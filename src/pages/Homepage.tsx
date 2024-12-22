import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import HeroContent from "../components/Homepage/HeroContent"; // Import the new HeroContent component

const Home = () => {
  useEffect(() => {
    // Show toast after 3 seconds
    setTimeout(() => {
      toast.success("Welcome to our awesome website!", {
        position: "top-center", // Position updated
        autoClose: 3000,
      });
    }, 3000);
  }, []);

  return (
    <>
      {/* Success Toast Notification */}
      <ToastContainer />

      <div className="h-screen flex items-center justify-center relative w-screen overflow-hidden">
        {/* Background Animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-50"
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        {/* Hero Content */}
        <HeroContent />
      </div>
    </>
  );
};

export default Home;
