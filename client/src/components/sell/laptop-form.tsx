import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertLaptopSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Extend the insert schema with additional validation
const formSchema = insertLaptopSchema.extend({
  price: z.number().min(1000, "Price must be at least ₦1,000").max(1000000, "Price must be less than ₦1,000,000"),
  images: z.array(z.string()).min(1, "Please provide at least one image URL"),
});

export default function LaptopForm() {
  const { toast } = useToast();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      brand: "",
      model: "",
      processor: "",
      ram: "",
      storage: "",
      display: "",
      condition: "",
      description: "",
      price: 0,
      images: [],
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/laptops", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/laptops"] });
      queryClient.invalidateQueries({ queryKey: ["/api/laptops/user"] });
      toast({
        title: "Laptop listed successfully",
        description: "Your laptop has been submitted for review.",
      });
      form.reset();
      setImageUrls([]);
    },
    onError: (error) => {
      toast({
        title: "Failed to list laptop",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values);
  }

  const addImageUrl = () => {
    if (currentImageUrl && isValidUrl(currentImageUrl)) {
      const newUrls = [...imageUrls, currentImageUrl];
      setImageUrls(newUrls);
      form.setValue("images", newUrls);
      setCurrentImageUrl("");
    } else {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
    }
  };

  const removeImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    form.setValue("images", newUrls);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Laptop Title*</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. MacBook Pro 2019 13-inch" {...field} />
                </FormControl>
                <FormDescription>
                  A clear, descriptive title for your laptop.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand*</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Apple">Apple</SelectItem>
                      <SelectItem value="Dell">Dell</SelectItem>
                      <SelectItem value="HP">HP</SelectItem>
                      <SelectItem value="Lenovo">Lenovo</SelectItem>
                      <SelectItem value="Asus">Asus</SelectItem>
                      <SelectItem value="Acer">Acer</SelectItem>
                      <SelectItem value="Microsoft">Microsoft</SelectItem>
                      <SelectItem value="Samsung">Samsung</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. XPS 15, Macbook Pro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="processor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Processor*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Intel Core i7, AMD Ryzen 5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RAM*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 16GB DDR4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="storage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 512GB SSD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="display"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 15.6-inch FHD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Like New">Like New</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description*</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide detailed information about your laptop..."
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Include any additional details like age, known issues, accessories included, etc.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (in Naira)*</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g. 250000"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Enter the price in Nigerian Naira (₦) without commas or currency symbol.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Label htmlFor="image-url">Images*</Label>
            <div className="flex mt-2">
              <Input
                id="image-url"
                placeholder="Enter image URL"
                value={currentImageUrl}
                onChange={(e) => setCurrentImageUrl(e.target.value)}
                className="mr-2"
              />
              <Button type="button" onClick={addImageUrl} variant="secondary">
                Add
              </Button>
            </div>
            <FormDescription className="mt-1">
              Add URLs to images of your laptop. At least one image is required.
            </FormDescription>
            {form.formState.errors.images && (
              <p className="text-sm font-medium text-destructive mt-1">
                {form.formState.errors.images.message}
              </p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Laptop image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => removeImageUrl(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Laptop for Sale"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
