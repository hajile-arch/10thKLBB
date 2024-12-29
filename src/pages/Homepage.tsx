import CountdownTimer from "../components/Homepage/CountdownTimer";
import { Link } from "react-router-dom"; // Import Link if you're using React Router

export default function Homepage() {
  const targetDate = new Date("2025-01-18T07:30:00");

  return (
    <div className="font-sans">
      {/* Header Section */}
      <div className="absolute bg-transparent text-white py-4 w-full z-50">
        <div className="container mx-auto">
          <div className="flex justify-center space-x-10 py-2">
            <a
              href="#about"
              className="text-xl hover:text-gray-400 transition duration-300"
            >
              About Us
            </a>
            <Link
              to="/user"
              className="text-xl hover:text-gray-400 transition duration-300"
            >
              Members
            </Link>
            <a
              href="#officers"
              className="text-xl hover:text-gray-400 transition duration-300"
            >
              Officers
            </a>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div
        className="h-screen w-screen bg-cover bg-center text-white font-bebas flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-16 px-8 relative"
        style={{ backgroundImage: 'url("/images/bg_landing_1.png")' }}
      >
        <div className="text-center md:text-left mr-[80px]">
          {/* Welcome Text */}
          <h1 className="text-9xl md:text-8xl font-extrabold tracking-wider leading-tight ">
            Welcome
          </h1>
          <h2 className="text-9xl md:text-8xl font-extrabold tracking-wider leading-tight ">
            To
          </h2>
          <h3 className="text-9xl md:text-8xl font-extrabold tracking-wider leading-tight ">
            10th KL
          </h3>
          <h3 className="text-9xl md:text-8xl font-extrabold tracking-wider leading-tight ">
            Boys' Brigade
          </h3>
        </div>
        {/* Countdown Timer */}
        <div className="mt-8">
          <CountdownTimer targetDate={targetDate} />
        </div>

        {/* Rotated Phrase */}
        <div className="absolute top-1/2 right-[-40px] transform -translate-y-1/2 -rotate-90 text-2xl text-white">
          <p className="">
            SURE & STEADFAST
          </p>
        </div>
      </div>

      {/* Video Section */}
      <div className="relative h-screen bg-white flex items-center justify-center">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            style={{
              fontSize: "200px",
              fontWeight: "bold",
              color: "transparent",
              WebkitTextStroke: "2px #000", // Black stroke color
              textAlign: "center",
              letterSpacing: "2px",
              lineHeight: "1.2",
            }}
            className="tracking-wider leading-none"
          >
            2024 RECAP
          </div>
          <div
            style={{
              fontSize: "200px",
              fontWeight: "bold",
              color: "black",
              textAlign: "center",
              letterSpacing: "2px",
              lineHeight: "1.2",
            }}
            className="tracking-wider leading-none mt-4"
          >
            2024 RECAP
          </div>
          <div
            style={{
              fontSize: "200px",
              fontWeight: "bold",
              color: "transparent",
              WebkitTextStroke: "2px #000", // Black stroke color
              textAlign: "center",
              letterSpacing: "2px",
              lineHeight: "1.2",
              marginBottom: "50px",
            }}
            className="tracking-wider leading-none mt-4"
          >
            2024 RECAP
          </div>
        </div>
        {/* YouTube Video */}
        <div className="z-10 max-w-2xl w-full mx-8">
          <iframe
            src="https://www.youtube.com/embed/EcRuA0XtmQo"
            title="2024 Annual Recap"
            className="w-full aspect-video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* Who Are We Section */}
      <div className="bg-gray-900 text-white py-20 px-8" id="about">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:space-x-10">
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold mb-4 ">
              Who Are We?
            </h2>
            <p className="text-lg mt-5 ">
              "The Boys' Brigade is the world's first uniformed organization for
              young people. We are dedicated to building character, leadership,
              and service among youth. Our mission is to empower young
              individuals to lead with integrity, serve with passion, and make a
              difference in their communities."
            </p>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0 ml-5">
            <img
              src="/images/group-photo.jpg"
              alt="Group Photo"
              className="rounded-lg shadow-lg w-full object-cover transform hover:scale-105 transition duration-300"
            />
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-black text-gray-400 py-6 text-center">
        <p>© 2024 10th KL Boys' Brigade. All rights reserved.</p>
      </footer>
    </div>
  );
}
