import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion"; // For adding animations

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

        <motion.div
          className="relative flex flex-col items-center justify-center z-10 text-center text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl font-bold mb-6 animate__animated animate__fadeIn animate__delay-1s">
            Welcome to 10THKL Boys Brigade
          </h1>
          <p className="text-xl mb-8 animate__animated animate__fadeIn animate__delay-2s">
            We are thrilled to have you here! Explore our community and make a difference.
          </p>
          <motion.button
            className="bg-yellow-500 text-black py-3 px-6 rounded-full shadow-lg hover:bg-yellow-600 transition duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => toast.info("You clicked the button!")}
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>
    </>
  );
};

export default Home;
