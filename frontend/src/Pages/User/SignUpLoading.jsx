import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUpLoadingPage() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        handleOAuthFlow();
    }, []);

    async function handleOAuthFlow() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (code) {
            // We have a code, process it
            await processAuthCode(code);
        } else {
            // No code, start the OAuth flow
            await startGoogleSignUp();
        }
    }

    async function startGoogleSignUp() {
        try {
            const response = await fetch("http://localhost:8000/auth/google-url");
            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                setError(data.message || "Failed to get Google OAuth URL");
                setIsLoading(false);
            }
        } catch (error) {
            setError("Failed to start Google authentication");
            setIsLoading(false);
            console.error("Google OAuth Error:", error);
        }
    }

    async function processAuthCode(code) {
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
                if (data.jwt) {
                    sessionStorage.setItem('accessToken', data.jwt);
                }
                if (data.user) {
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                    sessionStorage.setItem("activity", JSON.stringify(suggestedActivity));
                }
                
                navigate("/success");
            } else {
                setError(data.message || "Google Sign-Up failed. Please try again.");
                setIsLoading(false);
            }
        } catch (error) {
            setError("Error processing authentication");
            setIsLoading(false);
            console.error("Error processing Google auth code:", error);
        }
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
                    <h2 className="text-xl font-semibold text-red-700 mb-2">Authentication Error</h2>
                    <p className="text-red-600">{error}</p>
                    <button 
                        onClick={() => window.location.href = '/user-signin'}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">
                    {isLoading ? "Connecting to Google..." : "Processing..."}
                </h2>
                <p className="text-gray-600 mb-4">
                    Please wait while we authenticate your account.
                </p>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
            </div>
        </div>
    );
}

export default SignUpLoadingPage;
