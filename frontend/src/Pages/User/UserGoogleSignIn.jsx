import React from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

  import { useNavigate } from "react-router-dom";
const SignUpWithGoogle = ({ onSuccess }) => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/fitness.activity.read");


async function signInWithGoogle() {
    const navigate = useNavigate();

    try {
        // Step 1: Show loading screen while getting Google OAuth URL
        navigate("/loading");  

        // Step 2: Fetch the Google OAuth URL from the backend
        const response = await fetch("http://localhost:8000/auth/google-url");
        const data = await response.json();

        if (data.url) {
            // Step 3: Open Google OAuth login in a new tab
            window.open(data.url, "_blank");

            // Wait and check when the user completes login
            checkGoogleLogin();
        } else {
            console.error("Failed to get Google OAuth URL");
        }
    } catch (error) {
        console.error("Google OAuth Error:", error);
    }
}

// Step 4: Polling function to check if the user has completed login
async function checkGoogleLogin() {
    try {
        const response = await fetch("http://localhost:8000/auth/google/check-login");
        const data = await response.json();

        if (data.success) {
            // Redirect to success page after login is completed
            window.location.href = "/success";
        } else {
            // Retry after 2 seconds if login isn't complete
            setTimeout(checkGoogleLogin, 2000);
        }
    } catch (error) {
        console.error("Error checking Google login status:", error);
    }
}

  async function fetchGoogleFitData(googleToken) {
    try {
      const response = await fetch("http://localhost:8000/getGoogleFitData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${googleToken}`,
        },
        body: JSON.stringify({ token: googleToken }),
      });
      
      const data = await response.json();
      console.log("Google Fit Data:", data);
    } catch (error) {
      console.error("Error fetching Google Fit data:", error);
    }
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="w-full py-2 text-lg font-bold text-white bg-red-500 rounded-md hover:bg-red-600 transition-all"
    >
      Sign Up with Google
    </button>
  );
};

export default SignUpWithGoogle;
