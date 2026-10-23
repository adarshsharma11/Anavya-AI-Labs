"use client";

import { motion, useReducedMotion } from "framer-motion";

function Fighter({
  side,
  reduceMotion,
}: {
  side: "left" | "right";
  reduceMotion: boolean;
}) {
  const isLeft = side === "left";
  const color = isLeft ? "hsl(var(--primary))" : "hsl(var(--accent))";
  const enterX = isLeft ? -72 : 72;
  const swing = isLeft ? [18, -42, 28, -36, 8] : [-18, 42, -28, 36, -8];

  return (
    <motion.div
      className="relative h-40 w-28 [transform-style:preserve-3d]"
      initial={reduceMotion ? false : { x: enterX, opacity: 0, rotateY: isLeft ? 28 : -28 }}
      animate={{ x: 0, opacity: 1, rotateY: isLeft ? 16 : -16 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <svg viewBox="0 0 112 160" className="h-full w-full" aria-hidden>
        <g fill={color} fillOpacity="0.92">
          <circle cx="56" cy="22" r="12" />
          <rect x="42" y="34" width="28" height="44" rx="10" />
          <rect x="44" y="76" width="9" height="38" rx="4" />
          <rect x="59" y="76" width="9" height="38" rx="4" />
        </g>
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: isLeft ? "24px 48px" : "88px 48px" }}
          animate={reduceMotion ? undefined : { rotate: swing }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 1.35, times: [0, 0.28, 0.5, 0.74, 1], ease: "easeInOut" }
          }
        >
          <rect
            x={isLeft ? 16 : 80}
            y="44"
            width="8"
            height="22"
            rx="4"
            fill={color}
          />
          <rect
            x={isLeft ? 6 : 54}
            y="22"
            width={isLeft ? 52 : 52}
            height="5"
            rx="2"
            fill="currentColor"
            className="text-foreground"
            transform={isLeft ? "rotate(-38 32 24)" : "rotate(38 80 24)"}
          />
          <rect
            x={isLeft ? 2 : 94}
            y="16"
            width="8"
            height="10"
            rx="1"
            fill="currentColor"
            className="text-foreground"
          />
        </motion.g>
      </svg>
    </motion.div>
  );
}

export function CompetitorDuel() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="mx-auto mb-8 flex h-48 max-w-md items-end justify-center [perspective:900px]"
      aria-hidden
    >
      <div className="relative flex w-full items-end justify-center gap-2">
        <div className="flex flex-col items-center gap-2">
          <Fighter side="left" reduceMotion={Boolean(reduceMotion)} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Your site
          </span>
        </div>

        <div className="relative mb-16 flex h-16 w-20 items-center justify-center">
          <motion.span
            className="absolute h-16 w-16 rounded-full bg-primary/20"
            initial={reduceMotion ? { opacity: 0.25, scale: 0.7 } : { opacity: 0, scale: 0.2 }}
            animate={{ opacity: [0, 0.7, 0], scale: [0.2, 1.15, 1.4] }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.42, delay: 0.55, repeat: 2, repeatDelay: 0.22 }
            }
          />
          <motion.span
            className="h-px w-14 bg-foreground/70"
            initial={false}
            animate={reduceMotion ? { opacity: 0.4 } : { opacity: [0, 1, 0], rotate: [0, 18, -12] }}
            transition={reduceMotion ? undefined : { duration: 0.35, delay: 0.58, repeat: 2, repeatDelay: 0.28 }}
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <Fighter side="right" reduceMotion={Boolean(reduceMotion)} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Competitor
          </span>
        </div>
      </div>
    </div>
  );
}
