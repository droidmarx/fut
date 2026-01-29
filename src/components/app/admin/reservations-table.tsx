'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Player, Settings } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  confirmReservation,
  releaseReservation,
  editReservationName,
  confirmMultipleReservations,
  releaseMultipleReservations,
} from '@/app/actions';
import { useToast, playNotificationSound, playWhistleSound } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type ReservationsTableProps = {
  initialPlayers: Player[];
  settings: Settings;
};

const statusDisplay: { [key: string]: { text: string; className: string } } = {
  disponivel: { text: 'Disponível', className: 'bg-gray-500' },
  pendente: { text: 'Pendente', className: 'bg-yellow-500' },
  aprovado: { text: 'Aprovado', className: 'bg-primary' },
};

const playersApiUrl = 'https://6974f6ea265838bbea96693a.mockapi.io/Jogadores/Player';


export function ReservationsTable({ initialPlayers, settings }: ReservationsTableProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [managingPlayer, setManagingPlayer] = useState<Player | null>(null);
  const [editedName, setEditedName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [dialogClassName, setDialogClassName] = useState('');

  const { toast } = useToast();
  
  const [isClient, setIsClient] = useState(false);
  const knownPendingIds = useRef<Set<string>>(
    new Set(initialPlayers.filter((p) => p.status === 'pendente').map((p) => p.id))
  );
  const dialogContentRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }
  
    const visualViewport = window.visualViewport;
  
    const handleResize = () => {
        if (!visualViewport || !dialogContentRef.current) return;
        
        const isKeyboardVisible = visualViewport.height < window.innerHeight * 0.9;

        if (isKeyboardVisible) {
            const topOffset = visualViewport.offsetTop + 16; // 1rem from top
            const availableHeight = visualViewport.height - topOffset - 16; // 1rem from bottom
            
            dialogContentRef.current.style.top = `${topOffset}px`;
            dialogContentRef.current.style.height = `${availableHeight}px`;
            dialogContentRef.current.style.transform = 'translate(-50%, 0)';
            dialogContentRef.current.style.top = `${topOffset}px`;
        } else {
            dialogContentRef.current.style.top = '50%';
            dialogContentRef.current.style.height = 'auto';
            dialogContentRef.current.style.transform = 'translate(-50%, -50%)';
        }
    };
  
    visualViewport.addEventListener('resize', handleResize);
  
    return () => {
        visualViewport.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setIsClient(true);
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(playersApiUrl, { cache: 'no-store' });
        if (response.ok) {
          const newPlayers: Player[] = (await response.json()).slice(-32);
          
          if (JSON.stringify(newPlayers) !== JSON.stringify(players)) {
            setPlayers(newPlayers);

            const newPendingPlayers = newPlayers.filter(p => p.status === 'pendente');
            const newPendingIds = new Set(newPendingPlayers.map(p => p.id));
            
            newPendingPlayers.forEach(player => {
              if (!knownPendingIds.current.has(player.id)) {
                toast({
                  title: 'Nova Reserva Pendente',
                  description: `Jogador ${player.name} para a camisa #${player.playerNumber} (Time ${player.team}).`,
                });
                playNotificationSound();
              }
            });
            
            knownPendingIds.current = newPendingIds;
          }
        }
      } catch (error) {
        console.error("Failed to poll for player data:", error);
      }
    }, 5000); 

    return () => clearInterval(intervalId);
  }, [players, toast]);

  const handleRowClick = (player: Player) => {
    if (player.status === 'disponivel') return;
    setEditedName(player.name || '');
    setManagingPlayer(player);
  };
  
  const handleCloseDialog = () => {
      setManagingPlayer(null);
      setIsSubmitting(null);
  }

  const handleAction = async (action: 'confirm' | 'edit' | 'release') => {
    if (!managingPlayer) return;

    setIsSubmitting(action);
    let result: { success: boolean; error?: string } | undefined;

    try {
        switch (action) {
            case 'confirm':
                result = await confirmReservation(managingPlayer.id);
                if (result.success) {
                    playWhistleSound();
                    toast({ title: "Sucesso!", description: "Vaga confirmada com sucesso." });
                }
                break;
            case 'edit':
                if (!editedName.trim()) {
                    toast({ title: "Erro", description: "O nome não pode estar vazio.", variant: 'destructive' });
                    setIsSubmitting(null);
                    return;
                }
                result = await editReservationName(managingPlayer.id, editedName);
                if (result.success) {
                    toast({ title: "Sucesso", description: "Nome da reserva atualizado." });
                }
                break;
            case 'release':
                result = await releaseReservation(managingPlayer.id);
                if (result.success) {
                     toast({ title: "Sucesso!", description: "Vaga liberada com sucesso." });
                }
                break;
        }

        if (result?.success) {
            handleCloseDialog();
        } else if (result?.error) {
            toast({ variant: "destructive", title: "Falha na Ação", description: result.error });
            setIsSubmitting(null);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
        toast({ variant: "destructive", title: "Falha na Ação", description: message });
        setIsSubmitting(null);
    }
  };

  const handleSelectPlayer = (playerId: string, checked: boolean | 'indeterminate') => {
    setSelectedIds(prev =>
      checked ? [...prev, playerId] : prev.filter(id => id !== playerId)
    );
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const statusOrder = { 'pendente': 1, 'aprovado': 2, 'disponivel': 3 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    if (a.team < b.team) return -1;
    if (a.team > b.team) return 1;
    return a.playerNumber - b.playerNumber;
  });

  const pendingPlayers = sortedPlayers.filter(p => p.status === 'pendente');
  const approvedPlayers = sortedPlayers.filter(p => p.status === 'aprovado');
  const availablePlayers = sortedPlayers.filter(p => p.status === 'disponivel');
  
  const pendingPlayerIds = pendingPlayers.map(p => p.id);
  
  const handleSelectAllPending = (checked: boolean | 'indeterminate') => {
    if (checked) {
      setSelectedIds(Array.from(new Set([...selectedIds, ...pendingPlayerIds])));
    } else {
      setSelectedIds(selectedIds.filter(id => !pendingPlayerIds.includes(id)));
    }
  };

  const handleBulkConfirm = async () => {
    setIsBulkSubmitting(true);
    const result = await confirmMultipleReservations(selectedIds);
    if (result.success) {
      playWhistleSound();
      toast({ title: "Sucesso!", description: result.message });
      setSelectedIds([]);
    } else {
      toast({ variant: "destructive", title: "Falha na Ação", description: result.error });
    }
    setIsBulkSubmitting(false);
  };
  
  const handleBulkRelease = async () => {
    setIsBulkSubmitting(true);
    const result = await releaseMultipleReservations(selectedIds);
    if (result.success) {
      toast({ title: "Sucesso!", description: result.message });
      setSelectedIds([]);
    } else {
      toast({ variant: "destructive", title: "Falha na Ação", description: result.error });
    }
    setIsBulkSubmitting(false);
  };

  const PlayerCard = ({ player }: { player: Player }) => (
    <Card
      className={cn('w-full', player.status !== 'disponivel' && 'cursor-pointer hover:bg-muted/50')}
      onClick={() => handleRowClick(player)}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-0.5 overflow-hidden">
            <CardTitle className="flex items-center gap-2 truncate text-base font-bold">
              <span>{player.name || `Camisa #${player.playerNumber}`}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {player.name ? `Camisa #${player.playerNumber}` : statusDisplay[player.status].text}
            </CardDescription>
          </div>
          {player.status === 'pendente' && (
            <Checkbox
              onCheckedChange={(checked) => handleSelectPlayer(player.id, checked)}
              checked={selectedIds.includes(player.id)}
              aria-label={`Selecionar jogador ${player.name}`}
              onClick={(e) => e.stopPropagation()}
              className="ml-2 mt-1 flex-shrink-0"
            />
          )}
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className={statusDisplay[player.status].className}>
            {statusDisplay[player.status].text}
          </Badge>
        </div>
         {player.reservedAt && (
          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-2">
            <Clock className="h-3 w-3" />
            <span className="truncate">
              {isClient ? formatDistanceToNow(new Date(player.reservedAt), { addSuffix: true, locale: ptBR }) : '...'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderPlayerTable = (playersToRender: Player[], isPending: boolean) => (
    <Table>
      <TableHeader>
        <TableRow>
          {isPending && (
            <TableHead className="w-[50px]">
              <Checkbox
                onCheckedChange={handleSelectAllPending}
                checked={pendingPlayerIds.length > 0 && pendingPlayerIds.every(id => selectedIds.includes(id))}
                aria-label="Selecionar todas as vagas pendentes"
                disabled={pendingPlayerIds.length === 0}
              />
            </TableHead>
          )}
          <TableHead>Time</TableHead>
          <TableHead>Camisa</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Reservado em</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {playersToRender.map((player) => (
          <TableRow
            key={player.id}
            className={cn(
              player.status !== 'disponivel' && 'cursor-pointer',
              player.status === 'pendente' ? 'bg-yellow-500/10 hover:bg-yellow-500/20' : 'hover:bg-muted/50'
            )}
            onClick={() => handleRowClick(player)}
          >
            {isPending && (
              <TableCell>
                <Checkbox
                  onCheckedChange={(checked) => handleSelectPlayer(player.id, checked)}
                  checked={selectedIds.includes(player.id)}
                  aria-label={`Selecionar jogador ${player.name}`}
                  onClick={(e) => e.stopPropagation()}
                />
              </TableCell>
            )}
            <TableCell className="font-medium">Time {player.team}</TableCell>
            <TableCell className="font-medium">#{player.playerNumber}</TableCell>
            <TableCell>
              <Badge variant="secondary" className={statusDisplay[player.status].className}>
                {statusDisplay[player.status].text}
              </Badge>
            </TableCell>
            <TableCell>{player.name}</TableCell>
            <TableCell>
              {isClient && player.reservedAt ? formatDistanceToNow(new Date(player.reservedAt), { addSuffix: true, locale: ptBR }) : (player.reservedAt ? '...' : '')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
  
  const renderPlayerContent = (playersToRender: Player[], isPending: boolean) => {
    if (playersToRender.length === 0) {
      return <p className="text-muted-foreground text-center py-4">Nenhum jogador nesta categoria.</p>;
    }
    return (
      <>
        <div className="md:hidden grid grid-cols-2 sm:grid-cols-3 gap-2 p-2">
            {playersToRender.map((player) => <PlayerCard key={player.id} player={player} />)}
        </div>
        <div className="hidden md:block">
            {renderPlayerTable(playersToRender, isPending)}
        </div>
      </>
    );
  };


  return (
    <>
       {selectedIds.length > 0 && (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>Ações em Massa</CardTitle>
                <CardDescription>Você selecionou {selectedIds.length} vaga(s) pendente(s).</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleBulkConfirm} disabled={isBulkSubmitting}>
                    {isBulkSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    Confirmar Selecionados
                </Button>
                <Button variant="destructive" onClick={handleBulkRelease} disabled={isBulkSubmitting}>
                    {isBulkSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                    Liberar Selecionados
                </Button>
            </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Vagas</CardTitle>
          <CardDescription>
            Expanda as seções para gerenciar as vagas por status.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Accordion type="multiple" defaultValue={['pendentes', 'aprovados']} className="w-full">
              <AccordionItem value="pendentes">
                <AccordionTrigger>Pendentes ({pendingPlayers.length})</AccordionTrigger>
                <AccordionContent>
                  {renderPlayerContent(pendingPlayers, true)}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="aprovados">
                <AccordionTrigger>Aprovados ({approvedPlayers.length})</AccordionTrigger>
                <AccordionContent>
                  {renderPlayerContent(approvedPlayers, false)}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="disponiveis">
                <AccordionTrigger>Disponíveis ({availablePlayers.length})</AccordionTrigger>
                <AccordionContent>
                  {renderPlayerContent(availablePlayers, false)}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
        </CardContent>
      </Card>
      
      <Dialog open={!!managingPlayer} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent ref={dialogContentRef} className={cn('transition-all duration-300', dialogClassName)}>
            <DialogHeader>
                <DialogTitle>Gerenciar Vaga - Camisa #{managingPlayer?.playerNumber}</DialogTitle>
                <DialogDescription>
                    Edite o nome, confirme a reserva ou libere a vaga.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Label htmlFor='edit-name'>Nome do Jogador</Label>
                <Input id="edit-name" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
            </div>
            <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2 pt-4">
                <Button onClick={() => handleAction('edit')} disabled={!!isSubmitting}>
                  {isSubmitting === 'edit' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Alterações
                </Button>

                {managingPlayer?.status === 'pendente' && (
                    <Button onClick={() => handleAction('confirm')} disabled={!!isSubmitting} variant="secondary">
                        {isSubmitting === 'confirm' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar Vaga
                    </Button>
                )}

                <Button onClick={() => handleAction('release')} disabled={!!isSubmitting} variant="destructive">
                     {isSubmitting === 'release' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Liberar Vaga
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
