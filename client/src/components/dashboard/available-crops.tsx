import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CropCard } from "@/components/dashboard/crop-card";
import { CropDetailsModal } from "@/components/dashboard/crop-details-modal";
import { Crop } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AvailableCropsProps {
  className?: string;
}

const mockFarmerDetails = {
  fullName: "Rajesh Kumar",
  location: "Nashik, Maharashtra",
  since: "1995",
  phone: "+91 98765 43210",
  email: "rajesh.kumar@example.com",
  isVerified: true,
  activeListings: 8,
};

export function AvailableCrops({ className }: AvailableCropsProps) {
  const { toast } = useToast();
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  
  // Fetch all available crops
  const { data: crops, isLoading } = useQuery<Crop[]>({
    queryKey: ["/api/crops"],
  });
  
  const handleViewDetails = (crop: Crop) => {
    setSelectedCrop(crop);
    setDetailsModalOpen(true);
  };
  
  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
  };
  
  const handleContactFarmer = (farmerId: number) => {
    // In a real app, this would open a chat or contact form
    toast({
      title: "Contact Request Sent",
      description: "The farmer will be notified of your interest.",
    });
  };
  
  const handleExpressInterest = () => {
    // In a real app, this would initiate the order process
    toast({
      title: "Interest Expressed",
      description: "You have shown interest in this crop. The farmer will contact you soon.",
    });
    setDetailsModalOpen(false);
  };
  
  // Filter and sort crops
  const filteredCrops = crops?.filter(crop => 
    category === "all" || crop.category.toLowerCase() === category.toLowerCase()
  ) || [];
  
  // Sort crops
  const sortedCrops = [...filteredCrops].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "price-low") {
      return a.currentPrice - b.currentPrice;
    } else if (sortBy === "price-high") {
      return b.currentPrice - a.currentPrice;
    }
    // Default to recent
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  return (
    <section id="available-crops" className={className}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-2xl">Available Crops</h3>
        <div className="flex items-center space-x-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="vegetables">Vegetables</SelectItem>
              <SelectItem value="fruits">Fruits</SelectItem>
              <SelectItem value="grains">Grains</SelectItem>
              <SelectItem value="flowers">Flowers</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Sort by: Recent</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
      ) : sortedCrops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCrops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onViewDetails={handleViewDetails}
              onContactFarmer={handleContactFarmer}
              isBuyer={true}
              farmerName="Rajesh Kumar" // In a real app, this would be fetched from the API
              distance="120km" // In a real app, this would be calculated based on user location
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow-sm">
          <div className="text-neutral-500 mb-4">No crops available matching your criteria</div>
          <Button onClick={() => setCategory("all")}>View All Crops</Button>
        </div>
      )}
      
      {sortedCrops.length > 0 && (
        <div className="mt-6 text-center">
          <Button variant="link" className="text-primary hover:text-primary-dark font-medium mx-auto">
            <span>View More Crops</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Button>
        </div>
      )}
      
      <CropDetailsModal
        isOpen={detailsModalOpen}
        crop={selectedCrop}
        onClose={handleCloseDetails}
        onExpressInterest={handleExpressInterest}
        onContactFarmer={() => selectedCrop && handleContactFarmer(selectedCrop.farmerId)}
        isBuyer={true}
        farmerDetails={mockFarmerDetails}
      />
    </section>
  );
}

export default AvailableCrops;
