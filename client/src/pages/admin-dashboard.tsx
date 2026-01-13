import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import AdminSidebar from "@/components/layout/admin-sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Sprout, Users, ShoppingBag, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

const AdminDashboard = () => {
    const { user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { data: stats } = useQuery<{
        totalUsers: number;
        totalCrops: number;
        totalOrders: number;
        totalRevenue: number;
    }>({
        queryKey: ["/api/admin/stats"],
    });

    const { data: recentUsers } = useQuery<User[]>({
        queryKey: ["/api/admin/users/recent"],
    });

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-neutral-100">
            <AdminSidebar className={isMobileMenuOpen ? "flex" : "hidden lg:flex"} />

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 min-h-screen">
                <Navbar
                    title="Admin Dashboard"
                    onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-primary">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-neutral-500 text-sm font-medium">Total Users</p>
                                    <h3 className="text-3xl font-bold mt-2">{stats?.totalUsers || 0}</h3>
                                </div>
                                <Users className="h-8 w-8 text-primary/20" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-neutral-500 text-sm font-medium">Total Crops</p>
                                    <h3 className="text-3xl font-bold mt-2">{stats?.totalCrops || 0}</h3>
                                </div>
                                <Sprout className="h-8 w-8 text-green-500/20" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-neutral-500 text-sm font-medium">Total Orders</p>
                                    <h3 className="text-3xl font-bold mt-2">{stats?.totalOrders || 0}</h3>
                                </div>
                                <ShoppingBag className="h-8 w-8 text-blue-500/20" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-neutral-500 text-sm font-medium">Total Revenue</p>
                                    <h3 className="text-3xl font-bold mt-2">₹{((stats?.totalRevenue || 0) / 100).toLocaleString()}</h3>
                                </div>
                                <TrendingUp className="h-8 w-8 text-purple-500/20" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Recent Registrations</h3>
                            <div className="space-y-4">
                                {recentUsers?.map((u: User) => (
                                    <div key={u.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mr-3">
                                                <span className="font-semibold text-neutral-500">U{u.id}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{u.username}</p>
                                                <p className="text-sm text-neutral-500 capitalize">{u.role}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${u.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {u.isVerified ? 'Verified' : 'Pending'}
                                        </span>
                                    </div>
                                ))}
                                {!recentUsers?.length && <p className="text-neutral-500">No recent users.</p>}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Platform Activity</h3>
                            <div className="space-y-4">
                                {/* Placeholder for activity log */}
                                <p className="text-neutral-500">Activity logs and system health monitoring to be implemented.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
