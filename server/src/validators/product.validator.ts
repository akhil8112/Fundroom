import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  category: z.string().min(2),
  unitPrice: z.number().positive(),
  currentStock: z.number().int().nonnegative().default(0),
  minStockAlert: z.number().int().nonnegative().default(10),
  location: z.string().min(2),
});

export const updateProductSchema = createProductSchema.partial();
