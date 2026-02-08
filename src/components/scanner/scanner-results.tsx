'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ScanResult, ScanSummary } from '@/lib/scan-types';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ScannerResultsSummary from './scanner-results-summary';

interface ScannerResultsProps {
  results: ScanResult[];
  summary?: ScanSummary;
}

export default function ScannerResults({ results, summary }: ScannerResultsProps) {
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const topFixes = useMemo(
    () => results.filter((item) => !item.isPremium).slice(0, 4),
    [results]
  );

  const restFixes = useMemo(() => results.slice(0, 12), [results]);

  const getSeverityBadge = (severity: 'Low' | 'Medium' | 'High') => {
    switch (severity) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handlePremiumClick = () => {
    setUpgradeModalOpen(true);
  };

  return (
    <>
      <div className="space-y-10">
        <ScannerResultsSummary results={results} summary={summary} />

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Top fixes to ship</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Start here for the fastest conversion and performance wins.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {topFixes.map((result) => (
                <motion.div
                  key={result.id}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <Card className="border-border/60 bg-background/80 p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold">
                        {result.title}
                      </div>
                      <Badge variant={getSeverityBadge(result.severity)}>
                        {result.severity}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {result.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="border-border/60 bg-background/80 p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Next best actions</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Share this scan with your team and fix the top three blockers
                first. Most sites see measurable gains after a single sprint.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild size="sm">
                  <Link href="/services">Book a strategy call</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/pricing">See Pro plans</Link>
                </Button>
              </div>
            </Card>
            <Card className="border-border/60 bg-background/80 p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Scan details</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium tabular-nums">
                    {summary?.metrics.status ?? '—'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Final URL</dt>
                  <dd className="max-w-[12rem] truncate font-medium">
                    {summary?.metrics.finalUrl ?? '—'}
                  </dd>
                </div>
              </dl>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">All detected issues</h3>
              <p className="text-sm text-muted-foreground">
                A complete list of issues found in this scan.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Export report
            </Button>
          </div>
          <div className="grid gap-3">
            {restFixes.map((result) => (
              <motion.div
                key={result.id}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <Card
                  className={cn(
                    'border-border/60 bg-background/80 p-5 shadow-sm',
                    result.isPremium && 'border-dashed border-primary/60'
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">
                        {result.title}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {result.type}
                      </p>
                    </div>
                    <Badge variant={getSeverityBadge(result.severity)}>
                      {result.severity}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {result.description}
                  </p>
                  {result.isPremium && (
                    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
                      <Lock className="h-4 w-4 text-primary" />
                      <div className="flex-1 text-sm text-muted-foreground">
                        Premium insight. Upgrade to reveal full fix guidance.
                      </div>
                      <Button size="sm" onClick={handlePremiumClick}>
                        Unlock Pro
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <Dialog open={isUpgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to Pro</DialogTitle>
            <DialogDescription>
              Unlock advanced checks, detailed reports, and continuous
              monitoring by upgrading to a Pro plan.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setUpgradeModalOpen(false)}
            >
              Maybe Later
            </Button>
            <Button asChild onClick={() => setUpgradeModalOpen(false)}>
              <Link href="/pricing">Upgrade Now</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
