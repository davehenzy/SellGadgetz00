import { useEffect } from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import ServicesSection from "@/components/home/services-section";
import HowItWorksSection from "@/components/home/how-it-works-section";
import FeaturedLaptopsSection from "@/components/home/featured-laptops-section";
import RepairPricingSection from "@/components/home/repair-pricing-section";
import TestimonialsSection from "@/components/home/testimonials-section";
import FAQSection from "@/components/home/faq-section";
import ContactSection from "@/components/home/contact-section";

export default function HomePage() {
  // Handle smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.hash && anchor.hash.startsWith('#')) {
        e.preventDefault();
        
        const id = anchor.hash.substring(1);
        const element = document.getElementById(id);
        
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 80, // Adjust for header height
            behavior: 'smooth'
          });
          
          // Update URL without scrolling
          window.history.pushState(null, '', anchor.hash);
        }
      }
    };
    
    document.addEventListener('click', handleAnchorClick);
    
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16">
        <HeroSection />
        <ServicesSection />
        <HowItWorksSection />
        <FeaturedLaptopsSection />
        <RepairPricingSection />
        <TestimonialsSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
