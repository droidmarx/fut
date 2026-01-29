import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { getPlayers, getSettings } from '@/app/lib/data';
import { ReservationsTable } from '@/components/app/admin/reservations-table';
import { SettingsForm } from '@/components/app/admin/settings-form';
import { FieldDisplay } from '@/components/app/field-display';

export default async function DashboardPage() {
  const players = await getPlayers();
  const settings = await getSettings();

  return (
    <Tabs defaultValue="reservations" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="reservations">Reservas</TabsTrigger>
        <TabsTrigger value="field">Campo</TabsTrigger>
        <TabsTrigger value="settings">Configurações</TabsTrigger>
      </TabsList>
      <TabsContent value="reservations">
        <ReservationsTable initialPlayers={players} settings={settings} />
      </TabsContent>
       <TabsContent value="field">
        <FieldDisplay initialPlayers={players} settings={settings} />
      </TabsContent>
      <TabsContent value="settings">
        <SettingsForm initialSettings={settings} />
      </TabsContent>
    </Tabs>
  );
}
