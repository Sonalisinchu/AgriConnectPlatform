import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BellIcon, Search, Menu, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  title: string;
  className?: string;
  onToggleSidebar?: () => void;
}

export function Navbar({ title, className, onToggleSidebar }: NavbarProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log(`Searching for: ${searchQuery}`);
  };

  return (
    <div className={cn("bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10", className)}>
      <div className="flex items-center">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-4 text-neutral-700"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h2 className="font-semibold text-xl">{title}</h2>
      </div>

      <div className="flex items-center space-x-4">
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-neutral-400" />
          </span>
          <Input
            type="search"
            placeholder={user?.role === "farmer" ? "Search crops, market..." : "Search crops, farmers..."}
            className="pl-10 pr-4 py-2 w-40 md:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <Button variant="ghost" size="icon" className="relative text-neutral-700 hover:bg-neutral-100 rounded-full">
          <BellIcon className="h-5 w-5" />
          <span className="absolute top-1 right-1 bg-primary w-2 h-2 rounded-full"></span>
        </Button>
      </div>
    </div>
  );
}

export default Navbar;
