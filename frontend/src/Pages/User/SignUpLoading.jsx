import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SignUpLoadingPage() {
    const navigate = useNavigate();

    useEffect(() => {
        startGoogleSignUp(); // Start the sign-up process immediately
    }, []);

    async function startGoogleSignUp() {
        try {
            // Step 1: Fetch the Google OAuth URL from the backend
            const response = await fetch("http://localhost:8000/auth/google-url");
            const data = await response.json();

            if (data.url) {
                // Step 2: Open Google OAuth login in a new tab
                window.location.href = data.url;

                // Step 3: Start polling to check login status
                checkGoogleSignUp();
            } else {
                console.error("Failed to get Google OAuth URL");
            }
        } catch (error) {
            console.error("Google OAuth Error:", error);
        }
    }

    async function checkGoogleSignUp() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code"); // Extract auth code from URL
    
        if (!code) {
            console.error("No Google Auth code found in URL");
            return;
        }
    
        try {
            const response = await fetch("http://localhost:8000/auth/google/callback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code }),
            });
    
            const data = await response.json();
    
            if (data.success) {
                navigate("/success"); // Redirect to success page
            } else {
                console.error("Google Sign-Up failed", data);
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

export default SignUpLoadingPage;
