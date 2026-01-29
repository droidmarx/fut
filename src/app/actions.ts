'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  updatePlayer,
  updateSettings as dbUpdateSettings,
  getPlayers,
} from '@/app/lib/data';
import {
  createSession,
  deleteSession,
  verifySession,
} from '@/app/lib/auth';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '@/app/lib/credentials';

const reservePlayerSchema = z.object({
  playerId: z.string(),
  userName: z.string().min(1, 'O nome é obrigatório'),
});

export async function reservePlayer(input: {
  playerId: string;
  userName: string;
}) {
  const parsed = reservePlayerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Dados inválidos.' };
  }

  const { playerId, userName } = parsed.data;

  try {
    const updatedPlayer = await updatePlayer(playerId, {
      name: userName,
      status: 'pendente',
      reservedAt: new Date().toISOString(),
    });

    // revalidatePath('/'); // Removed to allow client-side polling to handle updates
    return { success: true, player: updatedPlayer };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.',
    };
  }
}

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function login(prevState: any, formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { success: false, error: 'Dados do formulário inválidos.' };
  }

  const { username, password } = parsed.data;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    await createSession(username);
    redirect('/admin/dashboard');
  } else {
    return { success: false, error: 'Usuário ou senha inválidos.' };
  }
}

export async function logout() {
  await deleteSession();
  redirect('/admin');
}

const adminSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'O nome é obrigatório'),
  whatsappNumber: z.string().min(1, 'O número do WhatsApp é obrigatório'),
});

const settingsSchema = z.object({
  administrators: z.string().transform((str, ctx) => {
    try {
      const parsed = z.array(adminSchema).min(1, "É necessário ter pelo menos um administrador.").parse(JSON.parse(str));
      return parsed;
    } catch (e) {
      if (e instanceof z.ZodError) {
          ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: e.errors.map(err => err.message).join(', '),
          });
      } else {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Dados de administradores inválidos.',
        });
      }
      return z.NEVER;
    }
  }),
  teamAColor: z.string().regex(/^#[0-9A-F]{6}$/i, { message: 'Formato de cor inválido para o Time A.' }).optional(),
  teamBColor: z.string().regex(/^#[0-9A-F]{6}$/i, { message: 'Formato de cor inválido para o Time B.' }).optional(),
  teamAName: z.string().min(1, "O nome do Time A é obrigatório.").optional(),
  teamBName: z.string().min(1, "O nome do Time B é obrigatório.").optional(),
  gameDate: z.string().nullable().optional(),
});


export async function updateSettings(prevState: any, formData: FormData) {
  if (!(await verifySession())) {
    return { success: false, error: 'Sua sessão expirou. Por favor, faça o login novamente.' };
  }
  const rawData = Object.fromEntries(formData);
  const data = {
    ...rawData,
    gameDate: rawData.gameDate || null
  };

  const parsed = settingsSchema.safeParse(data);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const errorMessage = fieldErrors.administrators?.[0] || fieldErrors.teamAColor?.[0] || fieldErrors.teamBColor?.[0] || fieldErrors.teamAName?.[0] || fieldErrors.teamBName?.[0] || 'Dados do formulário inválidos.';
    return { success: false, error: errorMessage };
  }

  try {
    await dbUpdateSettings(parsed.data);
    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    return { success: true, message: 'Configurações atualizadas com sucesso.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao salvar as configurações.';
    return { success: false, error: message };
  }
}

export async function confirmReservation(playerId: string) {
    if (!(await verifySession())) {
    return { success: false, error: 'Sua sessão expirou. Por favor, faça o login novamente.' };
  }
  try {
    await updatePlayer(playerId, { status: 'aprovado' });
    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao confirmar a reserva.';
    return { success: false, error: message };
  }
}

export async function releaseReservation(playerId: string) {
  if (!(await verifySession())) {
    return { success: false, error: 'Sua sessão expirou. Por favor, faça o login novamente.' };
  }
  try {
    await updatePlayer(playerId, {
      status: 'disponivel',
      name: null,
      reservedAt: null,
    });
    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao liberar a vaga.';
    return { success: false, error: message };
  }
}

export async function editReservationName(playerId: string, newName: string) {
  if (!(await verifySession())) {
    return { success: false, error: 'Sua sessão expirou. Por favor, faça o login novamente.' };
  }
  if (!newName.trim()) {
    return { success: false, error: "O nome não pode estar vazio." };
  }
  try {
    await updatePlayer(playerId, { name: newName.trim() });
    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao editar o nome.';
    return { success: false, error: message };
  }
}

export async function confirmMultipleReservations(playerIds: string[]) {
  if (!(await verifySession())) {
    return { success: false, error: 'Sua sessão expirou. Por favor, faça o login novamente.' };
  }
  try {
    for (const playerId of playerIds) {
      await updatePlayer(playerId, { status: 'aprovado' });
    }
    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    return { success: true, message: `${playerIds.length} reserva(s) confirmada(s) com sucesso.` };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao confirmar as reservas.';
    return { success: false, error: message };
  }
}

export async function releaseMultipleReservations(playerIds: string[]) {
  if (!(await verifySession())) {
    return { success: false, error: 'Sua sessão expirou. Por favor, faça o login novamente.' };
  }
  try {
    for (const playerId of playerIds) {
      await updatePlayer(playerId, {
        status: 'disponivel',
        name: null,
        reservedAt: null,
      });
    }
    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    return { success: true, message: `${playerIds.length} vaga(s) liberada(s) com sucesso.` };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao liberar as vagas.';
    return { success: false, error: message };
  }
}

export async function resetAllPlayers() {
  if (!(await verifySession())) {
    return { success: false, error: 'Sua sessão expirou. Por favor, faça o login novamente.' };
  }
  try {
    const players = await getPlayers();
    for (const player of players) {
      if (player.status !== 'disponivel') {
        await updatePlayer(player.id, {
          status: 'disponivel',
          name: null,
          reservedAt: null,
        });
      }
    }
    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    return { success: true, message: 'Campo resetado com sucesso! Todas as vagas foram liberadas.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao resetar o campo.';
    return { success: false, error: message };
  }
}
