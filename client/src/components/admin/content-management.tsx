import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  WebsiteContent, 
  contentTypes, 
  insertWebsiteContentSchema 
} from '@shared/schema';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define the content form schema based on the insertWebsiteContentSchema
const contentFormSchema = insertWebsiteContentSchema.extend({
  content: z.string().min(1, "Content is required"),
});

type ContentFormValues = z.infer<typeof contentFormSchema>;

export default function ContentManagement() {
  const { toast } = useToast();
  const [selectedContent, setSelectedContent] = useState<WebsiteContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<WebsiteContent | null>(null);
  
  // Fetch all website content
  const { data: content, isLoading } = useQuery<WebsiteContent[]>({
    queryKey: ['/api/content'],
    refetchOnWindowFocus: false,
  });
  
  // Form for editing/creating content
  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      type: 'hero',
      title: '',
      content: '',
      order: 0,
    },
  });
  
  // Reset form when selected content changes
  useEffect(() => {
    if (selectedContent) {
      form.reset({
        type: selectedContent.type,
        title: selectedContent.title,
        content: selectedContent.content,
        order: selectedContent.order,
      });
    } else if (isCreating) {
      form.reset({
        type: 'hero',
        title: '',
        content: '',
        order: 0,
      });
    }
  }, [selectedContent, isCreating, form]);
  
  // Create content mutation
  const createMutation = useMutation({
    mutationFn: async (data: ContentFormValues) => {
      const res = await apiRequest('POST', '/api/content', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Content created successfully",
      });
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create content: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Update content mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ContentFormValues & { id: number }) => {
      const { id, ...values } = data;
      const res = await apiRequest('PUT', `/api/content/${id}`, values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Content updated successfully",
      });
      setIsEditing(false);
      setSelectedContent(null);
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update content: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete content mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/content/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Content deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setContentToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete content: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: ContentFormValues) => {
    if (isEditing && selectedContent) {
      updateMutation.mutate({ ...data, id: selectedContent.id });
    } else if (isCreating) {
      createMutation.mutate(data);
    }
  };
  
  // Handle edit button click
  const handleEditClick = (content: WebsiteContent) => {
    setSelectedContent(content);
    setIsEditing(true);
    setIsCreating(false);
  };
  
  // Handle create button click
  const handleCreateClick = () => {
    setSelectedContent(null);
    setIsEditing(false);
    setIsCreating(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (content: WebsiteContent) => {
    setContentToDelete(content);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle cancel button click
  const handleCancelClick = () => {
    setSelectedContent(null);
    setIsEditing(false);
    setIsCreating(false);
    form.reset();
  };
  
  // Confirm delete action
  const confirmDelete = () => {
    if (contentToDelete) {
      deleteMutation.mutate(contentToDelete.id);
    }
  };

  // Group content by type
  const contentByType = content?.reduce<Record<string, WebsiteContent[]>>((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {}) || {};
  
  // Get available content types from the enum
  const availableTypes = Object.values(contentTypes.enumValues);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Website Content Management</h2>
        <Button onClick={handleCreateClick} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add New Content
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading content...</p>
        </div>
      ) : (
        <>
          {/* Content Editor Form */}
          {(isEditing || isCreating) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{isEditing ? 'Edit Content' : 'Create New Content'}</CardTitle>
                <CardDescription>
                  {isEditing 
                    ? 'Update the details for the selected content item.'
                    : 'Create a new content item for the website.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid.cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a content type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The section of the website this content belongs to.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="order"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="0"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                value={field.value?.toString() || "0"}
                                name={field.name}
                                onBlur={field.onBlur}
                                ref={field.ref}
                              />
                            </FormControl>
                            <FormDescription>
                              The order in which this content appears (lower numbers appear first).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            The title or heading for this content.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={8}
                              placeholder="Enter the content here..."
                            />
                          </FormControl>
                          <FormDescription>
                            The main content. You can use basic HTML for formatting.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancelClick}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" /> Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" /> {isEditing ? 'Save Changes' : 'Create Content'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
          
          {/* Content List with Tabs by Type */}
          <Tabs defaultValue={availableTypes[0]}>
            <TabsList className="mb-2">
              {availableTypes.map((type) => (
                <TabsTrigger key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {availableTypes.map((type) => (
              <TabsContent key={type} value={type}>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')} Content
                    </CardTitle>
                    <CardDescription>
                      Manage content for the {type.replace(/_/g, ' ')} section of the website.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      {contentByType[type] && contentByType[type].length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Order</TableHead>
                              <TableHead>Title</TableHead>
                              <TableHead>Content Preview</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {contentByType[type].sort((a, b) => (a.order || 0) - (b.order || 0)).map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.order}</TableCell>
                                <TableCell>{item.title}</TableCell>
                                <TableCell>
                                  <div className="max-w-md truncate">
                                    {item.content.length > 100 
                                      ? `${item.content.substring(0, 100)}...` 
                                      : item.content}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="icon"
                                      onClick={() => handleEditClick(item)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      size="icon"
                                      onClick={() => handleDeleteClick(item)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <Alert>
                          <AlertTitle>No content found</AlertTitle>
                          <AlertDescription>
                            No content items exist for the {type.replace(/_/g, ' ')} section yet. 
                            Click the "Add New Content" button to create one.
                          </AlertDescription>
                        </Alert>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this content item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {contentToDelete && (
            <div className="py-4">
              <p><strong>Title:</strong> {contentToDelete.title}</p>
              <p><strong>Type:</strong> {contentToDelete.type}</p>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}