import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactPlayer from 'react-player';

declare global {
  interface Window {
    createSession: any;
  }
}

const Demo: React.FC = () => {
  const [state, setState] = useState({
    counting: false,
    seconds: 0,
    time: '',
  });
  const log = (msg) => {
    document.getElementById('logs').innerHTML += msg + '<br>';
  };

  if (typeof window !== 'undefined') {
    window.createSession = (isPublisher) => {
      let pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: 'stun:stun.l.google.com:19302',
          },
        ],
      });
      pc.oniceconnectionstatechange = (e) => {
        log(pc.iceConnectionState);
      };
      pc.onicecandidate = (event) => {
        if (event.candidate === null) {
          document.getElementById('localSessionDescription').value = btoa(JSON.stringify(pc.localDescription));
        }
      };

      if (isPublisher) {
        navigator.mediaDevices
          .getUserMedia({ video: false, audio: true })
          .then((stream) => {
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));
            document.getElementById('video1').srcObject = stream;
            pc.createOffer()
              .then((d) => pc.setLocalDescription(d))
              .then(() =>
                setState((prevState) => ({
                  ...prevState,
                  counting: true,
                })),
              )
              .catch(log);
          })
          .catch(log);
      } else {
        pc.addTransceiver('audio');
        pc.createOffer()
          .then((d) => pc.setLocalDescription(d))
          .catch(log);

        pc.ontrack = function (event) {
          var el = document.getElementById('video1');
          el.srcObject = event.streams[0];
          el.autoplay = true;
          el.controls = true;
        };
      }

      window.startSession = () => {
        let sd = document.getElementById('remoteSessionDescription').value;
        if (sd === '') {
          return alert('Session Description must not be empty');
        }

        try {
          pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(sd))));
        } catch (e) {
          alert(e);
        }
      };

      let btns = document.getElementsByClassName('createSessionButton');
      for (let i = 0; i < btns.length; i++) {
        btns[i].style = 'display: none';
      }

      document.getElementById('signalingContainer').style = 'display: block';
    };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const s = state.seconds;
      setState((prevState) => ({
        ...prevState,
        seconds: state.counting ? s + 1 : s,
        time: new Date(s * 1000).toISOString().substr(11, 8),
      }));
      console.log(state.seconds);
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <>
      <div id="signalingContainer" style={{ display: 'none', textAlign: 'center' }}>
        Browser base64 Session Description
        <br />
        <textarea id="localSessionDescription" readOnly={true}></textarea> <br />
        Golang base64 Session Description
        <br />
        <textarea id="remoteSessionDescription"></textarea> <br />
        <button onClick={() => window.startSession()}> Start Session </button>
        <br />
      </div>
      <br />
      Video
      <br />
      <video id="video1" width="160" height="120" autoPlay muted></video> <br />
      <br />
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
      {state.counting ? <div>You are recording for: {state.time}</div> : null}
      <div id="logs"></div>
    </>
  );
};

export default Demo;
