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
import BookApp from "./Pages/User/BookDoctor";
import DoctorAppointments from "./Pages/Doctor/FinalAppointment";
import Detail from "./Pages/Doctor/Detail";
import MainPage from "./MainPage/MainPage"
import UserTelemedicine from "./Pages/User/User_tele";
import DeviceList from "./Pages/DeviceList";
import CommunityChat from "./Community/community";
import UserProfile from "./Pages/User/User_profile";
import User_reports from "./Pages/User/User_reports";
import PhysicalActivity from "./Pages/Activity/Activity";
import HomePage2 from "./Pages/HomePage2";
import DoctorLogIn from "./Pages/Doctor/DoctorSignIn2";
import DoctorLogUp from "./Pages/Doctor/DoctorSignUp2";
function App() {
  return (
  //  <Layout>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage2/>} />
        <Route path="/auth" element={<Auth/>} />
        <Route path="/user-signin" element={<UserSignIn />}/>
        <Route path="/user-signup" element={<UserSignUp />} />
        <Route path="/Onboard" element={<OnboardingPhase/>}/>
        <Route path="/success" element={<SuccessPage/>}/>
        <Route path="/roleselect" element={<RoleSelection/>}/>
        <Route path="/in-loading" element={<SignInLoadingPage/>}/>
        <Route path="/up-loading" element={<SignUpLoadingPage/>}/>
        <Route path="/doctor-signin" element={<DoctorSignIn/>}/>
        <Route path="/doctor-signup" element={<DoctorSignUp/>}/>
        <Route path="/doctor-login" element={<DoctorLogIn/>}/>
        <Route path="/signup" element={<DoctorLogUp/>}/>
        <Route path="/doctor-dashboard" element={<DoctorDashBoard/>}/>
        <Route path="/details" element={<Detail/>}/>
        <Route path="/main-page" element={<MainPage/>}/>
        <Route path="/user-tele" element={<UserTelemedicine/>}/>
        <Route path="/wearables" element={<DeviceList/>}/>
        <Route path="/community" element={<CommunityChat/>}/>
        <Route path="/user-profile" element={<UserProfile/>}/>
        <Route path="/user-reports" element={<User_reports/>}/>
        <Route path="/activity" element={<PhysicalActivity/>}/>
        <Route path="/appointments" element={<DoctorAppointments/>}/>
        <Route path="/book-appointment" element={<BookApp/>}/>
      </Routes>
    </Router>
    //  </Layout>
  );
}

export default App;
