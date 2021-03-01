import * as Yup from 'yup';

export const SignInSchema = Yup.object().shape({
  username: Yup.string().required('Cannot be empty!'),
  password: Yup.string().required('Cannot be empty!'),
});

export const SignUpSchema = Yup.object().shape({
  email: Yup.string().email().required('Email cannot be empty!'),
  username: Yup.string().required('Username cannot be empty!'),
  password: Yup.string().min(8, 'Your password should contain 8 or more symbols').required('Cannot be empty!'),
  repeatPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Password must match'),
});
