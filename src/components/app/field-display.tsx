'use client';

import type { Player, Settings } from '@/lib/types';
import { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerSlot } from './player-slot';
import { ReservationModal } from './reservation-modal';

type FieldDisplayProps = {
  initialPlayers: Player[];
  settings: Settings;
};

const playersApiUrl = 'https://6974f6ea265838bbea96693a.mockapi.io/Jogadores/Player';

export function FieldDisplay({ initialPlayers, settings }: FieldDisplayProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const playersRef = useRef(players);
  playersRef.current = players;

  const fetchPlayers = useCallback(async () => {
    try {
      const response = await fetch(playersApiUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      const newPlayers: Player[] = await response.json();
      
      // To handle MockAPI accumulating players, we just take the last 32 players added.
      const latestPlayers = newPlayers.slice(-32);

      if (JSON.stringify(latestPlayers) !== JSON.stringify(playersRef.current)) {
        setPlayers(latestPlayers);
      }
    } catch (error) {
      console.error("Failed to fetch real-time player data:", error);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
    const intervalId = setInterval(fetchPlayers, 3000); // Poll every 3 seconds

    return () => clearInterval(intervalId);
  }, [fetchPlayers]);

  const teamA_field = players.filter((p) => p.team === 'A' && p.playerNumber <= 12);
  const teamA_subs = players.filter((p) => p.team === 'A' && p.playerNumber > 12);
  const teamB_field = players.filter((p) => p.team === 'B' && p.playerNumber <= 12);
  const teamB_subs = players.filter((p) => p.team === 'B' && p.playerNumber > 12);

  const handlePlayerSelect = (player: Player) => {
    if (player.status === 'disponivel') {
      setSelectedPlayer(player);
    }
  };

  const handleModalClose = () => {
    setSelectedPlayer(null);
    fetchPlayers();
  };

  return (
    <>
      <section className="container mx-auto px-1 md:px-6 py-8">

        {/* Team A Bench */}
        <div className="mb-8">
            <h3 className="font-bold text-xl text-center mb-2 text-muted-foreground font-headline">Banco de Reservas - {settings.teamAName || 'Time A'}</h3>
            <div className="flex justify-center gap-2 sm:gap-4 p-6 bg-neutral-800 rounded-t-xl shadow-[inset_0_4px_6px_rgba(0,0,0,0.4)] border-b-8 border-neutral-900">
                {teamA_subs.map((player) => (
                    <PlayerSlot
                        key={player.id}
                        player={player}
                        onSelect={() => handlePlayerSelect(player)}
                        settings={settings}
                    />
                ))}
            </div>
        </div>

        <div className="flex flex-col items-center">
            <h2 className="text-center text-2xl md:text-3xl font-bold font-headline text-foreground mb-2 sm:mb-4 drop-shadow-lg flex items-center justify-center gap-3">
              {settings.teamAName || 'Time A'}
              <span style={{ backgroundColor: settings.teamAColor }} className="inline-block w-5 h-5 rounded-full border-2 border-muted-foreground/50"></span>
            </h2>

            <div className="relative overflow-hidden bg-gradient-to-b from-green-600 to-green-700 border-4 border-white/50 shadow-xl rounded-lg max-w-6xl mx-auto p-2 sm:p-4 flex flex-col justify-around items-center w-full gap-y-8 md:gap-y-12">
              
              <div className="absolute inset-0 p-4 pointer-events-none">
                {/* Center Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/30 -translate-y-1/2 z-0"></div>
                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 md:w-1/5 aspect-square border-2 border-white/30 rounded-full z-0"></div>
                
                {/* Top Goal Area */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[20%] w-[60%] border-x-2 border-b-2 border-white/20 rounded-b-xl z-0 bg-white/5"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[8%] w-[30%] border-x-2 border-b-2 border-white/20 rounded-b-lg z-0 bg-white/10"></div>
                <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 text-4xl sm:text-5xl text-white/60">🥅</div>

                {/* Bottom Goal Area */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[20%] w-[60%] border-x-2 border-t-2 border-white/20 rounded-t-xl z-0 bg-white/5"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[8%] w-[30%] border-x-2 border-t-2 border-white/20 rounded-t-lg z-0 bg-white/10"></div>
                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 text-4xl sm:text-5xl text-white/60 rotate-180">🥅</div>
                
                {/* Center Soccer Ball */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl md:text-5xl z-10 opacity-70">
                  ⚽
                </div>
              </div>
              
              {/* Time A */}
              <div className="relative z-10 w-full">
                <div className="flex flex-col items-center gap-y-8 sm:gap-y-12 w-full">
                  {/* Goalie */}
                  <div className="flex justify-center w-full pt-8">
                    {teamA_field.slice(0, 1).map((player) => (
                      <PlayerSlot
                        key={player.id}
                        player={player}
                        onSelect={() => handlePlayerSelect(player)}
                        settings={settings}
                      />
                    ))}
                  </div>
                  {/* Defenders */}
                  <div className="flex justify-around w-full max-w-4xl">
                    {teamA_field.slice(1, 5).map((player) => (
                      <PlayerSlot
                        key={player.id}
                        player={player}
                        onSelect={() => handlePlayerSelect(player)}
                        settings={settings}
                      />
                    ))}
                  </div>
                  {/* Midfielders */}
                  <div className="flex justify-around w-full max-w-4xl">
                    {teamA_field.slice(5, 9).map((player) => (
                      <PlayerSlot
                        key={player.id}
                        player={player}
                        onSelect={() => handlePlayerSelect(player)}
                        settings={settings}
                      />
                    ))}
                  </div>
                  {/* Attackers */}
                  <div className="flex justify-around w-full max-w-2xl">
                    {teamA_field.slice(9, 12).map((player) => (
                      <PlayerSlot
                        key={player.id}
                        player={player}
                        onSelect={() => handlePlayerSelect(player)}
                        settings={settings}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Time B */}
              <div className="relative z-10 w-full">
                <div className="flex flex-col items-center gap-y-8 sm:gap-y-12 w-full">
                  {/* Attackers */}
                   <div className="flex justify-around w-full max-w-2xl">
                    {teamB_field.slice(9, 12).map((player) => (
                      <PlayerSlot
                        key={player.id}
                        player={player}
                        onSelect={() => handlePlayerSelect(player)}
                        settings={settings}
                      />
                    ))}
                  </div>
                  {/* Midfielders */}
                  <div className="flex justify-around w-full max-w-4xl">
                    {teamB_field.slice(5, 9).map((player) => (
                      <PlayerSlot
                        key={player.id}
                        player={player}
                        onSelect={() => handlePlayerSelect(player)}
                        settings={settings}
                      />
                    ))}
                  </div>
                  {/* Defenders */}
                  <div className="flex justify-around w-full max-w-4xl">
                    {teamB_field.slice(1, 5).map((player) => (
                      <PlayerSlot
                        key={player.id}
                        player={player}
                        onSelect={() => handlePlayerSelect(player)}
                        settings={settings}
                      />
                    ))}
                  </div>
                  {/* Goalie */}
                  <div className="flex justify-center w-full pb-8">
                    {teamB_field.slice(0, 1).map((player) => (
                      <PlayerSlot
                        key={player.id}
                        player={player}
                        onSelect={() => handlePlayerSelect(player)}
                        settings={settings}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <h2 className="text-center text-2xl md:text-3xl font-bold font-headline text-foreground mt-2 sm:mt-4 drop-shadow-lg flex items-center justify-center gap-3">
              {settings.teamBName || 'Time B'}
              <span style={{ backgroundColor: settings.teamBColor }} className="inline-block w-5 h-5 rounded-full border-2 border-muted-foreground/50"></span>
            </h2>
        </div>

        {/* Team B Bench */}
        <div className="mt-8">
            <h3 className="font-bold text-xl text-center mb-2 text-muted-foreground font-headline">Banco de Reservas - {settings.teamBName || 'Time B'}</h3>
            <div className="flex justify-center gap-2 sm:gap-4 p-6 bg-neutral-800 rounded-t-xl shadow-[inset_0_4px_6px_rgba(0,0,0,0.4)] border-b-8 border-neutral-900">
                {teamB_subs.map((player) => (
                    <PlayerSlot
                        key={player.id}
                        player={player}
                        onSelect={() => handlePlayerSelect(player)}
                        settings={settings}
                    />
                ))}
            </div>
        </div>
      </section>

      {selectedPlayer && (
        <ReservationModal
          player={selectedPlayer}
          settings={settings}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}
