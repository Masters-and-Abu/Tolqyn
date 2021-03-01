import { Checkbox } from 'antd';
import { Formik } from 'formik';
import { Form, Input, } from 'formik-antd';
import React from 'react';
import { SignInSchema } from '../../public/Validation/validation';

type SignInPropType = {
  handleOk: () => void;
};

const SignIn = ({ handleOk }: SignInPropType) => {
  const handleRememberMeChange = (e) => {
    console.log(`okay - ${e}`);
  };
  return (
    <>
      <Formik
        initialValues={{
          username: undefined,
          password: undefined,
        }}
        validationSchema={SignInSchema}
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
              <span style={{ marginLeft: '0.25vh' }}>Username or email address</span>
              <Input style={{ marginTop: '1vh' }} name="username" />
            </Form.Item>
            <Form.Item name="password">
              <span style={{ marginLeft: '0.25vh' }}>Password</span>
              <Input.Password style={{ marginTop: '1vh' }} name="password" />
            </Form.Item>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Checkbox onChange={handleRememberMeChange}>Remember me</Checkbox>
              <button className="ant-btn ant-btn-primary" style={{ marginTop: '3.3vh' }}>Sign in</button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default SignIn;
