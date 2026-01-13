import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Crop, InsertCrop } from "@shared/schema";

import FarmerSidebar from "@/components/layout/farmer-sidebar";
import { Navbar } from "@/components/layout/navbar";
import MarketTrends from "@/components/dashboard/market-trends";
import PlantingCalendar from "@/components/dashboard/planting-calendar";
import CropCard from "@/components/dashboard/crop-card";
import CropDetailsModal from "@/components/dashboard/crop-details-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form schema for adding a new crop
const cropFormSchema = z.object({
  name: z.string().min(1, "Crop name is required"),
  category: z.string().min(1, "Category is required"),
  currentPrice: z.number().min(1, "Price must be greater than 0"),
  quantity: z.number().min(1, "Quantity must be greater than 0"),
  plantedDate: z.string().min(1, "Planted date is required"),
  harvestDate: z.string().min(1, "Harvest date is required"),
  location: z.string().min(1, "Location is required"),
  storageInfo: z.string().optional(),
  description: z.string().optional(),
});

type CropFormValues = z.infer<typeof cropFormSchema>;

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [addCropModalOpen, setAddCropModalOpen] = useState(false);

  // Fetch crops for the logged-in farmer
  const { data: crops, isLoading } = useQuery<Crop[]>({
    queryKey: [`/api/crops/farmer/${user?.id}`],
    enabled: !!user?.id,
  });

  // Form for adding a new crop
  const form = useForm<CropFormValues>({
    resolver: zodResolver(cropFormSchema),
    defaultValues: {
      name: "",
      category: "vegetables",
      currentPrice: 0,
      quantity: 0,
      plantedDate: "",
      harvestDate: "",
      location: user?.location || "",
      storageInfo: "",
      description: "",
    },
  });

  // Mutation for adding a new crop
  const addCropMutation = useMutation({
    mutationFn: async (crop: InsertCrop) => {
      const res = await apiRequest("POST", "/api/crops", crop);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crops/farmer", user?.id] });
      setAddCropModalOpen(false);
      form.reset();
      toast({
        title: "Crop Added",
        description: "Your crop has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add crop",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmitAddCrop = (data: CropFormValues) => {
    if (!user) return;

    // Convert price from rupees to paisa and quantity from kg to grams
    const cropData: InsertCrop = {
      ...data,
      farmerId: user.id,
      currentPrice: Math.round(data.currentPrice * 100), // Convert to paisa
      quantity: Math.round(data.quantity * 1000), // Convert to grams
      plantedDate: new Date(data.plantedDate),
      harvestDate: new Date(data.harvestDate),
    };

    addCropMutation.mutate(cropData);
  };

  const handleViewDetails = (crop: Crop) => {
    setSelectedCrop(crop);
    setDetailsModalOpen(true);
  };

  const handleListForSale = (crop: Crop) => {
    // In a real app, this would update the crop to make it available for sale
    toast({
      title: "Crop Listed for Sale",
      description: `${crop.name} is now available for buyers to purchase.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-neutral-100">
      <FarmerSidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        <Navbar
          title="Farmer Dashboard"
          onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <div className="p-6">
          {/* Market Trends Section */}
          <MarketTrends />

          {/* Planting Calendar Section */}
          <PlantingCalendar />

          {/* My Crops Section */}
          <section id="my-crops" className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-2xl">My Crops</h3>
              <Button onClick={() => setAddCropModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add New Crop
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm h-96 animate-pulse">
                    <div className="h-40 bg-neutral-200"></div>
                    <div className="p-5 space-y-4">
                      <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                      <div className="h-3 bg-neutral-200 rounded w-full"></div>
                      <div className="h-3 bg-neutral-200 rounded w-full"></div>
                      <div className="h-8 bg-neutral-200 rounded w-full mt-6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !crops || crops.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <div className="text-neutral-500 mb-4">You haven't added any crops yet</div>
                <Button onClick={() => setAddCropModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Crop
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {crops.map((crop) => (
                  <CropCard
                    key={crop.id}
                    crop={crop}
                    onViewDetails={handleViewDetails}
                    onListForSale={handleListForSale}
                  />
                ))}
              </div>
            )}

            {crops && crops.length > 0 && (
              <div className="mt-6 text-center">
                <Button variant="link" className="text-primary hover:text-primary-dark font-medium mx-auto">
                  <span>View All Crops</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Crop Details Modal */}
      <CropDetailsModal
        isOpen={detailsModalOpen}
        crop={selectedCrop}
        onClose={() => setDetailsModalOpen(false)}
      />

      {/* Add Crop Modal */}
      <Dialog open={addCropModalOpen} onOpenChange={setAddCropModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Crop</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAddCrop)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Tomato" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vegetables">Vegetables</SelectItem>
                          <SelectItem value="fruits">Fruits</SelectItem>
                          <SelectItem value="grains">Grains</SelectItem>
                          <SelectItem value="flowers">Flowers</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per kg (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g. 45"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g. 1000"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="plantedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planted Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="harvestDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harvest Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Field #3, North Block" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storageInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage Information</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 3 weeks at room temperature" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional details about your crop..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddCropModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addCropMutation.isPending}
                >
                  {addCropMutation.isPending ? "Adding..." : "Add Crop"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmerDashboard;
