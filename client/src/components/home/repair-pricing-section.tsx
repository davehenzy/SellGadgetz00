import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function RepairPricingSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Repair Services Pricing</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transparent pricing for our most common laptop repair services. All prices are estimates and may vary based on specific model and damage.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Basic Repairs */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Basic Repairs</h3>
              <div className="text-blue-700 text-3xl font-bold mt-2">₦15,000 - ₦30,000</div>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <span>Software troubleshooting</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <span>Operating system reinstallation</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <span>Virus/malware removal</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <span>Basic hardware diagnostics</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <span>RAM/storage upgrades</span>
              </li>
            </ul>
            <div className="text-center">
              <Link href="/repair?type=basic">
                <Button className="bg-blue-700 hover:bg-blue-800">Request Basic Repair</Button>
              </Link>
            </div>
          </div>
          
          {/* Standard Repairs */}
          <div className="bg-white rounded-lg shadow-md p-8 transform md:scale-105 border-2 border-blue-700">
            <div className="text-center mb-6">
              <div className="bg-blue-700 text-white py-1 px-4 rounded-full text-xs font-bold inline-block mb-2">MOST POPULAR</div>
              <h3 className="text-2xl font-bold text-gray-900">Standard Repairs</h3>
              <div className="text-blue-700 text-3xl font-bold mt-2">₦25,000 - ₦60,000</div>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <span>Screen replacement</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <span>Keyboard replacement</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <span>Battery replacement</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <span>Charging port repair</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <span>Fan/cooling system cleaning</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <span>All basic repairs included</span>
              </li>
            </ul>
            <div className="text-center">
              <Link href="/repair?type=standard">
                <Button className="bg-blue-700 hover:bg-blue-800">Request Standard Repair</Button>
              </Link>
            </div>
          </div>
          
          {/* Advanced Repairs */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Advanced Repairs</h3>
              <div className="text-blue-700 text-3xl font-bold mt-2">₦45,000 - ₦120,000</div>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <span>Motherboard repair/replacement</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <span>Graphics card repair</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <span>Water damage recovery</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <span>Data recovery services</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <span>Complex hardware diagnostics</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <span>All standard repairs included</span>
              </li>
            </ul>
            <div className="text-center">
              <Link href="/repair?type=advanced">
                <Button className="bg-blue-700 hover:bg-blue-800">Request Advanced Repair</Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-100 text-center">
          <p className="text-gray-600 mb-4">Not sure what repair you need? Request a free diagnostic assessment.</p>
          <Link href="/repair?type=diagnostic">
            <Button variant="outline" className="bg-white text-blue-700 border-blue-700 hover:bg-blue-50">
              Request Diagnostic
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
