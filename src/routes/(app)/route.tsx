import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React, { useEffect } from "react";
import { useAtom } from "jotai";
import { currentItemAtom, urlAtom } from "@/store/menu";

export const Route = createFileRoute("/(app)")({
  component: RouteComponent,
});

function RouteComponent() {
  const [, setUrl] = useAtom(urlAtom);
  const [currentItem] = useAtom(currentItemAtom);

  useEffect(() => {
    const handleHashChange = () => {
      console.log("hash:", window.location.pathname);
      setUrl(window.location.pathname);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [setUrl]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {currentItem.title.map((title: string, index: number) => {
                  if (index === 0) {
                    return (
                      <BreadcrumbItem key={`breadcrumb-item-${index}`} className="hidden md:block">
                        <BreadcrumbLink key="link1" href="#">{title}</BreadcrumbLink>
                      </BreadcrumbItem>
                    );
                  } else {
                    return (
                      <React.Fragment key={`breadcrumb-fragment-${index}`}>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem key={`breadcrumb-item-${index}`}>
                          <BreadcrumbPage key="page2">{title}</BreadcrumbPage>
                        </BreadcrumbItem>
                      </React.Fragment>
                    );
                  }
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
