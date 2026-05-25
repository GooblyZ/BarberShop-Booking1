'use client';

import dynamic from 'next/dynamic';

const SplineComponent = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#95122c] border-t-transparent animate-spin" />
        <p className="text-white/30 text-xs tracking-widest uppercase">Loading scene</p>
      </div>
    </div>
  ),
});

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export function SplineScene({ scene, className = '' }: SplineSceneProps) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      <SplineComponent scene={scene} />
    </div>
  );
}
