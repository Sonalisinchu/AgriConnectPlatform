import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RecentOrdersProps {
  className?: string;
}

export function RecentOrders({ className }: RecentOrdersProps) {
  const { user } = useAuth();
  
  // Fetch orders based on user type
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: [user?.userType === "buyer" ? "/api/orders/buyer" : "/api/orders/farmer"],
    enabled: !!user,
  });
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "delivered":
        return "success";
      case "in_transit":
        return "warning";
      case "processing":
        return "info";
      case "pending":
        return "secondary";
      default:
        return "secondary";
    }
  };
  
  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  // Format price from paisa to rupees
  const formatPrice = (paisa: number) => {
    return (paisa / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };
  
  // Format quantity from grams to kg
  const formatQuantity = (grams: number) => {
    const kg = grams / 1000;
    return kg >= 1000 
      ? `${(kg / 1000).toFixed(2)} tons` 
      : `${kg.toFixed(0)} kg`;
  };
  
  return (
    <section id="orders" className={className}>
      <h3 className="font-bold text-2xl mb-6">Recent Orders</h3>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-neutral-600">Loading orders...</p>
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-neutral-600 mb-4">No orders found</p>
            {user?.userType === "buyer" && (
              <Button>Browse Available Crops</Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-neutral-600">Order ID</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-neutral-600">Crop</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-neutral-600">
                      {user?.userType === "buyer" ? "Farmer" : "Buyer"}
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-neutral-600">Quantity</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-neutral-600">Amount</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-neutral-600">Status</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-neutral-600">Date</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-neutral-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                      <td className="py-3 px-4 text-sm">#{order.id.toString().padStart(4, '0')}</td>
                      <td className="py-3 px-4 text-sm">Crop #{order.cropId}</td>
                      <td className="py-3 px-4 text-sm">
                        {user?.userType === "buyer" 
                          ? `Farmer #${order.farmerId}`
                          : `Buyer #${order.buyerId}`}
                      </td>
                      <td className="py-3 px-4 text-sm">{formatQuantity(order.quantity)}</td>
                      <td className="py-3 px-4 text-sm font-medium">{formatPrice(order.totalAmount)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusVariant(order.status as string)} className="capitalize">
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{formatDate(order.createdAt)}</td>
                      <td className="py-3 px-4 text-sm">
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-primary hover:text-primary-dark"
                        >
                          {order.status === "in_transit" ? "Track Order" : "View Details"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-neutral-200 text-center">
              <Button variant="link" className="text-primary hover:text-primary-dark font-medium">
                View All Orders
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default RecentOrders;
