import { Phone, Mail, Clock, MapPin, ExternalLink } from "lucide-react";
import { useState } from "react";

interface Contact {
  id: number;
  name: string;
  role: string;
  phone: string;

}

const ContactSection = () => {
  const contacts: Contact[] = [
    {
      id: 1,
      name: "Mdm Jenna",
      role: "Head of Senior Section",
      phone: "016-643 1987",

    },
    {
      id: 2,
      name: "Mr Emanuel",
      role: "Head of Recruits",
      phone: "018-297 7371",

    },
    {
      id: 3,
      name: "Inst Yong Hang",
      role: "BB Storekeeper",
      phone: "017-603 2551",

    },
  ];

  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section className="relative py-16 px-6 bg-gray-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#1f1f1f,transparent)]" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,#2563eb,transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-100 mb-4">
            Got More Questions?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Parents' meet and greet is on the <span className="font-bold">15th Febraury 2025, 11am to 1pm at SSIS.</span>
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto">
           Or... you may contact anyone of us here !
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="group relative bg-gray-800 rounded-xl p-6 border border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
              onMouseEnter={() => setHoveredCard(contact.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Card Content */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-100">
                      {contact.name}
                    </h3>
                    <p className="text-blue-400">{contact.role}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Phone className="w-4 h-4 text-blue-400" />
                    <p>{contact.phone}</p>
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div
                className={`absolute inset-0 bg-blue-500/5 rounded-xl transition-opacity duration-300 ${
                  hoveredCard === contact.id ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;