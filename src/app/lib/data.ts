'use server';

import type { Player, Settings } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

const mockApiBaseUrl = 'https://6974f6ea265838bbea96693a.mockapi.io/Jogadores';
const playersApiUrl = `${mockApiBaseUrl}/Player`;
const settingsApiUrl = `${mockApiBaseUrl}/settings`;


// This function will be called to populate the mock API if it's empty
async function initializePlayersApi(): Promise<void> {
    // This will add 32 new players to the mock API.
    // It doesn't clear existing players, so be aware that MockAPI can accumulate data.
    const defaultPlayers = Array.from({ length: 32 }, (_, i) => {
        const team = i < 16 ? ('A' as const) : ('B' as const);
        const playerIndexInTeam = i % 16;
        return {
            team: team,
            playerNumber: playerIndexInTeam + 1, // Player numbers 1 to 16 for each team
            status: 'disponivel' as const,
            name: null,
            reservedAt: null,
        };
    });

    for (const player of defaultPlayers) {
        await fetch(playersApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(player),
        });
    }
}

async function initializeSettingsApi(): Promise<Settings> {
    const defaultSettings = {
        administrators: [{ id: '1', name: 'Admin', whatsappNumber: '+5511999999999' }],
        teamAColor: '#9CA3AF',
        teamBColor: '#F87171',
        teamAName: 'Time A',
        teamBName: 'Time B',
        gameDate: null,
    };
    const response = await fetch(settingsApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultSettings),
    });

    if (!response.ok) {
        throw new Error(`Failed to initialize settings: ${response.statusText}`);
    }
    const createdSettings = await response.json();
    return createdSettings;
}


export async function getPlayers(): Promise<Player[]> {
  noStore();
  
  let players: Player[] = [];
  try {
    const response = await fetch(playersApiUrl, { cache: 'no-store' });
    if (!response.ok) {
        if(response.status === 404) {
            console.log("Players endpoint not found. Assuming empty and initializing.");
            players = [];
        } else {
            throw new Error(`Failed to fetch players: ${response.statusText}`);
        }
    } else {
        players = await response.json();
    }

    // Since we now have 16 players per team (32 total), we check for this.
    // MockAPI can accumulate old data. A simple check is to see if we have enough players
    // and if any of them has a number greater than 11 (the old max).
    const hasNewerSchemaPlayers = players.some(p => p.playerNumber > 11);

    if (players.length < 32 || !hasNewerSchemaPlayers) {
        console.log("Correct player data not found or incomplete. Initializing 32 players on MockAPI...");
        await initializePlayersApi(); // This will add 32 new players
        const secondResponse = await fetch(playersApiUrl, { cache: 'no-store' });
        if (!secondResponse.ok) {
             throw new Error(`Failed to fetch players after initialization: ${secondResponse.statusText}`);
        }
        players = await secondResponse.json();
    }
  } catch (error) {
      console.error("Error fetching or initializing players:", error);
      return [];
  }

  // To handle MockAPI accumulating players, we just take the last 32 players added.
  // This assumes the latest initialized players are the ones we want.
  return players.slice(-32);
}

export async function getSettings(): Promise<Settings> {
    noStore();
    const response = await fetch(settingsApiUrl, { cache: 'no-store' });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
    }

    let settingsArray: Settings[] = await response.json();

    if (settingsArray.length === 0) {
        console.log("Settings not found. Initializing with default settings.");
        const newSettings = await initializeSettingsApi();
        return newSettings;
    }
    
    return settingsArray[0];
}

export async function updatePlayer(
  playerId: string,
  updatedData: Partial<Omit<Player, 'id' | 'team' | 'playerNumber'>>
): Promise<Player> {
    // First, get the current state of the player
    const getPlayerResponse = await fetch(`${playersApiUrl}/${playerId}`);
    if (!getPlayerResponse.ok) {
        throw new Error(`Failed to fetch player ${playerId} for update.`);
    }
    const currentPlayer: Player = await getPlayerResponse.json();

    // Merge the current data with the new data
    const updatedPlayerPayload = { ...currentPlayer, ...updatedData };

    // Then, send the full updated object back to the API
    const response = await fetch(`${playersApiUrl}/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlayerPayload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update player: ${errorText}`);
    }

    const updatedPlayer = await response.json();
    return updatedPlayer;
}

export async function updateSettings(
  updatedData: Partial<Omit<Settings, 'id'>>
): Promise<Settings> {
  const currentSettings = await getSettings();
  if (!currentSettings || !currentSettings.id) {
    throw new Error('Could not retrieve current settings ID from API to perform update.');
  }

  const newSettings = { ...currentSettings, ...updatedData };
  
  const response = await fetch(`${settingsApiUrl}/${currentSettings.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newSettings),
  });

   if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update settings: ${errorText}`);
    }

  return await response.json();
}
