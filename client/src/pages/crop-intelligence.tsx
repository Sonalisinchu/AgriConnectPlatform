import { useQuery, useMutation } from "@tanstack/react-query";
import {
    Sprout,
    Droplets,
    Thermometer,
    Calendar,
    Bug,
    Info,
    Search,
    Plus
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCropIntelligenceSchema, type InsertCropIntel, type CropIntel } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import FarmerSidebar from "@/components/layout/farmer-sidebar";
import FPOSidebar from "@/components/layout/fpo-sidebar";
import AdminSidebar from "@/components/layout/admin-sidebar";
import BuyerSidebar from "@/components/layout/buyer-sidebar"; // Added just in case

export default function CropIntelligencePage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetch all crop intelligence data
    const { data: crops, isLoading } = useQuery<CropIntel[]>({
        queryKey: ["/api/crop-intelligence"],
    });

    const form = useForm<InsertCropIntel>({
        resolver: zodResolver(insertCropIntelligenceSchema),
        defaultValues: {
            cropName: "",
            soilRequirements: "",
            climate: "",
            sowingWindow: "",
            harvestWindow: "",
            diseases: "",
            pestManagement: "",
            yieldInfo: ""
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: InsertCropIntel) => {
            const res = await apiRequest("POST", "/api/crop-intelligence", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crop-intelligence"] });
            toast({
                title: "Success",
                description: "Crop intelligence data added successfully",
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
        },
    });

    function onSubmit(data: InsertCropIntel) {
        createMutation.mutate(data);
    }

    const filteredCrops = crops?.filter(crop =>
        crop.cropName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSidebar = () => {
        switch (user?.role) {
            case "farmer": return <FarmerSidebar />;
            case "fpo": return <FPOSidebar />;
            case "admin": return <AdminSidebar />;
            case "buyer": return <BuyerSidebar />;
            default: return <FarmerSidebar />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-neutral-50">
                {getSidebar()}
                <main className="flex-1 lg:pl-64 p-8 flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <Sprout className="h-12 w-12 text-neutral-300 mb-4" />
                        <p className="text-neutral-500">Loading crop intelligence...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-neutral-50">
            {getSidebar()}

            <main className="flex-1 lg:pl-64">
                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
                                <Sprout className="h-8 w-8 text-primary" />
                                Crop Intelligence
                            </h1>
                            <p className="text-neutral-500 mt-1">
                                Scientific farming practices and crop management guides
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <Input
                                    placeholder="Search crops..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {(user?.role === "admin" || user?.role === "fpo") && (
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Crop Data
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Add New Crop Intelligence</DialogTitle>
                                            <DialogDescription>
                                                Provide detailed scientific information about the crop.
                                            </DialogDescription>
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
                                                                <Input  {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="soilRequirements"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Soil Requirements</FormLabel>
                                                                <FormControl>
                                                                    <Input  {...field} value={field.value || ""} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="climate"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Climate Conditions</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} value={field.value || ""} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="sowingWindow"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Sowing Window</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} value={field.value || ""} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="harvestWindow"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Harvest Window</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} value={field.value || ""} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name="pestManagement"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Pest Management</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} value={field.value || ""} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="diseases"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Common Diseases</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} value={field.value || ""} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="yieldInfo"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Yield Information</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} value={field.value || ""} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="flex justify-end gap-2 pt-4">
                                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit" disabled={createMutation.isPending}>
                                                        {createMutation.isPending ? "Saving..." : "Save Crop Data"}
                                                    </Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCrops?.map((crop) => (
                            <Card key={crop.id} className="hover:shadow-lg transition-shadow duration-200">
                                <CardHeader>
                                    <CardTitle className="text-xl text-primary-dark flex items-center justify-between">
                                        {crop.cropName}
                                        <Info className="h-5 w-5 text-neutral-400" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Droplets className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-medium text-sm text-neutral-900">Soil</p>
                                            <p className="text-sm text-neutral-600 line-clamp-2">{crop.soilRequirements}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Thermometer className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-medium text-sm text-neutral-900">Climate</p>
                                            <p className="text-sm text-neutral-600 line-clamp-2">{crop.climate}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-medium text-sm text-neutral-900">Sowing</p>
                                            <p className="text-sm text-neutral-600">{crop.sowingWindow}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Bug className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-medium text-sm text-neutral-900">Pest Mgmt</p>
                                            <p className="text-sm text-neutral-600 line-clamp-1">{crop.pestManagement}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {filteredCrops?.length === 0 && (
                            <div className="col-span-full py-12 text-center text-neutral-500">
                                <Sprout className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                                <p>No crop information found matching "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
