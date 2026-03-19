import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Settings, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface HeaderProps {
  onCartClick?: () => void;
}

export default function Header({ onCartClick }: HeaderProps) {
  const { totalItems } = useCart();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const qc = useQueryClient();
  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      qc.clear();
    } else {
      try {
        await login();
      } catch (err: any) {
        console.error(err);
      }
    }
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center" data-ocid="header.link">
          <img
            src="/assets/uploads/Gemini_Generated_Image_8zqcyv8zqcyv8zqc-1.png"
            alt="Malda Store"
            className="h-12 sm:h-14 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCartClick}
            className="relative text-primary-foreground hover:bg-primary-foreground/10 md:hidden"
            data-ocid="header.cart_button"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-yellow-400 text-yellow-900 text-xs">
                {totalItems}
              </Badge>
            )}
          </Button>
          <Button
            variant="ghost"
            className="hidden md:flex items-center gap-2 text-primary-foreground hover:bg-primary-foreground/10"
            onClick={onCartClick}
            data-ocid="header.cart_button_desktop"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Cart ({totalItems})</span>
          </Button>
          <Link to="/admin">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              data-ocid="header.admin_link"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Admin</span>
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAuth}
            disabled={loginStatus === "logging-in"}
            className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
            data-ocid="header.login_button"
          >
            {loginStatus === "logging-in"
              ? "Logging in..."
              : isAuthenticated
                ? "Logout"
                : "Login"}
          </Button>
        </div>
      </div>
    </header>
  );
}
