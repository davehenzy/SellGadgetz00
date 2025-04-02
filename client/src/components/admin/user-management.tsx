import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  User as UserIcon, 
  Shield,
  Mail,
  Phone,
  Calendar
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

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all users on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Admin</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">User</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)}>
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
              <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent>
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>
                  Joined on {formatDate(selectedUser.createdAt)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <UserIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">{selectedUser.fullName}</p>
                    <p className="text-sm text-gray-500">@{selectedUser.username}</p>
                  </div>
                  {selectedUser.isAdmin && (
                    <Badge variant="outline" className="ml-auto bg-purple-100 text-purple-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
                
                <div className="pt-4 space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{selectedUser.email}</span>
                  </div>
                  
                  {selectedUser.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{selectedUser.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span>Joined {formatDate(selectedUser.createdAt)}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Laptops Listed</p>
                    <p className="text-xl font-semibold">0</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Repair Requests</p>
                    <p className="text-xl font-semibold">0</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}