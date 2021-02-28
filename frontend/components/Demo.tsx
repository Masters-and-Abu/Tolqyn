import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from 'antd';

import { ToTopOutlined } from '@ant-design/icons';
import { UserAddOutlined } from '@ant-design/icons';

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
    console.log(msg);
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
          const config = {
            headers: {
              'Content-Type': 'text/plain',
            },
          };
          if (isPublisher) {
            axios
              .post('https://tolqyn-backend-dev.herokuapp.com/sdp', session, config)
              .then((res) => {
                setStartDisabled(true);
                key = res.data;
              })
              .then(() =>
                setState((prevState) => ({
                  ...prevState,
                  counting: true,
                })),
              )
              .then(() => {
                setStartDisabled(false);
              })
              .catch(function (error) {
                console.log(error);
              });
          } else {
            axios
              .post('https://tolqyn-backend-dev.herokuapp.com/connect', session, config)
              .then((res) => {
                setStartDisabled(true);
                key = res.data;
              })
              .then(() => {
                setStartDisabled(false);
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

  const [activeKey, setActiveKey] = useState(-1);
  const [startDisabled, setStartDisabled] = useState(false);

  return (
    <>
      <div id="signalingContainer" style={{ display: 'none', textAlign: 'center' }}>
        <Button size="large" disabled={!startDisabled} onClick={() => (window as any).startSession()}> Start Session </Button>
      </div>
      {!state.counting && startDisabled ? <h3>We are preparing everything for you...</h3> : null}
      <video id="video1" width="160" height="120" autoPlay muted />
      <div style={{ display: 'flex', textAlign: 'center' }}>
        <div className="createSessionButton">
          <Button
            size="large"
            shape="circle"
            icon={<ToTopOutlined />}
            onClick={() => window.createSession(true)}
            onMouseEnter={() => setActiveKey(0)}
            onMouseLeave={() => setActiveKey(-1)}
          />
          <p style={{ color: activeKey === 0 ? '#40a9ff' : 'black' }}>Publish</p>
        </div>
        <div className="createSessionButton">
          <Button
            size="large"
            shape="circle"
            icon={<UserAddOutlined />}
            onClick={() => window.createSession(false)}
            onMouseEnter={() => setActiveKey(1)}
            onMouseLeave={() => setActiveKey(-1)}
          />
          <p style={{ color: activeKey === 1 ? '#40a9ff' : 'black' }}>Join</p>
        </div>
      </div>
      {state.counting ? (
        <>
          <h1 style={{ marginBottom: '5px' }}>On air!</h1>
          <div>You are recording for: {state.time}</div>
        </>
      ) : null}
    </>
  );
};

export default Demo;