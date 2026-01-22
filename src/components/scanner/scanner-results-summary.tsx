'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ScanResult } from '@/lib/mock-api';

interface ScannerResultsSummaryProps {
  results: ScanResult[];
}

export default function ScannerResultsSummary({
  results,
}: ScannerResultsSummaryProps) {
  const summary = results.reduce(
    (acc, result) => {
      acc.bySeverity[result.severity] =
        (acc.bySeverity[result.severity] || 0) + 1;
      acc.byType[result.type] = (acc.byType[result.type] || 0) + 1;
      return acc;
    },
    {
      bySeverity: {} as Record<string, number>,
      byType: {} as Record<string, number>,
    }
  );

  const severityData = [
    { severity: 'Low', count: summary.bySeverity['Low'] || 0 },
    { severity: 'Medium', count: summary.bySeverity['Medium'] || 0 },
    { severity: 'High', count: summary.bySeverity['High'] || 0 },
  ];

  const typeData = [
    { type: 'Performance', count: summary.byType['Performance'] || 0 },
    { type: 'SEO', count: summary.byType['SEO'] || 0 },
    { type: 'Accessibility', count: summary.byType['Accessibility'] || 0 },
  ];

  const chartConfig = {
    count: {
      label: 'Issues',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Issues by Severity</CardTitle>
          <CardDescription>
            Distribution of issues based on their potential impact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <BarChart data={severityData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="severity"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                allowDecimals={false}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={false}
                defaultIndex={1}
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={4}
                barSize={40}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Issues by Category</CardTitle>
          <CardDescription>
            Breakdown of issues across different areas of your site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <BarChart data={typeData} accessibilityLayer layout="vertical">
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="type"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <XAxis type="number" hide />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={false}
                defaultIndex={1}
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={4}
                barSize={20}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
