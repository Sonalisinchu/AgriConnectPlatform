import { Crop } from "@shared/schema";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
// import { getPricePrediction } from "../../server/openai"; 

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus, User, VerifiedIcon, Phone, Mail, Globe } from "lucide-react";

interface CropDetailsModalProps {
  isOpen: boolean;
  crop: Crop | null;
  onClose: () => void;
  onExpressInterest?: () => void;
  onContactFarmer?: () => void;
  isBuyer?: boolean;
  farmerDetails?: {
    fullName: string;
    location: string;
    since: string;
    phone: string;
    email: string;
    isVerified: boolean;
    activeListings: number;
  };
}

export function CropDetailsModal({
  isOpen,
  crop,
  onClose,
  onExpressInterest,
  onContactFarmer,
  isBuyer = false,
  farmerDetails,
}: CropDetailsModalProps) {
  const { toast } = useToast();

  if (!crop) return null;

  // Convert price from paisa to rupees for display
  const priceInRupees = (crop.currentPrice / 100).toFixed(2);

  // Price prediction - in a real app this would fetch from the API
  // This is mocked for demonstration
  const pricePrediction = {
    currentPrice: Number(priceInRupees),
    fifteenDayForecast: Number(priceInRupees) + 5,
    thirtyDayForecast: Number(priceInRupees) + 10,
    trend: "rising" as string,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {crop.name} (Crop Details)
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <div className="lg:col-span-1">
            <div className="bg-neutral-200 rounded-lg h-64 flex items-center justify-center">
              <span className="text-primary font-medium">{crop.name}</span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center p-3 bg-neutral-100 rounded-lg">
                <span className="text-neutral-700">Current Price</span>
                <span className="font-semibold text-amber-600">₹{pricePrediction.currentPrice}/kg</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-neutral-100 rounded-lg">
                <span className="text-neutral-700">Predicted Price (15 days)</span>
                <span className="font-semibold text-amber-600">₹{pricePrediction.fifteenDayForecast}/kg</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-neutral-100 rounded-lg">
                <span className="text-neutral-700">Predicted Price (30 days)</span>
                <span className="font-semibold text-amber-600">₹{pricePrediction.thirtyDayForecast}/kg</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-neutral-100 rounded-lg">
                <span className="text-neutral-700">Price Trend</span>
                <span className={cn(
                  "font-semibold flex items-center",
                  pricePrediction.trend === "rising" ? "text-green-600" :
                    pricePrediction.trend === "falling" ? "text-red-500" : "text-neutral-500"
                )}>
                  {pricePrediction.trend === "rising" && <ArrowUp className="mr-1 h-4 w-4" />}
                  {pricePrediction.trend === "falling" && <ArrowDown className="mr-1 h-4 w-4" />}
                  {pricePrediction.trend === "stable" && <Minus className="mr-1 h-4 w-4" />}
                  {pricePrediction.trend.charAt(0).toUpperCase() + pricePrediction.trend.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-semibold text-lg mb-3">Crop Information</h4>

            <div className="space-y-4 mb-6">
              <div className="flex border-b border-neutral-200 pb-3">
                <div className="w-1/3 text-neutral-600">Category</div>
                <div className="w-2/3 capitalize">{crop.category}</div>
              </div>

              <div className="flex border-b border-neutral-200 pb-3">
                <div className="w-1/3 text-neutral-600">Location</div>
                <div className="w-2/3">{crop.location}</div>
              </div>

              {crop.plantedDate && (
                <div className="flex border-b border-neutral-200 pb-3">
                  <div className="w-1/3 text-neutral-600">Planted Date</div>
                  <div className="w-2/3">{format(new Date(crop.plantedDate), "dd MMMM yyyy")}</div>
                </div>
              )}

              {crop.harvestDate && (
                <div className="flex border-b border-neutral-200 pb-3">
                  <div className="w-1/3 text-neutral-600">Harvest Date</div>
                  <div className="w-2/3">{format(new Date(crop.harvestDate), "dd MMMM yyyy")}</div>
                </div>
              )}

              <div className="flex border-b border-neutral-200 pb-3">
                <div className="w-1/3 text-neutral-600">Quantity Available</div>
                <div className="w-2/3">{(crop.quantity / 1000).toFixed(2)} kg</div>
              </div>

              {crop.storageInfo && (
                <div className="flex border-b border-neutral-200 pb-3">
                  <div className="w-1/3 text-neutral-600">Storage Capacity</div>
                  <div className="w-2/3">{crop.storageInfo}</div>
                </div>
              )}

              {crop.description && (
                <div className="flex">
                  <div className="w-1/3 text-neutral-600">Description</div>
                  <div className="w-2/3">{crop.description}</div>
                </div>
              )}
            </div>

            {farmerDetails && (
              <>
                <h4 className="font-semibold text-lg mb-3">Farmer Information</h4>

                <div className="bg-neutral-100 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white mr-4">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h5 className="font-medium">{farmerDetails.fullName}</h5>
                      <p className="text-sm text-neutral-600">Farming since {farmerDetails.since}</p>
                    </div>
                    <div className="ml-auto">
                      {farmerDetails.isVerified && (
                        <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                          <VerifiedIcon className="inline-block mr-1 h-3 w-3" />
                          Verified Farmer
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 text-neutral-500 h-4 w-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                      <span>{farmerDetails.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="mr-2 text-neutral-500 h-4 w-4" />
                      <span>{farmerDetails.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="mr-2 text-neutral-500 h-4 w-4" />
                      <span>{farmerDetails.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="mr-2 text-neutral-500 h-4 w-4" />
                      <span>{farmerDetails.activeListings} active crop listings</span>
                    </div>
                  </div>

                  {onContactFarmer && (
                    <div className="mt-4 flex justify-end">
                      <Button onClick={onContactFarmer}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" /><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" /></svg>
                        Contact Farmer
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {isBuyer && onExpressInterest && (
            <Button onClick={onExpressInterest}>
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
              Express Interest
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CropDetailsModal;
