import * as React from "react";
import {
  GalleryVerticalEnd,
  ListMinus,
  LayoutTemplate,
  UsersRound,
  UserCog,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useUserStore } from "@/store/user";
import { User } from "@/typings/user";

// This is sample data.
const data = {
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
          url: "/user/list",
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
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUserStore();
  const navUserData = { ...user, avatar: "/avatar.jpeg" } as User;

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
        <NavUser user={navUserData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
