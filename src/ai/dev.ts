import { config } from 'dotenv';
config();

import '@/ai/flows/generate-payment-prompt.ts';
import '@/ai/flows/verify-payment-information.ts';