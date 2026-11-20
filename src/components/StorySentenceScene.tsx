import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { STORY_VISUALS } from '../data/storyVisuals';

interface StorySentenceSceneProps {
  storyId: string;
  sentenceIndex: number;
}

export const StorySentenceScene: React.FC<StorySentenceSceneProps> = ({
  storyId,
  sentenceIndex,
}) => {
  const frames = STORY_VISUALS[storyId] || STORY_VISUALS['video-1'];
  const safeIdx = Math.max(0, Math.min(sentenceIndex, frames.length - 1));
  const frame = frames[safeIdx];
  const sceneKey = `${storyId}-${safeIdx}`;

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
            initial={{ scale: frame.scale + 0.05 }}
            animate={{ scale: frame.scale }}
            transition={{ duration: 8, ease: 'easeOut' }}
            style={{
              objectPosition: frame.origin,
              transformOrigin: frame.origin,
              filter: `brightness(${frame.brightness ?? 0.88}) saturate(1.06)`,
            }}
            className="w-full h-full object-cover will-change-transform"
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
