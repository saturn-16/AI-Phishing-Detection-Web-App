"use client";

import { motion } from "framer-motion";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  charSpeed?: number;
}

export function SplitText({ text, className, delay = 0, charSpeed = 0.015 }: SplitTextProps) {
  const words = text.split(" ");
  
  // Keep track of the absolute character index to stagger animations correctly
  let absoluteCharIndex = 0;

  return (
    <span className={className} aria-label={text}>
      {words.map((word, wordIdx) => {
        const chars = word.split("");
        return (
          <span key={wordIdx} className="inline-block whitespace-nowrap">
            {chars.map((char, charIdx) => {
              const currentDelay = delay + absoluteCharIndex * charSpeed;
              absoluteCharIndex++;
              return (
                <motion.span
                  key={charIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: currentDelay, duration: 0.3, ease: "easeOut" }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              );
            })}
            {/* Add space after the word, except for the last word */}
            {wordIdx < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        );
      })}
    </span>
  );
}
