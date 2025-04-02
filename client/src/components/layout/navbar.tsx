import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Laptop, 
  Menu, 
  X, 
  LogOut, 
  User, 
  ShoppingCart, 
  Settings,
  Wrench
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-white shadow fixed w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Laptop className="text-primary h-6 w-6 mr-2" />
              <span className="text-primary font-bold text-xl">SellGadgetz</span>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/" className={`${isActive('/') ? 'text-primary' : 'text-gray-700'} hover:text-primary transition`}>
              Home
            </Link>
            <Link href="/#services" className="text-gray-700 hover:text-primary transition">
              Services
            </Link>
            <Link href="/#how-it-works" className="text-gray-700 hover:text-primary transition">
              How It Works
            </Link>
            <Link href="/#faq" className="text-gray-700 hover:text-primary transition">
              FAQ
            </Link>
            <Link href="/#contact" className="text-gray-700 hover:text-primary transition">
              Contact
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/sell" className="cursor-pointer">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>Sell Laptop</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/repair" className="cursor-pointer">
                      <Wrench className="mr-2 h-4 w-4" />
                      <span>Repair Service</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Admin</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth?tab=login" className="text-primary hover:text-primary-dark font-medium">
                  Login
                </Link>
                <Link href="/auth?tab=register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium">
                  Register
                </Link>
              </>
            )}
            
            <button 
              className="md:hidden text-gray-500 focus:outline-none" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-2 pt-2 pb-4 space-y-3">
            <Link href="/" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Home
            </Link>
            <Link href="/#services" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Services
            </Link>
            <Link href="/#how-it-works" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              How It Works
            </Link>
            <Link href="/#faq" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              FAQ
            </Link>
            <Link href="/#contact" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Contact
            </Link>
            {user && (
              <>
                <Link href="/dashboard" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Dashboard
                </Link>
                <Link href="/sell" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Sell Laptop
                </Link>
                <Link href="/repair" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Repair Service
                </Link>
                {user.isAdmin && (
                  <Link href="/admin" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
