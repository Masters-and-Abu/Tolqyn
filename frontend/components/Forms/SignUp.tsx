import { List, Popover } from 'antd';
import { Checkbox } from 'antd';
import { Formik } from 'formik';
import { Form, Input, SubmitButton } from 'formik-antd';
import React, { useEffect, useState } from 'react';
import { SignUpSchema } from '../../public/Validation/validation';

type SignUpPropTypes = {
  handleOk: () => void;
};
const SignUp = ({ handleOk }: SignUpPropTypes) => {
  const [password, setPassword] = useState('');
  const [validationState, setValidationState] = useState({
    lowercase: false,
    uppercase: false,
    containsNumbers: false,
    length: false,
  });

  const checkboxes = [
            <Checkbox disabled checked={validationState.lowercase}>
                Consist of at least one lowercase letter
            </Checkbox>,
            <Checkbox disabled checked={validationState.uppercase}>
                Consist of at least one uppercase letter
            </Checkbox>,
            <Checkbox disabled checked={validationState.containsNumbers}>
                Contain at least one numerical symbol (0-9)
            </Checkbox>,
            <Checkbox disabled checked={validationState.length}>
                Exceed 8 symbols
            </Checkbox>,
  ]

  useEffect(() => {
    password.match(/[a-z]/g)
      ? setValidationState((prevState) => ({
          ...prevState,
          lowercase: true,
        }))
      : setValidationState((prevState) => ({
          ...prevState,
          lowercase: false,
        }));
    password.match(/[A-Z]/g)
      ? setValidationState((prevState) => ({
          ...prevState,
          uppercase: true,
        }))
      : setValidationState((prevState) => ({
          ...prevState,
          uppercase: false,
        }));
    password.match(/[0-9]/g)
      ? setValidationState((prevState) => ({
          ...prevState,
          containsNumbers: true,
        }))
      : setValidationState((prevState) => ({
          ...prevState,
          containsNumbers: false,
        }));
    password.length >= 8
      ? setValidationState((prevState) => ({
          ...prevState,
          length: true,
        }))
      : setValidationState((prevState) => ({
          ...prevState,
          length: false,
        }));
    console.log(validationState);
  }, [password]);
  return (
    <Formik
      initialValues={{
        username: undefined,
        email: undefined,
        password: undefined,
        repeatPassword: undefined,
      }}
      validationSchema={SignUpSchema}
      onSubmit={(values, { resetForm }) => {
        alert('Logged in');
        handleOk();
        resetForm({});
      }}
    >
      {({ errors, touched }) => (
        <Form
          style={{
            padding: '0 50px',
          }}
        >
          <Form.Item name="username">
            <span style={{ marginLeft: '0.25vh' }}>Username</span>
            <Input style={{ marginTop: '1vh' }} name="username" />
          </Form.Item>
          <Form.Item name="email">
            <span style={{ marginLeft: '0.25vh' }}>E-mail</span>
            <Input style={{ marginTop: '1vh' }} name="email" />
          </Form.Item>
          <Form.Item name="password">
            <span style={{ marginLeft: '0.25vh' }}>Password</span>
            <Popover
              placement="rightBottom"
              content={
                <List
                  className="advice-list"
                  header={'Strong password should:'}
                  dataSource={checkboxes}
                  bordered
                  renderItem={(item, index) => (
                    <List.Item className="advice-list-item">
                      {item}
                    </List.Item>
                  )}
                />
              }
              trigger="click"
            >
              <Input.Password style={{ marginTop: '1vh' }} name="password" onChange={(e) => setPassword(e.target.value)} />
            </Popover>
          </Form.Item>
          <Form.Item name="repeatPassword">
            <span style={{ marginLeft: '0.25vh' }}>Repeat password</span>
            <Input.Password style={{ marginTop: '1vh' }} name="repeatPassword" />
          </Form.Item>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <SubmitButton style={{ marginTop: '3.3vh' }}>Create account</SubmitButton>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default SignUp;
