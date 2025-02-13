import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero Section */}
            <section className="relative flex flex-col items-center justify-center text-center p-10 bg-blue-600 text-white">
                <motion.h1 
                    className="text-5xl font-bold mb-4"
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.6 }}
                >
                    Welcome to FitFull
                </motion.h1>
                <p className="text-lg mb-6 max-w-xl">
                    Your all-in-one platform for **physical & mental wellness**. Track your health, consult doctors, and stay fit.
                </p>
                <Button 
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-200"
                    onClick={() => navigate("/auth")}
                >
                    Get Started
                </Button>

                {/* Background Health Image */}
                <img 
                    src="/images/fitness-hero.jpg" // Replace with an actual image
                    alt="Healthy Lifestyle"
                    className="absolute bottom-0 right-0 w-1/3 opacity-30"
                />
            </section>

            {/* Features Section */}
            <section className="py-12 px-6">
                <h2 className="text-4xl font-semibold text-center mb-8">Our Key Features</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div 
                            key={index} 
                            className="flex justify-center"
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: index * 0.2 }}
                        >
                            <Card className="p-4 shadow-lg bg-white text-center">
                                <img 
                                    src={feature.image} 
                                    alt={feature.title} 
                                    className="w-24 h-24 mx-auto mb-4"
                                />
                                <CardContent>
                                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                                    <p className="text-gray-700 mt-2">{feature.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Telemedicine Section */}
            <section className="flex flex-col items-center justify-center text-center p-10 bg-gray-100">
                <h2 className="text-4xl font-semibold mb-6">Instant Telemedicine Consultation</h2>
                <p className="text-lg max-w-2xl mb-6">
                    Connect with **certified doctors** in real-time, get instant **health advice**, and track your prescriptions seamlessly.
                </p>
                {/* <img 
                    // src="/images/telemedicine.jpg" // Replace with an actual image
                    alt="Telemedicine"
                    className="w-full md:w-2/3 rounded-lg shadow-lg"
                /> */}
            </section>

            {/* Testimonials */}
            <section className="py-12 px-6">
                <h2 className="text-3xl font-semibold text-center mb-8">What Our Users Say</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <motion.div 
                            key={index} 
                            className="flex justify-center"
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: index * 0.2 }}
                        >
                            <Card className="p-4 shadow-lg">
                                <CardContent>
                                    <p className="text-gray-700 italic">"{testimonial.text}"</p>
                                    <p className="mt-4 font-semibold text-right">- {testimonial.author}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto bg-gray-800 text-white text-center py-4">
                <p className="text-sm">© {new Date().getFullYear()} FitFull. All rights reserved.</p>
                <div className="mt-2">
                    <a href="#" className="text-blue-400 mx-2 hover:underline">Privacy Policy</a>
                    <a href="#" className="text-blue-400 mx-2 hover:underline">Terms of Service</a>
                </div>
            </footer>
        </div>
    );
}

/* Feature Cards Data */
const features = [
    {
        title: "Wearable Integration",
        description: "Sync your smartwatch & track real-time fitness data.",
        image: "https://tse2.mm.bing.net/th?id=OIP.vqtlY_mynVQL_hwpcV6eVwHaD5&pid=Api&P=0&h=180" // Replace with actual image
    },
    {
        title: "Telemedicine",
        description: "Consult with doctors online & get instant prescriptions.",
        image: "https://tse1.mm.bing.net/th?id=OIP.XNfVRaUpn8IyY17U9A7oQQHaE8&pid=Api&P=0&h=180" // Replace with actual image
    },
    {
        title: "Personalized Recommendations",
        description: "AI-driven health tips based on your fitness data.",
        image: "https://tse3.mm.bing.net/th?id=OIP.gO16jJtEafX96qISiszIHgHaDF&pid=Api&P=0&h=180" // Replace with actual image
    },
    {
        title: "Mental Wellness",
        description: "Meditation & self-care resources for better mental health.",
        image: "https://tse3.mm.bing.net/th?id=OIP.s4DV8nqjcu4Qid9B1S-NEgHaGl&pid=Api&P=0&h=180" // Replace with actual image
    },
    {
        title: "Medicine Reminders",
        description: "Get SMS reminders for your medicine schedules.",
        image: "https://tse2.mm.bing.net/th?id=OIP.qM8RHpdoJVfSgKFdG8moYQHaFI&pid=Api&P=0&h=180" // Replace with actual image
    },
    {
        title: "Volunteer Network",
        description: "Connect with MBBS graduates & health volunteers.",
        image: "/https://tse2.mm.bing.net/th?id=OIP.4jQxicHcDeAeQ33LstrBDAHaGC&pid=Api&P=0&h=180" // Replace with actual image
    }
];

/* Testimonials Data */
const testimonials = [
    { text: "FitFull changed my life! I feel healthier and happier every day.", author: "Aman S." },
    { text: "Great platform for tracking wellness and mental health.", author: "Priya K." },
    { text: "I love how easy it is to stay on top of my health goals!", author: "Rahul M." }
];
