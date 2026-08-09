import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';
import prisma from '../utils/prisma';
import { parsePagination } from '../utils/helpers';
import { AppError } from '../utils/AppError';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { skip, take, page, limit } = parsePagination(req.query);
    const search = req.query.search as string;
    const category = req.query.category as string;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = category;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/low-stock', authenticate, async (req, res, next) => {
  try {
    const products = await prisma.$queryRaw`SELECT * FROM "Product" WHERE "currentStock" <= "minStockAlert" ORDER BY "currentStock" ASC`;
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { name: true } },
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          include: { creator: { select: { name: true } } },
        },
      },
    });

    if (!product) throw new AppError('Product not found', 404);

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('ADMIN', 'WAREHOUSE'), validate(createProductSchema), async (req, res, next) => {
  try {
    // Check if SKU exists
    const existing = await prisma.product.findUnique({ where: { sku: req.body.sku } });
    if (existing) throw new AppError('Product with this SKU already exists', 400);

    const product = await prisma.product.create({
      data: {
        ...req.body,
        createdBy: req.user!.id,
      },
    });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'WAREHOUSE'), validate(updateProductSchema), async (req, res, next) => {
  try {
    if (req.body.sku) {
      const existing = await prisma.product.findFirst({
        where: { sku: req.body.sku, id: { not: req.params.id } },
      });
      if (existing) throw new AppError('Another product with this SKU already exists', 400);
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

export default router;
