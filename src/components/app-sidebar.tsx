import * as React from "react";
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
import { APP_DATA as data } from "@/store/menu"
import { useEffect, useState } from "react";

const navMain = data.navMain;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUserStore();
  const [navItems, setNavItems] = useState(data.navMain);
  const navUserData = { ...user, avatar: "/avatar.jpeg" } as User;

  useEffect(() => {
    if (user?.roleName === 'Operator') {
      setNavItems(navMain.slice(0, 3));
      return;
    }
    setNavItems(navMain);
  }, [user]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUserData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
