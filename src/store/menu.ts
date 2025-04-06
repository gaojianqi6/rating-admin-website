import {
  Airplay,
  GalleryVerticalEnd,
  LayoutTemplate,
  ListMinus,
  LucideProps,
  UserCog,
  UsersRound,
} from "lucide-react"
import { atom } from "jotai"

export interface Team {
  name: string;
  logo: React.ComponentType<LucideProps>; // Component type for SVG/React components
  plan: string;
}

export const APP_DATA = {
  teams: [
    {
      name: "Rating Everything",
      logo: GalleryVerticalEnd,
      plan: "Version 1",
    },
  ] as Team[],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Airplay,
    },
    {
      title: "Items Management",
      url: "#",
      icon: ListMinus,
      isActive: true,
      items: [
        {
          title: "Rating Items",
          url: "/items/list",
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
          url: "/template/list",
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
  projects: [],
}

export const TOTAL_NAVS = APP_DATA.navMain.concat([{
  title: "Template Management",
  url: "#",
  icon: LayoutTemplate,
  isActive: true,
  items: [
    {
      title: "Create Rating Template",
      url: "/template/create",
    },
  ],
}, {
  title: "Template Management",
  url: "#",
  icon: LayoutTemplate,
  isActive: true,
  items: [
    {
      title: "View Rating Template",
      url: "/template/$id/view",
      pattern: /^\/template\/\d+\/view$/
    },
  ],
}, {
  title: "Template Management",
  url: "#",
  icon: LayoutTemplate,
  isActive: true,
  items: [
    {
      title: "Edit Rating Template",
      url: "/template/$id/edit",
    },
  ],
},]);

// Function to check if a URL matches a pattern
function matchUrlPattern(navItem, currentUrl) {
  // Direct match
  if (navItem.url === currentUrl) {
    return true;
  }
  
  // Pattern match (for routes with parameters)
  if (navItem.pattern && navItem.pattern.test(currentUrl)) {
    return true;
  }

  // Check if this is a parameter route by looking for "$" in the URL
  if (navItem.url && navItem.url.includes('$')) {
    // Convert the route template to a regex pattern
    const regexPattern = navItem.url.replace(/\$\w+/g, '\\d+');
    const dynamicPattern = new RegExp(`^${regexPattern}$`);
    return dynamicPattern.test(currentUrl);
  }
  
  return false;
}


export const urlAtom = atom(window.location.pathname || "/")
// Derived atom that calculates the current item based on the current URL
export const currentItemAtom = atom((get) => {
  const currentUrl = get(urlAtom);

  // Default structure to return
  const result: { url: string; title: string[] } = { url: currentUrl, title: [] };

  // Look through navMain items first.
  for (const nav of TOTAL_NAVS) {
    // If there are subitems, attempt to find a matching child.
    if (nav.items && nav.items.length) {
      const found = nav.items.find((item) => matchUrlPattern(item, currentUrl));
      if (found) {
        result.title = [nav.title, found.title];
        return result;
      }
    }
    // In case a nav item itself is the match (if needed)
    if (nav.url === currentUrl) {
      result.title = [nav.title];
      return result;
    }
  }

  // Also, check if the URL matches any project.
  const project = APP_DATA.projects.find((p) => p.url === currentUrl);
  if (project) {
    result.title = [project.name];
    return result;
  }

  // Fallback if nothing matches - you can customize this as necessary.
  result.title = ["Unknown Title", "Unknown Subtitle"];
  return result;
});

export const teamAtom = atom<Team>(APP_DATA.teams[0])
