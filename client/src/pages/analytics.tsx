import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Loader2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useState } from "react";
import { Crop } from "@shared/schema";
import FarmerSidebar from "@/components/layout/farmer-sidebar";
import FPOSidebar from "@/components/layout/fpo-sidebar";
import AdminSidebar from "@/components/layout/admin-sidebar";
import BuyerSidebar from "@/components/layout/buyer-sidebar";

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [selectedCropId, setSelectedCropId] = useState<string>("");

    // Fetch all crops for the selector
    const { data: crops, isLoading: isLoadingCrops } = useQuery<Crop[]>({
        queryKey: ["/api/crops"],
    });

    // Fetch price history for selected crop
    const { data: priceHistory, isLoading: isLoadingPrices } = useQuery<{ date: string, price: number }[]>({
        queryKey: ["/api/analytics/prices", selectedCropId],
        enabled: !!selectedCropId,
    });

    const getSidebar = () => {
        switch (user?.role) {
            case "farmer": return <FarmerSidebar />;
            case "fpo": return <FPOSidebar />;
            case "admin": return <AdminSidebar />;
            case "buyer": return <BuyerSidebar />;
            default: return <FarmerSidebar />;
        }
    };

    if (isLoadingCrops) {
        return (
            <div className="flex min-h-screen bg-neutral-50">
                {getSidebar()}
                <main className="flex-1 lg:pl-64 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </main>
            </div>
        );
    }

    // Determine trend
    let trend = "stable";
    let changePercentage = 0;
    if (priceHistory && priceHistory.length > 1) {
        const lastPrice = priceHistory[priceHistory.length - 1].price;
        const firstPrice = priceHistory[0].price;
        changePercentage = ((lastPrice - firstPrice) / firstPrice) * 100;
        if (changePercentage > 5) trend = "up";
        else if (changePercentage < -5) trend = "down";
    }

    return (
        <div className="flex min-h-screen bg-neutral-50">
            {getSidebar()}

            <main className="flex-1 lg:pl-64">
                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900">Price Analytics</h1>
                            <p className="text-neutral-500 mt-1">Real-time market trends and price history</p>
                        </div>

                        <div className="w-full md:w-64">
                            <Select
                                onValueChange={setSelectedCropId}
                                defaultValue={selectedCropId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a crop to analyze" />
                                </SelectTrigger>
                                <SelectContent>
                                    {crops?.map((crop) => (
                                        <SelectItem key={crop.id} value={crop.id.toString()}>
                                            {crop.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {!selectedCropId ? (
                        <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-neutral-200">
                            <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-neutral-900">Select a crop to view trends</h3>
                            <p className="text-neutral-500 mt-2">Choose a crop from the dropdown above to see detailed price analysis.</p>
                        </div>
                    ) : isLoadingPrices ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Current Price</CardTitle>
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">₹{priceHistory?.[priceHistory.length - 1]?.price.toFixed(2)}</div>
                                        <p className="text-xs text-muted-foreground">per kg</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">30-Day Trend</CardTitle>
                                        {trend === "up" ? (
                                            <TrendingUp className="h-4 w-4 text-green-500" />
                                        ) : trend === "down" ? (
                                            <TrendingDown className="h-4 w-4 text-red-500" />
                                        ) : (
                                            <TrendingUp className="h-4 w-4 text-neutral-500" />
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-2xl font-bold ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-neutral-600'}`}>
                                            {changePercentage > 0 ? "+" : ""}{changePercentage.toFixed(1)}%
                                        </div>
                                        <p className="text-xs text-muted-foreground">since last month</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Forecast (AI)</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-blue-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-blue-600">Stable</div>
                                        <p className="text-xs text-muted-foreground">predicted for next 7 days</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Chart */}
                            <Card className="p-6">
                                <CardHeader className="px-0 pt-0">
                                    <CardTitle>Price History (Last 30 Days)</CardTitle>
                                    <CardDescription>Daily average market prices</CardDescription>
                                </CardHeader>
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={priceHistory}>
                                            <defs>
                                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(str) => {
                                                    const d = new Date(str);
                                                    return `${d.getDate()}/${d.getMonth() + 1}`;
                                                }}
                                            />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value: number) => [`₹${value.toFixed(2)}`, "Price"]}
                                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="price"
                                                stroke="#22c55e"
                                                fillOpacity={1}
                                                fill="url(#colorPrice)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
