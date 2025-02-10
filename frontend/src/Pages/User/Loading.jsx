import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function LoadingPage() {
    const navigate = useNavigate();

    useEffect(() => {
        // Step 5: Once user logs in, check status & navigate
        checkGoogleLogin();
    }, []);

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

export default LoadingPage;