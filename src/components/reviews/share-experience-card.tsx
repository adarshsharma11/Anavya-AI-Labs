"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Star, X } from "lucide-react";

import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewThankYou } from "@/components/reviews/review-thank-you";
import { StarRating } from "@/components/reviews/star-rating";
import { Button } from "@/components/ui/button";

export function ShareExperienceCard() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [formKey, setFormKey] = useState(0);
  const [thanks, setThanks] = useState<string | null>(null);

  const openForm = (nextRating = rating) => {
    setThanks(null);
    setRating(nextRating);
    setFormKey((key) => key + 1);
    setOpen(true);
  };

  const resetToPrompt = () => {
    setThanks(null);
    setOpen(false);
    setRating(0);
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border border-border/60 bg-card/80 p-6 shadow-lg backdrop-blur sm:p-8">
      <AnimatePresence mode="wait">
      {thanks ? (
        <motion.div
          key="thanks"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <ReviewThankYou message={thanks} onWriteAnother={resetToPrompt} />
        </motion.div>
      ) : open ? (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Share Your Experience</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Reviewing Website AEO GEO Checker
              </p>
            </div>
            <button
              type="button"
              onClick={resetToPrompt}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close review form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ReviewForm
            key={formKey}
            initialRating={rating}
            onSuccess={(message) => {
              setRating(0);
              setThanks(message);
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="prompt"
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            Share Your Feedback · Takes &lt; 1 min
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
            Have you used Website AEO GEO Checker?
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Your review helps website owners and SEO creators optimize their sites for
            ChatGPT, Gemini, and AI search engines.
          </p>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Tap a star to rate your experience
          </p>
          <div className="mt-3">
            <StarRating value={rating} onChange={openForm} size="lg" />
          </div>
          <Button
            type="button"
            onClick={() => openForm()}
            className="mt-6 rounded-full bg-primary/20 px-6 text-foreground hover:bg-primary/30"
          >
            <Star className="mr-2 h-4 w-4 fill-current" />
            Write a Review
          </Button>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
