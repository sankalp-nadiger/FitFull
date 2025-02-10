import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInPage from "./Pages/SignIn";
import PasswordSignIn from "./Pages/PasswordSignIn";
import GoogleSignIn from "./Pages/GoogleSignIn";
import Onboarding from "./Pages/User/OnBoardingPhase";
import LoadingPage from "./Pages/User/Loading";
import DoctorSignIn from "./Pages/Doctor/DoctorSignIn";
import DoctorSignUp from "./Pages/Doctor/DoctorSignUp";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/signin-password" element={<PasswordSignIn />} />
        <Route path="/signin-google" element={<GoogleSignIn />} />
        <Route path="/Onboard" element={<Onboarding/>}/>
        <Route path="/loading" element={<LoadingPage/>}/>
        <Route path="/doctor-signin" element={<DoctorSignIn/>}/>
        <Route path="/doctor-signup" element={<DoctorSignUp/>}/>
      </Routes>
    </Router>
  );
}

export default App;
