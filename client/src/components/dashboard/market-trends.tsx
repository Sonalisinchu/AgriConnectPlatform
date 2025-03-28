import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PriceTrend {
  currentPrice: number;
  fifteenDayForecast: number;
  thirtyDayForecast: number;
  trend: "rising" | "falling" | "stable";
}

const vegetables = [
  { name: "Tomato", price: 45 },
  { name: "Potato", price: 30 },
  { name: "Onion", price: 60 },
  { name: "Cabbage", price: 70 },
  { name: "Carrot", price: 40 },
  { name: "Cucumber", price: 50 },
  { name: "Cauliflower", price: 80 },
];

const fruits = [
  { name: "Mango", price: 100 },
  { name: "Banana", price: 80 },
  { name: "Apple", price: 150 },
  { name: "Grapes", price: 120 },
  { name: "Strawberry", price: 180 },
  { name: "Orange", price: 110 },
  { name: "Papaya", price: 115 },
];

const grains = [
  { name: "Rice", price: 35 },
  { name: "Wheat", price: 25 },
  { name: "Maize", price: 18 },
  { name: "Barley", price: 30 },
  { name: "Bajra", price: 45 },
  { name: "Jowar", price: 50 },
  { name: "Ragi", price: 22 },
];

// Mock crop forecasts
const cropForecasts = [
  {
    name: "Tomato",
    currentPrice: 45,
    fifteenDayForecast: 50,
    thirtyDayForecast: 55,
    trend: "rising" as const,
  },
  {
    name: "Potato",
    currentPrice: 30,
    fifteenDayForecast: 28,
    thirtyDayForecast: 25,
    trend: "falling" as const,
  },
  {
    name: "Rice",
    currentPrice: 35,
    fifteenDayForecast: 35,
    thirtyDayForecast: 36,
    trend: "stable" as const,
  },
  {
    name: "Mango",
    currentPrice: 100,
    fifteenDayForecast: 120,
    thirtyDayForecast: 140,
    trend: "rising" as const,
  },
  {
    name: "Onion",
    currentPrice: 60,
    fifteenDayForecast: 55,
    thirtyDayForecast: 50,
    trend: "falling" as const,
  },
];

interface MarketTrendsProps {
  className?: string;
}

export function MarketTrends({ className }: MarketTrendsProps) {
  const [location, setLocation] = useState("Nashik, Maharashtra");
  const [timeframe, setTimeframe] = useState("7");
  
  // In a real app, this would fetch price predictions from the backend
  const { data: pricePredictions, isLoading } = useQuery({
    queryKey: ["/api/market/trends/tomato", location],
    enabled: false, // Disabled for now since we're using mock data
  });
  
  return (
    <section id="market-trends" className={cn("mb-10", className)}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-2xl">Market Trends</h3>
        <div className="flex items-center">
          <span className="text-sm text-neutral-500 mr-3">Location:</span>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nashik, Maharashtra">Nashik, Maharashtra</SelectItem>
              <SelectItem value="Pune, Maharashtra">Pune, Maharashtra</SelectItem>
              <SelectItem value="Mumbai, Maharashtra">Mumbai, Maharashtra</SelectItem>
              <SelectItem value="Bangalore, Karnataka">Bangalore, Karnataka</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Vegetables Price Trends */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-lg">Price Trends: Vegetables</h4>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[120px] border-none text-sm h-8">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="h-[250px] relative">
              {vegetables.map((veg, index) => (
                <div 
                  key={veg.name}
                  className="absolute bottom-0 bg-gradient-to-t from-primary to-secondary rounded-t-md"
                  style={{ 
                    left: `calc(${index} * 12% + 2%)`, 
                    width: '8%', 
                    height: `${(veg.price / 100) * 100}%`,
                    minHeight: '20px'
                  }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap">
                    ₹{veg.price}/kg
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap">
                    {veg.name}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Fruits Price Trends */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-lg">Price Trends: Fruits</h4>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[120px] border-none text-sm h-8">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="h-[250px] relative">
              {fruits.map((fruit, index) => (
                <div 
                  key={fruit.name}
                  className="absolute bottom-0 bg-gradient-to-t from-primary to-secondary rounded-t-md"
                  style={{ 
                    left: `calc(${index} * 12% + 2%)`, 
                    width: '8%', 
                    height: `${(fruit.price / 180) * 100}%`,
                    minHeight: '20px'
                  }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap">
                    ₹{fruit.price}/kg
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap">
                    {fruit.name}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Grains Price Trends */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-lg">Price Trends: Grains</h4>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[120px] border-none text-sm h-8">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="h-[250px] relative">
              {grains.map((grain, index) => (
                <div 
                  key={grain.name}
                  className="absolute bottom-0 bg-gradient-to-t from-primary to-secondary rounded-t-md"
                  style={{ 
                    left: `calc(${index} * 12% + 2%)`, 
                    width: '8%', 
                    height: `${(grain.price / 50) * 100}%`,
                    minHeight: '20px'
                  }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap">
                    ₹{grain.price}/kg
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap">
                    {grain.name}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-lg">Price Forecasts: Next 30 Days</h4>
            <div className="flex items-center text-sm">
              <span className="flex items-center mr-4">
                <span className="w-3 h-3 inline-block bg-primary rounded-full mr-1"></span>
                Current Price
              </span>
              <span className="flex items-center">
                <span className="w-3 h-3 inline-block bg-amber-500 rounded-full mr-1"></span>
                Forecast Price
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="py-3 text-left text-sm font-semibold text-neutral-600">Crop</th>
                  <th className="py-3 text-left text-sm font-semibold text-neutral-600">Current Price</th>
                  <th className="py-3 text-left text-sm font-semibold text-neutral-600">Forecast (15 days)</th>
                  <th className="py-3 text-left text-sm font-semibold text-neutral-600">Forecast (30 days)</th>
                  <th className="py-3 text-left text-sm font-semibold text-neutral-600">Trend</th>
                </tr>
              </thead>
              <tbody>
                {cropForecasts.map((crop) => (
                  <tr key={crop.name} className="border-b border-neutral-200 hover:bg-neutral-50">
                    <td className="py-3 text-sm">{crop.name}</td>
                    <td className="py-3 text-sm font-medium">₹{crop.currentPrice}/kg</td>
                    <td className="py-3 text-sm text-amber-700 font-medium">₹{crop.fifteenDayForecast}/kg</td>
                    <td className="py-3 text-sm text-amber-700 font-medium">₹{crop.thirtyDayForecast}/kg</td>
                    <td className="py-3">
                      {crop.trend === "rising" && (
                        <span className="text-green-600 flex items-center">
                          <ArrowUp className="mr-1 h-4 w-4" /> Rising
                        </span>
                      )}
                      {crop.trend === "falling" && (
                        <span className="text-red-500 flex items-center">
                          <ArrowDown className="mr-1 h-4 w-4" /> Falling
                        </span>
                      )}
                      {crop.trend === "stable" && (
                        <span className="text-neutral-500 flex items-center">
                          <Minus className="mr-1 h-4 w-4" /> Stable
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default MarketTrends;
