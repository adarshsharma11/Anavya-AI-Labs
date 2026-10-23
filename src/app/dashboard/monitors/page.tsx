"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { isApiError } from "@/lib/api/client";
import {
  createMonitorApi,
  deleteMonitorApi,
  getMonitorHistoryApi,
  getMonitorsApi,
} from "@/lib/api/dashboard";
import { UpgradeProCard } from "@/components/report/upgrade-pro-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Monitor, MonitorHistory } from "@/types/api";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function MonitorsPage() {
  const [monitors, setMonitors] = useState<readonly Monitor[]>([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [needsPro, setNeedsPro] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<MonitorHistory | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      setMonitors(await getMonitorsApi());
      setNeedsPro(false);
      setError(null);
    } catch (err) {
      if (isApiError(err) && err.status === 402) {
        setNeedsPro(true);
      } else {
        setError(isApiError(err) ? err.message : "Unable to load monitors.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addMonitor = async () => {
    setBusy(true);
    try {
      await createMonitorApi(url);
      setUrl("");
      await load();
    } catch (err) {
      if (isApiError(err) && err.status === 402) {
        setNeedsPro(true);
      } else {
        toast({
          variant: "destructive",
          title: "Could not add monitor",
          description: isApiError(err) ? err.message : "Duplicate or limit reached.",
        });
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (needsPro) {
    return (
      <UpgradeProCard
        title="Weekly monitoring is a Pro feature"
        description="Checked weekly; we email you if the score drops 5+ points."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Monitoring</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Checked weekly; we email you if the score drops 5+ points.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void addMonitor();
        }}
      >
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="example.com"
        />
        <Button type="submit" disabled={busy || !url.trim()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </Button>
      </form>

      {monitors.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No monitors yet. Add a URL to watch weekly.
        </Card>
      ) : (
        <div className="space-y-3">
          {monitors.map((monitor) => (
            <Card key={monitor.id} className="flex items-center justify-between p-4">
              <button
                type="button"
                className="text-left text-sm font-medium"
                onClick={async () => setHistory(await getMonitorHistoryApi(monitor.id))}
              >
                {monitor.url}
              </button>
              <Button
                size="icon"
                variant="ghost"
                onClick={async () => {
                  await deleteMonitorApi(monitor.id);
                  await load();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {history ? (
        <Card className="space-y-3 p-5">
          <h4 className="font-semibold">History for {history.monitor.url}</h4>
          {history.history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No weekly checks yet.</p>
          ) : (
            <>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={history.history.map((point) => ({
                      ...point,
                      date: new Date(point.createdAt).toLocaleDateString(),
                    }))}
                  >
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="overall" name="Overall" stroke="#10b981" dot />
                    <Line type="monotone" dataKey="geoScore" name="GEO" stroke="#0ea5e9" dot />
                    <Line type="monotone" dataKey="aeoScore" name="AEO" stroke="#8b5cf6" dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2 text-sm">
                {history.history.map((point) => (
                  <li key={point.publicId} className="flex justify-between gap-3">
                    <Link className="underline" href={`/scanner?id=${point.publicId}`}>
                      {new Date(point.createdAt).toLocaleDateString()}
                    </Link>
                    <span>
                      Overall {point.overall ?? "—"} · GEO {point.geoScore ?? "—"} · AEO{" "}
                      {point.aeoScore ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      ) : null}
    </div>
  );
}
