import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import BuyerSidebar from "@/components/layout/buyer-sidebar";
import { Navbar } from "@/components/layout/navbar";
import { BuyerVerification } from "@/components/dashboard/buyer-verification";
import { AvailableCrops } from "@/components/dashboard/available-crops";
import { RecentOrders } from "@/components/dashboard/recent-orders";

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-neutral-100">
      <BuyerSidebar />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        <Navbar
          title="Buyer Dashboard"
          onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        
        <div className="p-6">
          {/* Verification Status Section - show first if not verified */}
          {!user?.isVerified && (
            <BuyerVerification className="mb-10" />
          )}
          
          {/* Available Crops Section */}
          <AvailableCrops className="mb-10" />
          
          {/* Recent Orders Section */}
          <RecentOrders className="mb-10" />
          
          {/* Verification Status Section - show at bottom if already verified */}
          {user?.isVerified && (
            <BuyerVerification className="mb-10" />
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
