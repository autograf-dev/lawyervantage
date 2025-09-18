"use client"

import * as React from "react"
import { Infinity, Database, GalleryVerticalEnd, LayoutDashboard as IconDashboard } from "lucide-react"

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
import { supabase } from "@/lib/supabase"

// This is sample data.
const data = {
  user: {
    name: "Sutej",
    email: "sutej@autgraph.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Lawyer Vantage",
      logo: GalleryVerticalEnd,
      plan: "LawFirm",
    },

  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
      isActive: false,
    },
    {
      title: "CRM",
      url: "#",
      icon: Database,
      isActive: true,
      items: [
        {
          title: "Contacts",
          url: "/contacts",
        },
        {
          title: "Opportunities",
          url: "/opportunities",
        },
       
      ],
    },
    
  ],
  projects: [
    {
      name: "Meta",
      url: "#",
      icon: Infinity,
    },
   
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [authUser, setAuthUser] = React.useState<{ name: string; email: string; avatar: string }>(
    data.user
  )

  React.useEffect(() => {
    let isMounted = true
    supabase.auth.getUser().then(({ data: result }) => {
      const u = result.user
      if (!u || !isMounted) return
      const meta = (u.user_metadata || {}) as Record<string, unknown>
      const fullName = (meta.full_name as string) || (meta.name as string) || ""
      const derivedName = fullName || (u.email ? String(u.email).split("@")[0] : data.user.name)
      const avatarUrl =
        (meta.avatar_url as string) || (meta.picture as string) || data.user.avatar || ""
      setAuthUser({
        name: derivedName,
        email: u.email || data.user.email,
        avatar: avatarUrl,
      })
    })
    return () => {
      isMounted = false
    }
  }, [])

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
        <NavUser user={authUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
