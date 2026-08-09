import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createChallanSchema } from '../validators/challan.validator';
import prisma from '../utils/prisma';
import { parsePagination, generateChallanNumber } from '../utils/helpers';
import { AppError } from '../utils/AppError';
import { ChallanStatus, MovementType } from '@prisma/client';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { skip, take, page, limit } = parsePagination(req.query);
    const status = req.query.status as ChallanStatus;

    const where = status ? { status } : {};

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { customerName: true, businessName: true } },
        },
      }),
      prisma.challan.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        challans,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const challan = await prisma.challan.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        customer: true,
        creator: { select: { name: true } },
      },
    });

    if (!challan) throw new AppError('Challan not found', 404);

    res.json({ success: true, data: challan });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('ADMIN', 'SALES'), validate(createChallanSchema), async (req, res, next) => {
  try {
    const { customerId, items, status } = req.body;
    
    // Validate customer
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new AppError('Customer not found', 404);

    const result = await prisma.$transaction(async (tx) => {
      let totalQuantity = 0;
      let totalAmount = 0;
      const challanItemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new AppError(`Product with id ${item.productId} not found`, 404);

        if (status === ChallanStatus.CONFIRMED) {
          if (product.currentStock < item.quantity) {
            throw new AppError(`Insufficient stock for product ${product.name}`, 400);
          }
          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: { decrement: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              quantity: item.quantity,
              movementType: MovementType.OUT,
              reason: `Challan generated`,
              createdBy: req.user!.id,
            },
          });
        }

        const lineTotal = Number(product.unitPrice) * item.quantity;
        totalQuantity += item.quantity;
        totalAmount += lineTotal;

        challanItemsData.push({
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          unitPrice: product.unitPrice,
          quantity: item.quantity,
          lineTotal,
        });
      }

      const challan = await tx.challan.create({
        data: {
          challanNumber: generateChallanNumber(),
          customerId,
          totalQuantity,
          totalAmount,
          status,
          createdBy: req.user!.id,
          items: {
            create: challanItemsData,
          },
        },
        include: { items: true },
      });

      return challan;
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/confirm', authenticate, authorize('ADMIN', 'SALES'), async (req, res, next) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id: req.params.id },
        include: { items: true },
      });

      if (!challan) throw new AppError('Challan not found', 404);
      if (challan.status !== ChallanStatus.DRAFT) throw new AppError('Only DRAFT challans can be confirmed', 400);

      for (const item of challan.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new AppError(`Product ${item.productName} not found`, 404);
        if (product.currentStock < item.quantity) throw new AppError(`Insufficient stock for ${product.name}`, 400);

        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: MovementType.OUT,
            reason: `Challan confirmed: ${challan.challanNumber}`,
            createdBy: req.user!.id,
          },
        });
      }

      const updatedChallan = await tx.challan.update({
        where: { id: challan.id },
        data: { status: ChallanStatus.CONFIRMED },
      });

      return updatedChallan;
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/cancel', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id: req.params.id },
        include: { items: true },
      });

      if (!challan) throw new AppError('Challan not found', 404);
      if (challan.status === ChallanStatus.CANCELLED) throw new AppError('Challan is already cancelled', 400);

      if (challan.status === ChallanStatus.CONFIRMED) {
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: MovementType.IN,
              reason: 'Challan cancelled',
              createdBy: req.user!.id,
            },
          });
        }
      }

      const updatedChallan = await tx.challan.update({
        where: { id: challan.id },
        data: { status: ChallanStatus.CANCELLED },
      });

      return updatedChallan;
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
