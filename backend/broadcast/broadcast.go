package broadcast


import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/pion/rtcp"
	"github.com/pion/webrtc/v3"
	"github.com/Masters-and-Abu/Tolqyn/backend/signal"
)

const (
	rtcpPLIInterval = time.Second * 3
)

type Connections struct{
	sdpResp chan string
	sdpCons chan string
}

var cons Connections

func StartSession(sdp string){ // nolint:gocognit
	// Everything below is the Pion WebRTC API, thanks for using it ❤️.
	offer := webrtc.SessionDescription{}

	signal.Decode(sdp, &offer)
	fmt.Println("decoded")

	peerConnectionConfig := webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				URLs: []string{"stun:stun.l.google.com:19302"},
			},
		},
	}

	// Create a new RTCPeerConnection
	peerConnection, err := webrtc.NewPeerConnection(peerConnectionConfig)
	if err != nil {
		panic(err)
	}

	// Allow us to receive 1 video track
	if _, err = peerConnection.AddTransceiverFromKind(webrtc.RTPCodecTypeVideo); err != nil {
		panic(err)
	}

	localTrackChan := make(chan *webrtc.TrackLocalStaticRTP)
	// Set a handler for when a new remote track starts, this just distributes all our packets
	// to connected peers
	peerConnection.OnTrack(func(remoteTrack *webrtc.TrackRemote, receiver *webrtc.RTPReceiver) {
		// Send a PLI on an interval so that the publisher is pushing a keyframe every rtcpPLIInterval
		// This can be less wasteful by processing incoming RTCP events, then we would emit a NACK/PLI when a viewer requests it
		go func() {
			ticker := time.NewTicker(rtcpPLIInterval)
			for range ticker.C {
				if rtcpSendErr := peerConnection.WriteRTCP([]rtcp.Packet{&rtcp.PictureLossIndication{MediaSSRC: uint32(remoteTrack.SSRC())}}); rtcpSendErr != nil {
					fmt.Println(rtcpSendErr)
				}
			}
		}()

		// Create a local track, all our SFU clients will be fed via this track
		localTrack, newTrackErr := webrtc.NewTrackLocalStaticRTP(remoteTrack.Codec().RTPCodecCapability, "audio", "pion")
		if newTrackErr != nil {
			panic(newTrackErr)
		}
		localTrackChan <- localTrack

		rtpBuf := make([]byte, 1400)
		for {
			i, _, readErr := remoteTrack.Read(rtpBuf)
			if readErr != nil {
				panic(readErr)
			}

			// ErrClosedPipe means we don't have any subscribers, this is ok if no peers have connected yet
			if _, err = localTrack.Write(rtpBuf[:i]); err != nil && !errors.Is(err, io.ErrClosedPipe) {
				panic(err)
			}
		}
	})

	// Set the remote SessionDescription
	err = peerConnection.SetRemoteDescription(offer)
	if err != nil {
		panic(err)
	}

	// Create answer
	answer, err := peerConnection.CreateAnswer(nil)
	if err != nil {
		panic(err)
	}

	// Create channel that is blocked until ICE Gathering is complete
	gatherComplete := webrtc.GatheringCompletePromise(peerConnection)

	// Sets the LocalDescription, and starts our UDP listeners
	err = peerConnection.SetLocalDescription(answer)
	if err != nil {
		panic(err)
	}

	// Block until ICE Gathering is complete, disabling trickle ICE
	// we do this because we only can exchange one signaling message
	// in a production application you should exchange ICE Candidates via OnICECandidate
	<-gatherComplete

	// Get the LocalDescription and take it to base64 so we can paste in browser
	cons.sdpResp<-signal.Encode(*peerConnection.LocalDescription())

	//fmt.Println(signal.Encode(*peerConnection.LocalDescription()))

	localTrack := <-localTrackChan
	for {
		fmt.Println("")
		fmt.Println("Curl an base64 SDP to start sendonly peer connection")

		recvOnlyOffer := webrtc.SessionDescription{}
		con := <-cons.sdpCons
		if(con=="stop"){
			return
		}
		signal.Decode(con, &recvOnlyOffer)

		// Create a new PeerConnection
		peerConnection, err := webrtc.NewPeerConnection(peerConnectionConfig)
		if err != nil {
			panic(err)
		}

		rtpSender, err := peerConnection.AddTrack(localTrack)
		if err != nil {
			panic(err)
		}

		// Read incoming RTCP packets
		// Before these packets are retuned they are processed by interceptors. For things
		// like NACK this needs to be called.
		go func() {
			rtcpBuf := make([]byte, 1500)
			for {
				if _, _, rtcpErr := rtpSender.Read(rtcpBuf); rtcpErr != nil {
					return
				}
			}
		}()

		// Set the remote SessionDescription
		err = peerConnection.SetRemoteDescription(recvOnlyOffer)
		if err != nil {
			panic(err)
		}

		// Create answer
		answer, err := peerConnection.CreateAnswer(nil)
		if err != nil {
			panic(err)
		}

		// Create channel that is blocked until ICE Gathering is complete
		gatherComplete = webrtc.GatheringCompletePromise(peerConnection)

		// Sets the LocalDescription, and starts our UDP listeners
		err = peerConnection.SetLocalDescription(answer)
		if err != nil {
			panic(err)
		}

		// Block until ICE Gathering is complete, disabling trickle ICE
		// we do this because we only can exchange one signaling message
		// in a production application you should exchange ICE Candidates via OnICECandidate
		<-gatherComplete

		// Get the LocalDescription and take it to base64 so we can paste in browser
		cons.sdpResp<-signal.Encode(*peerConnection.LocalDescription())
	}
}


func SDP(w http.ResponseWriter, r *http.Request){
	w.Header().Set("Access-Control-Allow-Origin", "*")
	if cons.sdpCons != nil{
		cons.sdpCons<-"stop"
	}
	cons.sdpCons = make(chan string)
	cons.sdpResp = make(chan string)
	fmt.Println(cons.sdpResp)
	body, _ := ioutil.ReadAll(r.Body)

	fmt.Println("stop")
	go StartSession(string(body))
	resp := <-cons.sdpResp
	w.Write([]byte(resp))

}


func SDPConnect(w http.ResponseWriter, r *http.Request){
	w.Header().Set("Access-Control-Allow-Origin", "*")
	body, _ := ioutil.ReadAll(r.Body)
	cons.sdpCons<-string(body)
	resp := <-cons.sdpResp
	w.Write([]byte(resp))
}