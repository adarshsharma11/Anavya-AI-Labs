"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PartyPopper, Sparkles } from "lucide-react";

const BURST = [
  { x: -92, y: -28, delay: 0.04, rotate: -18, icon: "star" },
  { x: 88, y: -36, delay: 0.08, rotate: 16, icon: "spark" },
  { x: -58, y: -72, delay: 0.12, rotate: -8, icon: "spark" },
  { x: 52, y: -78, delay: 0.1, rotate: 12, icon: "star" },
  { x: -110, y: 18, delay: 0.16, rotate: -24, icon: "spark" },
  { x: 108, y: 12, delay: 0.14, rotate: 22, icon: "star" },
  { x: -36, y: 56, delay: 0.2, rotate: 8, icon: "star" },
  { x: 42, y: 52, delay: 0.18, rotate: -10, icon: "spark" },
] as const;

type ReviewThankYouProps = {
  readonly message: string;
  readonly onWriteAnother?: () => void;
};

export function ReviewThankYou({ message, onWriteAnother }: ReviewThankYouProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      role="status"
      aria-live="polite"
      className="relative overflow-hidden px-2 py-8 text-center sm:py-10"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-10 h-36 w-36 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
      />

      {BURST.map((piece, index) => (
        <motion.span
          key={index}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-16 text-primary"
          initial={reduceMotion ? { opacity: 0.35, x: piece.x, y: piece.y } : { opacity: 0, x: 0, y: 0, scale: 0.3 }}
          animate={{ opacity: 0.9, x: piece.x, y: piece.y, scale: 1, rotate: piece.rotate }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 220, damping: 16, delay: piece.delay }
          }
        >
          {piece.icon === "star" ? (
            <Sparkles className="h-3.5 w-3.5 fill-primary/40" />
          ) : (
            <span className="block h-1.5 w-1.5 rounded-full bg-primary/70" />
          )}
        </motion.span>
      ))}

      <motion.div
        className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary shadow-[0_0_40px_hsl(var(--primary)/0.25)]"
        initial={reduceMotion ? false : { scale: 0.4, rotate: -18, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.08 }}
      >
        <PartyPopper className="h-7 w-7" />
      </motion.div>

      <motion.p
        className="relative mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.35 }}
      >
        Congratulations
      </motion.p>

      <motion.h2
        className="relative mt-2 font-headline text-3xl font-semibold tracking-tight sm:text-4xl"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.4 }}
      >
        Thank you
      </motion.h2>

      <motion.p
        className="relative mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, duration: 0.4 }}
      >
        {message}
      </motion.p>

      {onWriteAnother ? (
        <motion.button
          type="button"
          onClick={onWriteAnother}
          className="relative mt-6 text-sm font-medium text-primary underline-offset-4 hover:underline"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          Write another
        </motion.button>
      ) : null}
    </motion.div>
  );
}
