import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertRepairSchema } from "@shared/schema";
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
import { Loader2, X } from "lucide-react";

// Extend the insert schema with additional validation
const formSchema = insertRepairSchema.extend({
  issueType: z.string().min(1, "Please select an issue type"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  images: z.array(z.string()),
});

type RepairFormProps = {
  repairType?: string;
};

export default function RepairForm({ repairType }: RepairFormProps) {
  const { toast } = useToast();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      model: "",
      issueType: repairType ? mapRepairTypeToIssue(repairType) : "",
      description: "",
      images: [],
    },
  });

  function mapRepairTypeToIssue(type: string): string {
    switch (type) {
      case "basic": return "Software Issue";
      case "standard": return "Hardware Issue";
      case "advanced": return "Advanced Repair";
      case "diagnostic": return "Diagnostic";
      default: return "";
    }
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/repairs", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repairs/user"] });
      toast({
        title: "Repair request submitted successfully",
        description: "Our team will review your request and provide an estimate soon.",
      });
      form.reset();
      setImageUrls([]);
    },
    onError: (error) => {
      toast({
        title: "Failed to submit repair request",
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Laptop Brand*</FormLabel>
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
                  <FormLabel>Laptop Model*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. XPS 15, Macbook Pro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="issueType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Type*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Software Issue">Software Issue</SelectItem>
                    <SelectItem value="Hardware Issue">Hardware Issue</SelectItem>
                    <SelectItem value="Display Problem">Display Problem</SelectItem>
                    <SelectItem value="Battery Issue">Battery Issue</SelectItem>
                    <SelectItem value="Keyboard/Trackpad">Keyboard/Trackpad</SelectItem>
                    <SelectItem value="Overheating">Overheating</SelectItem>
                    <SelectItem value="Charging Problem">Charging Problem</SelectItem>
                    <SelectItem value="Water Damage">Water Damage</SelectItem>
                    <SelectItem value="Diagnostic">Diagnostic</SelectItem>
                    <SelectItem value="Advanced Repair">Advanced Repair</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
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
                <FormLabel>Description of the Issue*</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please describe the problem in detail. When did it start? What happens when the issue occurs? What troubleshooting steps have you already tried?"
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The more details you provide, the more accurately we can diagnose and fix your laptop.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Label htmlFor="image-url">Images (Optional)</Label>
            <div className="flex mt-2">
              <Input
                id="image-url"
                placeholder="Enter image URL showing the issue"
                value={currentImageUrl}
                onChange={(e) => setCurrentImageUrl(e.target.value)}
                className="mr-2"
              />
              <Button type="button" onClick={addImageUrl} variant="secondary">
                Add
              </Button>
            </div>
            <FormDescription className="mt-1">
              Add URLs to images showing the problem with your laptop. This helps our technicians better understand the issue.
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
                    alt={`Issue image ${index + 1}`}
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

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
            <ol className="list-decimal pl-5 space-y-1 text-gray-600">
              <li>Our technicians will review your repair request</li>
              <li>We'll provide a cost estimate within 24-48 hours</li>
              <li>Once approved, repairs typically take 3-7 business days</li>
              <li>You'll receive an invoice for payment when repairs are complete</li>
            </ol>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Repair Request"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
