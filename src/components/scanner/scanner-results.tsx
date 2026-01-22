'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScanResult } from '@/lib/mock-api';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import ScannerResultsSummary from './scanner-results-summary';
import { Separator } from '../ui/separator';

interface ScannerResultsProps {
  results: ScanResult[];
}

export default function ScannerResults({ results }: ScannerResultsProps) {
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

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
      <div className="space-y-8">
        <ScannerResultsSummary results={results} />
        <Separator />
        <div>
          <h2 className="mb-4 text-2xl font-bold">Detailed Report</h2>
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {results.map((result) => (
              <motion.div key={result.id} variants={itemVariants}>
                <Card
                  className={cn(
                    'relative overflow-hidden',
                    result.isPremium && 'border-dashed border-primary/50'
                  )}
                  onClick={result.isPremium ? handlePremiumClick : undefined}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{result.title}</CardTitle>
                      <Badge variant={getSeverityBadge(result.severity)}>
                        {result.severity}
                      </Badge>
                    </div>
                    <CardDescription>{result.type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {result.description}
                    </p>
                  </CardContent>

                  {result.isPremium && (
                    <div className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-background/80 p-4 text-center backdrop-blur-sm">
                      <Lock className="h-8 w-8 text-primary" />
                      <h3 className="mt-2 text-lg font-semibold">
                        Unlock with Pro
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        This is a premium check. Upgrade to see the results.
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
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
