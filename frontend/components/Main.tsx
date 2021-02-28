import { Button, Layout, Menu } from 'antd';
import { AudioOutlined } from '@ant-design/icons';

import Waves from '../components/Waves';
import AuthModal from './Modals/AuthModal';
import React, { useState } from 'react';
import Demo from './Demo';

const { Header } = Layout;
// ya l'yu cristal
export default function Main() {
  const [showAloha, setShowAloha] = useState(false);
  return (
    <>
      <div className="main">
        <Header className="header">
          <Menu mode="horizontal">
            <Menu.Item key="1">Main</Menu.Item>
            <Menu.Item key="2">Podcasts</Menu.Item>
            <Menu.Item key="3">About us</Menu.Item>
          </Menu>
          <AuthModal />
        </Header>
        <div className="title" data-aos="fade-up" data-aos-once="true">
          <h1>Tolqyn</h1>
          <h2>Audio streaming platform</h2>
        </div>
        <Waves />
      </div>
      <div className="start-stream" data-aos="fade-up" data-aos-once="true">
        <h1>Start your podcast</h1>
        {showAloha ? 
        <div style={{ textAlign: 'center', }}>
          <Demo />
        </div>
        :
        <Button size="large" shape="circle" icon={<AudioOutlined />} onClick={() => setShowAloha(true)} />
        }
      </div>
      <style>
        {`
          .main {
            height: 100vh;
            position: relative;
            background: linear-gradient(0deg, #7196ff -.45%, #2a5ee8 71.18%);
          }

          .header {
            background: transparent;
            text-align: center;
          }

          .header ul {
            background: transparent;
            text-align: center;
            border: none;
            display: inline-block;
            zoom: 1;
          }

          .header ul li {
            color: #fff;
            font-weight: 700;
            border-bottom: none;
            height: 50px;
            line-height: 50px;
          }

          .main .title {
            height: 70vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }

          .main .title h1 {
            font-size: 4rem;
            color: #fff;
            font-weight: 700;
          }

          .main .title h2 {
            font-size: 2rem;
            color: #fff;
            font-weight: 700;
          }

          .start-stream {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          .start-stream h1 {
            color: #303030;
            font-size: 2rem;
            margin-bottom: 50px;
          }
          
          .auth-footer-text {
            margin: auto
          }
          
          .auth-footer-span {
            margin-left: 5px;
            color: #1890ff;
            cursor: pointer;
            font-weight: 500;
            transition: color 0.5s ease;
          }

          .auth-footer-span:hover {
            color: lightblue;
          }
          
          .advice-list .ant-checkbox-wrapper, .advice-list span, .advice-list input {
            cursor: context-menu!important;
            color: black!important;
          }

          .createSessionButton {
            line-height: 28px;
            display: flex;
            flex-direction: column;
            margin: 5px 50px;
          }

          .createSessionButton p {
            transition: all .3s ease-in-out;
            margin-top: 7px;
          }

          @media (max-width: 768px) {
            .header {
              display: none;
            }

            .main .title h1 {
              font-size: 2.5rem;
            }
  
            .main .title h2,
            .start-stream h1 {
              font-size: 1.5rem;
            }
          }
        `}
      </style>
    </>
  );
}
