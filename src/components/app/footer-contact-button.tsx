'use client';

import { useState } from 'react';
import type { Settings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { MessageSquare } from 'lucide-react';

type FooterContactButtonProps = {
  settings: Settings;
};

export function FooterContactButton({ settings }: FooterContactButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const contactMessage = `Olá, gostaria de mais informações.`;

  return (
    <>
      <Button variant="outline" onClick={() => setIsModalOpen(true)}>
        <MessageSquare className="mr-2 h-5 w-5" />
        Fale com um Administrador
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Contatos dos Administradores</DialogTitle>
            <DialogDescription>
              Precisa de ajuda? Entre em contato com um dos administradores abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground text-center px-4">
              Clique em um dos botões para iniciar a conversa no WhatsApp.
            </p>
            <div className="space-y-2">
              {settings.administrators.map((admin) => (
                <Button key={admin.id} asChild className="w-full bg-green-500 hover:bg-green-600 text-white font-bold">
                  <a href={`https://wa.me/${admin.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(contactMessage)}`} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Falar com {admin.name}
                  </a>
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)} className="w-full" variant="outline">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
