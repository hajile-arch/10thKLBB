import ContactSection from "../components/AboutUs/contact";
import TestimonialsSection from "../components/AboutUs/testimonial";
import Header from "../components/Homepage/Header";

const Aboutus = () => {
  return (
    <div className="bg-gray-700 text-gray-800">
      <Header />

      {/* First Screen: Group Picture and 5Ws 1H */}
      <section className="relative flex flex-col lg:flex-row items-center justify-between py-16 px-10 min-h-screen overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gray-900">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-95"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b3b3b,transparent)]"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-500/10 rounded-full filter blur-3xl"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-red-500/10 rounded-full filter blur-3xl"></div>
          </div>
        </div>

        {/* Left: The 5Ws and 1H */}
        <div className="lg:w-1/2 lg:mb-0 flex flex-col h-full items-end justify-center pr-[120px] relative z-10">
  <div>
    <h2 className="font-rebond text-8xl font-bold mb-4 text-gray-200">
      5W's 1H
    </h2>
    <h2 className="font-rebond text-8xl font-bold">
      <span className="text-gray-200">Of</span>{" "}
      <span className="animated-gradient-text">
        10th KL
      </span>
    </h2>
  </div>
</div>


        {/* Right: Group Picture */}
        <div className="lg:w-1/2 relative z-10">
          <img
            src="/images/about-us.jpg"
            alt="10th KL BB Group Picture"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </section>
      
      <section className="relative py-20 px-8 bg-[#f8f7f2] overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full filter blur-[100px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/20 rounded-full filter blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Who Box */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-red-600 rounded-lg opacity-30"></div>
              <div className="relative bg-gray-100 rounded-lg p-8 ring-1 ring-gray-300 h-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <div className="absolute right-4 top-4 text-6xl font-bold text-gray-300">
                  01
                </div>
                <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-500 to-red-600 text-transparent bg-clip-text">
                  Who
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  The 10th KL Boys' Brigade consists of dedicated members aged
                  12-19, along with committed officers and volunteers who guide
                  and mentor these young individuals.
                </p>
              </div>
            </div>

            {/* What Box */}
            <div className="group relative mt-8 md:mt-16 lg:mt-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-red-600 rounded-lg opacity-30"></div>
              <div className="relative bg-gray-100 rounded-lg p-8 ring-1 ring-gray-300 h-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <div className="absolute right-4 top-4 text-6xl font-bold text-gray-300">
                  02
                </div>
                <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-500 to-red-600 text-transparent bg-clip-text">
                  What
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  We engage in character-building activities, community service,
                  leadership training, and spiritual development programs
                  throughout the year.
                </p>
              </div>
            </div>

            {/* When Box */}
            <div className="group relative mt-8 md:mt-32 lg:mt-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-red-600 rounded-lg opacity-30"></div>
              <div className="relative bg-gray-100 rounded-lg p-8 ring-1 ring-gray-300 h-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <div className="absolute right-4 top-4 text-6xl font-bold text-gray-300">
                  03
                </div>
                <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-500 to-red-600 text-transparent bg-clip-text">
                  When
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Weekly meetings are held every Saturday from 9:00 AM to 12:00
                  PM, with special events and camps organized during school
                  holidays.
                </p>
              </div>
            </div>

            {/* Where Box */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-red-600 rounded-lg opacity-30"></div>
              <div className="relative bg-gray-100 rounded-lg p-8 ring-1 ring-gray-300 h-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <div className="absolute right-4 top-4 text-6xl font-bold text-gray-300">
                  04
                </div>
                <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-500 to-red-600 text-transparent bg-clip-text">
                  Where
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Our activities take place at our main headquarters and various
                  locations around Kuala Lumpur, including community centers and
                  outdoor facilities.
                </p>
              </div>
            </div>

            {/* Why Box */}
            <div className="group relative mt-8 md:mt-16 lg:mt-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-red-600 rounded-lg opacity-30"></div>
              <div className="relative bg-gray-100 rounded-lg p-8 ring-1 ring-gray-300 h-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <div className="absolute right-4 top-4 text-6xl font-bold text-gray-300">
                  05
                </div>
                <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-500 to-red-600 text-transparent bg-clip-text">
                  Why
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  We aim to nurture young people in Christian values, develop
                  leadership skills, and create positive impacts in our
                  community through service and fellowship.
                </p>
              </div>
            </div>

            {/* How Box */}
            <div className="group relative mt-8 md:mt-32 lg:mt-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-red-600 rounded-lg opacity-30"></div>
              <div className="relative bg-gray-100 rounded-lg p-8 ring-1 ring-gray-300 h-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <div className="absolute right-4 top-4 text-6xl font-bold text-gray-300">
                  06
                </div>
                <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-500 to-red-600 text-transparent bg-clip-text">
                  How
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Through structured programs, mentoring, hands-on activities,
                  leadership opportunities, and community engagement projects
                  guided by experienced officers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 px-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden">
        {/* Simple Background Effects */}
        <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full filter blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full filter blur-[100px]"></div>
        </div>

        <h2 className="text-4xl font-bold text-center mb-12 relative z-10">
          <span className="text-white">
            Parade Flow Details
          </span>
        </h2>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-600 opacity-30"></div>

          {/* Timeline Items */}
          <div className="space-y-8">
            {[
              {
                time: "7:45am - 8:00am",
                event: "Band, Dancing and Singing Fall In",
                icon: "💂",
              },
              { time: "8:00am - 10:00am", event: "Band", icon: "🎺" },
              {
                time: "10:00am - 10:15am",
                event: "Opening Parade",
                icon: "🚩",
              },
              {
                time: "10:15am - 11:00am",
                event: "Senior BadgeWork Classes",
                icon: "📚",
              },
              { time: "11:00am - 11:45am", event: "Senior Drill", icon: "⭐" },
              { time: "11:45am - 12:00pm", event: "Short Break", icon: "☕" },
              {
                time: "12:00pm - 12:25pm",
                event: "Praise and Worship",
                icon: "🙏",
              },
              { time: "12:25pm - 12:55pm", event: "Word Session", icon: "📖" },
              { time: "12:55pm - 1:10pm", event: "Announcements", icon: "📢" },
              { time: "1:10pm - 1:30pm", event: "Closing Parade", icon: "🏁" },
            ].map((item, index) => (
              <div
                key={index}
                className={`flex ${
                  index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                } items-center gap-8 group`}
              >
                {/* Timeline Content */}
                <div
                  className={`w-1/2 ${
                    index % 2 === 0 ? "text-right" : "text-left"
                  }`}
                >
                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-yellow-200 rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-gray-800 p-6 rounded-lg transform group-hover:-translate-y-1 transition-all duration-300">
                      <div className="text-xl font-semibold mb-2 text-white">
                        {item.time}
                      </div>
                      <div className="text-gray-300 text-lg">{item.event}</div>
                    </div>
                  </div>
                </div>

                {/* Timeline Node */}
                <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 border-4 border-gray-900 z-10 transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">{item.icon}</span>
                </div>

                {/* Empty Space for Alignment */}
                <div className="w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
    </section>

    <TestimonialsSection></TestimonialsSection>

      {/* Section 4: Who to Contact */}
      <ContactSection></ContactSection>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-6 text-center relative z-10">
        <p>© 2024 10th KL Boys' Brigade. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Aboutus;
