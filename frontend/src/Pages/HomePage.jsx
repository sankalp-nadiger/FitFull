import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center text-center p-10 bg-blue-600 text-white">
                <motion.h1 
                    className="text-4xl font-bold mb-4"
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.6 }}
                >
                    Welcome to FitFull
                </motion.h1>
                <p className="text-lg mb-6 max-w-xl">
                    Your all-in-one platform for physical well-being. Stay healthy, stay fitfull.
                </p>
                <Button 
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-200"
                    onClick={() => navigate("/roleselect")}
                >
                    Get Started
                </Button>
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

const testimonials = [
    { text: "FitFull changed my life! I feel healthier and happier every day.", author: "Aman S." },
    { text: "Great platform for tracking wellness and mental health.", author: "Priya K." },
    { text: "I love how easy it is to stay on top of my health goals!", author: "Rahul M." }
];
