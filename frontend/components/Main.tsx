import { Button, Layout, Menu } from 'antd';
import { AudioOutlined } from '@ant-design/icons';

import Waves from '../components/Waves';

const { Header } = Layout;

export default function Main() {
  return (
    <>
      <div className="main">
        <Header className="header">
          <Menu mode="horizontal">
            <Menu.Item key="1">Main</Menu.Item>
            <Menu.Item key="2">Podcasts</Menu.Item>
            <Menu.Item key="3">About us</Menu.Item>
          </Menu>
        </Header>
        <div className="title" data-aos="fade-up" data-aos-once="true">
          <h1>Tolqyn</h1>
          <h2>Audio streaming platform</h2>
        </div>
        <Waves />
      </div>
      <div className="start-stream" data-aos="fade-up" data-aos-once="true">
        <h1>Start your podcast</h1>
        <Button size="large" shape="circle" icon={<AudioOutlined />} />
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
          }

          .header ul {
            background: transparent;
            text-align: center;
            border: none;
          }

          .header ul li {
            color: #fff;
            font-weight: 500;
            border-bottom: none;
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
