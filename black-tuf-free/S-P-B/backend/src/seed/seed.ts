import mongoose from 'mongoose';
import User from '../models/User';
import Seller from '../models/Seller';
import SellerWallet from '../models/SellerWallet';
import Category from '../models/Category';
import Product from '../models/Product';
import Coupon from '../models/Coupon';
import Review from '../models/Review';
import Order from '../models/Order';
import { hashPassword } from '../utils/auth';
import { generateSlug } from '../utils/slug';
import config from '../config/index';

const connect = async () => {
  await mongoose.connect(config.mongoUri);
  console.log('[seed] Connected to MongoDB');
};

const disconnect = async () => {
  await mongoose.disconnect();
  console.log('[seed] Disconnected');
};

const main = async () => {
  await connect();

  await User.deleteMany({});
  await Seller.deleteMany({});
  await SellerWallet.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Coupon.deleteMany({});
  await Review.deleteMany({});
  await Order.deleteMany({});

  const admin = await User.create({
    name: 'Black Tuf Admin',
    email: config.admin.email,
    password: await hashPassword(config.admin.password),
    role: 'admin',
    emailVerified: true,
    isActive: true
  });

  const customer = await User.create({
    name: 'Demo Customer',
    email: 'customer@blacktuf.com',
    password: await hashPassword('Customer@123'),
    role: 'customer',
    emailVerified: true
  });

  const sellerUser = await User.create({
    name: 'Tech Store',
    email: 'techstore@blacktuf.com',
    password: await hashPassword('Seller@123'),
    role: 'seller',
    emailVerified: true
  });

  const seller = await Seller.create({
    user: sellerUser._id,
    storeName: 'TechStore',
    storeDescription: 'Premium electronics and gadgets',
    businessType: 'private_limited',
    businessAddress: '123 Tech Street, Bengaluru',
    phone: '9876543210',
    taxId: 'GSTIN1234567890',
    status: 'approved',
    isApproved: true,
    approvedAt: new Date()
  });
  sellerUser.seller = seller._id;
  await sellerUser.save();
  await SellerWallet.create({ seller: seller._id, availableBalance: 0, pendingBalance: 0 });

  const categories = [];
  const catData = [
    { name: 'Electronics', slug: 'electronics', order: 1 },
    { name: 'Mobiles', slug: 'mobiles', order: 1 },
    { name: 'Smartphones', slug: 'smartphones', order: 1 },
    { name: 'Laptops', slug: 'laptops', order: 2 },
    { name: 'Fashion', slug: 'fashion', order: 2 },
    { name: 'Men\'s Clothing', slug: 'mens-clothing', order: 1 },
    { name: 'Women\'s Clothing', slug: 'womens-clothing', order: 2 },
    { name: 'Home & Kitchen', slug: 'home-kitchen', order: 3 },
    { name: 'Books', slug: 'books', order: 4 }
  ];
  for (const c of catData) {
    const cat = await Category.create(c);
    categories.push(cat);
  }

  const smartphoneCat = categories.find((c) => c.slug === 'smartphones')!;
  const laptopCat = categories.find((c) => c.slug === 'laptops')!;
  const mensCat = categories.find((c) => c.slug === 'mens-clothing')!;

  const products = await Product.insertMany([
    {
      name: 'NexPhone X1',
      slug: 'nexphone-x1',
      description: 'A powerful smartphone with stunning display and long battery life.',
      shortDescription: '6.5" AMOLED, 128GB, 5000mAh',
      brand: 'NexPhone',
      category: smartphoneCat._id,
      seller: seller._id,
      images: ['https://via.placeholder.com/500x500/4B5563/FFFFFF?text=NexPhone+X1'],
      price: 29999,
      compareAtPrice: 34999,
      discount: 14,
      tax: 18,
      sku: 'NPX1-128',
      stock: 150,
      minimumOrderQuantity: 1,
      weight: 0.2,
      dimensions: { length: 16, width: 8, height: 1 },
      specifications: { color: 'Midnight Black', storage: '128GB', ram: '8GB' },
      tags: ['smartphone', 'mobile', 'nexphone'],
      warranty: '1 year manufacturer warranty',
      returnPolicy: '10 days return policy',
      shippingInfo: 'Free shipping across India',
      ratings: 4.5,
      reviewCount: 120,
      status: 'published',
      approvalStatus: 'approved',
      isFeatured: true,
      variantCombinations: [
        { sku: 'NPX1-128-BLK', price: 29999, stock: 60, optionValue: 'Color:Black,Storage:128GB', images: ['https://via.placeholder.com/500x500/4B5563/FFFFFF?text=NexPhone+X1+Black'] },
        { sku: 'NPX1-128-WHT', price: 29999, stock: 90, optionValue: 'Color:White,Storage:128GB', images: ['https://via.placeholder.com/500x500/F3F4F6/000000?text=NexPhone+X1+White'] }
      ]
    },
    {
      name: 'NexBook Pro 14',
      slug: 'nexbook-pro-14',
      description: 'Thin and light laptop perfect for professionals.',
      shortDescription: 'Intel i7, 16GB RAM, 512GB SSD',
      brand: 'NexBook',
      category: laptopCat._id,
      seller: seller._id,
      images: ['https://via.placeholder.com/500x500/1F2937/FFFFFF?text=NexBook+Pro'],
      price: 119999,
      compareAtPrice: 134999,
      discount: 11,
      tax: 18,
      sku: 'NBP-14',
      stock: 80,
      minimumOrderQuantity: 1,
      weight: 1.4,
      specifications: { color: 'Space Gray', ram: '16GB', storage: '512GB SSD' },
      tags: ['laptop', 'notebook', 'nexbook'],
      warranty: '2 year warranty',
      returnPolicy: '10 days return policy',
      shippingInfo: 'Free shipping',
      ratings: 4.7,
      reviewCount: 85,
      status: 'published',
      approvalStatus: 'approved'
    },
    {
      name: 'Classic Cotton T-Shirt',
      slug: 'classic-cotton-tshirt',
      description: 'Premium combed cotton t-shirt, available in multiple colors.',
      shortDescription: '100% combed cotton, regular fit',
      brand: 'ThreadVibe',
      category: mensCat._id,
      seller: seller._id,
      images: ['https://via.placeholder.com/500x500/E5E7EB/000000?text=T-Shirt'],
      price: 799,
      compareAtPrice: 1299,
      discount: 38,
      tax: 12,
      sku: 'CV-TS-001',
      stock: 500,
      minimumOrderQuantity: 1,
      maximumOrderQuantity: 5,
      weight: 0.2,
      specifications: { fabric: '100% Cotton', fit: 'Regular', length: 'Regular' },
      tags: ['tshirt', 'cotton', 'mens', 'tshirt'],
      warranty: '30 days return',
      returnPolicy: '15 days return',
      shippingInfo: 'Ships in 2 days',
      ratings: 4.2,
      reviewCount: 200,
      status: 'published',
      approvalStatus: 'approved'
    }
  ]);

  await Coupon.create({
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    description: '10% off on first order',
    startDate: new Date(),
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    minOrderValue: 499,
    maxDiscount: 500,
    usageLimit: 1000,
    scope: 'global',
    isActive: true
  });

  await Coupon.create({
    code: 'TECH15',
    type: 'percentage',
    value: 15,
    description: '15% off on TechStore products',
    startDate: new Date(),
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    minOrderValue: 1000,
    maxDiscount: 2000,
    usageLimit: 500,
    scope: 'seller',
    seller: seller._id,
    isActive: true
  });

  await Review.create({
    product: products[0]._id,
    customer: customer._id,
    order: new mongoose.Types.ObjectId(),
    rating: 5,
    title: 'Amazing phone!',
    comment: 'This phone is incredible. Battery lasts all day and the camera is excellent.',
    isVerifiedPurchase: true,
    status: 'approved'
  });

  console.log('[seed] Database seeded successfully');
  console.log('[seed] Admin email:', config.admin.email, '| password:', config.admin.password);
  console.log('[seed] Customer email: customer@blacktuf.com | password: Customer@123');
  console.log('[seed] Seller email: techstore@blacktuf.com | password: Seller@123');

  await disconnect();
};

main().catch((err) => {
  console.error('[seed] Error:', err);
  process.exit(1);
});


