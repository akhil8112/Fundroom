import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCustomerSchema, updateCustomerSchema, followUpSchema } from '../validators/customer.validator';
import prisma from '../utils/prisma';
import { parsePagination } from '../utils/helpers';
import { AppError } from '../utils/AppError';
import { CustomerStatus, CustomerType } from '@prisma/client';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { skip, take, page, limit } = parsePagination(req.query);
    const search = req.query.search as string;
    const status = req.query.status as CustomerStatus;
    const type = req.query.type as CustomerType;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (status) where.status = status;
    if (type) where.customerType = type;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        customers,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { name: true } },
        followUps: {
          orderBy: { createdAt: 'desc' },
          include: { creator: { select: { name: true } } },
        },
      },
    });

    if (!customer) throw new AppError('Customer not found', 404);

    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('ADMIN', 'SALES'), validate(createCustomerSchema), async (req, res, next) => {
  try {
    const customer = await prisma.customer.create({
      data: {
        ...req.body,
        createdBy: req.user!.id,
      },
    });
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'SALES'), validate(updateCustomerSchema), async (req, res, next) => {
  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/follow-ups', authenticate, authorize('ADMIN', 'SALES'), validate(followUpSchema), async (req, res, next) => {
  try {
    const { notes, followUpDate } = req.body;
    const customerId = req.params.id;

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new AppError('Customer not found', 404);

    const followUp = await prisma.$transaction(async (tx) => {
      const newFollowUp = await tx.followUp.create({
        data: {
          customerId,
          notes,
          followUpDate,
          createdBy: req.user!.id,
        },
      });

      if (followUpDate) {
        await tx.customer.update({
          where: { id: customerId },
          data: { followUpDate },
        });
      }

      return newFollowUp;
    });

    res.status(201).json({ success: true, data: followUp });
  } catch (error) {
    next(error);
  }
});

export default router;
