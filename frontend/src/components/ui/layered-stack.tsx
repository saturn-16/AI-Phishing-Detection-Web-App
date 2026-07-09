"use client";

import { ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export type LayeredStackProps = ComponentProps<"div">;

export const LayeredStack = ({ children, className, ...props }: LayeredStackProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [expanded, setExpanded] = useState(false);
    const isStacked = useRef(true);

    const stackCards = useCallback((animate = true) => {
        const container = containerRef.current;
        if (!container) return;

        isStacked.current = true;
        const cards = Array.from(container.children) as HTMLElement[];

        // First clear all transforms so offsetLeft/offsetTop reflect true grid positions
        cards.forEach((card) => {
            gsap.killTweensOf(card);
        });

        if (!animate) {
            // Instant reposition: clear transforms, recalculate, set immediately
            cards.forEach((card) => gsap.set(card, { x: 0, y: 0, rotate: 0 }));
            // Wait a frame so the browser recalculates layout
            requestAnimationFrame(() => {
                const container = containerRef.current;
                if (!container || !isStacked.current) return;
                const cards = Array.from(container.children) as HTMLElement[];
                cards.forEach((card, i) => {
                    const offsetX = container.clientWidth / 2 - card.offsetWidth / 2 - card.offsetLeft;
                    const offsetY = container.clientHeight / 2 - card.offsetHeight / 2 - card.offsetTop;
                    gsap.set(card, {
                        x: offsetX,
                        y: offsetY,
                        rotate: gsap.utils.random(-8, 8),
                        zIndex: 100 - i,
                    });
                });
            });
            return;
        }

        // Animated: first clear, then after layout recalc, animate to center
        cards.forEach((card) => gsap.set(card, { x: 0, y: 0, rotate: 0 }));
        requestAnimationFrame(() => {
            const container = containerRef.current;
            if (!container || !isStacked.current) return;
            const cards = Array.from(container.children) as HTMLElement[];
            cards.forEach((card, i) => {
                const offsetX = container.clientWidth / 2 - card.offsetWidth / 2 - card.offsetLeft;
                const offsetY = container.clientHeight / 2 - card.offsetHeight / 2 - card.offsetTop;
                gsap.to(card, {
                    x: offsetX,
                    y: offsetY,
                    rotate: gsap.utils.random(-8, 8),
                    zIndex: 100 - i,
                    duration: 0.6,
                    ease: "power2.out",
                    overwrite: true,
                });
            });
        });
    }, []);

    const resetCards = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        isStacked.current = false;
        const cards = Array.from(container.children) as HTMLElement[];

        gsap.to(cards, {
            x: 0,
            y: 0,
            zIndex: (i: number) => 100 - i,
            duration: 0.6,
            rotate: 0,
            ease: "power2.out",
            stagger: {
                amount: 0.1,
                from: "start",
            },
            overwrite: true,
        });
    }, []);

    const handleToggle = () => {
        if (expanded) {
            stackCards(true);
            setExpanded(false);
        } else {
            resetCards();
            setExpanded(true);
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Initial setup
        stackCards(false);

        // Re-run current state on resize
        const ro = new ResizeObserver(() => {
            if (isStacked.current) {
                stackCards(false);
            }
        });
        ro.observe(container);

        return () => ro.disconnect();
    }, [stackCards]);

    return (
        <div
            ref={containerRef}
            onClick={handleToggle}
            className={cn("relative cursor-pointer transition-all duration-300", className)}
            {...props}
        >
            {children}
        </div>
    );
};
