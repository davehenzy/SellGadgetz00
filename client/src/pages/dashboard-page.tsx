import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Laptop, Repair, Invoice } from "@shared/schema";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart,
  Wrench,
  FileText,
  Plus,
  AlertCircle,
  Loader2,
  ChevronRight,
  DollarSign
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("laptops");
  const [selectedLaptop, setSelectedLaptop] = useState<Laptop | null>(null);
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLaptopDialogOpen, setIsLaptopDialogOpen] = useState(false);
  const [isRepairDialogOpen, setIsRepairDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);

  const { data: laptops, isLoading: isLoadingLaptops } = useQuery<Laptop[]>({
    queryKey: ["/api/laptops/user"],
  });

  const { data: repairs, isLoading: isLoadingRepairs } = useQuery<Repair[]>({
    queryKey: ["/api/repairs/user"],
  });

  const { data: invoices, isLoading: isLoadingInvoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices/user"],
  });

  const handleViewLaptop = (laptop: Laptop) => {
    setSelectedLaptop(laptop);
    setIsLaptopDialogOpen(true);
  };

  const handleViewRepair = (repair: Repair) => {
    setSelectedRepair(repair);
    setIsRepairDialogOpen(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceDialogOpen(true);
  };

  // Format price from cents to naira
  const formatPrice = (price: number | null): string => {
    if (price === null) return "Not set";
    return `₦${price.toLocaleString()}`;
  };

  const getLaptopStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "sold":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Sold</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRepairStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "diagnosed":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Diagnosed</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case "unpaid":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Unpaid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
        <span>User not authenticated</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, {user.fullName}</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
              <Link href="/sell">
                <Button>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Sell Laptop
                </Button>
              </Link>
              <Link href="/repair">
                <Button variant="outline">
                  <Wrench className="mr-2 h-4 w-4" />
                  Request Repair
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
                  My Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{laptops ? laptops.length : 0}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="p-0 h-auto" onClick={() => setActiveTab("laptops")}>
                  View all listings <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-green-600" />
                  Repair Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{repairs ? repairs.length : 0}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="p-0 h-auto" onClick={() => setActiveTab("repairs")}>
                  View all repairs <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-yellow-600" />
                  Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{invoices ? invoices.length : 0}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="p-0 h-auto" onClick={() => setActiveTab("invoices")}>
                  View all invoices <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Activity Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="laptops" className="flex items-center">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    My Listings
                  </TabsTrigger>
                  <TabsTrigger value="repairs" className="flex items-center">
                    <Wrench className="mr-2 h-4 w-4" />
                    Repair Requests
                  </TabsTrigger>
                  <TabsTrigger value="invoices" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Invoices
                  </TabsTrigger>
                </TabsList>
                
                {/* Laptops Tab */}
                <TabsContent value="laptops" className="space-y-4">
                  {isLoadingLaptops ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : laptops && laptops.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date Listed</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {laptops.map((laptop) => (
                            <TableRow key={laptop.id}>
                              <TableCell className="font-medium">{laptop.title}</TableCell>
                              <TableCell>{formatPrice(laptop.price)}</TableCell>
                              <TableCell>{getLaptopStatusBadge(laptop.status)}</TableCell>
                              <TableCell>{new Date(laptop.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => handleViewLaptop(laptop)}>
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No laptops listed yet</h3>
                      <p className="text-gray-600 mb-4">Start selling your used laptops today</p>
                      <Link href="/sell">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          List a Laptop
                        </Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>

                {/* Repairs Tab */}
                <TabsContent value="repairs" className="space-y-4">
                  {isLoadingRepairs ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : repairs && repairs.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Brand</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Issue</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Estimate</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {repairs.map((repair) => (
                            <TableRow key={repair.id}>
                              <TableCell className="font-medium">{repair.brand}</TableCell>
                              <TableCell>{repair.model}</TableCell>
                              <TableCell>{repair.issueType}</TableCell>
                              <TableCell>{getRepairStatusBadge(repair.status)}</TableCell>
                              <TableCell>{formatPrice(repair.estimatedCost)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => handleViewRepair(repair)}>
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No repair requests yet</h3>
                      <p className="text-gray-600 mb-4">Request a laptop repair service</p>
                      <Link href="/repair">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Request Repair
                        </Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>

                {/* Invoices Tab */}
                <TabsContent value="invoices" className="space-y-4">
                  {isLoadingInvoices ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : invoices && invoices.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium">INV-{invoice.id.toString().padStart(4, '0')}</TableCell>
                              <TableCell>{formatPrice(invoice.amount)}</TableCell>
                              <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                              <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice)}>
                                  View
                                </Button>
                                {invoice.status === "unpaid" && (
                                  <Button variant="outline" size="sm" className="ml-2">
                                    <DollarSign className="mr-1 h-3 w-3" />
                                    Pay
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
                      <p className="text-gray-600">
                        Invoices will appear here when you receive them for repair services
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Laptop Details Dialog */}
      <Dialog open={isLaptopDialogOpen} onOpenChange={setIsLaptopDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedLaptop && (
            <>
              <DialogHeader>
                <DialogTitle>Laptop Details</DialogTitle>
                <DialogDescription>
                  Listed on {new Date(selectedLaptop.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6 my-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">{selectedLaptop.title}</h3>
                  <p className="text-sm mb-2"><span className="font-semibold">Brand:</span> {selectedLaptop.brand}</p>
                  <p className="text-sm mb-2"><span className="font-semibold">Model:</span> {selectedLaptop.model}</p>
                  <p className="text-sm mb-2"><span className="font-semibold">Processor:</span> {selectedLaptop.processor}</p>
                  <p className="text-sm mb-2"><span className="font-semibold">RAM:</span> {selectedLaptop.ram}</p>
                  <p className="text-sm mb-2"><span className="font-semibold">Storage:</span> {selectedLaptop.storage}</p>
                  <p className="text-sm mb-2"><span className="font-semibold">Display:</span> {selectedLaptop.display}</p>
                  <p className="text-sm mb-2"><span className="font-semibold">Condition:</span> {selectedLaptop.condition}</p>
                  <p className="text-sm mb-2"><span className="font-semibold">Price:</span> {formatPrice(selectedLaptop.price)}</p>
                  <p className="text-sm mb-2 flex items-center">
                    <span className="font-semibold mr-2">Status:</span> 
                    {getLaptopStatusBadge(selectedLaptop.status)}
                  </p>
                  
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Description:</h4>
                    <p className="text-sm whitespace-pre-line">{selectedLaptop.description}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Images:</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedLaptop.images.map((url, index) => (
                      <img 
                        key={index}
                        src={url} 
                        alt={`${selectedLaptop.title} image ${index + 1}`}
                        className="w-full h-auto rounded-md border"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Repair Details Dialog */}
      <Dialog open={isRepairDialogOpen} onOpenChange={setIsRepairDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedRepair && (
            <>
              <DialogHeader>
                <DialogTitle>Repair Request Details</DialogTitle>
                <DialogDescription>
                  Submitted on {new Date(selectedRepair.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid md:grid-cols-2 gap-6 my-4">
                <div>
                  <p className="text-sm mb-2"><span className="font-semibold">Brand:</span> {selectedRepair.brand}</p>
                  <p className="text-sm mb-2"><span className="font-semibold">Model:</span> {selectedRepair.model}</p>
                  <p className="text-sm mb-2"><span className="font-semibold">Issue Type:</span> {selectedRepair.issueType}</p>
                  <p className="text-sm mb-2 flex items-center">
                    <span className="font-semibold mr-2">Status:</span> 
                    {getRepairStatusBadge(selectedRepair.status)}
                  </p>
                  <p className="text-sm mb-2"><span className="font-semibold">Estimated Cost:</span> {formatPrice(selectedRepair.estimatedCost)}</p>
                  
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Description of Issue:</h4>
                    <p className="text-sm whitespace-pre-line">{selectedRepair.description}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Images:</h4>
                  {selectedRepair.images && selectedRepair.images.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {selectedRepair.images.map((url, index) => (
                        <img 
                          key={index}
                          src={url} 
                          alt={`Issue image ${index + 1}`}
                          className="w-full h-auto rounded-md border"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No images provided</p>
                  )}
                </div>
              </div>

              {selectedRepair.status === 'diagnosed' && selectedRepair.estimatedCost && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-gray-900 mb-2">Repair Estimate</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Our technicians have assessed your laptop and provided a repair estimate.
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(selectedRepair.estimatedCost)}
                  </p>
                  <div className="mt-3">
                    <Button size="sm">
                      <DollarSign className="mr-1 h-4 w-4" />
                      Approve and Pay
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Details Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent>
          {selectedInvoice && (
            <>
              <DialogHeader>
                <DialogTitle>Invoice Details</DialogTitle>
                <DialogDescription>
                  Invoice #INV-{selectedInvoice.id.toString().padStart(4, '0')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="my-4 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">Issue Date:</span>
                  <span>{new Date(selectedInvoice.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">Status:</span>
                  <span>{getInvoiceStatusBadge(selectedInvoice.status)}</span>
                </div>
                
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">Amount:</span>
                  <span className="font-bold">{formatPrice(selectedInvoice.amount)}</span>
                </div>
                
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium">Repair ID:</span>
                  <span>{selectedInvoice.repairId || 'N/A'}</span>
                </div>
              </div>

              {selectedInvoice.status === 'unpaid' && (
                <div className="mt-4 text-center">
                  <Button>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Pay Invoice
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
