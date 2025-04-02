import { Star } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: "Oluwaseun A.",
      location: "Lagos, Nigeria",
      rating: 5,
      message: "I sold my MacBook Pro through SellGadgetz and was amazed by how smooth the process was. Identity verification made me feel secure, and payment was processed quickly.",
      avatar: "https://randomuser.me/api/portraits/men/54.jpg"
    },
    {
      id: 2,
      name: "Ngozi E.",
      location: "Abuja, Nigeria",
      rating: 5,
      message: "My HP laptop wouldn't turn on, and I was worried about losing my data. The repair team at SellGadgetz not only fixed the issue but also recovered all my important files. Worth every naira!",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg"
    },
    {
      id: 3,
      name: "Chukwudi O.",
      location: "Port Harcourt, Nigeria",
      rating: 4.5,
      message: "I bought a Dell XPS through SellGadgetz at a fantastic price. The verification process gave me peace of mind that I was getting exactly what was advertised. The live chat support was especially helpful.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    }
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-yellow-400 text-yellow-400 h-4 w-4" />);
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half-star" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400 h-4 w-4">
          <defs>
            <linearGradient id="half" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polygon fill="url(#half)" stroke="currentColor" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    }

    // Add empty stars if needed
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="text-yellow-400 h-4 w-4" />);
    }

    return stars;
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Read testimonials from our satisfied customers who have used our laptop marketplace and repair services.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {renderStars(testimonial.rating)}
                </div>
              </div>
              <p className="italic text-gray-600 mb-6">{testimonial.message}</p>
              <div className="flex items-center">
                <div className="mr-4 w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
