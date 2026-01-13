import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Crop, MarketplaceRequirement, InsertRequirement, insertRequirementSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, ShoppingCart, MessageCircle, MapPin, Tag } from "lucide-react";
import FarmerSidebar from "@/components/layout/farmer-sidebar";
import FPOSidebar from "@/components/layout/fpo-sidebar";
import AdminSidebar from "@/components/layout/admin-sidebar";
import BuyerSidebar from "@/components/layout/buyer-sidebar";
import { useState } from "react";
import { Link } from "wouter";

export default function MarketplacePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Queries
    const { data: crops, isLoading: isLoadingCrops } = useQuery<Crop[]>({
        queryKey: ["/api/crops"],
    });

    const { data: requirements, isLoading: isLoadingReqs } = useQuery<MarketplaceRequirement[]>({
        queryKey: ["/api/marketplace/requirements"],
    });

    // Form for new requirement
    const form = useForm<InsertRequirement>({
        resolver: zodResolver(insertRequirementSchema),
        defaultValues: {
            buyerId: user?.id,
            cropName: "",
            quantityRequired: 0,
            priceRange: "",
            description: ""
        }
    });

    // Mutation for creating requirement
    const createRequirementMutation = useMutation({
        mutationFn: async (data: InsertRequirement) => {
            const res = await apiRequest("POST", "/api/marketplace/requirements", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/marketplace/requirements"] });
            toast({
                title: "Success",
                description: "Requirement posted successfully",
            });
            setIsDialogOpen(false);
            form.reset();
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    });

    function onSubmit(data: InsertRequirement) {
        if (!user) return;
        createRequirementMutation.mutate({ ...data, buyerId: user.id });
    }

    const getSidebar = () => {
        switch (user?.role) {
            case "farmer": return <FarmerSidebar />;
            case "fpo": return <FPOSidebar />;
            case "admin": return <AdminSidebar />;
            case "buyer": return <BuyerSidebar />;
            default: return <FarmerSidebar />;
        }
    };

    if (isLoadingCrops || isLoadingReqs) {
        return (
            <div className="flex min-h-screen bg-neutral-50">
                {getSidebar()}
                <main className="flex-1 lg:pl-64 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-neutral-50">
            {getSidebar()}

            <main className="flex-1 lg:pl-64">
                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900">Marketplace</h1>
                            <p className="text-neutral-500 mt-1">Connect with farmers and buyers</p>
                        </div>

                        {user?.role === "buyer" && (
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Post Requirement
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Post Buying Requirement</DialogTitle>
                                        <DialogDescription>Let farmers know what you need</DialogDescription>
                                    </DialogHeader>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="cropName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Crop Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. Wheat, Rice" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="quantityRequired"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Quantity needed (kg)</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="priceRange"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Price Range (₹)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g. 20-30" {...field} value={field.value || ""} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Description</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="Specific quality requirements or delivery details..." {...field} value={field.value || ""} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" className="w-full" disabled={createRequirementMutation.isPending}>
                                                {createRequirementMutation.isPending ? "Posting..." : "Post Requirement"}
                                            </Button>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    <Tabs defaultValue="available-crops" className="w-full">
                        <TabsList>
                            <TabsTrigger value="available-crops">Available Produce</TabsTrigger>
                            <TabsTrigger value="buyer-requirements">Buyer Requirements</TabsTrigger>
                        </TabsList>

                        <TabsContent value="available-crops" className="mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {crops?.map((crop) => (
                                    <Card key={crop.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <CardTitle className="flex justify-between items-start">
                                                <span>{crop.name}</span>
                                                <span className="text-primary font-bold">₹{crop.currentPrice}/kg</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center text-sm text-neutral-500">
                                                <MapPin className="h-4 w-4 mr-2" />
                                                {crop.location}
                                            </div>
                                            <div className="flex items-center text-sm text-neutral-500">
                                                <Tag className="h-4 w-4 mr-2" />
                                                {crop.category}
                                            </div>
                                            <p className="text-sm text-neutral-600 line-clamp-2">{crop.description}</p>
                                            <div className="pt-2 flex justify-between items-center text-sm font-medium">
                                                <span>Available: {crop.quantity} kg</span>
                                                {crop.storageInfo && (
                                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                        {crop.storageInfo}
                                                    </span>
                                                )}
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button className="w-full" variant="outline">
                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                Contact Seller
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                                {crops?.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-neutral-500">
                                        No crops listed yet.
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="buyer-requirements" className="mt-6">
                            <div className="grid grid-cols-1 gap-4">
                                {requirements?.map((req) => (
                                    <Card key={req.id}>
                                        <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-lg font-semibold text-neutral-900">{req.cropName}</h3>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                </div>
                                                <p className="text-neutral-600">{req.description}</p>
                                                <div className="flex gap-4 text-sm text-neutral-500 pt-2">
                                                    <span className="flex items-center">
                                                        <ShoppingCart className="h-4 w-4 mr-1" />
                                                        Qty: {req.quantityRequired} kg
                                                    </span>
                                                    {req.priceRange && (
                                                        <span className="flex items-center">
                                                            Target Price: ₹{req.priceRange}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button>
                                                Contact Buyer
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                                {requirements?.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-neutral-500">
                                        No buyer requirements posted yet.
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
