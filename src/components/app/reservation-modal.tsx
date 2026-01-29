'use client';

import { useState } from 'react';
import type { Player, Settings } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { reservePlayer } from '@/app/actions';
import { Loader2, MessageSquare } from 'lucide-react';

type ReservationModalProps = {
  player: Player;
  settings: Settings;
  onClose: () => void;
};

export function ReservationModal({
  player,
  settings,
  onClose,
}: ReservationModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReserve = async () => {
    if (!name.trim()) {
      toast({
        title: 'Erro de Validação',
        description: 'Por favor, insira seu nome.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await reservePlayer({
        playerId: player.id,
        userName: name.trim(),
      });
      if (result.success) {
        setStep(2);
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Não foi possível reservar o número.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    toast({
      title: 'Reserva Pendente',
      description: 'Sua reserva está pendente de confirmação. Entre em contato com um administrador para finalizar.',
    });
    setIsOpen(false); // This will trigger onOpenChange
  };

  const handleModalStateChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
    setIsOpen(open);
  };
  
  const reservationMessage = `Olá, gostaria de confirmar minha reserva para a vaga de camisa número ${player.playerNumber}. Meu nome é ${name}.`;

  return (
    <Dialog open={isOpen} onOpenChange={handleModalStateChange}>
      <DialogContent className="sm:max-w-[425px]">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Pré-reservar Posição - Camisa {player.playerNumber}</DialogTitle>
              <DialogDescription>
                Digite seu nome para continuar. Para confirmar a vaga, entre em contato com um administrador via WhatsApp.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                  placeholder="Seu nome completo"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleReserve}
                disabled={isLoading}
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Pré-reservar Vaga
              </Button>
            </DialogFooter>
          </>
        )}
        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Quase lá!</DialogTitle>
              <DialogDescription>
                Sua vaga foi pré-reservada. Entre em contato com um dos administradores abaixo para confirmar e garantir seu lugar.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground text-center px-4">
                Clique em um dos botões para iniciar a conversa.
              </p>
               <div className="space-y-2">
                {settings.administrators.map((admin) => (
                   <Button key={admin.id} asChild className="w-full bg-green-500 hover:bg-green-600 text-white font-bold">
                     <a href={`https://wa.me/${admin.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(reservationMessage)}`} target="_blank" rel="noopener noreferrer">
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Falar com {admin.name}
                     </a>
                   </Button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleFinish} className="w-full" variant="outline">
                Fechar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
