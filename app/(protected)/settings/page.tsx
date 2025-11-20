"use client";

import { useAuthStore } from "@/store/authStore";
import { useCurrentUser } from "@/hooks/useAuth";
import { PageContainer } from "@/components/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Calendar,
  Settings as SettingsIcon,
  Lock,
  Bell,
  Shield,
  Palette,
  Edit3,
} from "lucide-react";

export default function SettingsPage() {
  const userFromStore = useAuthStore((s) => s.user);
  const { data: currentUser, isLoading } = useCurrentUser();

  const user = userFromStore || currentUser;

  if (isLoading && !user) {
    return (
      <PageContainer>
        <div className="space-y-6 max-w-6xl mx-auto">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <div className="text-center">
          <p className="text-muted-foreground">
            No user information available.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <SettingsIcon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Settings</h1>
          <p className="text-muted-foreground text-lg">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="border-0 shadow-lg bg-linear-to-br from-background via-background to-muted/30">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="rounded-xl bg-primary/10 p-2.5">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  Profile Information
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Avatar & Name */}
              <div className="flex items-center gap-6 p-6 rounded-xl bg-linear-to-r from-primary/5 to-primary/10 border border-primary/10">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-4 border-background rounded-full" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2" disabled>
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
              </div>

              {/* Info Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="group p-5 rounded-xl bg-muted/50 hover:bg-muted/80 transition-all hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-blue-500/10 p-3 group-hover:scale-110 transition-transform">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        Email Address
                      </p>
                      <p className="font-semibold truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="group p-5 rounded-xl bg-muted/50 hover:bg-muted/80 transition-all hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-green-500/10 p-3 group-hover:scale-110 transition-transform">
                      <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        Member Since
                      </p>
                      <p className="font-semibold">
                        {new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="border-0 shadow-lg bg-linear-to-br from-background via-background to-muted/30">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="rounded-xl bg-purple-500/10 p-2.5">
                  <SettingsIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-auto py-6 px-5 justify-start group hover:border-primary/50 hover:bg-primary/5 transition-all"
                  disabled
                >
                  <div className="flex items-start gap-4 text-left">
                    <div className="rounded-lg bg-red-500/10 p-2.5 group-hover:scale-110 transition-transform">
                      <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Change Password</div>
                      <div className="text-xs text-muted-foreground">
                        Update your password
                      </div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-6 px-5 justify-start group hover:border-primary/50 hover:bg-primary/5 transition-all"
                  disabled
                >
                  <div className="flex items-start gap-4 text-left">
                    <div className="rounded-lg bg-amber-500/10 p-2.5 group-hover:scale-110 transition-transform">
                      <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Notifications</div>
                      <div className="text-xs text-muted-foreground">
                        Manage your alerts
                      </div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-6 px-5 justify-start group hover:border-primary/50 hover:bg-primary/5 transition-all"
                  disabled
                >
                  <div className="flex items-start gap-4 text-left">
                    <div className="rounded-lg bg-blue-500/10 p-2.5 group-hover:scale-110 transition-transform">
                      <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Privacy</div>
                      <div className="text-xs text-muted-foreground">
                        Control your data
                      </div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-6 px-5 justify-start group hover:border-primary/50 hover:bg-primary/5 transition-all"
                  disabled
                >
                  <div className="flex items-start gap-4 text-left">
                    <div className="rounded-lg bg-purple-500/10 p-2.5 group-hover:scale-110 transition-transform">
                      <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Appearance</div>
                      <div className="text-xs text-muted-foreground">
                        Customize theme
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
