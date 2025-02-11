import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserSignIn from "./Pages/User/UserSignIn";
import SignUpPage from "./Pages/User/UserSignUp";
//import PasswordSignIn from "./Pages/PasswordSignIn";
//import GoogleSignIn from "./Pages/GoogleSignIn";
import Onboarding from "./Pages/User/OnBoardingPhase";
import SignInLoadingPage from "./Pages/User/SignInLoading";
import SignUpLoadingPage from "./Pages/User/SignUpLoading";
import DoctorSignIn from "./Pages/Doctor/DoctorSignIn";
import DoctorSignUp from "./Pages/Doctor/DoctorSignUp";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserSignIn/>} />
        <Route path="/user-signup" element={<SignUpPage />} />
        {/* <Route path="/signin-password" element={<PasswordSignIn />} /> */}
        {/* <Route path="/signin-google" element={<GoogleSignIn />} /> */}
        <Route path="/Onboard" element={<Onboarding/>}/>
        <Route path="/in-loading" element={<SignInLoadingPage/>}/>
        <Route path="/up-loading" element={<SignUpLoadingPage/>}/>
        <Route path="/doctor-signin" element={<DoctorSignIn/>}/>
        <Route path="/doctor-signup" element={<DoctorSignUp/>}/>
      </Routes>
    </Router>
  );
}

export default App;
