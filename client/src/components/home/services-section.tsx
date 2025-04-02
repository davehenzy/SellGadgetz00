import { Link } from "wouter";
import { Laptop, Wrench, ShieldCheck, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We provide comprehensive solutions for all your laptop needs, from buying and selling to repairs and maintenance.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Sell Laptops Service */}
          <div className="bg-gray-50 rounded-lg p-8 shadow-sm hover:shadow-md transition">
            <div className="bg-blue-700 inline-block p-4 rounded-full text-white mb-6">
              <Laptop className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Sell Your Used Laptop</h3>
            <p className="text-gray-600 mb-6">
              List your used laptop for sale securely. Upload specs, photos, and set your price. We verify buyers to ensure safe transactions.
            </p>
            <ul className="mb-8 space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Easy listing process</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Verified buyer protection</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Secure payment processing</span>
              </li>
            </ul>
            <Link href="/sell">
              <Button className="bg-blue-700 hover:bg-blue-800">Sell Now</Button>
            </Link>
          </div>
          
          {/* Repair Service */}
          <div className="bg-gray-50 rounded-lg p-8 shadow-sm hover:shadow-md transition">
            <div className="bg-green-600 inline-block p-4 rounded-full text-white mb-6">
              <Wrench className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Professional Laptop Repairs</h3>
            <p className="text-gray-600 mb-6">
              Expert technicians to fix your laptop issues. Request service, get a quote, and track repairs through our transparent process.
            </p>
            <ul className="mb-8 space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Hardware & software fixes</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Transparent pricing</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Fast turnaround time</span>
              </li>
            </ul>
            <Link href="/repair">
              <Button className="bg-green-600 hover:bg-green-700">Request Repair</Button>
            </Link>
          </div>
        </div>
        
        {/* Additional Services */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-blue-100 p-3 inline-block rounded-full mb-4">
                  <ShieldCheck className="text-blue-700 h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Identity Verification</h3>
                <p className="text-gray-600">We verify all users to create a secure marketplace experience.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-blue-100 p-3 inline-block rounded-full mb-4">
                  <MessageSquare className="text-blue-700 h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Live Support</h3>
                <p className="text-gray-600">Get instant help from our customer service team anytime.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-blue-100 p-3 inline-block rounded-full mb-4">
                  <FileText className="text-blue-700 h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Invoicing System</h3>
                <p className="text-gray-600">Professional invoices for all transactions and repairs.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
