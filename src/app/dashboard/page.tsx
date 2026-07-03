"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAnalyticsApi } from "@/lib/api/dashboard";
import { getAdminAnalyticsApi } from "@/lib/api/admin";
import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, MousePointerClick, FileText, CheckCircle, Users, Shield, Accessibility } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardAnalytics {
  totalUsers?: number;
  totalScans: number;
  avgPerformanceScore: number;
  avgSeoScore: number;
  avgAccessibilityScore?: number;
  avgSecurityScore?: number;
  totalIssuesFound: number;
}

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") {
      getAdminAnalyticsApi()
        .then((res) => setAnalytics(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      getAnalyticsApi()
        .then((res) => setAnalytics(res.analytics))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-foreground">
          {isAdmin ? "Platform Administration Overview" : "Overview Analytics"}
        </h3>
        <p className="text-muted-foreground mt-1">
          {isAdmin 
            ? "Monitor platform usage, total user signups, website scans, and system performance averages." 
            : "Monitor your overall scanning activity and performance."}
        </p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {isAdmin ? (
          <>
            <motion.div variants={itemVariants}>
              <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Total Users</CardTitle>
                  <div className="rounded-full bg-violet-500/10 p-2 text-violet-600">
                    <Users className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-foreground">{analytics?.totalUsers || 0}</div>}
                  <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Platform Scans</CardTitle>
                  <div className="rounded-full bg-sky-500/10 p-2 text-sky-600">
                    <Activity className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-foreground">{analytics?.totalScans || 0}</div>}
                  <p className="text-xs text-muted-foreground mt-1">Total scans completed</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Avg SEO Score</CardTitle>
                  <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-foreground">{analytics?.avgSeoScore || 0}%</div>}
                  <p className="text-xs text-muted-foreground mt-1">Platform average score</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Avg Performance</CardTitle>
                  <div className="rounded-full bg-amber-500/10 p-2 text-amber-600">
                    <FileText className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-foreground">{analytics?.avgPerformanceScore || 0}%</div>}
                  <p className="text-xs text-muted-foreground mt-1">Platform average speed</p>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div variants={itemVariants}>
              <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Total Scans</CardTitle>
                  <div className="rounded-full bg-sky-500/10 p-2 text-sky-600">
                    <Activity className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-foreground">{analytics?.totalScans || 0}</div>}
                  <p className="text-xs text-muted-foreground mt-1">Total websites scanned</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Avg SEO Score</CardTitle>
                  <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-foreground">{Math.round(analytics?.avgSeoScore || 0)}%</div>}
                  <p className="text-xs text-muted-foreground mt-1">Across all history</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Avg Performance</CardTitle>
                  <div className="rounded-full bg-amber-500/10 p-2 text-amber-600">
                    <FileText className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-foreground">{Math.round(analytics?.avgPerformanceScore || 0)}%</div>}
                  <p className="text-xs text-muted-foreground mt-1">Speed & Load averages</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Total Issues</CardTitle>
                  <div className="rounded-full bg-rose-500/10 p-2 text-rose-600">
                    <MousePointerClick className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-foreground">{analytics?.totalIssuesFound || 0}</div>}
                  <p className="text-xs text-muted-foreground mt-1">Identified across all scans</p>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>

      {isAdmin && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-3 mt-6"
        >
          <motion.div variants={itemVariants}>
            <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Avg Accessibility</CardTitle>
                <div className="rounded-full bg-teal-500/10 p-2 text-teal-600">
                  <Accessibility className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-foreground">{analytics?.avgAccessibilityScore || 0}%</div>}
                <p className="text-xs text-muted-foreground mt-1">Accessibility score average</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Avg Security</CardTitle>
                <div className="rounded-full bg-indigo-500/10 p-2 text-indigo-600">
                  <Shield className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-foreground">{analytics?.avgSecurityScore || 0}%</div>}
                <p className="text-xs text-muted-foreground mt-1">Security score average</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Global Total Issues</CardTitle>
                <div className="rounded-full bg-rose-500/10 p-2 text-rose-600">
                  <MousePointerClick className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-foreground">{analytics?.totalIssuesFound || 0}</div>}
                <p className="text-xs text-muted-foreground mt-1">Aggregated issue fixes detected</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
