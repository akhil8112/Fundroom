import { PrismaClient, Role, CustomerType, CustomerStatus, MovementType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // 1. Create Users
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@erp.com' },
    update: {},
    create: {
      email: 'admin@erp.com',
      name: 'Admin User',
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  const sales = await prisma.user.upsert({
    where: { email: 'sales@erp.com' },
    update: {},
    create: {
      email: 'sales@erp.com',
      name: 'Sales User',
      password: passwordHash,
      role: Role.SALES,
    },
  });

  const warehouse = await prisma.user.upsert({
    where: { email: 'warehouse@erp.com' },
    update: {},
    create: {
      email: 'warehouse@erp.com',
      name: 'Warehouse User',
      password: passwordHash,
      role: Role.WAREHOUSE,
    },
  });

  const accounts = await prisma.user.upsert({
    where: { email: 'accounts@erp.com' },
    update: {},
    create: {
      email: 'accounts@erp.com',
      name: 'Accounts User',
      password: passwordHash,
      role: Role.ACCOUNTS,
    },
  });

  console.log('Users created.');

  // 2. Create Customers
  const customersData = [
    { customerName: 'John Doe', mobile: '1234567890', email: 'john@example.com', businessName: 'JD Retail', customerType: CustomerType.RETAIL, address: '123 Main St', status: CustomerStatus.ACTIVE },
    { customerName: 'Jane Smith', mobile: '0987654321', email: 'jane@example.com', businessName: 'JS Wholesale', customerType: CustomerType.WHOLESALE, address: '456 Market St', status: CustomerStatus.ACTIVE },
    { customerName: 'Bob Johnson', mobile: '1122334455', email: 'bob@example.com', businessName: 'BJ Dist', customerType: CustomerType.DISTRIBUTOR, address: '789 Warehouse Rd', status: CustomerStatus.INACTIVE },
    { customerName: 'Alice Brown', mobile: '5544332211', email: 'alice@example.com', businessName: 'AB Retail', customerType: CustomerType.RETAIL, address: '321 Side St', status: CustomerStatus.LEAD },
    { customerName: 'Charlie Davis', mobile: '6677889900', email: 'charlie@example.com', businessName: 'CD Wholesale', customerType: CustomerType.WHOLESALE, address: '654 Back St', status: CustomerStatus.LEAD },
    { customerName: 'Diana Prince', mobile: '9988776655', email: 'diana@example.com', businessName: 'DP Dist', customerType: CustomerType.DISTRIBUTOR, address: '987 Front St', status: CustomerStatus.ACTIVE },
    { customerName: 'Evan Wright', mobile: '1112223333', email: 'evan@example.com', businessName: 'EW Retail', customerType: CustomerType.RETAIL, address: '111 First St', status: CustomerStatus.ACTIVE },
    { customerName: 'Fiona Green', mobile: '4445556666', email: 'fiona@example.com', businessName: 'FG Wholesale', customerType: CustomerType.WHOLESALE, address: '222 Second St', status: CustomerStatus.INACTIVE },
    { customerName: 'George King', mobile: '7778889999', email: 'george@example.com', businessName: 'GK Dist', customerType: CustomerType.DISTRIBUTOR, address: '333 Third St', status: CustomerStatus.LEAD },
    { customerName: 'Hannah Scott', mobile: '0009998888', email: 'hannah@example.com', businessName: 'HS Retail', customerType: CustomerType.RETAIL, address: '444 Fourth St', status: CustomerStatus.ACTIVE },
  ];

  const customers = [];
  for (const c of customersData) {
    const customer = await prisma.customer.create({
      data: { ...c, createdBy: sales.id },
    });
    customers.push(customer);
  }

  console.log('Customers created.');

  // 3. Create Products and Stock Movements
  const productsData = [
    { name: 'Laptop Pro', sku: 'ELEC-001', category: 'Electronics', unitPrice: 1200.0, currentStock: 50, minStockAlert: 10, location: 'A1' },
    { name: 'Smartphone X', sku: 'ELEC-002', category: 'Electronics', unitPrice: 800.0, currentStock: 5, minStockAlert: 15, location: 'A2' }, // Low stock
    { name: 'Wireless Mouse', sku: 'ELEC-003', category: 'Electronics', unitPrice: 25.0, currentStock: 100, minStockAlert: 20, location: 'A3' },
    { name: 'Mechanical Keyboard', sku: 'ELEC-004', category: 'Electronics', unitPrice: 75.0, currentStock: 40, minStockAlert: 10, location: 'A4' },
    { name: 'HD Monitor', sku: 'ELEC-005', category: 'Electronics', unitPrice: 200.0, currentStock: 8, minStockAlert: 10, location: 'A5' }, // Low stock
    { name: 'Hammer', sku: 'HARD-001', category: 'Hardware', unitPrice: 15.0, currentStock: 200, minStockAlert: 50, location: 'B1' },
    { name: 'Screwdriver Set', sku: 'HARD-002', category: 'Hardware', unitPrice: 20.0, currentStock: 150, minStockAlert: 30, location: 'B2' },
    { name: 'Drill Machine', sku: 'HARD-003', category: 'Hardware', unitPrice: 100.0, currentStock: 25, minStockAlert: 10, location: 'B3' },
    { name: 'Nails Pack', sku: 'HARD-004', category: 'Hardware', unitPrice: 5.0, currentStock: 500, minStockAlert: 100, location: 'B4' },
    { name: 'Wrench', sku: 'HARD-005', category: 'Hardware', unitPrice: 12.0, currentStock: 4, minStockAlert: 10, location: 'B5' }, // Low stock
    { name: 'A4 Paper Ream', sku: 'OFF-001', category: 'Office Supplies', unitPrice: 8.0, currentStock: 300, minStockAlert: 50, location: 'C1' },
    { name: 'Pens Box', sku: 'OFF-002', category: 'Office Supplies', unitPrice: 10.0, currentStock: 200, minStockAlert: 40, location: 'C2' },
    { name: 'Stapler', sku: 'OFF-003', category: 'Office Supplies', unitPrice: 15.0, currentStock: 60, minStockAlert: 20, location: 'C3' },
    { name: 'Whiteboard', sku: 'OFF-004', category: 'Office Supplies', unitPrice: 50.0, currentStock: 15, minStockAlert: 5, location: 'C4' },
    { name: 'Office Chair', sku: 'OFF-005', category: 'Office Supplies', unitPrice: 150.0, currentStock: 2, minStockAlert: 10, location: 'C5' }, // Low stock
  ];

  for (const p of productsData) {
    const product = await prisma.product.create({
      data: { ...p, createdBy: warehouse.id },
    });

    // Create initial stock movement
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        quantity: product.currentStock,
        movementType: MovementType.IN,
        reason: 'Initial Stock',
        createdBy: warehouse.id,
      },
    });
  }

  console.log('Products and Stock Movements created.');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
