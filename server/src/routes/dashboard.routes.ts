import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../utils/prisma';
import { CustomerStatus, ChallanStatus } from '@prisma/client';

const router = Router();

router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const [
      totalCustomers,
      activeCustomers,
      totalProducts,
      lowStockCount,
      pendingChallans,
      totalChallans,
      recentChallans,
      recentCustomers,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: CustomerStatus.ACTIVE } }),
      prisma.product.count(),
      prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*)::bigint as count FROM "Product" WHERE "currentStock" <= "minStockAlert"`.then(r => Number(r[0].count)),
      prisma.challan.count({ where: { status: ChallanStatus.DRAFT } }),
      prisma.challan.count(),
      prisma.challan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { customerName: true } } },
      }),
      prisma.customer.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        totalProducts,
        lowStockCount,
        pendingChallans,
        totalChallans,
        recentChallans,
        recentCustomers,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
