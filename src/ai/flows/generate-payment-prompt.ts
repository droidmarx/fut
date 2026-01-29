'use server';

/**
 * @fileOverview A flow to generate a payment message for a selected number.
 *
 * - generatePaymentPrompt - A function that generates the payment message.
 * - GeneratePaymentPromptInput - The input type for the generatePaymentPrompt function.
 * - GeneratePaymentPromptOutput - The return type for the generatePaymentPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePaymentPromptInputSchema = z.object({
  selectedNumber: z.number().describe('The number selected by the user.'),
  pixKey: z.string().describe('The Pix key for payment.'),
  userName: z.string().describe('The name of the user making the reservation.'),
});

export type GeneratePaymentPromptInput = z.infer<typeof GeneratePaymentPromptInputSchema>;

const GeneratePaymentPromptOutputSchema = z.object({
  paymentMessage: z.string().describe('The generated payment message.'),
});

export type GeneratePaymentPromptOutput = z.infer<typeof GeneratePaymentPromptOutputSchema>;

export async function generatePaymentPrompt(input: GeneratePaymentPromptInput): Promise<GeneratePaymentPromptOutput> {
  return generatePaymentPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePaymentPromptPrompt',
  input: {schema: GeneratePaymentPromptInputSchema},
  output: {schema: GeneratePaymentPromptOutputSchema},
  prompt: `Olá {{userName}}, você selecionou o número {{selectedNumber}}. Para confirmar sua reserva, por favor, realize o pagamento via Pix usando a chave: {{pixKey}}. Após o pagamento, sua reserva será confirmada e o número será reservado em seu nome.`,
});

const generatePaymentPromptFlow = ai.defineFlow(
  {
    name: 'generatePaymentPromptFlow',
    inputSchema: GeneratePaymentPromptInputSchema,
    outputSchema: GeneratePaymentPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
