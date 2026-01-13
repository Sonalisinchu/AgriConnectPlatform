import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
    Sprout,
    LayoutDashboard,
    Users,
    ShieldCheck,
    Settings,
    LogOut,
    Database,
    BarChart,
    Send,
    BookOpen,
    ShoppingBag,
    BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    className?: string;
}

export function AdminSidebar({ className }: SidebarProps) {
    const [location] = useLocation();
    const { logoutMutation } = useAuth();

    const navItems = [
        { href: "/admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/users", label: "User Management", icon: Users },
        { href: "/admin/verifications", label: "Verifications", icon: ShieldCheck },
        { href: "/admin/crops", label: "Crop Database", icon: Database },
        { href: "/admin/analytics", label: "Analytics", icon: BarChart },
        { href: "/crop-intelligence", label: "Crop Intelligence", icon: BookOpen },
        { href: "/messages", label: "Messages", icon: Send },
        { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
        { href: "/admin/settings", label: "Settings", icon: Settings },
    ];

    return (
        <aside className={cn("bg-white border-r border-neutral-200 w-64 fixed h-full hidden lg:flex flex-col z-20", className)}>
            <div className="p-6 border-b border-neutral-100 flex items-center">
                <Sprout className="h-6 w-6 text-primary mr-2" />
                <span className="font-bold text-xl text-primary-dark">AgriConnect</span>
            </div>

            <div className="flex-1 py-6 px-4 space-y-1">
                <div className="px-2 mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Admin Console
                </div>
                {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <div
                            className={cn(
                                "flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors",
                                location === item.href
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", location === item.href ? "text-primary" : "text-neutral-500")} />
                            <span>{item.label}</span>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="p-4 border-t border-neutral-100">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => logoutMutation.mutate()}
                >
                    <LogOut className="mr-2 h-5 w-5" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}

export default AdminSidebar;
