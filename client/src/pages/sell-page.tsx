import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import LaptopForm from "@/components/sell/laptop-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, LaptopIcon } from "lucide-react";

export default function SellPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Sell Your Laptop</h1>
              <p className="text-gray-600 mt-2">
                List your used laptop for sale on our secure marketplace
              </p>
            </div>

            <Alert className="mb-8">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Important Information</AlertTitle>
              <AlertDescription>
                All listings are reviewed by our team before being published to ensure quality and accuracy. 
                Please provide accurate details about your laptop to speed up the approval process.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LaptopIcon className="mr-2 h-5 w-5" />
                  Laptop Details
                </CardTitle>
                <CardDescription>
                  Fill out the form below with your laptop's specifications and condition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LaptopForm />
              </CardContent>
            </Card>

            <div className="mt-8 space-y-4 text-sm text-gray-600">
              <p>
                <strong>Note:</strong> By submitting this form, you confirm that you are the legitimate owner of this laptop 
                and that all information provided is accurate and truthful.
              </p>
              <p>
                <strong>Security:</strong> For your protection and that of buyers, all transactions are processed securely 
                through our platform, and all users undergo identity verification.
              </p>
              <p>
                <strong>Listing Fee:</strong> There are no upfront fees to list your laptop. A small commission fee will 
                be applied only once your laptop is sold.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
