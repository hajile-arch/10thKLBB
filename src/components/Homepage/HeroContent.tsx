import { motion } from "framer-motion";
import { toast } from "react-toastify";

const HeroContent = () => {
  return (
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
  );
};

export default HeroContent;
