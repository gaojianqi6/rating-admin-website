import * as React from "react"
import {
  GalleryVerticalEnd,
  ListMinus,
  LayoutTemplate,
  UsersRound,
  UserCog,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "jerome",
    email: "jerome@gmail.com",
    avatar: "/avatar.jpeg",
  },
  teams: [
    {
      name: "Rating Everything",
      logo: GalleryVerticalEnd,
      plan: "Version 1",
    },
  ],
  navMain: [
    {
      title: "Rating Infos Management",
      url: "#",
      icon: ListMinus,
      isActive: true,
      items: [
        {
          title: "Rating Infos",
          url: "#",
        },
      ],
    },
    {
      title: "Template Management",
      url: "#",
      icon: LayoutTemplate,
      isActive: true,
      items: [
        {
          title: "Rating Templates",
          url: "#",
        },
      ],
    },
    {
      title: "User Management",
      url: "#",
      icon: UsersRound,
      items: [
        {
          title: "Users",
          url: "/users",
        },
      ],
    },
    {
      title: "Role Management",
      url: "#",
      icon: UserCog,
      items: [
        {
          title: "Roles",
          url: "/role/list",
        },
      ],
    },
  ],
  projects: [
    // {
    //   name: "Design Engineering",
    //   url: "#",
    //   icon: Frame,
    // },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
