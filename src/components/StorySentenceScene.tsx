import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { STORY_VISUALS } from '../data/storyVisuals';

interface StorySentenceSceneProps {
  storyId: string;
  sentenceIndex: number;
}

interface MotionPattern {
  scaleDelta: number[];
  x: string[];
  y: string[];
  duration: number;
}

const MOTION_PATTERNS: MotionPattern[] = [
  { scaleDelta: [0.0, 0.06, 0.02, 0.0], x: ['0%', '1.1%', '-0.7%', '0%'], y: ['0%', '-0.8%', '0.5%', '0%'], duration: 15 },
  { scaleDelta: [0.05, 0.0, 0.04, 0.05], x: ['-0.8%', '0.9%', '-0.5%', '-0.8%'], y: ['0.6%', '-0.7%', '0.4%', '0.6%'], duration: 16 },
  { scaleDelta: [0.01, 0.065, 0.02, 0.01], x: ['0.8%', '-1.0%', '0.4%', '0.8%'], y: ['-0.5%', '0.8%', '-0.4%', '-0.5%'], duration: 17 },
  { scaleDelta: [0.045, 0.01, 0.055, 0.045], x: ['0%', '-0.9%', '1.0%', '0%'], y: ['0.7%', '-0.6%', '0.3%', '0.7%'], duration: 14 },
];

export const StorySentenceScene: React.FC<StorySentenceSceneProps> = ({
  storyId,
  sentenceIndex,
}) => {
  const frames = STORY_VISUALS[storyId] || STORY_VISUALS['video-1'];
  const safeIdx = Math.max(0, Math.min(sentenceIndex, frames.length - 1));
  const frame = frames[safeIdx];
  const sceneKey = `${storyId}-${safeIdx}`;
  const baseScale = Math.max(frame.scale, 1.11);
  const pattern = MOTION_PATTERNS[safeIdx % MOTION_PATTERNS.length];

  // Preload upcoming 2 paintings so sentence transitions appear instantly
  useEffect(() => {
    const upcoming = [frames[safeIdx + 1]?.src, frames[safeIdx + 2]?.src].filter(Boolean);
    upcoming.forEach((src) => {
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [frames, safeIdx]);

  return (
    <div
      className="absolute inset-0 overflow-hidden select-none pointer-events-none bg-[#120d09]"
      aria-hidden="true"
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={sceneKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <motion.img
            src={frame.src}
            alt=""
            referrerPolicy="no-referrer"
            initial={{
              scale: baseScale + pattern.scaleDelta[0],
              x: pattern.x[0],
              y: pattern.y[0],
            }}
            animate={{
              scale: pattern.scaleDelta.map((d) => baseScale + d),
              x: pattern.x,
              y: pattern.y,
            }}
            transition={{
              duration: pattern.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              objectPosition: frame.origin,
              transformOrigin: frame.origin,
              filter: `brightness(${frame.brightness ?? 0.88}) saturate(1.06)`,
            }}
            className="w-full h-full object-cover will-change-transform"
          />
          <motion.div
            animate={{ opacity: [0.04, 0.14, 0.04] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 72% 24%, rgba(253,224,140,0.35) 0%, rgba(253,224,140,0) 60%)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 85% 80% at 50% 50%, rgba(14,10,7,0.12) 0%, rgba(14,10,7,0.52) 100%)',
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
