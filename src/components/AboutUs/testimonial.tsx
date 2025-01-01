import { Quote } from "lucide-react";
import { useState } from "react";

// Define the type for a testimonial
interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  image: string;
}

const TestimonialsSection = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Ashley Wong",
      role: "Staff Sergeant",
      content: "我叫Ashley.",
      image: "/images/pfp/ashley.jpg",
    },
    {
      id: 2,
      name: "Yan Yu",
      role: "Sergeant",
      content:
        "This parade is an amazing experience! It brought my family closer together and created memories we'll cherish forever.",
      image: "/images/pfp/cheah-yan-yu.jpg",
    },
    {
      id: 3,
      name: "Gabriel Ho",
      role: "Corporal",
      content:
        "The community spirit here is incredible. The organization and flow of the event are seamless.",
      image: "/images/pfp/caleb-loo.jpg",
    },
    {
      id: 4,
      name: "Jee Hong",
      role: "Lance Corporal",
      content:
        "The community spirit here is incredible. The organization and flow of the event are seamless.",
      image: "/images/pfp/janae-lee.jpg",
    },
  ];

  const [flippedCard, setFlippedCard] = useState<number | null>(null);

  const handleFlip = (id: number) => {
    setFlippedCard(flippedCard === id ? null : id);
  };

  return (
    <section className="relative py-20 px-6 bg-gray-50">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("/images/testimonial.png")`,
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Members Say
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-yellow-500 to-red-500 mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative h-96 cursor-pointer [perspective:1000px]"
              onClick={() => handleFlip(testimonial.id)}
            >
              <div
                className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
                  flippedCard === testimonial.id ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                {/* Front Side */}
                <div className="absolute inset-0 bg-white rounded-2xl [backface-visibility:hidden]">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-end text-white rounded-2xl pb-5">
                    <h3 className="font-bold text-xl">{testimonial.name}</h3>
                    <p className="text-sm">{testimonial.role}</p>
                  </div>
                </div>

                {/* Back Side */}
                <div
                  className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl flex flex-col justify-center p-6 [transform:rotateY(180deg)] [backface-visibility:hidden]"
                >
                  <Quote className="w-8 h-8 text-gray-400 mb-4" />
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    {testimonial.content}
                  </p>
                  <p className="text-right text-gray-500">
                    - {testimonial.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;