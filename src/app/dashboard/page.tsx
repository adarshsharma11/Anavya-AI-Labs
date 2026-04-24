"use client";

import React, { useEffect, useState } from "react";
import { getAnalyticsApi } from "@/lib/api/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, MousePointerClick, FileText, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardOverviewPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsApi()
      .then((res) => setAnalytics(res.analytics))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 lg:py-8">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Overview Analytics</h3>
        <p className="text-muted-foreground">Monitor your overall scanning activity and performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{analytics?.totalScans || 0}</div>}
            <p className="text-xs text-muted-foreground">Total websites scanned</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg SEO Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{Math.round(analytics?.avgSeoScore || 0)}%</div>}
            <p className="text-xs text-muted-foreground">Across all history</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{Math.round(analytics?.avgPerformanceScore || 0)}%</div>}
            <p className="text-xs text-muted-foreground">Speed & Load averages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{analytics?.totalIssuesFound || 0}</div>}
            <p className="text-xs text-muted-foreground">Identified across all scans</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
