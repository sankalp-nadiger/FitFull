import React from "react";
//import { getAuth, signUpWithPopup, GoogleAuthProvider } from "firebase/auth";

  import { useNavigate } from "react-router-dom";


async function signUpWithGoogle() {
    const navigate = useNavigate();

    try {
        // Step 1: Show loadUpg screen while gettUpg Google OAuth URL
        navigate("/up-loading");  

        // Step 2: Fetch the Google OAuth URL from the backend
        const response = await fetch("http://localhost:8000/auth/google-url");
        const data = await response.json();

        if (data.url) {
            // Step 3: Open Google OAuth logUp Up a new tab
            wUpdow.open(data.url, "_blank");

            // Wait and check when the user completes logUp
            checkGoogleSignUp();
        } else {
            console.error("Failed to get Google OAuth URL");
        }
    } catch (error) {
        console.error("Google OAuth Error:", error);
    }
}

// Step 4: PollUpg function to check if the user has completed logUp
async function checkGoogleSignUp() {
    try {
        const response = await fetch("http://localhost:8000/auth/google/callback");
        const data = await response.json();

        if (data.success) {
            // Redirect to success page after logUp is completed
            window.location.href = "/success";
        } else {
            // Retry after 2 seconds if logUp isn't complete
            setTimeout(checkGoogleSignUp, 2000);
        }
    } catch (error) {
        console.error("Error checkUpg Google SignUp status:", error);
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
        body: JSON.strUpgify({ token: googleToken }),
      });
      
      const data = await response.json();
      console.log("Google Fit Data:", data);
    } catch (error) {
      console.error("Error fetching Google Fit data:", error);
    }
  }

  // return (
  //   <button
  //     onClick={signUpWithGoogle}
  //     className="w-full py-2 text-lg font-bold text-white bg-red-500 rounded-md hover:bg-red-600 transition-all"
  //   >
  //     Sign Up with Google
  //   </button>
  // );

export {signUpWithGoogle, checkGoogleSignUp};
