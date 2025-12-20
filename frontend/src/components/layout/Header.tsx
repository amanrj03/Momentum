import { Bell, HelpCircle, LogOut, Settings, User, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  categories?: string[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export const Header = ({ 
  title, 
  showSearch = false, 
  searchQuery = "", 
  onSearchChange, 
  categories = [], 
  selectedCategory = "All", 
  onCategoryChange 
}: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  const profile = user?.profile as any;
  const initials = profile?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-card border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: Title */}
      <div className="flex items-center gap-6">
        {title && !showSearch && (
          <h1 className="font-display font-bold text-xl text-foreground">
            {title}
          </h1>
        )}
      </div>

      {/* Center: Search Bar (if enabled) */}
      {showSearch && onSearchChange && (
        <div className="flex-1 max-w-2xl mx-auto px-4">
          <div className="space-y-2">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search creators, videos, or topics..."
                  value={searchQuery}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                  }}
                  className="pl-12 h-10 bg-secondary/50 border-transparent focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-10 ${showFilters ? "border-primary text-primary bg-primary/10" : ""}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {/* Categories Filter */}
            {showFilters && categories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 py-2"
              >
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`cursor-pointer transition-all hover:scale-105 text-xs ${
                      selectedCategory === category
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "hover:border-primary/50 hover:bg-primary/10"
                    }`}
                    onClick={() => onCategoryChange?.(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
        </Button>

        {/* User Menu */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-xl hover:bg-secondary/50 ml-2"
              >
                <Avatar className="h-9 w-9 ring-2 ring-border/50">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur-xl border-border/50" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {profile?.full_name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                onClick={() => navigate("/profile")}
                className="cursor-pointer hover:bg-secondary/50"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate("/settings")}
                className="cursor-pointer hover:bg-secondary/50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive" 
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => navigate("/login")}
            className="rounded-xl border-border/50 hover:bg-secondary/50"
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;