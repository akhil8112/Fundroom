import { z } from 'zod';
import { CustomerType, CustomerStatus } from '@prisma/client';

export const createCustomerSchema = z.object({
  customerName: z.string().min(2),
  mobile: z.string().min(10),
  email: z.string().email(),
  businessName: z.string().min(2),
  gstNumber: z.string().optional(),
  customerType: z.nativeEnum(CustomerType),
  address: z.string().min(5),
  status: z.nativeEnum(CustomerStatus).optional().default(CustomerStatus.LEAD),
  followUpDate: z.string().optional().transform(v => v ? new Date(v) : undefined),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const followUpSchema = z.object({
  notes: z.string().min(1),
  followUpDate: z.string().optional().transform(v => v ? new Date(v) : undefined),
});
