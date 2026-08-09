import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { stockMovementSchema } from '../validators/stock.validator';
import prisma from '../utils/prisma';
import { parsePagination } from '../utils/helpers';
import { AppError } from '../utils/AppError';
import { MovementType } from '@prisma/client';

const router = Router();

router.post('/movement', authenticate, authorize('ADMIN', 'WAREHOUSE'), validate(stockMovementSchema), async (req, res, next) => {
  try {
    const { productId, quantity, movementType, reason } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new AppError('Product not found', 404);

      if (movementType === MovementType.OUT) {
        if (product.currentStock < quantity) {
          throw new AppError(`Insufficient stock. Current stock: ${product.currentStock}`, 400);
        }
        await tx.product.update({
          where: { id: productId },
          data: { currentStock: { decrement: quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: productId },
          data: { currentStock: { increment: quantity } },
        });
      }

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantity,
          movementType,
          reason,
          createdBy: req.user!.id,
        },
      });

      return movement;
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/movements', authenticate, async (req, res, next) => {
  try {
    const { skip, take, page, limit } = parsePagination(req.query);
    const productId = req.query.productId as string;

    const where = productId ? { productId } : {};

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
          creator: { select: { name: true } },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        movements,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
