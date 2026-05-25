'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ContainerScrollProps {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
}

export function ContainerScroll({ titleComponent, children }: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const rotate = useTransform(scrollYProgress, [0, 0.45], [28, 0]);
  const scale  = useTransform(scrollYProgress, [0, 0.45], [0.82, 1.02]);
  const translateY = useTransform(scrollYProgress, [0, 0.45], [120, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center py-24"
      style={{ minHeight: '120vh' }}
    >
      <div className="w-full max-w-5xl mx-auto px-4 relative">
        {/* Title fades in */}
        <motion.div style={{ opacity }} className="mb-16 text-center">
          {titleComponent}
        </motion.div>

        {/* 3D perspective wrapper */}
        <div className="perspective-1200">
          <motion.div
            style={{
              rotateX: rotate,
              scale,
              y: translateY,
              transformOrigin: 'center top',
            }}
          >
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_40px_120px_rgba(149,18,44,0.25)]">
              {children}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
