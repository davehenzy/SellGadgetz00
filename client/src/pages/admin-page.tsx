import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import LaptopListings from "@/components/admin/laptop-listings";
import RepairRequests from "@/components/admin/repair-requests";
import UserManagement from "@/components/admin/user-management";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { User, Laptop, Repair, Invoice } from "@shared/schema";
import { 
  Users, 
  ShoppingCart, 
  Wrench, 
  FileText, 
  Settings,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("laptops");

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!user?.isAdmin,
  });

  const { data: laptops, isLoading: isLoadingLaptops } = useQuery<Laptop[]>({
    queryKey: ["/api/laptops"],
    enabled: !!user?.isAdmin,
  });

  const { data: repairs, isLoading: isLoadingRepairs } = useQuery<Repair[]>({
    queryKey: ["/api/repairs"],
    enabled: !!user?.isAdmin,
  });

  const { data: invoices, isLoading: isLoadingInvoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
    enabled: !!user?.isAdmin,
  });

  // Check for authentication issues
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
        <span>User not authenticated</span>
      </div>
    );
  }
  
  // Admin check - We'll handle redirect in the ProtectedRoute component
  if (!user.isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
        <span>Access denied. Admin privileges required.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage the SellGadgetz platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                  <p className="text-3xl font-bold">{users ? users.length : 0}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
                  Laptops
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingLaptops ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                  <p className="text-3xl font-bold">{laptops ? laptops.length : 0}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-green-600" />
                  Repairs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingRepairs ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                  <p className="text-3xl font-bold">{repairs ? repairs.length : 0}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-yellow-600" />
                  Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingInvoices ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                  <p className="text-3xl font-bold">{invoices ? invoices.length : 0}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="laptops" className="flex items-center">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Laptop Listings
              </TabsTrigger>
              <TabsTrigger value="repairs" className="flex items-center">
                <Wrench className="mr-2 h-4 w-4" />
                Repair Requests
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="laptops">
              <LaptopListings />
            </TabsContent>

            <TabsContent value="repairs">
              <RepairRequests />
            </TabsContent>
            
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                  <CardDescription>Manage global settings for the platform</CardDescription>
                </CardHeader>
                <CardContent className="py-12 text-center text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Settings page is currently under development.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
