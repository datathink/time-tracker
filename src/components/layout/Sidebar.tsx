"use client";

import { Settings, BarChart3, Building2, FileText, Folder } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { isAdminUser } from "@/lib/actions/clients";

const AppSidebar = () => {
    const pathname = usePathname();
    const { state } = useSidebar();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const adminStatus = await isAdminUser();
                setIsAdmin(adminStatus);
            } catch (error) {
                console.error("Error checking admin status:", error);
                setIsAdmin(false);
            }
        };

        checkAdminStatus();
    }, []);

    const baseNavigation = [
        {
            title: "Time Entries",
            url: "/entries",
            icon: FileText,
        },
        {
            title: "Projects",
            url: "/projects",
            icon: Folder,
        },
        {
            title: "Reports",
            url: "/reports",
            icon: BarChart3,
        },
        {
            title: "Settings",
            url: "/settings",
            icon: Settings,
        },
    ];

    const adminNavigation = [
        {
            title: "Clients",
            url: "/clients",
            icon: Building2,
        },
    ];

    const navigation = isAdmin
        ? [
              ...baseNavigation.slice(0, 2),
              ...adminNavigation,
              ...baseNavigation.slice(2),
          ]
        : baseNavigation;

    const isActive = (url: string): boolean => {
        // Handle root separately if needed
        if (url === "/") return pathname === "/";

        // Exact match OR starts with url + "/"
        return pathname === url || pathname.startsWith(`${url}/`);
    };

    const isCollapsed = state === "collapsed";

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="bg-sidebar">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link
                                href="/entries"
                                className="mt-3.5 mb-4 flex items-center space-x-2"
                            >
                                <Image
                                    src="/logo.svg"
                                    alt="logo"
                                    width={24}
                                    height={24}
                                    className="shrink-0"
                                />
                                <span className="font-bold text-lg">
                                    Time Tracker Pro
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="bg-sidebar">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigation.map((item, index) => (
                                <SidebarMenuItem
                                    key={`nav-item-${index}-${item.title}`}
                                >
                                    {isCollapsed ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={isActive(
                                                        item.url
                                                    )}
                                                    className="text-[16px] py-5 hover:bg-sidebar-border data-[active=true]:bg-sidebar-border data-[active=true]:text-sidebar-accent-foreground"
                                                >
                                                    <Link href={item.url}>
                                                        <item.icon className="mr-2 h-4 w-4" />
                                                        <span>
                                                            {item.title}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </TooltipTrigger>
                                            <TooltipContent
                                                side="right"
                                                align="center"
                                            >
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive(item.url)}
                                            className="text-[16px] py-5 hover:bg-sidebar-border data-[active=true]:bg-sidebar-border data-[active=true]:text-sidebar-accent-foreground"
                                        >
                                            <Link href={item.url}>
                                                <item.icon className="mr-2 h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};

export default AppSidebar;
