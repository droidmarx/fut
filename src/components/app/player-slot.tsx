'use client';
import { cn } from '@/lib/utils';
import type { Player, Settings } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Shirt, Armchair } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const getContrastingTextColor = (hexcolor: string): string => {
  if (!hexcolor) return '#000000';
  if (hexcolor.startsWith('#')) {
    hexcolor = hexcolor.slice(1);
  }
  if (hexcolor.length === 3) {
    hexcolor = hexcolor.split('').map(char => char + char).join('');
  }
  const r = parseInt(hexcolor.substring(0, 2), 16);
  const g = parseInt(hexcolor.substring(2, 4), 16);
  const b = parseInt(hexcolor.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
}

type PlayerSlotProps = {
    player: Player;
    onSelect: () => void;
    settings: Settings;
};


export function PlayerSlot({ player, onSelect, settings }: PlayerSlotProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const prevStatusRef = useRef(player.status);

  useEffect(() => {
    if (prevStatusRef.current !== player.status) {
      setIsUpdating(true);
      const timer = setTimeout(() => setIsUpdating(false), 1000); // Animate for 1 second
      prevStatusRef.current = player.status;
      return () => clearTimeout(timer);
    }
  }, [player.status]);

  const isAvailable = player.status === 'disponivel';
  const playerNumber = player.playerNumber;
  const isBenchPlayer = playerNumber > 12;

  let fillColor = 'white';
  let strokeColor = 'gray';
  let textColor = 'black';
  let statusLabel = '';
  let cursorClass = 'cursor-not-allowed';
  let textShadowStyle = {};
  
  const teamColor = player.team === 'A' 
    ? (settings.teamAColor || '#9CA3AF') 
    : (settings.teamBColor || '#F87171');

  switch (player.status) {
    case 'disponivel':
      statusLabel = 'Disponível';
      cursorClass = 'cursor-pointer hover:opacity-80 transition-opacity';
      fillColor = 'white';
      strokeColor = '#d1d5db';
      textColor = '#374151';
      break;
    case 'pendente':
      statusLabel = 'Pendente';
      fillColor = '#fef9c3'; // yellow-100
      strokeColor = '#fde047'; // yellow-300
      textColor = '#854d0e'; // yellow-800
      break;
    case 'aprovado':
      statusLabel = 'Aprovado';
      fillColor = teamColor;
      const contrast = getContrastingTextColor(teamColor);
      strokeColor = contrast === '#FFFFFF' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.2)';
      textColor = contrast;
      if (player.playerNumber > 12 && textColor === '#FFFFFF') {
        textShadowStyle = { textShadow: '0 1px 3px rgba(0, 0, 0, 0.7)' };
      }
      break;
  }
  
  const tooltipText = player.name ? `${statusLabel} por ${player.name}` : statusLabel;
  const IconComponent = isBenchPlayer ? Armchair : Shirt;

  const content = (
    <div
      onClick={isAvailable ? onSelect : undefined}
      className={cn(
        "relative flex flex-col items-center justify-center w-full transition-transform duration-300",
        cursorClass,
        isUpdating && "animate-pulse"
      )}
    >
      <IconComponent
        className="w-full h-auto drop-shadow-md" 
        style={{ fill: fillColor, stroke: strokeColor }}
        strokeWidth={1.5}
        size={80} // Base size
      />
      <div className={cn(
        "absolute inset-0 flex flex-col items-center justify-start text-center pointer-events-none",
        isBenchPlayer ? 'pt-7' : 'pt-5'
        )}>
        <span 
          className="text-2xl font-bold font-headline" 
          style={{ color: textColor, ...textShadowStyle }}
        >
          {playerNumber}
        </span>
        
        <div className="mt-0 leading-tight">
           {player.name && (
            <p className="font-semibold truncate text-[10px] sm:text-xs" style={{ color: textColor, ...textShadowStyle }}>{player.name}</p>
          )}
          <p className="text-[10px] font-medium opacity-90" style={{ color: textColor, ...textShadowStyle }}>
             {statusLabel}
          </p>
        </div>
      </div>
    </div>
  );

  return (
     <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full max-w-[60px] sm:max-w-[80px]">{content}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
