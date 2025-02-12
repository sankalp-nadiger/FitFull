import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserSignIn from "./Pages/User/UserSignIn";
import UserSignUp from "./Pages/User/UserSignUp";
//import PasswordSignIn from "./Pages/PasswordSignIn";
//import GoogleSignIn from "./Pages/GoogleSignIn";
import Onboarding from "./Pages/User/OnBoardingPhase";
import SignInLoadingPage from "./Pages/User/SignInLoading";
import SignUpLoadingPage from "./Pages/User/SignUpLoading";
import DoctorSignIn from "./Pages/Doctor/DoctorSignIn";
import DoctorSignUp from "./Pages/Doctor/DoctorSignUp";
import SuccessPage from "./Pages/User/Success";
import HomePage from "./Pages/HomePage";
import SignInInterface from "./Pages/Auth";
import RoleSelection from "./Pages/RoleSelection";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/auth" element={<SignInInterface/>} />
        <Route path="/user-signin" element={<UserSignIn />}/>
        <Route path="/user-signup" element={<UserSignUp />} />
        {/* <Route path="/signin-password" element={<PasswordSignIn />} /> */}
        {/* <Route path="/signin-google" element={<GoogleSignIn />} /> */}
        <Route path="/Onboard" element={<Onboarding/>}/>
        <Route path="/success" element={<SuccessPage/>}/>
        <Route path="/roleselect" element={<RoleSelection/>}/>
        <Route path="/in-loading" element={<SignInLoadingPage/>}/>
        <Route path="/up-loading" element={<SignUpLoadingPage/>}/>
        <Route path="/doctor-signin" element={<DoctorSignIn/>}/>
        <Route path="/doctor-signup" element={<DoctorSignUp/>}/>
      </Routes>
    </Router>
  );
}

export default App;
