"use client";

import { useEffect, useRef, useState } from "react";

interface ScrambleTextProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

export function ScrambleText({ text, className, speed = 30, delay = 0 }: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const chars = text.split("");
    let settled = 0;

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplay(
          chars
            .map((ch, i) => {
              if (ch === " ") return " ";
              if (i < settled) return ch;
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );
        settled++;
        if (settled > chars.length) clearInterval(interval);
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return <span className={className}>{display}</span>;
}
