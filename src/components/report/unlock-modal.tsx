"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UnlockEmailModal({
  open,
  defaultEmail,
  priceLabel,
  submitting,
  emailError,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  defaultEmail: string;
  priceLabel: string;
  submitting?: boolean;
  emailError?: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (email: string) => void;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEmail(defaultEmail);
  }, [defaultEmail, open]);

  useEffect(() => {
    if (emailError) {
      inputRef.current?.focus();
    }
  }, [emailError]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unlock the AI report</DialogTitle>
          <DialogDescription>
            We will email the report to this address and keep it on your shareable link.
            {priceLabel ? ` ${priceLabel}.` : ""}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(email.trim());
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="unlock-email">Email</Label>
            <Input
              ref={inputRef}
              id="unlock-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "unlock-email-error" : undefined}
            />
            {emailError ? (
              <p id="unlock-email-error" className="text-sm text-destructive">
                {emailError}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} aria-busy={submitting}>
              {submitting ? "Opening checkout…" : "Continue to payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
