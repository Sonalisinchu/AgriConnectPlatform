import { Crop } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarCheck, Map, Database } from "lucide-react";
import { format } from "date-fns";

interface CropCardProps {
  crop: Crop;
  onViewDetails: (crop: Crop) => void;
  onListForSale?: (crop: Crop) => void;
  onContactFarmer?: (farmerId: number) => void;
  isBuyer?: boolean;
  farmerName?: string;
  distance?: string;
}

export function CropCard({ 
  crop, 
  onViewDetails, 
  onListForSale, 
  onContactFarmer,
  isBuyer = false,
  farmerName,
  distance
}: CropCardProps) {
  // Convert price from paisa to rupees for display
  const priceInRupees = (crop.currentPrice / 100).toFixed(2);
  // Convert quantity from grams to kg for display
  const quantityInKg = (crop.quantity / 1000).toFixed(2);
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="h-40 bg-neutral-200 relative overflow-hidden">
        {/* We would use an actual image here in a real app */}
        <div className="w-full h-full flex items-center justify-center bg-primary/10">
          <span className="text-primary font-medium">{crop.name}</span>
        </div>
        
        <div className="absolute top-2 right-2 bg-white rounded-lg p-1 px-2 text-xs font-medium">
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="text-primary mr-1 h-3 w-3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 9c0-7-7.5-7-7.5-7S7 2 7 9s7.5 12 7.5 12"/><circle cx="7" cy="9" r="1"/></svg>
            {crop.category.charAt(0).toUpperCase() + crop.category.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-semibold text-lg">{crop.name}</h4>
          <span className="text-amber-600 font-medium">₹{priceInRupees}/kg</span>
        </div>
        
        <div className="flex flex-wrap mb-3">
          {isBuyer && farmerName && (
            <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full mr-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="inline mr-1 h-3 w-3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              {farmerName}
            </span>
          )}
          
          <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full mr-2 mb-2">
            <Map className="inline mr-1 h-3 w-3" />
            {isBuyer && distance ? `${crop.location} (${distance})` : crop.location}
          </span>
          
          <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="inline mr-1 h-3 w-3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3.2A9 9 0 0 0 3.2 10"/><path d="M21 10a9 9 0 0 0-10-10v10z"/></svg>
            {isBuyer ? `Available: ${quantityInKg} kg` : `Expected: ${quantityInKg} kg`}
          </span>
        </div>
        
        <div className="text-sm text-neutral-600 mb-4">
          {crop.plantedDate && (
            <div className="flex items-center mb-1">
              <Calendar className="mr-2 text-neutral-500 h-4 w-4" />
              <span>
                Planted: {format(new Date(crop.plantedDate), "dd MMM yyyy")}
              </span>
            </div>
          )}
          
          {crop.harvestDate && (
            <div className="flex items-center mb-1">
              <CalendarCheck className="mr-2 text-neutral-500 h-4 w-4" />
              <span>
                {isBuyer 
                  ? `Harvested: ${format(new Date(crop.harvestDate), "dd MMM yyyy")}` 
                  : `Harvest: ${format(new Date(crop.harvestDate), "dd MMM yyyy")}`}
              </span>
            </div>
          )}
          
          {crop.storageInfo && (
            <div className="flex items-center">
              <Database className="mr-2 text-neutral-500 h-4 w-4" />
              <span>{crop.storageInfo}</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="default"
            className="flex-1"
            onClick={() => onViewDetails(crop)}
          >
            {isBuyer ? "View Details" : "Details"}
          </Button>
          
          {isBuyer && onContactFarmer ? (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onContactFarmer(crop.farmerId)}
            >
              Contact Farmer
            </Button>
          ) : onListForSale ? (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onListForSale(crop)}
            >
              List for Sale
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default CropCard;
