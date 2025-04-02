import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Laptop } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Check, 
  X, 
  AlertCircle, 
  Loader2, 
  ChevronDown, 
  ShoppingCart 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LaptopListings() {
  const { toast } = useToast();
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedLaptop, setSelectedLaptop] = useState<Laptop | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: laptops, isLoading, error } = useQuery<Laptop[]>({
    queryKey: ["/api/laptops"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/laptops/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/laptops"] });
      toast({
        title: "Status updated",
        description: `Laptop status has been updated to ${newStatus}`,
      });
      setIsStatusDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOpenViewDialog = (laptop: Laptop) => {
    setSelectedLaptop(laptop);
    setIsViewDialogOpen(true);
  };

  const handleOpenStatusDialog = (laptop: Laptop) => {
    setSelectedLaptop(laptop);
    setNewStatus(laptop.status);
    setIsStatusDialogOpen(true);
  };

  const handleStatusUpdate = () => {
    if (selectedLaptop && newStatus) {
      updateStatusMutation.mutate({
        id: selectedLaptop.id,
        status: newStatus,
      });
    }
  };

  // Format price from cents to naira with commas
  const formatPrice = (price: number): string => {
    return `₦${price.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
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

  // Filter laptops based on active tab
  const filteredLaptops = laptops?.filter(laptop => {
    if (activeTab === "all") return true;
    return laptop.status === activeTab;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading laptop listings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <CardTitle className="text-red-600">Error Loading Data</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p>Failed to load laptop listings. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (!laptops || laptops.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Laptop Listings</CardTitle>
          <CardDescription>Manage all laptop listings from users</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No laptop listings available at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Laptop Listings</CardTitle>
          <CardDescription>Manage all laptop listings from users</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All ({laptops.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({laptops.filter(laptop => laptop.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({laptops.filter(laptop => laptop.status === 'approved').length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({laptops.filter(laptop => laptop.status === 'rejected').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLaptops?.map((laptop) => (
                  <TableRow key={laptop.id}>
                    <TableCell className="font-medium">{laptop.id}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={laptop.title}>
                      {laptop.title}
                    </TableCell>
                    <TableCell>{laptop.brand}</TableCell>
                    <TableCell>{formatPrice(laptop.price)}</TableCell>
                    <TableCell>{getStatusBadge(laptop.status)}</TableCell>
                    <TableCell>
                      {new Date(laptop.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenViewDialog(laptop)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenStatusDialog(laptop)}
                        >
                          Status
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Laptop Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedLaptop && (
            <>
              <DialogHeader>
                <DialogTitle>Laptop Details</DialogTitle>
                <DialogDescription>
                  ID: {selectedLaptop.id} | Submitted on {new Date(selectedLaptop.createdAt).toLocaleDateString()}
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
                  <p className="text-sm mb-2"><span className="font-semibold">Status:</span> {getStatusBadge(selectedLaptop.status)}</p>
                  
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

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          {selectedLaptop && (
            <>
              <DialogHeader>
                <DialogTitle>Update Laptop Status</DialogTitle>
                <DialogDescription>
                  Change the status of {selectedLaptop.title}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleStatusUpdate}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
