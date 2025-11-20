"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            pathname === item.url || pathname.startsWith(item.url + "/");

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {item.items && item.items.length > 0 ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        className={`p-0 hover:bg-transparent data-[state=open]:bg-transparent`}
                      >
                        <div
                          className={`group relative flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors w-full ${
                            isActive
                              ? "bg-primary/10 text-foreground font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          }`}
                        >
                          {item.icon && (
                            <item.icon
                              className={`h-4 w-4 shrink-0 ${
                                isActive
                                  ? "text-primary"
                                  : "group-hover:text-foreground"
                              }`}
                            />
                          )}
                          <span className="truncate flex-1">{item.title}</span>
                          <ChevronRight
                            className={`ml-auto h-4 w-4 transition-all ${
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground/50"
                            } group-data-[state=open]/collapsible:rotate-90`}
                          />
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const isSubActive = pathname === subItem.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className="p-0 hover:bg-transparent"
                              >
                                <Link
                                  href={subItem.url}
                                  className={`group relative flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors w-full ${
                                    isSubActive
                                      ? "bg-primary/10 text-foreground font-semibold"
                                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                  }`}
                                >
                                  <span className="truncate flex-1">
                                    {subItem.title}
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="p-0 hover:bg-transparent"
                  >
                    <Link
                      href={item.url}
                      className={`group relative flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors w-full ${
                        isActive
                          ? "bg-primary/10 text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {item.icon && (
                        <item.icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive
                              ? "text-primary"
                              : "group-hover:text-foreground"
                          }`}
                        />
                      )}
                      <span className="truncate flex-1">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
