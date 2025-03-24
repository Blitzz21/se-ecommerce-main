import Login from './Login'
import { Helmet } from 'react-helmet-async'

const Register = () => {
  return (
    <>
      <Helmet>
        <title>Create Account | Spartant Parts</title>
      </Helmet>
      <Login isRegister={true} />
    </>
  )
}

export default Register 