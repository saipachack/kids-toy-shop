import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, adminOnly } from '../middlewares/auth';

const router = Router();

// Helper to format product images from DB
const formatProduct = (product: any) => {
  try {
    return {
      ...product,
      images: JSON.parse(product.images),
    };
  } catch (e) {
    return {
      ...product,
      images: [],
    };
  }
};

// GET all categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { nameEn: 'asc' },
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// POST new category (Admin Only)
router.post('/categories', authenticateToken, adminOnly, async (req: Request, res: Response) => {
  const { nameEn, nameTh, nameLa, slug } = req.body;

  if (!nameEn || !nameTh || !nameLa || !slug) {
    return res.status(400).json({ messageEn: 'All fields required', messageTh: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  try {
    const categoryExists = await prisma.category.findUnique({ where: { slug } });
    if (categoryExists) {
      return res.status(400).json({ messageEn: 'Category slug already exists', messageTh: 'มีสลักหมวดหมู่นี้แล้วในระบบ' });
    }

    const category = await prisma.category.create({
      data: { nameEn, nameTh, nameLa, slug },
    });

    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// GET all products with filtering, searching, and sorting
router.get('/', async (req: Request, res: Response) => {
  const { search, category, minPrice, maxPrice, sort, isBestSeller, isNewArrival } = req.query;

  try {
    const whereClause: any = {};

    // Text Search (EN or TH name/description)
    if (search) {
      const searchStr = String(search);
      whereClause.OR = [
        { nameEn: { contains: searchStr } },
        { nameTh: { contains: searchStr } },
        { nameLa: { contains: searchStr } },
        { descriptionEn: { contains: searchStr } },
        { descriptionTh: { contains: searchStr } },
        { descriptionLa: { contains: searchStr } },
      ];
    }

    // Category filter by slug
    if (category) {
      whereClause.category = { slug: String(category) };
    }

    // Price range bounds
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(String(minPrice));
      if (maxPrice) whereClause.price.lte = parseFloat(String(maxPrice));
    }

    // Special promotion tags
    if (isBestSeller === 'true') {
      whereClause.isBestSeller = true;
    }
    if (isNewArrival === 'true') {
      whereClause.isNewArrival = true;
    }

    // Sorting settings
    let orderBy: any = { createdAt: 'desc' }; // default: newest
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: { category: true },
      orderBy,
    });

    const formattedProducts = products.map(formatProduct);
    res.json(formattedProducts);
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// GET single product details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({ messageEn: 'Product not found', messageTh: 'ไม่พบสินค้าในระบบ' });
    }

    res.json(formatProduct(product));
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// POST new product (Admin Only)
router.post('/', authenticateToken, adminOnly, async (req: Request, res: Response) => {
  const { nameEn, nameTh, nameLa, descriptionEn, descriptionTh, descriptionLa, price, stock, categoryId, images, isBestSeller, isNewArrival } = req.body;

  if (!nameEn || !nameTh || !nameLa || price === undefined || stock === undefined || !categoryId) {
    return res.status(400).json({ messageEn: 'Required fields missing', messageTh: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
  }

  try {
    const product = await prisma.product.create({
      data: {
        nameEn,
        nameTh,
        nameLa,
        descriptionEn: descriptionEn || '',
        descriptionTh: descriptionTh || '',
        descriptionLa: descriptionLa || '',
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId,
        images: images ? JSON.stringify(images) : JSON.stringify([]),
        isBestSeller: !!isBestSeller,
        isNewArrival: !!isNewArrival,
      },
      include: { category: true },
    });

    res.status(201).json(formatProduct(product));
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// PUT update product (Admin Only)
router.put('/:id', authenticateToken, adminOnly, async (req: Request, res: Response) => {
  const { nameEn, nameTh, nameLa, descriptionEn, descriptionTh, descriptionLa, price, stock, categoryId, images, isBestSeller, isNewArrival } = req.body;

  try {
    const existingProduct = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existingProduct) {
      return res.status(404).json({ messageEn: 'Product not found', messageTh: 'ไม่พบสินค้าในระบบ' });
    }

    const updatedData: any = {};
    if (nameEn !== undefined) updatedData.nameEn = nameEn;
    if (nameTh !== undefined) updatedData.nameTh = nameTh;
    if (nameLa !== undefined) updatedData.nameLa = nameLa;
    if (descriptionEn !== undefined) updatedData.descriptionEn = descriptionEn;
    if (descriptionTh !== undefined) updatedData.descriptionTh = descriptionTh;
    if (descriptionLa !== undefined) updatedData.descriptionLa = descriptionLa;
    if (price !== undefined) updatedData.price = parseFloat(price);
    if (stock !== undefined) updatedData.stock = parseInt(stock);
    if (categoryId !== undefined) updatedData.categoryId = categoryId;
    if (images !== undefined) updatedData.images = JSON.stringify(images);
    if (isBestSeller !== undefined) updatedData.isBestSeller = !!isBestSeller;
    if (isNewArrival !== undefined) updatedData.isNewArrival = !!isNewArrival;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updatedData,
      include: { category: true },
    });

    res.json(formatProduct(product));
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

// DELETE product (Admin Only)
router.delete('/:id', authenticateToken, adminOnly, async (req: Request, res: Response) => {
  try {
    const existingProduct = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existingProduct) {
      return res.status(404).json({ messageEn: 'Product not found', messageTh: 'ไม่พบสินค้าในระบบ' });
    }

    await prisma.product.delete({
      where: { id: req.params.id },
    });

    res.json({ messageEn: 'Product deleted successfully', messageTh: 'ลบสินค้าเรียบร้อยแล้ว' });
  } catch (error: any) {
    res.status(500).json({ messageEn: error.message || 'Server error', messageTh: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
});

export default router;
