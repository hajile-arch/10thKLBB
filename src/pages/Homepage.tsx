import  { useState, useEffect } from "react";
import CountdownTimer from "../components/Homepage/CountdownTimer";
import { getDataFromFirebase } from "../firebase/firebaseUtils";
import Header from "../components/Homepage/Header";

export default function Homepage() {
  const [nextParadeDate, setNextParadeDate] = useState<Date | null>(null);

  useEffect(() => {

    const fetchParades = async () => {
      const result = await getDataFromFirebase("parades");

      if (result.success) {
        const parades = result.data;

        // Flatten the parade dates into a single array
        const allParadeDates: Date[] = [];
        Object.values(parades).forEach((month: any) => {
          Object.values(month).forEach((parade: any) => {
            allParadeDates.push(new Date(parade.date));
          });
        });

        // Find the next parade date (the one that's in the future)
        const now = new Date();
        const futureParades = allParadeDates.filter((date) => date > now);
        const nextParade = futureParades.sort((a, b) => a.getTime() - b.getTime())[0];

        if (nextParade) {
          setNextParadeDate(nextParade);
        }
      } else {
        console.error(result.message);
      }
    };

    fetchParades();

  }, []);

  
  return (
    <div className="font-sans">

      {/* Header Section */}
      <Header></Header>

      {/* Welcome Section */}
      <div
        className="h-screen w-screen bg-cover bg-center text-white font-bebas flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-16 px-8 relative"
        style={{ backgroundImage: 'url("/images/bg_landing_1.png")' }}
      >
        <div className="text-center md:text-left mr-[80px]">
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
        {nextParadeDate ? (
          <div className="mt-8">
            <CountdownTimer targetDate={nextParadeDate} />
          </div>
        ) : (
          <div className="mt-8 text-center text-xl">Loading next parade...</div>
        )}

        {/* Rotated Phrase */}
        <div className="absolute top-1/2 right-[-40px] transform -translate-y-1/2 -rotate-90 text-2xl text-white">
          <p className="">SURE & STEDFAST</p>
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
              marginTop: "20px",
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
