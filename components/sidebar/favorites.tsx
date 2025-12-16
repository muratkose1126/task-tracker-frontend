"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface FavoriteItem {
  id: string;
  name: string;
  type: "list" | "folder";
  url: string;
  icon?: React.ReactNode;
}

const FAVORITES_STORAGE_KEY = "workspace-favorites";

export function FavoritesSidebar({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [favorites, setFavorites] = React.useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load favorites from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      const allFavorites = stored ? JSON.parse(stored) : {};
      const workspaceFavorites = allFavorites[workspaceId] || [];
      setFavorites(workspaceFavorites);
    } catch (error) {
      console.error("Failed to load favorites:", error);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  const saveFavorites = React.useCallback(
    (items: FavoriteItem[]) => {
      try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        const allFavorites = stored ? JSON.parse(stored) : {};
        allFavorites[workspaceId] = items;
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(allFavorites));
        setFavorites(items);
      } catch (error) {
        console.error("Failed to save favorites:", error);
      }
    },
    [workspaceId]
  );

  const removeFavorite = (id: string) => {
    const updated = favorites.filter((f) => f.id !== id);
    saveFavorites(updated);
  };

  if (isLoading) {
    return null;
  }

  if (favorites.length === 0) {
    // Show empty state but still display group header
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          Favorites
        </SidebarGroupLabel>
        <div className="px-2 py-2 text-xs text-muted-foreground">
          No favorites yet
        </div>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <Star className="h-4 w-4" />
        Favorites
      </SidebarGroupLabel>
      <SidebarMenu>
        {favorites.map((favorite) => {
          const isActive = pathname === favorite.url;
          return (
            <SidebarMenuItem key={favorite.id}>
              <div className="flex items-center gap-1 group w-full">
                <SidebarMenuButton
                  onClick={() => router.push(favorite.url)}
                  className={cn(
                    "flex-1 px-2 py-1.5",
                    isActive && "bg-primary/10 font-semibold text-primary"
                  )}
                >
                  <Star className="h-4 w-4" />
                  <span className="truncate">{favorite.name}</span>
                </SidebarMenuButton>
                <button
                  onClick={() => removeFavorite(favorite.id)}
                  className="opacity-0 group-hover:opacity-100 hover:bg-accent rounded-sm p-1 ml-auto"
                  title="Remove from favorites"
                >
                  <Star className="h-4 w-4 fill-current" />
                </button>
              </div>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

// Hook to add/remove favorites
export function useFavorites(workspaceId: string) {
  const [favorites, setFavorites] = React.useState<FavoriteItem[]>([]);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      const allFavorites = stored ? JSON.parse(stored) : {};
      const workspaceFavorites = allFavorites[workspaceId] || [];
      setFavorites(workspaceFavorites);
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  }, [workspaceId]);

  const addFavorite = React.useCallback(
    (item: FavoriteItem) => {
      try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        const allFavorites = stored ? JSON.parse(stored) : {};
        const workspaceFavorites = allFavorites[workspaceId] || [];
        
        // Check if already favorited
        if (!workspaceFavorites.some((f: FavoriteItem) => f.id === item.id)) {
          workspaceFavorites.push(item);
          allFavorites[workspaceId] = workspaceFavorites;
          localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(allFavorites));
          setFavorites(workspaceFavorites);
        }
      } catch (error) {
        console.error("Failed to add favorite:", error);
      }
    },
    [workspaceId]
  );

  const removeFavorite = React.useCallback(
    (id: string) => {
      try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        const allFavorites = stored ? JSON.parse(stored) : {};
        const workspaceFavorites = allFavorites[workspaceId] || [];
        
        const updated = workspaceFavorites.filter((f: FavoriteItem) => f.id !== id);
        allFavorites[workspaceId] = updated;
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(allFavorites));
        setFavorites(updated);
      } catch (error) {
        console.error("Failed to remove favorite:", error);
      }
    },
    [workspaceId]
  );

  const isFavorited = React.useCallback(
    (id: string) => {
      return favorites.some((f) => f.id === id);
    },
    [favorites]
  );

  return { favorites, addFavorite, removeFavorite, isFavorited };
}
