'use client';
import { useFormStatus } from 'react-dom';
import React, { useActionState } from 'react';
import { updateSettings, resetAllPlayers } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Settings, Administrator } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { PlusCircle, Trash2, Loader2, AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


type SettingsFormProps = {
  initialSettings: Settings;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Salvar Configurações
    </Button>
  );
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [state, formAction] = useActionState(updateSettings, undefined);
  const { toast } = useToast();

  const [admins, setAdmins] = useState<Administrator[]>([]);
  const [teamAColor, setTeamAColor] = useState('');
  const [teamBColor, setTeamBColor] = useState('');
  const [teamAName, setTeamAName] = useState('');
  const [teamBName, setTeamBName] = useState('');
  const [gameDate, setGameDate] = useState<Date | undefined>();
  const [isResetting, setIsResetting] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);


  useEffect(() => {
    if (state?.success) {
      toast({
        title: 'Sucesso',
        description: state.message,
      });
    } else if (state?.error) {
      toast({
        title: 'Erro',
        description: state.error,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  useEffect(() => {
    setAdmins(initialSettings.administrators || []);
    setTeamAColor(initialSettings.teamAColor || '#9CA3AF');
    setTeamBColor(initialSettings.teamBColor || '#F87171');
    setTeamAName(initialSettings.teamAName || 'Time A');
    setTeamBName(initialSettings.teamBName || 'Time B');
    setGameDate(initialSettings.gameDate ? new Date(initialSettings.gameDate) : undefined);
  }, [initialSettings]);

  const handleAdminChange = (index: number, field: 'name' | 'whatsappNumber', value: string) => {
    const newAdmins = [...admins];
    newAdmins[index] = { ...newAdmins[index], [field]: value };
    setAdmins(newAdmins);
  };

  const addAdmin = () => {
    setAdmins([...admins, { id: Date.now().toString(), name: '', whatsappNumber: '' }]);
  };

  const removeAdmin = (index: number) => {
    const newAdmins = admins.filter((_, i) => i !== index);
    setAdmins(newAdmins);
  };
  
  const handleResetField = async () => {
    setIsResetting(true);
    const result = await resetAllPlayers();
    if (result.success) {
        toast({
            title: 'Sucesso!',
            description: result.message,
        });
        setIsResetDialogOpen(false);
    } else {
        toast({
            title: 'Erro',
            description: result.error,
            variant: 'destructive',
        });
    }
    setIsResetting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações</CardTitle>
        <CardDescription>
          Gerencie os nomes e cores das equipes, e a lista de administradores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-6">
          <input type="hidden" name="gameDate" value={gameDate ? gameDate.toISOString() : ''} />

           <div className="grid gap-2">
            <h3 className="font-semibold">Data do Jogo</h3>
            <div className="grid gap-4 p-3 border rounded-lg bg-muted/20">
              <div className="grid gap-2">
                <Label htmlFor="gameDate">Data da próxima partida</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full sm:w-[280px] justify-start text-left font-normal",
                        !gameDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {gameDate ? format(gameDate, "PPP", { locale: ptBR }) : <span>Escolha uma data (opcional)</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={gameDate}
                      onSelect={setGameDate}
                      initialFocus
                    />
                    <div className="p-2 border-t">
                      <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          onClick={() => setGameDate(undefined)}
                      >
                          Sem data definida
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid gap-2">
            <h3 className="font-semibold">Equipes</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 border rounded-lg bg-muted/20">
                <div className="grid gap-4 flex-1">
                    <div className="grid gap-2">
                      <Label htmlFor="teamAName">Nome do Time A</Label>
                      <Input id="teamAName" name="teamAName" value={teamAName} onChange={(e) => setTeamAName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="teamAColor">Cor do Time A</Label>
                      <Input
                          id="teamAColor"
                          name="teamAColor"
                          type="color"
                          value={teamAColor}
                          onChange={(e) => setTeamAColor(e.target.value)}
                          className="p-1 h-10 w-24 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none"
                      />
                    </div>
                </div>
                <div className="grid gap-4 flex-1">
                    <div className="grid gap-2">
                        <Label htmlFor="teamBName">Nome do Time B</Label>
                        <Input id="teamBName" name="teamBName" value={teamBName} onChange={(e) => setTeamBName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="teamBColor">Cor do Time B</Label>
                      <Input
                          id="teamBColor"
                          name="teamBColor"
                          type="color"
                          value={teamBColor}
                          onChange={(e) => setTeamBColor(e.target.value)}
                          className="p-1 h-10 w-24 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none"
                      />
                    </div>
                </div>
            </div>
          </div>
          
          <Separator />

          <input type="hidden" name="administrators" value={JSON.stringify(admins)} />
          <div className="grid gap-2">
             <h3 className="font-semibold">Administradores</h3>
            {admins.map((admin, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-end gap-2 p-3 border rounded-lg bg-muted/20">
                <div className="grid gap-2 flex-1 w-full">
                  <Label htmlFor={`admin-name-${index}`} className="text-xs font-semibold">Nome do Administrador</Label>
                  <Input
                    id={`admin-name-${index}`}
                    name={`admin-name-${index}`}
                    type="text"
                    className="w-full bg-background"
                    placeholder="Ex: João Silva"
                    value={admin.name}
                    onChange={(e) => handleAdminChange(index, 'name', e.target.value)}
                  />
                </div>
                <div className="grid gap-2 flex-1 w-full">
                  <Label htmlFor={`admin-whatsapp-${index}`} className="text-xs font-semibold">Nº do WhatsApp</Label>
                  <Input
                    id={`admin-whatsapp-${index}`}
                    name={`admin-whatsapp-${index}`}
                    type="text"
                    className="w-full bg-background"
                    placeholder="Ex: +5511999999999"
                    value={admin.whatsappNumber}
                    onChange={(e) => handleAdminChange(index, 'whatsappNumber', e.target.value)}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeAdmin(index)} type="button" disabled={admins.length <= 1}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Remover Administrador</span>
                </Button>
              </div>
            ))}
             <Button variant="outline" type="button" onClick={addAdmin}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Administrador
            </Button>
          </div>
          
          <SubmitButton />
        </form>
        
        <Separator className="my-8" />
        
        <div className="space-y-4 rounded-lg border border-destructive/50 p-4 bg-destructive/5">
            <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <h3 className="font-semibold text-destructive">Zona de Perigo</h3>
                    <p className="text-sm text-muted-foreground">
                        A ação abaixo é irreversível e irá liberar todas as vagas do campo.
                    </p>
                </div>
            </div>
            
            <Button variant="destructive" onClick={() => setIsResetDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                RESETAR O CAMPO
            </Button>
            
            <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso irá liberar permanentemente todas as vagas reservadas e pendentes, resetando o campo para seu estado inicial.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="ghost" onClick={() => setIsResetDialogOpen(false)} disabled={isResetting}>
                          Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleResetField}
                            disabled={isResetting}
                        >
                            {isResetting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resetando...
                                </>
                            ) : (
                                "Sim, quero resetar o campo"
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>

      </CardContent>
    </Card>
  );
}
