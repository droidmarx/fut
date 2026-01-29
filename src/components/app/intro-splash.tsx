'use client';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { playWhistleSound } from '@/hooks/use-toast';

export function IntroSplash() {
  const [isHiding, setIsHiding] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // This function attempts to play the intro sound.
    const playIntroSound = async () => {
      try {
        // Browsers block autoplay with audio until the user interacts with the page.
        // We will attempt to play, but it will likely be silent on the first load.
        playWhistleSound();
      } catch (error) {
        // Autoplay was prevented by the browser. This is an expected behavior.
        // The user must interact with the page first for audio to play.
        console.log("A reprodução do som de introdução foi impedida pelo navegador.");
      }
    };

    playIntroSound();


    const hideTimer = setTimeout(() => {
      setIsHiding(true);
    }, 3500); // Start fading out before animation ends

    const destroyTimer = setTimeout(() => {
        setIsDestroyed(true);
        document.body.style.overflow = 'auto';
    }, 4000); // Remove from DOM after fade out

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(destroyTimer);
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (isDestroyed) {
      return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center bg-background overflow-hidden transition-opacity duration-500',
          isHiding ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div className="relative w-max h-48 flex items-center justify-center">
        <div className="absolute text-9xl animate-ball-roll-zoom">⚽</div>
        <div className="absolute flex items-center justify-center animate-text-zoom-out opacity-0">
            <div className="flex items-center gap-2 font-headline text-5xl md:text-6xl font-bold text-primary">
              <span className="text-5xl md:text-6xl">🌵</span>
              <span className="text-foreground">MANDACARU</span>
            </div>
        </div>
      </div>
    </div>
  );
}
