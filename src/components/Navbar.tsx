import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { LogOut, Shield, Github } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import { ModeToggle } from "./mode-toggle";

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "AD";
  };

  return (
    <nav
      className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-md supports-backdrop-filter:bg-background/60 border-b border-border/40"
    >
      {" "}
      {/* container alinha todos os filhos ao fim (direita) */}
      <div className="container mx-auto flex h-16 items-center justify-end px-4">
        {/* Right side - Mode Toggle, GitHub icons, and User Menu/Login */}
        <div className="flex items-center gap-4">
          {/* GitHub Icons with separators */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="https://github.com/GMB-Rs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/60 hover:text-foreground transition-colors"
              aria-label="GitHub Projeto 1"
            >
              <Github className="h-5 w-5" />
            </a>
            <div className="h-4 w-px bg-border" />
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.photoURL || ""}
                        alt={user.email || ""}
                      />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName || "Usuário"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Git mobile Button */}
          <div className="md:hidden">
            <a
              title="Git"
              href="https://github.com/GMB-Rs"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-1">
                <Github className="h-4 w-4" />
              </Button>
            </a>
          </div>

          <div className="h-4 w-px bg-border" />

          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}