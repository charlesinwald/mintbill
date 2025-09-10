"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";
import { Magnet } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface MagnetizeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  particleCount?: number;
  attractRadius?: number;
  text?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
}

function MagnetizeButton({
  className,
  particleCount = 12,
  attractRadius = 50,
  text = "Hover me",
  ...props
}: MagnetizeButtonProps) {
  const [isAttracting, setIsAttracting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particlesControl = useAnimation();

  useEffect(() => {
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 360 - 180,
      y: Math.random() * 360 - 180,
    }));
    setParticles(newParticles);
  }, [particleCount]);

  // Start a gentle, looping drift for each particle while idle
  const startIdleDrift = useCallback(() => {
    if (!particles.length) return;
    particlesControl.start((i) => {
      const base = particles[i];
      const dx1 = (Math.random() - 0.5) * 80;
      const dy1 = (Math.random() - 0.5) * 80;
      const dx2 = (Math.random() - 0.5) * 80;
      const dy2 = (Math.random() - 0.5) * 80;
      const duration = 8 + Math.random() * 6; // 8-14s (slightly faster)
      return {
        x: [base.x, base.x + dx1, base.x + dx2, base.x],
        y: [base.y, base.y + dy1, base.y + dy2, base.y],
        transition: {
          duration,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
        },
      };
    });
  }, [particles, particlesControl]);

  // Start drifting once particles are initialized. Ensure elements are mounted and bound to controls
  useEffect(() => {
    if (!particles.length) return;
    // Set base positions first so the first drift starts from the correct place
    particlesControl.set((i) => ({ x: particles[i].x, y: particles[i].y }));
    // Kick off on next frame to ensure subscribers are ready
    const raf = requestAnimationFrame(() => {
      if (!isAttracting) startIdleDrift();
    });
    return () => cancelAnimationFrame(raf);
  }, [particles, particlesControl]);

  const handleInteractionStart = useCallback(async () => {
    setIsAttracting(true);
    await particlesControl.start({
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 10,
      },
    });
  }, [particlesControl]);

  const handleInteractionEnd = useCallback(async () => {
    setIsAttracting(false);
    await particlesControl.start((i) => ({
      x: particles[i].x,
      y: particles[i].y,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    }));
    // Resume idle drifting after returning to base positions
    startIdleDrift();
  }, [particlesControl, particles, startIdleDrift]);

  return (
    <Button
      className={cn(
        "min-w-40 relative touch-none",
        "bg-emerald-100 dark:bg-emerald-900",
        "hover:bg-emerald-200 dark:hover:bg-emerald-800",
        "text-emerald-600 dark:text-emerald-300",
        "border border-emerald-300 dark:border-emerald-700",
        "transition-all duration-300",
        className
      )}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      {...props}
    >
      {particles.map((_, index) => (
        <motion.div
          key={index}
          custom={index}
          initial={{ x: particles[index].x, y: particles[index].y }}
          animate={particlesControl}
          className={cn(
            "absolute w-1.5 h-1.5 rounded-full",
            "bg-emerald-400 dark:bg-emerald-300",
            "transition-opacity duration-300",
            isAttracting ? "opacity-100" : "opacity-40"
          )}
        />
      ))}
      <span className="relative w-full flex items-center justify-center gap-2">
        <Magnet
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            isAttracting && "scale-110"
          )}
        />
        {text}
      </span>
    </Button>
  );
}

export { MagnetizeButton };
