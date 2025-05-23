import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SignInLoadingPage() {
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
            await processAuthCode(code);
        } else {
            await signInWithGoogle();
        }
    }

    async function signInWithGoogle() {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/auth/login-google`);
            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                setError("Failed to get Google OAuth URL");
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
            const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/auth/google/check-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                // Store authentication data
                if (data.jwt) {
                    sessionStorage.setItem('accessToken', data.jwt);
                    console.log("JWT Token:", data.jwt);
                }
                if (data.user) {
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                    sessionStorage.setItem("activity", JSON.stringify(data.suggestedActivity));
                }
                
                // Redirect to success page
                navigate("/success");
            } else {
                setError("Sign-in failed: " + (data.message || "Unknown error"));
                setIsLoading(false);
            }
        } catch (error) {
            setError("Error processing authentication");
            setIsLoading(false);
            console.error("Error processing Google auth code:", error);
        }
    }

    // if (error) {
    //     return (
    //         <div className="flex flex-col items-center justify-center min-h-screen p-4">
    //             <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
    //                 <h2 className="text-xl font-semibold text-red-700 mb-2">Authentication Error</h2>
    //                 <p className="text-red-600">{error}</p>
    //                 <button 
    //                     onClick={() => window.location.href = '/user-signin'}
    //                     className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
    //                 >
    //                     Try Again
    //                 </button>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">
                    {isLoading ? "Connecting to Google..." : "Processing..."}
                </h2>
                <p className="text-gray-600 mb-4">
                    Please wait while we authenticate your account.
                </p>
                <div 
                    className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"
                    role="status"
                    aria-label="Loading"
                />
            </div>
        </div>
    );
}

export default SignInLoadingPage;