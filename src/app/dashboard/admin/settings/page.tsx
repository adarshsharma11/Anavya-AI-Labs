"use client";

import { useEffect, useState } from "react";

import { isApiError } from "@/lib/api/client";
import { fetchSiteSettings } from "@/lib/api/settings";
import { updateSiteSettingsApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
  const [rate, setRate] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    void fetchSiteSettings().then((settings) => {
      setRate(settings.usd_to_inr_rate ?? settings.usdToInrRate ?? "");
    });
  }, []);

  return (
    <Card className="max-w-xl space-y-4 p-6">
      <div>
        <h3 className="text-2xl font-bold">Site settings</h3>
        <p className="text-sm text-muted-foreground">
          USD → INR rate drives the INR unlock price.
        </p>
      </div>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          try {
            await updateSiteSettingsApi({ usd_to_inr_rate: rate });
            toast({ title: "Settings saved" });
          } catch (err) {
            toast({
              variant: "destructive",
              title: "Save failed",
              description: isApiError(err) ? err.message : "Unable to save settings.",
            });
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="usd-inr">USD → INR rate</Label>
          <Input
            id="usd-inr"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            placeholder="80.84"
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </form>
    </Card>
  );
}
