"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useUser } from "@/context/UserContext"

// This is sample data.
const data = {
  teams: [
    {
      name: "MediCrypt",
      logo: GalleryVerticalEnd,
      plan: "Your reports at ease",
    },
    {
      name: "Product Team",
      logo: AudioWaveform,
      plan: "Enterprise",
    },
    {
      name: "Design Team",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: PieChart,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard/overview",
        },
        {
          title: "Recent Reports",
          url: "/dashboard/reports",
        },
        {
          title: "Notifications",
          url: "/dashboard/notifications",
        },
      ],
    },
    {
      title: "Reports",
      url: "/reports",
      icon: SquareTerminal,
      items: [
        {
          title: "Shared Reports",
          url: "/reports/shared",
        },
        {
          title: "My Reports",
          url: "/reports",
        },
        {
          title: "Create Report",
          url: "/reports/new",
        },
      ],
    },
    {
      title: "Media Library",
      url: "/media",
      icon: GalleryVerticalEnd,
      items: [
        {
          title: "Images",
          url: "/media/images",
        },
        {
          title: "Videos",
          url: "/media/videos",
        },
        {
          title: "Documents",
          url: "/media/documents",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "Profile",
          url: "/settings/profile",
        },
        {
          title: "Team Settings",
          url: "/settings/team",
        },
        {
          title: "Billing",
          url: "/settings/billing",
        },
        {
          title: "Notifications",
          url: "/settings/notifications",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Q3 Marketing Campaign",
      url: "/projects/q3-marketing",
      icon: Frame,
    },
  ],
}


export function AppSidebar({
  ...props
}) {
  const { user } = useUser()
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user || {}} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
