"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { User, LogOut } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";

export function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-16 bg-white flex items-center justify-between px-4">
      <div className="flex items-center">
        <SidebarTrigger className="cursor-pointer" />
      </div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>
                {session?.user?.name || session?.user?.email || "User"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-gray-600 cursor-pointer"
              onClick={() => setIsProfileOpen(true)}
            >
              <User className="h-5 w-5" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleSignOut}
              className="text-red-600 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ProfileForm
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        onSuccess={handleSuccess}
      />
    </header>
  );
}
