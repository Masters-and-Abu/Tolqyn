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

  log(process.env.NEXT_PUBLIC_STUN);
  log(process.env.NEXT_PUBLIC_BACKEND);

  if (typeof window !== 'undefined') {
    window.createSession = (isPublisher) => {
      setActiveKey(-1);
      setStartDisabled(1);
      const pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: `stun:${process.env.NEXT_PUBLIC_STUN}`,
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
              .post(`${process.env.NEXT_PUBLIC_BACKEND}/sdp`, session, config)
              .then((res) => {
                key = res.data;
                (window as any).startSession();
              })
              .then(() =>
                setState((prevState) => ({
                  ...prevState,
                  counting: true,
                })),
              )
              .catch(function (error) {
                console.log(error);
                setStartDisabled(2);
              });
          } else {
            axios
              .post(`${process.env.NEXT_PUBLIC_BACKEND}/connect`, session, config)
              .then((res) => {
                key = res.data;
                (window as any).startSession();
              })
              .catch(function (error) {
                console.log(error);
                setStartDisabled(2);
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
          setStartDisabled(0);
          pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(key))));
        } catch (e) {
          alert(e);
        }
      };
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

  const [msg, setMsg] = useState(<p></p>);

  const [activeKey, setActiveKey] = useState(-1);
  const [startDisabled, setStartDisabled] = useState(0);

  useEffect(() => {
    switch (startDisabled) {
      case 1:
        setMsg(<p className="msg">We are preparing everything for your broadcast</p>);
        break;
      case 2:
        setMsg(<p className="msg error-msg">Sorry, something went wrong! Please, try again later</p>);
        break;
      default:
        setMsg(<p className="msg"></p>);
        break;
    }
  }, [startDisabled]);

  return (
    <>
      <video id="video1" width="160" height="120" autoPlay muted />
      {startDisabled !== 1 ? (
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
      ) : null}
      {msg}
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
