export interface Shade {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  brandId: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  shades: Shade[];
  rating: number;
  reviewCount: number;
  distance: string;
  pickupAvailable: boolean;
  sameDayDelivery: boolean;
  tags: string[];
  skinTypes?: string[];
  inStock: boolean;
}

export interface Seller {
  id: string;
  name: string;
  tagline: string;
  image: string;
  logo: string;
  rating: number;
  reviewCount: number;
  distance: string;
  verified: boolean;
  categories: string[];
  tags: string[];
  productCount: number;
  area: string;
}

export interface LiveSession {
  id: string;
  title: string;
  host: string;
  hostImage: string;
  thumbnail: string;
  startTime: string;
  isLive: boolean;
  viewers?: number;
  products: number;
}

export interface Deal {
  id: string;
  productName: string;
  brand: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  endsIn: string;
  discount: number;
}

export interface Review {
  id: string;
  author: string;
  skinTone: string;
  skinType: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
}

export const formatPrice = (amount: number) => `${amount.toFixed(1)} KD`;

export const categories = [
  { name: 'Skincare', icon: '✨', count: 324, color: '#E8D5B7' },
  { name: 'Makeup', icon: '💄', count: 512, color: '#D4536D' },
  { name: 'Haircare', icon: '💇', count: 198, color: '#8B6F47' },
  { name: 'Fragrance', icon: '🌸', count: 87, color: '#C9A0DC' },
  { name: 'Tools', icon: '🖌️', count: 145, color: '#B8B8B8' },
  { name: 'Salon Services', icon: '💅', count: 76, color: '#F0A0A0' },
];

export const kuwaitAreas = [
  'Salmiya', 'Hawalli', 'Kuwait City', 'Sharq', 'Jabriya',
  'Mishref', 'Mangaf', 'Fintas', 'Fahaheel', 'Sabah Al-Salem',
  'Bayan', 'Rumaithiya', 'Bneid Al-Gar', 'Avenues Mall', 'The Gate Mall',
];

export const products: Product[] = [
  {
    id: '1', name: 'Velvet Matte Lipstick', brand: 'Nūra Beauty', brandId: 's1',
    price: 7.5, originalPrice: 9.9, category: 'Makeup',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
    shades: [
      { name: 'Desert Rose', hex: '#C4626A' }, { name: 'Nude Sand', hex: '#C8967B' },
      { name: 'Berry Oud', hex: '#7B2D4E' }, { name: 'Coral Sunset', hex: '#E8735A' },
      { name: 'Deep Kohl', hex: '#4A1942' },
    ],
    rating: 4.8, reviewCount: 234, distance: '1.2 km', pickupAvailable: true,
    sameDayDelivery: true, tags: ['Clean Beauty', 'Cruelty-Free'], skinTypes: ['All'], inStock: true,
  },
  {
    id: '2', name: 'Saffron Glow Serum', brand: 'Bāsha Botanics', brandId: 's2',
    price: 12.0, category: 'Skincare',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    shades: [],
    rating: 4.9, reviewCount: 189, distance: '2.0 km', pickupAvailable: true,
    sameDayDelivery: false, tags: ['Clean Beauty', 'Vegan', 'Dermatologist Tested'], skinTypes: ['Dry', 'Normal'], inStock: true,
  },
  {
    id: '3', name: 'Silk Foundation SPF 30', brand: 'Layla Cosmetics', brandId: 's3',
    price: 13.5, category: 'Makeup',
    image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&h=400&fit=crop',
    shades: [
      { name: 'Porcelain', hex: '#F5E0D0' }, { name: 'Sand', hex: '#D4B896' },
      { name: 'Honey', hex: '#C49A6C' }, { name: 'Caramel', hex: '#A67B5B' },
      { name: 'Espresso', hex: '#6B4226' }, { name: 'Deep Mahogany', hex: '#4A2C17' },
    ],
    rating: 4.7, reviewCount: 312, distance: '3.5 km', pickupAvailable: false,
    sameDayDelivery: true, tags: ['Dermatologist Tested'], skinTypes: ['All'], inStock: true,
  },
  {
    id: '4', name: 'Hydra Moisturizer', brand: 'Ward Skincare', brandId: 's4',
    price: 9.0, category: 'Skincare',
    image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=400&fit=crop',
    shades: [],
    rating: 4.6, reviewCount: 156, distance: '0.8 km', pickupAvailable: true,
    sameDayDelivery: true, tags: ['Clean Beauty', 'Cruelty-Free'], skinTypes: ['Oily', 'Combination'], inStock: true,
  },
  {
    id: '5', name: 'Brow Sculpt Pencil', brand: 'Nūra Beauty', brandId: 's1',
    price: 5.5, category: 'Makeup',
    image: 'https://images.unsplash.com/photo-1631214500115-598fc2cb8ada?w=400&h=400&fit=crop',
    shades: [
      { name: 'Blonde', hex: '#C8A87C' }, { name: 'Brunette', hex: '#6B4226' },
      { name: 'Dark Brown', hex: '#3E2723' }, { name: 'Black', hex: '#1A1A1A' },
    ],
    rating: 4.5, reviewCount: 98, distance: '1.2 km', pickupAvailable: true,
    sameDayDelivery: true, tags: ['Cruelty-Free'], inStock: true,
  },
  {
    id: '6', name: 'Argan & Rose Hair Oil', brand: 'Bāsha Botanics', brandId: 's2',
    price: 8.0, category: 'Haircare',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop',
    shades: [],
    rating: 4.7, reviewCount: 67, distance: '2.0 km', pickupAvailable: true,
    sameDayDelivery: false, tags: ['Clean Beauty', 'Vegan'], inStock: true,
  },
  {
    id: '7', name: 'Luminous Highlighter', brand: 'Layla Cosmetics', brandId: 's3',
    price: 8.5, originalPrice: 11.0, category: 'Makeup',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
    shades: [
      { name: 'Moonlit', hex: '#F5E6D3' }, { name: 'Golden Hour', hex: '#D4A76A' },
      { name: 'Bronze Glow', hex: '#B8860B' },
    ],
    rating: 4.8, reviewCount: 145, distance: '3.5 km', pickupAvailable: false,
    sameDayDelivery: true, tags: ['Cruelty-Free'], inStock: true,
  },
  {
    id: '8', name: 'Desert Clay Mask', brand: 'Ward Skincare', brandId: 's4',
    price: 6.9, category: 'Skincare',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
    shades: [],
    rating: 4.4, reviewCount: 203, distance: '0.8 km', pickupAvailable: true,
    sameDayDelivery: true, tags: ['Clean Beauty', 'Vegan'], skinTypes: ['Oily'], inStock: true,
  },
];

export const sellers: Seller[] = [
  {
    id: 's1', name: 'Nūra Beauty', tagline: 'Handcrafted color cosmetics for every skin tone',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=400&fit=crop',
    logo: '🌙', rating: 4.8, reviewCount: 432, distance: '1.2 km', verified: true,
    categories: ['Makeup', 'Tools'], tags: ['Clean Beauty', 'Cruelty-Free'], productCount: 45,
    area: 'Salmiya',
  },
  {
    id: 's2', name: 'Bāsha Botanics', tagline: 'Plant-powered skincare, locally formulated in Kuwait',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=400&fit=crop',
    logo: '🌿', rating: 4.9, reviewCount: 289, distance: '2.0 km', verified: true,
    categories: ['Skincare', 'Haircare'], tags: ['Clean Beauty', 'Vegan', 'Dermatologist Tested'], productCount: 32,
    area: 'Hawalli',
  },
  {
    id: 's3', name: 'Layla Cosmetics', tagline: 'Foundation matching experts — your perfect shade, guaranteed',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop',
    logo: '🎨', rating: 4.7, reviewCount: 567, distance: '3.5 km', verified: true,
    categories: ['Makeup', 'Salon Services'], tags: ['Dermatologist Tested'], productCount: 78,
    area: 'Sharq',
  },
  {
    id: 's4', name: 'Ward Skincare', tagline: 'Clean skincare rituals inspired by Gulf botanicals',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop',
    logo: '🌹', rating: 4.6, reviewCount: 198, distance: '0.8 km', verified: true,
    categories: ['Skincare'], tags: ['Clean Beauty', 'Cruelty-Free'], productCount: 24,
    area: 'Jabriya',
  },
];

export const liveSessions: LiveSession[] = [
  {
    id: 'l1', title: 'Eid Glam Makeup Tutorial', host: 'Fatima Al-Rashidi, MUA',
    hostImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300&fit=crop',
    startTime: 'Live Now', isLive: true, viewers: 234, products: 8,
  },
  {
    id: 'l2', title: 'Summer Skincare for Hot Climate', host: 'Dr. Hessa Al-Mutairi',
    hostImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop',
    startTime: 'Today, 8:00 PM', isLive: false, products: 5,
  },
  {
    id: 'l3', title: 'Bridal Henna & Glow Prep', host: 'Sara Al-Enezi',
    hostImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop',
    startTime: 'Tomorrow, 5:00 PM', isLive: false, products: 12,
  },
];

export const deals: Deal[] = [
  { id: 'd1', productName: 'Velvet Matte Lipstick', brand: 'Nūra Beauty', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=300&fit=crop', originalPrice: 9.9, salePrice: 7.5, endsIn: '2h 15m', discount: 25 },
  { id: 'd2', productName: 'Luminous Highlighter', brand: 'Layla Cosmetics', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop', originalPrice: 11.0, salePrice: 8.5, endsIn: '5h 30m', discount: 23 },
  { id: 'd3', productName: 'Oud Rose Perfume Oil', brand: 'Ward Skincare', image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=300&h=300&fit=crop', originalPrice: 14.0, salePrice: 9.0, endsIn: '1d 8h', discount: 36 },
];

export const reviews: Review[] = [
  { id: 'r1', author: 'Noura A.', skinTone: 'Medium-Deep', skinType: 'Combination', rating: 5, text: 'This lipstick is incredible — the shade Desert Rose is my perfect everyday color. Lasts all day even in Kuwait heat!', date: '2026-06-20', helpful: 34 },
  { id: 'r2', author: 'Hala M.', skinTone: 'Fair', skinType: 'Dry', rating: 4, text: 'Beautiful formula but I wish there were more nude shades for lighter skin tones. The Berry Oud is stunning though.', date: '2026-06-15', helpful: 12 },
  { id: 'r3', author: 'Fatima S.', skinTone: 'Deep', skinType: 'Oily', rating: 5, text: 'Finally a local brand that makes shades for deeper skin tones! The Deep Kohl is perfection. No transfer on my abaya.', date: '2026-06-10', helpful: 45 },
  { id: 'r4', author: 'Mariam K.', skinTone: 'Medium', skinType: 'Normal', rating: 5, text: 'The saffron serum literally transformed my skin. My dark spots faded in 2 weeks. Supporting a local Kuwaiti brand is a bonus!', date: '2026-06-05', helpful: 67 },
  { id: 'r5', author: 'Dana R.', skinTone: 'Light-Medium', skinType: 'Sensitive', rating: 4, text: 'Great foundation match for my undertone. Lightweight and doesn\'t break me out. SPF 30 is perfect for our sun.', date: '2026-05-28', helpful: 23 },
];

export const blogPosts = [
  { id: 'b1', title: 'The Ultimate Summer Skincare Routine for Kuwait\'s Heat', excerpt: 'How to keep your skin hydrated and protected when temperatures hit 50°C.', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=400&fit=crop', date: '2026-07-01', category: 'Skincare', readTime: '5 min' },
  { id: 'b2', title: 'How to Find Your Perfect Foundation Shade', excerpt: 'A step-by-step guide to matching your undertone to the right foundation from local brands.', image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600&h=400&fit=crop', date: '2026-06-25', category: 'Makeup', readTime: '7 min' },
  { id: 'b3', title: 'Clean Beauty: What It Really Means', excerpt: 'Decoding clean beauty labels and finding genuinely safe products from Kuwaiti brands.', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=400&fit=crop', date: '2026-06-18', category: 'Guide', readTime: '4 min' },
  { id: 'b4', title: 'Eid Makeup Looks from Local MUAs', excerpt: 'Four stunning Eid-ready looks created by Kuwait\'s best makeup artists, using all local products.', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=400&fit=crop', date: '2026-06-10', category: 'Makeup', readTime: '6 min' },
  { id: 'b5', title: 'Haircare Tips for Humid Gulf Weather', excerpt: 'Keep your hair smooth and frizz-free with these expert tips and local product picks.', image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&h=400&fit=crop', date: '2026-06-02', category: 'Haircare', readTime: '5 min' },
];

export const testimonials = [
  { name: 'Noura A.', role: 'Shopper — Salmiya', text: 'Finally found a foundation that matches my skin perfectly — and I picked it up same day from a shop in Hawalli!', skinTone: 'Medium-Deep', avatar: '🧕' },
  { name: 'Dalal K.', role: 'Indie Brand Owner — Sharq', text: 'GlowMe tripled my local sales in 3 months. The marketing tools are amazing for a small Kuwaiti brand.', avatar: '👩‍🎨' },
  { name: 'Mariam H.', role: 'Shopper — Jabriya', text: "I love filtering reviews by skin type. Kuwait's heat means I need products tested for our climate — this app gets it.", skinTone: 'Medium', avatar: '👩🏽' },
];
