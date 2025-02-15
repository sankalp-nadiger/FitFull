import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserSignIn from "./Pages/User/UserSignIn";
import UserSignUp from "./Pages/User/UserSignUp";
//import PasswordSignIn from "./Pages/PasswordSignIn";
//import GoogleSignIn from "./Pages/GoogleSignIn";
import OnboardingPhase from "./Pages/User/OnBoardingPhase";
import SignInLoadingPage from "./Pages/User/SignInLoading";
import SignUpLoadingPage from "./Pages/User/SignUpLoading";
import DoctorSignIn from "./Pages/Doctor/DoctorSignIn";
import DoctorSignUp from "./Pages/Doctor/DoctorSignUp";
import SuccessPage from "./Pages/User/Success";
import HomePage from "./Pages/HomePage";
import Auth from "./Pages/Auth";
import RoleSelection from "./Pages/RoleSelection";
import DoctorDashBoard from "./Pages/Doctor/DoctorDashBoard";
import Appointments from "./Pages/Doctor/Appointments";
import FinalPatient from "./Pages/Doctor/FinalPatient";
import Detail from "./Pages/Doctor/Detail";
import MainPage from "./MainPage/MainPage"
import UserTelemedicine from "./Pages/User/User_tele";
import DeviceList from "./Pages/DeviceList";
import CommunityChat from "./Community/community";
import UserProfile from "./Pages/User/User_profile";
import User_reports from "./Pages/User/User_reports";
// import OnboardingPhase from "./Pages/User/OnBoardingPhase";
function App() {
  return (
  //  <Layout>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/auth" element={<Auth/>} />
        <Route path="/user-signin" element={<UserSignIn />}/>
        <Route path="/user-signup" element={<UserSignUp />} />
        {/* <Route path="/signin-password" element={<PasswordSignIn />} /> */}
        {/* <Route path="/signin-google" element={<GoogleSignIn />} /> */}
        <Route path="/Onboard" element={<OnboardingPhase/>}/>
        <Route path="/success" element={<SuccessPage/>}/>
        <Route path="/roleselect" element={<RoleSelection/>}/>
        <Route path="/in-loading" element={<SignInLoadingPage/>}/>
        <Route path="/up-loading" element={<SignUpLoadingPage/>}/>
        <Route path="/doctor-signin" element={<DoctorSignIn/>}/>
        <Route path="/doctor-signup" element={<DoctorSignUp/>}/>
        <Route path="/doctor-dashboard" element={<DoctorDashBoard/>}/>
        <Route path="/appointments" element={<Appointments/>}/>
        <Route path="/patient-dashboard" element={<FinalPatient/>}/>
        <Route path="/details" element={<Detail/>}/>
        <Route path="/main-page" element={<MainPage/>}/>
        <Route path="/user-tele" element={<UserTelemedicine/>}/>
        <Route path="/wearables" element={<DeviceList/>}/>
        <Route path="/community" element={<CommunityChat/>}/>
        <Route path="/user-profile" element={<UserProfile/>}/>
        {/* <Route path="/onboard" element={<OnboardingPhase/>}/> */}
        <Route path="/user-reports" element={<User_reports/>}/>
      </Routes>
    </Router>
    //  </Layout>
  );
}

export default App;
