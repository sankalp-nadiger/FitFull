import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SignInLoadingPage() {
    const navigate = useNavigate();
    useEffect(() => {
        signInWithGoogle(); // Start the sign-up process immediately
    }, []);
    async function signInWithGoogle()
    {
           try {  
       
               // Step 2: Fetch the Google OAuth URL from the backend
               const response = await fetch("http://localhost:8000/auth/login-google");
               const data = await response.json();
       
               if (data.url) {
                   // Step 3: Open Google OAuth login in a new tab
                   window.location.href(data.url);
       
                   // Wait and check when the user completes login
                   checkGoogleLogin();
               } else {
                   console.error("Failed to get Google OAuth URL");
               }
           } catch (error) {
               console.error("Google OAuth Error:", error);
           }
    }

    async function checkGoogleLogin() {
        try {
            const response = await fetch("http://localhost:8000/auth/google/check-login");
            const data = await response.json();

            if (data.success) {
                navigate("/success"); // Redirect to success page
            } else {
                setTimeout(checkGoogleLogin, 2000); // Retry every 2 seconds
            }
        } catch (error) {
            console.error("Error checking Google login status:", error);
        }
    }

    return (
        <div>
            <h2>Connecting to Google...</h2>
            <p>Please wait while we authenticate your account.</p>
            <div className="spinner">🔄</div> {/* Loading animation */}
        </div>
    );
}

export default SignInLoadingPage