"use client";
import {
    Settings,
    BarChart3,
    Building2,
    FileText,
    Folder,
    LucideIcon,
    Shield,
    AlarmClockCheck,
} from "lucide-react";
import Link from "next/link";
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
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavigationItem {
    title: string;
    url: string;
    icon: LucideIcon;
    isAdminPage?: boolean;
}

const AppSidebar = ({ isAdmin }: { isAdmin: boolean }) => {
    const pathname = usePathname();
    const { state } = useSidebar();

    const baseNavigationItems: NavigationItem[] = [
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

    const adminNavigationItems: NavigationItem[] = [
        {
            title: "Clients",
            url: "/clients",
            icon: Building2,
            isAdminPage: true,
        },
    ];

    const navigationItems = isAdmin
        ? [...baseNavigationItems, ...adminNavigationItems]
        : baseNavigationItems;

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
                        <SidebarMenuButton className="mt-2 flex items-center">
                            <AlarmClockCheck className="size-10" />
                            <span className="font-bold text-xl">Time</span>
                            <span className="text-sm mt-1">by DataThink</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="bg-sidebar">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationItems.map((item, index) => (
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
                                                    className={cn(
                                                        item.isAdminPage &&
                                                            "flex items-center justify-between",
                                                        "text-base py-5 hover:bg-sidebar-border data-[active=true]:bg-sidebar-border data-[active=true]:text-sidebar-accent-foreground"
                                                    )}
                                                >
                                                    <Link href={item.url}>
                                                        <item.icon className="mr-2 h-4 w-4" />
                                                        <span>
                                                            {item.title}
                                                        </span>
                                                        {item.isAdminPage && (
                                                            <Shield className="ml-auto h-2 w-2" />
                                                        )}
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
                                                {item.isAdminPage && (
                                                    <Shield className="ml-auto h-4 w-4" />
                                                )}
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
