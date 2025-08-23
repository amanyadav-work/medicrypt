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
          url: "/dashboard",
        },
        {
          title: "Recent Reports",
          url: "/reports",
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
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "Profile",
          url: "/profile",
        },
        {
          title: "Audit Logs",
          url: "/auditlog",
        },
      ],
    },
  ],
  projects: [
   
  ],
}


export function AppSidebar({
  ...props
}) {
  const { user } = useUser()
  // Filter navMain to hide 'Create Report' if user is not doctor or patient
  const navMainFiltered = data.navMain.map(section => {
    if (section.title === 'Reports') {
      return {
        ...section,
        items: section.items.filter(item => {
          if (item.title === 'Create Report') {
            return user?.role === 'doctor' || user?.role === 'patient';
          }
          return true;
        })
      };
    }
    return section;
  });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainFiltered} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user || {}} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
