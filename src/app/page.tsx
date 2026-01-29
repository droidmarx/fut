import { getPlayers, getSettings } from '@/app/lib/data';
import { AppHeader } from '@/components/app/header';
import { FieldDisplay } from '@/components/app/field-display';
import { FooterContactButton } from '@/components/app/footer-contact-button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

export default async function Home() {
  const players = await getPlayers();
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      <AppHeader settings={settings} />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-headline">
                  Reserve seu lugar no time
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Selecione uma vaga disponível e entre em contato com um administrador para confirmar.
                </p>
              </div>
              {settings.gameDate && (
                <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm" style={{backgroundColor: 'hsl(var(--primary))'}}>
                  <Calendar className="h-5 w-5" />
                  <span className="font-semibold tracking-wide">
                    {(() => {
                        try {
                            const date = new Date(settings.gameDate as string);
                            // Add timezone offset to prevent off-by-one day errors
                            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                            const correctedDate = new Date(date.getTime() + userTimezoneOffset);
                            const formattedDate = format(correctedDate, "EEEE, dd 'de' MMMM", { locale: ptBR });
                            return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
                        } catch (e) {
                            return "Data inválida";
                        }
                    })()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
        <FieldDisplay initialPlayers={players} settings={settings} />
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} MANDACARU. Todos os direitos reservados.
        </p>
        <div className="sm:ml-auto">
          <FooterContactButton settings={settings} />
        </div>
      </footer>
    </div>
  );
}
