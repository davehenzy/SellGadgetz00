import { Link } from "wouter";
import { Laptop, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-6">
              <Laptop className="text-yellow-400 h-6 w-6 mr-2" />
              <span className="text-white font-bold text-xl">SellGadgetz</span>
            </div>
            <p className="text-gray-300 mb-6">Your trusted platform for buying, selling, and repairing laptops in Nigeria.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-300 hover:text-white transition">Home</Link></li>
              <li><Link href="/#services" className="text-gray-300 hover:text-white transition">Services</Link></li>
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition">Browse Laptops</Link></li>
              <li><Link href="/repair" className="text-gray-300 hover:text-white transition">Repair Services</Link></li>
              <li><Link href="/#how-it-works" className="text-gray-300 hover:text-white transition">How It Works</Link></li>
              <li><Link href="/#contact" className="text-gray-300 hover:text-white transition">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition">My Account</Link></li>
              <li><Link href="/#" className="text-gray-300 hover:text-white transition">Help Center</Link></li>
              <li><Link href="/#faq" className="text-gray-300 hover:text-white transition">FAQs</Link></li>
              <li><Link href="/#" className="text-gray-300 hover:text-white transition">Payment Methods</Link></li>
              <li><Link href="/#" className="text-gray-300 hover:text-white transition">Shipping Info</Link></li>
              <li><Link href="/#contact" className="text-gray-300 hover:text-white transition">Report an Issue</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Newsletter</h3>
            <p className="text-gray-300 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="mb-4" onSubmit={(e) => e.preventDefault()}>
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full rounded-r-none" 
                />
                <Button type="submit" className="rounded-l-none">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
            <p className="text-gray-300 text-sm">By subscribing, you agree to our Terms of Service and Privacy Policy.</p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">&copy; {new Date().getFullYear()} SellGadgetz. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
