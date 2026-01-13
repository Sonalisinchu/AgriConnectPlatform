import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import FPOSidebar from "@/components/layout/fpo-sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Plus, Users, FileText } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";

const FPODashboard = () => {
    const { user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [newMemberUsername, setNewMemberUsername] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetch FPO members
    const { data: members, isLoading } = useQuery<any[]>({
        queryKey: [`/api/fpo/members/${user?.id}`],
        enabled: !!user?.id,
    });

    // Fetch FPO stats
    const { data: stats } = useQuery<{
        totalMembers: number;
        activeCrops: number;
        totalRevenue: number;
    }>({
        queryKey: [`/api/fpo/stats/${user?.id}`],
        enabled: !!user?.id,
    });

    const addMemberMutation = useMutation({
        mutationFn: async (username: string) => {
            await apiRequest("POST", "/api/fpo/members", { username });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/fpo/members"] });
            queryClient.invalidateQueries({ queryKey: ["/api/fpo/stats"] });
            toast({
                title: "Member added",
                description: `${newMemberUsername} has been added to the FPO.`,
            });
            setNewMemberUsername("");
            setIsDialogOpen(false);
        },
        onError: (error: any) => {
            toast({
                title: "Failed to add member",
                description: error.message || "Please check the username and try again.",
                variant: "destructive",
            });
        }
    });

    const handleAddMember = () => {
        if (!newMemberUsername.trim()) return;
        addMemberMutation.mutate(newMemberUsername);
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-neutral-100">
            <FPOSidebar className={isMobileMenuOpen ? "flex" : "hidden lg:flex"} />

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 min-h-screen">
                <Navbar
                    title="FPO Dashboard"
                    onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-primary">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-neutral-500 text-sm font-medium">Total Members</p>
                                    <h3 className="text-3xl font-bold mt-2">{stats?.totalMembers || 0}</h3>
                                </div>
                                <Users className="h-8 w-8 text-primary/20" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-neutral-500 text-sm font-medium">Active Crops</p>
                                    <h3 className="text-3xl font-bold mt-2">{stats?.activeCrops || 0}</h3>
                                </div>
                                <FileText className="h-8 w-8 text-blue-500/20" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-neutral-500 text-sm font-medium">Total Revenue</p>
                                    <h3 className="text-3xl font-bold mt-2">₹{((stats?.totalRevenue || 0) / 100).toLocaleString()}</h3>
                                </div>
                                <span className="text-2xl font-bold text-green-500/20">₹</span>
                            </div>
                        </div>
                    </div>

                    <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl">Member Farmers</h3>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" /> Add Member
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Member</DialogTitle>
                                        <DialogDescription>
                                            Enter the username of the farmer you want to add to your FPO.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <label className="text-sm font-medium mb-2 block">Username</label>
                                        <Input
                                            value={newMemberUsername}
                                            onChange={(e) => setNewMemberUsername(e.target.value)}
                                            placeholder="Enter farmer username"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                        <Button onClick={handleAddMember} disabled={addMemberMutation.isPending}>
                                            {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {isLoading ? (
                            <p>Loading members...</p>
                        ) : !members || members.length === 0 ? (
                            <p className="text-neutral-500 text-center py-8">No members added yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-neutral-50">
                                            <th className="py-3 px-4 text-left font-medium text-neutral-600">Name</th>
                                            <th className="py-3 px-4 text-left font-medium text-neutral-600">Location</th>
                                            <th className="py-3 px-4 text-left font-medium text-neutral-600">Joined Date</th>
                                            <th className="py-3 px-4 text-left font-medium text-neutral-600">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.map((member: any) => (
                                            <tr key={member.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium">{member.username}</td>
                                                <td className="py-3 px-4 text-neutral-600">
                                                    {member.farmerProfile?.location || member.location || "N/A"}
                                                </td>
                                                <td className="py-3 px-4 text-neutral-600">
                                                    {new Date(member.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Button variant="outline" size="sm">View</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default FPODashboard;
