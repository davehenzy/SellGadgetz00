import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Repair } from "@shared/schema";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertCircle, 
  Loader2, 
  Wrench,
  DollarSign
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RepairRequests() {
  const { toast } = useToast();
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isEstimateDialogOpen, setIsEstimateDialogOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [activeTab, setActiveTab] = useState("all");

  const { data: repairs, isLoading, error } = useQuery<Repair[]>({
    queryKey: ["/api/repairs"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/repairs/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repairs"] });
      toast({
        title: "Status updated",
        description: `Repair status has been updated to ${newStatus}`,
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

  const updateEstimateMutation = useMutation({
    mutationFn: async ({ id, estimatedCost }: { id: number; estimatedCost: number }) => {
      const res = await apiRequest("PUT", `/api/repairs/${id}/estimate`, { estimatedCost });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repairs"] });
      toast({
        title: "Estimate updated",
        description: `Repair cost estimate has been set to ₦${estimatedCost.toLocaleString()}`,
      });
      setIsEstimateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update estimate",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async ({ userId, repairId, amount }: { userId: number; repairId: number; amount: number }) => {
      const res = await apiRequest("POST", `/api/invoices`, {
        userId,
        repairId,
        amount,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repairs"] });
      toast({
        title: "Invoice created",
        description: "An invoice has been created for this repair",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOpenViewDialog = (repair: Repair) => {
    setSelectedRepair(repair);
    setIsViewDialogOpen(true);
  };

  const handleOpenStatusDialog = (repair: Repair) => {
    setSelectedRepair(repair);
    setNewStatus(repair.status);
    setIsStatusDialogOpen(true);
  };

  const handleOpenEstimateDialog = (repair: Repair) => {
    setSelectedRepair(repair);
    setEstimatedCost(repair.estimatedCost || 0);
    setIsEstimateDialogOpen(true);
  };

  const handleStatusUpdate = () => {
    if (selectedRepair && newStatus) {
      updateStatusMutation.mutate({
        id: selectedRepair.id,
        status: newStatus,
      });
    }
  };

  const handleEstimateUpdate = () => {
    if (selectedRepair && estimatedCost >= 0) {
      updateEstimateMutation.mutate({
        id: selectedRepair.id,
        estimatedCost,
      });
    }
  };

  const handleCreateInvoice = (repair: Repair) => {
    if (!repair.estimatedCost) {
      toast({
        title: "Cannot create invoice",
        description: "Please set an estimated cost first",
        variant: "destructive",
      });
      return;
    }

    createInvoiceMutation.mutate({
      userId: repair.userId,
      repairId: repair.id,
      amount: repair.estimatedCost,
    });
  };

  // Format estimated cost with naira symbol and commas
  const formatPrice = (price: number | null): string => {
    if (price === null) return "Not set";
    return `₦${price.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
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

  // Filter repairs based on active tab
  const filteredRepairs = repairs?.filter(repair => {
    if (activeTab === "all") return true;
    return repair.status === activeTab;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading repair requests...</span>
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
          <p>Failed to load repair requests. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (!repairs || repairs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Repair Requests</CardTitle>
          <CardDescription>Manage all laptop repair requests</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No repair requests available at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Repair Requests</CardTitle>
          <CardDescription>Manage all laptop repair requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="all">All ({repairs.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({repairs.filter(repair => repair.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="diagnosed">
                Diagnosed ({repairs.filter(repair => repair.status === 'diagnosed').length})
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                In Progress ({repairs.filter(repair => repair.status === 'in_progress').length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({repairs.filter(repair => repair.status === 'completed').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Issue Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Estimate</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRepairs?.map((repair) => (
                  <TableRow key={repair.id}>
                    <TableCell className="font-medium">{repair.id}</TableCell>
                    <TableCell>{repair.brand}</TableCell>
                    <TableCell>{repair.model}</TableCell>
                    <TableCell>{repair.issueType}</TableCell>
                    <TableCell>{getStatusBadge(repair.status)}</TableCell>
                    <TableCell>{formatPrice(repair.estimatedCost)}</TableCell>
                    <TableCell>
                      {new Date(repair.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenViewDialog(repair)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenStatusDialog(repair)}
                        >
                          Status
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenEstimateDialog(repair)}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Estimate
                        </Button>
                        {repair.estimatedCost && repair.status !== 'cancelled' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCreateInvoice(repair)}
                            disabled={createInvoiceMutation.isPending}
                          >
                            Invoice
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Repair Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRepair && (
            <>
              <DialogHeader>
                <DialogTitle>Repair Request Details</DialogTitle>
                <DialogDescription>
                  ID: {selectedRepair.id} | Submitted on {new Date(selectedRepair.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid md:grid-cols-2 gap-6 my-4">
                <div>
                  <p className="text-sm mb-2"><span className="font-semibold">Brand:</span> {selectedRepair.brand}</p>
                  <p className="text-sm mb-2"><span className="font-semibold">Model:</span> {selectedRepair.model}</p>
                  <p className="text-sm mb-2"><span className="font-semibold">Issue Type:</span> {selectedRepair.issueType}</p>
                  <p className="text-sm mb-2"><span className="font-semibold">Status:</span> {getStatusBadge(selectedRepair.status)}</p>
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
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          {selectedRepair && (
            <>
              <DialogHeader>
                <DialogTitle>Update Repair Status</DialogTitle>
                <DialogDescription>
                  Change the status for repair ID: {selectedRepair.id}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="diagnosed">Diagnosed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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

      {/* Update Estimate Dialog */}
      <Dialog open={isEstimateDialogOpen} onOpenChange={setIsEstimateDialogOpen}>
        <DialogContent>
          {selectedRepair && (
            <>
              <DialogHeader>
                <DialogTitle>Set Repair Cost Estimate</DialogTitle>
                <DialogDescription>
                  Provide an estimated cost for repairing this laptop
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <Label htmlFor="estimated-cost">Estimated Cost (₦)</Label>
                <div className="mt-2 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                  <Input
                    id="estimated-cost"
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    min={0}
                    placeholder="e.g. 25000"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Enter the amount in Nigerian Naira (₦) without commas or currency symbol.
                </p>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEstimateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleEstimateUpdate}
                  disabled={updateEstimateMutation.isPending}
                >
                  {updateEstimateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Set Estimate"
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
