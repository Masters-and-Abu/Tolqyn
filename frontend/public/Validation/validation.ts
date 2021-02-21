import * as Yup from 'yup';

export const SignInSchema = Yup.object().shape({
  username: Yup.string().required('Cannot be empty!'),
  password: Yup.string().required('Cannot be empty!'),
});
