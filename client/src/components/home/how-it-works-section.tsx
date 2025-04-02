import { Button } from "@/components/ui/button";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Simple steps to buy, sell, or repair your laptop on our platform.</p>
        </div>
        
        {/* Steps for Selling */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Selling Your Laptop</h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center relative">
              <div className="bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h4 className="text-xl font-semibold mb-2">Create Account</h4>
              <p className="text-gray-600">Sign up and verify your identity for security.</p>
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-blue-700"></div>
            </div>
            <div className="text-center relative">
              <div className="bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h4 className="text-xl font-semibold mb-2">List Laptop</h4>
              <p className="text-gray-600">Upload details, specs, photos and set your price.</p>
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-blue-700"></div>
            </div>
            <div className="text-center relative">
              <div className="bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h4 className="text-xl font-semibold mb-2">Get Verified</h4>
              <p className="text-gray-600">Our team reviews and approves your listing.</p>
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-blue-700"></div>
            </div>
            <div className="text-center">
              <div className="bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
              <h4 className="text-xl font-semibold mb-2">Complete Sale</h4>
              <p className="text-gray-600">Securely receive payment when buyer confirms.</p>
            </div>
          </div>
        </div>
        
        {/* Steps for Repair */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-8">Repairing Your Laptop</h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center relative">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h4 className="text-xl font-semibold mb-2">Request Service</h4>
              <p className="text-gray-600">Submit repair details and upload images of the issue.</p>
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-green-600"></div>
            </div>
            <div className="text-center relative">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h4 className="text-xl font-semibold mb-2">Get Quote</h4>
              <p className="text-gray-600">Receive a transparent price estimate for repairs.</p>
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-green-600"></div>
            </div>
            <div className="text-center relative">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h4 className="text-xl font-semibold mb-2">Approve & Pay</h4>
              <p className="text-gray-600">Review the quote and make secure payment.</p>
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-green-600"></div>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
              <h4 className="text-xl font-semibold mb-2">Receive Repairs</h4>
              <p className="text-gray-600">Get your fully repaired laptop back quickly.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
