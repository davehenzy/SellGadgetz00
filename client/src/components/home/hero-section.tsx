import { Link } from "wouter";
import { 
  ShieldCheck, 
  UserCheck, 
  Wrench, 
  Headset 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="pt-24 pb-12 md:pt-32 md:pb-24 bg-gradient-to-r from-blue-700 to-blue-900 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Buy, Sell, and Repair Laptops with Confidence</h1>
            <p className="text-lg md:text-xl mb-8 text-blue-100">Your secure marketplace for used laptops and professional repair services in Nigeria.</p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/sell">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-blue-700 hover:bg-gray-100">
                  Sell Your Laptop
                </Button>
              </Link>
              <Link href="/repair">
                <Button size="lg" variant="default" className="w-full sm:w-auto bg-yellow-400 text-gray-900 hover:bg-yellow-500 border-none">
                  Repair Service
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 md:pl-12">
            <img 
              src="https://images.unsplash.com/photo-1593642702909-dec73df255d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Laptop marketplace" 
              className="rounded-lg shadow-xl w-full h-auto" 
            />
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="bg-white p-3 rounded-full mb-4">
              <ShieldCheck className="text-blue-700 h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Secure Transactions</h3>
            <p className="text-blue-100 text-sm">Protected payment system</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-white p-3 rounded-full mb-4">
              <UserCheck className="text-blue-700 h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Verified Users</h3>
            <p className="text-blue-100 text-sm">Identity verification</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-white p-3 rounded-full mb-4">
              <Wrench className="text-blue-700 h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Expert Repairs</h3>
            <p className="text-blue-100 text-sm">Certified technicians</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-white p-3 rounded-full mb-4">
              <Headset className="text-blue-700 h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">24/7 Support</h3>
            <p className="text-blue-100 text-sm">Always here to help</p>
          </div>
        </div>
      </div>
    </section>
  );
}
