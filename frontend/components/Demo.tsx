import React from 'react';
import axios from 'axios';

declare global {
  interface Window {
    createSession: any;
  }
}

const Demo: React.FC = () => {
  const log = (msg) => {
    document.getElementById('logs').innerHTML += msg + '<br>';
  };

  if (typeof window !== 'undefined') {
    window.createSession = (isPublisher) => {
      const pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: 'stun:stun.l.google.com:19302',
          },
        ],
      });
      let key;
      pc.oniceconnectionstatechange = (e) => log(pc.iceConnectionState);
      pc.onicecandidate = (event) => {
        if (event.candidate === null) {
          const session = btoa(JSON.stringify(pc.localDescription));
          (document.getElementById('localSessionDescription') as any).value = session;
          const config = {
            headers: {
              'Content-Type': 'text/plain',
            },
          };
          if (isPublisher) {
            axios
              .post('https://tolqyn-backend-dev.herokuapp.com/sdp', session, config)
              .then(function (res) {
                key = res.data;
              })
              .catch(function (error) {
                console.log(error);
              });
          } else {
            axios
              .post('https://tolqyn-backend-dev.herokuapp.com/connect', session, config)
              .then(function (res) {
                key = res.data;
              })
              .catch(function (error) {
                console.log(error);
              });
          }
        }
      };

      if (isPublisher) {
        navigator.mediaDevices
          .getUserMedia({ video: false, audio: true })
          .then((stream) => {
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));
            (document.getElementById('video1') as any).srcObject = stream;
            pc.createOffer()
              .then((d) => pc.setLocalDescription(d))
              .catch(log);
          })
          .catch(log);
      } else {
        pc.addTransceiver('audio');
        pc.createOffer()
          .then((d) => pc.setLocalDescription(d))
          .catch(log);

        pc.ontrack = function (event) {
          const el = document.getElementById('video1');
          (el as any).srcObject = event.streams[0];
          (el as any).autoplay = true;
          (el as any).controls = true;
        };
      }

      (window as any).startSession = () => {

        try {
          pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(key))));
        } catch (e) {
          alert(e);
        }
      };

      const btns = document.getElementsByClassName('createSessionButton');
      for (let i = 0; i < btns.length; i++) {
        (btns[i] as any).style = 'display: none';
      }

      (document.getElementById('signalingContainer') as any).style = 'display: block';
    };
  }

  return (
    <>
      <div id="signalingContainer" style={{ display: 'none' }}>
        Browser base64 Session Description
        <br />
        <textarea id="localSessionDescription" readOnly={true}></textarea> <br />
        Golang base64 Session Description
        <br />
        <textarea id="remoteSessionDescription"></textarea> <br />
        <button onClick={() => (window as any).startSession()}> Start Session </button>
        <br />
      </div>
      <br />
      Video
      <br />
      <video id="video1" width="160" height="120" autoPlay muted></video> <br />
      <button className="createSessionButton" onClick={() => window.createSession(true)}>
        Publish a Broadcast
      </button>
      <button className="createSessionButton" onClick={() => window.createSession(false)}>
        Join a Broadcast
      </button>
      <br />
      <br />
      Logs
      <br />
      <div id="logs"></div>
    </>
  );
};

export default Demo;
