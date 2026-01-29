'use client';

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// To prevent showing the toast multiple times in a session
let toastShown = false;

export function InstallPWAButton() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const { toast, dismiss } = useToast();

  const handleInstallClick = useCallback(async () => {
    if (!installPrompt) {
      return;
    }
    await installPrompt.prompt();
    // The prompt can only be used once.
    setInstallPrompt(null);
    // Dismiss the toast after the prompt is shown
    dismiss();
  }, [installPrompt, dismiss]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (installPrompt && !toastShown) {
      toastShown = true;
      toast({
        title: 'Instale o Aplicativo',
        description: 'Adicione o MANDACARU à sua tela inicial para acesso rápido.',
        action: (
          <Button onClick={handleInstallClick}>
            <Download className="mr-2 h-4 w-4" />
            Instalar
          </Button>
        ),
      });
    }
  }, [installPrompt, toast, handleInstallClick]);

  // This component doesn't render anything itself, it just triggers a toast.
  return null;
}
