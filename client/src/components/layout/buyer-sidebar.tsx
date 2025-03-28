import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Store,
  ShoppingCart,
  LogOut,
  Users,
  User,
  Shield,
  Home,
  Menu,
  Sprout, // Changed from Plant to Sprout
  X
} from "lucide-react";
import { useState } from "react";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

interface SidebarProps {
  className?: string;
}

export function BuyerSidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navItems = [
    {
      title: "Dashboard",
      icon: <Home className="mr-3 h-5 w-5" />,
      href: "/buyer-dashboard",
    },
    {
      title: "Available Crops",
      icon: <Store className="mr-3 h-5 w-5" />,
      href: "/buyer-dashboard#available-crops",
    },
    {
      title: "My Orders",
      icon: <ShoppingCart className="mr-3 h-5 w-5" />,
      href: "/buyer-dashboard#orders",
    },
    {
      title: "Farmer Connections",
      icon: <Users className="mr-3 h-5 w-5" />,
      href: "/buyer-dashboard#farmer-connections",
    },
    {
      title: "Verification Status",
      icon: <Shield className="mr-3 h-5 w-5" />,
      href: "/buyer-dashboard#verification",
    },
    {
      title: "My Profile",
      icon: <User className="mr-3 h-5 w-5" />,
      href: "/buyer-dashboard#profile",
    }
  ];
  
  const renderNavItems = () => (
    <ul className="space-y-1">
      {navItems.map((item) => (
        <li key={item.title}>
          <Link href={item.href}>
            <a
              className={cn(
                "flex items-center px-4 py-3 text-neutral-700 hover:bg-neutral-100 rounded-lg mb-1",
                location === item.href ||
                (item.href !== "/buyer-dashboard" && location.includes(item.href))
                  ? "bg-primary text-white hover:bg-primary-dark"
                  : ""
              )}
            >
              {item.icon}
              <span>{item.title}</span>
            </a>
          </Link>
        </li>
      ))}
      <li className="mt-6">
        <Button
          variant="ghost"
          className="flex w-full items-center px-4 py-3 text-neutral-700 hover:bg-neutral-100 rounded-lg"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span>Sign Out</span>
        </Button>
      </li>
    </ul>
  );
  
  // Mobile menu
  const mobileMenu = (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="p-4 border-b border-neutral-200">
          <SheetTitle className="font-bold text-xl text-primary flex items-center">
            <Sprout className="mr-2 h-5 w-5" /> AgriConnect
            <SheetClose className="ml-auto">
              <X className="h-4 w-4" />
            </SheetClose>
          </SheetTitle>
          <p className="text-sm text-neutral-500">Buyer Dashboard</p>
        </SheetHeader>
        
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{user?.fullName}</p>
              <p className="text-xs text-neutral-500">{user?.location}</p>
            </div>
          </div>
        </div>
        
        <nav className="p-2">
          {renderNavItems()}
        </nav>
      </SheetContent>
    </Sheet>
  );
  
  // Desktop sidebar
  return (
    <>
      {mobileMenu}
      
      <div className={cn("bg-white shadow-md lg:w-64 lg:fixed lg:h-full hidden lg:block", className)}>
        <div className="p-4 border-b border-neutral-200">
          <h1 className="font-bold text-xl text-primary flex items-center">
            <Sprout className="mr-2 h-5 w-5" /> AgriConnect
          </h1>
          <p className="text-sm text-neutral-500">Buyer Dashboard</p>
        </div>
        
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{user?.fullName}</p>
              <p className="text-xs text-neutral-500">{user?.location}</p>
            </div>
          </div>
        </div>
        
        <nav className="p-2">
          {renderNavItems()}
        </nav>
      </div>
    </>
  );
}

export default BuyerSidebar;
