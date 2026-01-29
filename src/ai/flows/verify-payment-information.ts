//VerifyPaymentInformation
'use server';
/**
 * @fileOverview This file contains the Genkit flow for verifying payment information.
 *
 * - verifyPaymentInformation - A function that verifies the provided PIX key and WhatsApp number.
 * - VerifyPaymentInformationInput - The input type for the verifyPaymentInformation function.
 * - VerifyPaymentInformationOutput - The return type for the verifyPaymentInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyPaymentInformationInputSchema = z.object({
  pixKey: z
    .string()
    .describe('A chave PIX a ser verificada. Pode ser um e-mail, número de telefone, CPF/CNPJ ou chave aleatória.'),
  whatsappNumber:
    z.string().describe('O número do WhatsApp a ser verificado, incluindo o código do país.'),
});

export type VerifyPaymentInformationInput = z.infer<typeof VerifyPaymentInformationInputSchema>;

const VerifyPaymentInformationOutputSchema = z.object({
  isValidPixKey: z
    .boolean()
    .describe('Se a chave PIX é válida e está ativa.'),
  isValidWhatsappNumber: z
    .boolean()
    .describe('Se o número do WhatsApp é válido e está ativo.'),
  verificationResult: z
    .string()
    .describe('Uma explicação detalhada dos resultados da verificação para a chave PIX e o número do WhatsApp.'),
});

export type VerifyPaymentInformationOutput = z.infer<typeof VerifyPaymentInformationOutputSchema>;

export async function verifyPaymentInformation(
  input: VerifyPaymentInformationInput
): Promise<VerifyPaymentInformationOutput> {
  return verifyPaymentInformationFlow(input);
}

const verifyPaymentInformationPrompt = ai.definePrompt({
  name: 'verifyPaymentInformationPrompt',
  input: {schema: VerifyPaymentInformationInputSchema},
  output: {schema: VerifyPaymentInformationOutputSchema},
  prompt: `Você é um agente especialista em verificação de pagamentos. Sua tarefa é determinar se a chave PIX e o número de WhatsApp fornecidos são válidos e estão ativos. Forneça explicações detalhadas para sua determinação.

  Chave PIX: {{{pixKey}}}
  Número do WhatsApp: {{{whatsappNumber}}}

  Considere vários formatos de chave PIX (email, telefone, CPF/CNPJ, chave aleatória) e formatos de número de WhatsApp (incluindo o código do país).
  Avalie se a chave PIX provavelmente está registrada e ativa no sistema PIX brasileiro.
  Avalie se o número do WhatsApp é uma conta válida e ativa do WhatsApp.

  Apresente suas conclusões no seguinte formato JSON:
  {
    "isValidPixKey": true or false,
    "isValidWhatsappNumber": true or false,
    "verificationResult": "Explicação detalhada dos resultados da verificação."
  }`,
});

const verifyPaymentInformationFlow = ai.defineFlow(
  {
    name: 'verifyPaymentInformationFlow',
    inputSchema: VerifyPaymentInformationInputSchema,
    outputSchema: VerifyPaymentInformationOutputSchema,
  },
  async input => {
    const {output} = await verifyPaymentInformationPrompt(input);
    return output!;
  }
);
