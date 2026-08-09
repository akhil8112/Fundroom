import { z } from 'zod';
import { ChallanStatus } from '@prisma/client';

export const createChallanSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1),
  status: z.nativeEnum(ChallanStatus).optional().default(ChallanStatus.DRAFT),
});
