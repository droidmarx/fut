export type Player = {
  id: string;
  playerNumber: number;
  team: 'A' | 'B';
  status: 'disponivel' | 'pendente' | 'aprovado';
  name: string | null;
  reservedAt: string | null;
};

export type Administrator = {
  id: string;
  name: string;
  whatsappNumber: string;
};

export type Settings = {
  id: string;
  administrators: Administrator[];
  teamAColor?: string;
  teamBColor?: string;
  teamAName?: string;
  teamBName?: string;
  gameDate?: string | null;
};

export type AppData = {
  players: Player[];
  settings: Settings;
};
