import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import RepairForm from "@/components/repair/repair-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Wrench } from "lucide-react";

export default function RepairPage() {
  const { user } = useAuth();
  const [location, search] = useLocation();
  const [repairType, setRepairType] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Parse query params for repair type
    if (location.includes('?')) {
      const searchParams = new URLSearchParams(location.split('?')[1]);
      const type = searchParams.get("type");
      if (type) {
        setRepairType(type);
      }
    }
  }, [location]);

  const getRepairTitle = () => {
    switch(repairType) {
      case "basic": return "Basic Laptop Repair";
      case "standard": return "Standard Laptop Repair";
      case "advanced": return "Advanced Laptop Repair";
      case "diagnostic": return "Laptop Diagnostic";
      default: return "Laptop Repair Service";
    }
  };

  const getRepairDescription = () => {
    switch(repairType) {
      case "basic": 
        return "Software troubleshooting, OS reinstallation, virus removal, basic hardware diagnostics";
      case "standard": 
        return "Screen replacement, keyboard replacement, battery replacement, charging port repair";
      case "advanced": 
        return "Motherboard repair, water damage recovery, data recovery, complex hardware issues";
      case "diagnostic": 
        return "Comprehensive diagnostic assessment to identify laptop issues";
      default: 
        return "Professional repair services for your laptop";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{getRepairTitle()}</h1>
              <p className="text-gray-600 mt-2">
                {getRepairDescription()}
              </p>
            </div>

            <Alert className="mb-8">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>How it works</AlertTitle>
              <AlertDescription>
                After submitting your repair request, our technicians will review the details and provide you with a cost estimate. 
                Once approved, we'll begin working on your laptop repair.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="mr-2 h-5 w-5" />
                  Repair Request Form
                </CardTitle>
                <CardDescription>
                  Provide details about your laptop and the issues you're experiencing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RepairForm repairType={repairType} />
              </CardContent>
            </Card>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Free Diagnostics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    We provide a free diagnostic assessment for all repair requests to accurately identify the issues.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">90-Day Warranty</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    All our repairs come with a 90-day warranty covering parts and labor for your peace of mind.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Transparent Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    You'll receive a detailed estimate before any work begins, with no hidden fees or surprises.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
