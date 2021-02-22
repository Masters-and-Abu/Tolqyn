import { Menu } from 'antd';
import { Modal } from 'antd';

import React, { useEffect, useState } from 'react';
import SignIn from '../Forms/SignIn';
import SignUp from '../Forms/SignUp';

type ShowAuthModalPropTypes = {
  signType: string;
};

const AuthModal = () => {
  const [state, setState] = useState({
    title: '',
    visible: false,
    confirmLoading: false,
    signType: '1',
  });

  const showModal = ({ signType }: ShowAuthModalPropTypes) => {
    setState((prevState) => ({
      ...prevState,
      visible: true,
      signType: signType,
    }));
  };

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      title: state.signType === '1' ? 'Login to Tolqyn' : 'Create new account',
    }));
  }, [state.signType]);

  const handleOk = () => {
    setState((prevState) => ({
      ...prevState,
      visible: false,
    }));
  };

  const handleCancel = () => {
    setState((prevState) => ({
      ...prevState,
      visible: false,
    }));
  };

  const handleChange = (key: string) => {
    setState((prevState) => ({
      ...prevState,
      signType: key,
    }));
  };
  return (
    <Menu
      mode="horizontal"
      style={{
        position: 'absolute',
        right: '3.35vw',
      }}
    >
      <Menu.Item key="1" onClick={() => showModal({ signType: '1' })}>
        Sign In
      </Menu.Item>
      <Menu.Item
        key="2"
        style={{
          width: '90px',
          border: '1px solid',
          borderRadius: '5px',
        }}
        onClick={() => showModal({ signType: '2' })}
      >
        Sign up
      </Menu.Item>
      <Modal
        title={<h3>{state.title}</h3>}
        visible={state.visible}
        onCancel={() => handleCancel()}
        footer={
          state.signType === '1' ? (
            <>
              <div style={{ display: 'flex', textAlign: 'center', }}>
                <p className="auth-footer-text">
                  Don't have an account yet?
                  <span 
                    className="auth-footer-span"
                    onClick={() => handleChange("2")}
                  >
                    Create it
                  </span>
                </p>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', textAlign: 'center', }}>
                <p className="auth-footer-text">
                  Already registered?
                  <span 
                    className="auth-footer-span"
                    onClick={() => handleChange("1")}
                  >
                    Login
                  </span>
                </p>
              </div>
            </>)
        }
      >
        {state.signType === '1' ? <SignIn handleOk={handleOk} /> : <SignUp handleOk={handleOk} />}
      </Modal>
    </Menu>
  );
};

export default AuthModal;
