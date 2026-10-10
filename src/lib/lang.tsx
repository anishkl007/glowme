import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Lang = 'en' | 'ar';

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LangContext = createContext<LangContextType>({
  lang: 'en', setLang: () => {}, t: (k) => k, dir: 'ltr',
});

export const useLang = () => useContext(LangContext);

const translations: Record<string, Record<Lang, string>> = {
  // Navbar
  'nav.discover': { en: 'Discover', ar: 'اكتشف' },
  'nav.categories': { en: 'Categories', ar: 'الأقسام' },
  'nav.brands': { en: 'Local Brands', ar: 'علامات محلية' },
  'nav.live': { en: 'Live', ar: 'بث مباشر' },
  'nav.deals': { en: 'Deals', ar: 'عروض' },
  'nav.quiz': { en: 'Shade Quiz', ar: 'اختبار الدرجة' },
  'nav.seller': { en: 'Become a Seller', ar: 'كن بائعاً' },

  // Hero
  'hero.badge': { en: 'Discover Local Beauty in Kuwait', ar: 'اكتشفي جمال الكويت المحلي' },
  'hero.title': { en: 'Beauty, from the block you live on.', ar: 'الجمال، من الحي اللي تعيشين فيه.' },
  'hero.subtitle': { en: 'Find indie cosmetics brands, boutiques, salons, and makeup artists across Kuwait. Real products, real people, same-day delivery.', ar: 'اكتشفي ماركات التجميل المحلية، البوتيكات، الصالونات، وفنانات المكياج في الكويت. منتجات حقيقية، ناس حقيقيين، توصيل نفس اليوم.' },
  'hero.placeholder': { en: 'e.g. Salmiya, Hawalli, Kuwait City', ar: 'مثلاً: السالمية، حولي، مدينة الكويت' },
  'hero.cta': { en: 'Discover', ar: 'اكتشف' },

  // Categories
  'cat.title': { en: 'Shop by Category', ar: 'تسوقي حسب القسم' },
  'cat.subtitle': { en: 'Everything beauty, all from your neighborhood in Kuwait.', ar: 'كل ما يخص الجمال، من جيرانك في الكويت.' },
  'cat.viewAll': { en: 'View all', ar: 'عرض الكل' },
  'cat.products': { en: 'products', ar: 'منتج' },
  'cat.skincare': { en: 'Skincare', ar: 'عناية بالبشرة' },
  'cat.makeup': { en: 'Makeup', ar: 'مكياج' },
  'cat.haircare': { en: 'Haircare', ar: 'عناية بالشعر' },
  'cat.fragrance': { en: 'Fragrance', ar: 'عطور' },
  'cat.tools': { en: 'Tools', ar: 'أدوات' },
  'cat.salon': { en: 'Salon Services', ar: 'خدمات صالون' },

  // Trending
  'trending.title': { en: 'Trending Near You', ar: 'الأكثر رواجاً قربك' },
  'trending.subtitle': { en: 'Top-rated products from local sellers across Kuwait.', ar: 'أعلى المنتجات تقييماً من بائعين محليين في الكويت.' },
  'trending.seeAll': { en: 'See all', ar: 'عرض الكل' },

  // Deals
  'deals.title': { en: 'Flash Deals', ar: 'عروض سريعة' },
  'deals.subtitle': { en: 'Limited-time offers from Kuwaiti sellers.', ar: 'عروض لفترة محدودة من بائعين كويتيين.' },
  'deals.allDeals': { en: 'All deals', ar: 'كل العروض' },
  'deals.endsIn': { en: 'Ends in', ar: 'ينتهي خلال' },

  // Live
  'live.title': { en: 'Live & Tutorials', ar: 'بث مباشر ودروس' },
  'live.subtitle': { en: 'Watch, learn, and shop — all at once.', ar: 'شاهدي، تعلمي، وتسوقي — كلها مرة وحدة.' },
  'live.seeAll': { en: 'See all', ar: 'عرض الكل' },
  'live.watching': { en: 'watching', ar: 'يشاهدون' },
  'live.products': { en: 'products', ar: 'منتج' },

  // Local Brands
  'brands.title': { en: 'Local Brands & Stores', ar: 'علامات ومتاجر محلية' },
  'brands.subtitle': { en: 'Verified sellers across Kuwait.', ar: 'بائعون موثقون في الكويت.' },
  'brands.viewDir': { en: 'View directory', ar: 'عرض الدليل' },

  // Quiz CTA
  'quiz.title': { en: 'Find Your Perfect Shade', ar: 'اكتشفي درجتك المثالية' },
  'quiz.subtitle': { en: 'Take our quick shade & skin quiz to get personalized product matches from local Kuwaiti sellers — tailored to your skin tone, undertone, and concerns.', ar: 'خذي اختبارنا السريع للبشرة والدرجات وحصلي على توصيات منتجات مخصصة من بائعين كويتيين — مصممة لدرجة بشرتك ونوعها واحتياجاتك.' },
  'quiz.cta': { en: 'Take the Quiz', ar: 'ابدئي الاختبار' },

  // Testimonials
  'test.title': { en: "Loved by Kuwait's Beauty Community", ar: 'محبوب من مجتمع الجمال في الكويت' },
  'test.subtitle': { en: 'Hear from shoppers and sellers across Kuwait.', ar: 'اسمعي من المتسوقين والبائعين في الكويت.' },

  // Seller CTA
  'seller.badge': { en: 'For Kuwaiti Sellers', ar: 'للبائعين الكويتيين' },
  'seller.title': { en: 'Grow Your Beauty Business in Kuwait', ar: 'طوّري مشروعك التجميلي في الكويت' },
  'seller.subtitle': { en: 'Get a storefront, marketing toolkit, loyalty program, and local visibility — everything you need to reach beauty lovers across Kuwait, without a marketing team.', ar: 'احصلي على واجهة متجر، أدوات تسويق، برنامج ولاء، وظهور محلي — كل ما تحتاجينه للوصول لعشاق الجمال في الكويت، بدون فريق تسويق.' },
  'seller.startSelling': { en: 'Start Selling', ar: 'ابدئي البيع' },
  'seller.learnMore': { en: 'Learn More', ar: 'اعرفي أكثر' },

  // Product Card
  'product.pickup': { en: 'Pickup', ar: 'استلام' },
  'product.sameDay': { en: 'Same-day', ar: 'نفس اليوم' },

  // Discover Page
  'discover.title': { en: 'Discover in Kuwait', ar: 'اكتشف في الكويت' },
  'discover.subtitle': { en: 'Find beauty products, brands, and services near you.', ar: 'اكتشفي منتجات التجميل والعلامات والخدمات قربك.' },
  'discover.search': { en: 'Search products, brands, shades...', ar: 'ابحثي عن منتجات، علامات، درجات...' },
  'discover.area': { en: 'Area in Kuwait', ar: 'منطقة في الكويت' },
  'discover.all': { en: 'All', ar: 'الكل' },
  'discover.filters': { en: 'Filters', ar: 'تصفية' },
  'discover.clearAll': { en: 'Clear all', ar: 'مسح الكل' },
  'discover.priceRange': { en: 'Price Range', ar: 'نطاق السعر' },
  'discover.tags': { en: 'Tags', ar: 'الوسوم' },
  'discover.fulfillment': { en: 'Fulfillment', ar: 'التوصيل' },
  'discover.pickupAvailable': { en: 'Pickup available', ar: 'الاستلام متاح' },
  'discover.sameDayDelivery': { en: 'Same-day delivery', ar: 'توصيل نفس اليوم' },
  'discover.results': { en: 'results', ar: 'نتيجة' },
  'discover.noProducts': { en: 'No products found', ar: 'لا توجد منتجات' },
  'discover.tryAdjusting': { en: 'Try adjusting your filters or search terms.', ar: 'جربي تعديل الفلاتر أو كلمات البحث.' },

  // Sort
  'sort.nearest': { en: 'Nearest', ar: 'الأقرب' },
  'sort.topRated': { en: 'Top Rated', ar: 'الأعلى تقييماً' },
  'sort.priceLow': { en: 'Price: Low', ar: 'السعر: أقل' },
  'sort.priceHigh': { en: 'Price: High', ar: 'السعر: أعلى' },
  'sort.newest': { en: 'Newest', ar: 'الأحدث' },

  // Price Ranges
  'price.all': { en: 'All Prices', ar: 'كل الأسعار' },
  'price.under5': { en: 'Under 5 KD', ar: 'أقل من 5 د.ك' },
  'price.5to10': { en: '5 – 10 KD', ar: '5 – 10 د.ك' },
  'price.10to15': { en: '10 – 15 KD', ar: '10 – 15 د.ك' },
  'price.over15': { en: 'Over 15 KD', ar: 'أكثر من 15 د.ك' },

  // Footer
  'footer.tagline': { en: 'Beauty, from the block you live on. Discover indie cosmetics brands, boutiques, and MUAs across Kuwait.', ar: 'الجمال، من الحي اللي تعيشين فيه. اكتشفي ماركات التجميل المحلية والبوتيكات وفنانات المكياج في الكويت.' },
  'footer.shop': { en: 'Shop', ar: 'تسوق' },
  'footer.forSellers': { en: 'For Sellers', ar: 'للبائعين' },
  'footer.company': { en: 'Company', ar: 'الشركة' },
  'footer.discoverNear': { en: 'Discover Near You', ar: 'اكتشف قربك' },
  'footer.dealsFlash': { en: 'Deals & Flash Sales', ar: 'عروض وتخفيضات' },
  'footer.shadeQuiz': { en: 'Shade Quiz', ar: 'اختبار الدرجة' },
  'footer.becomeSeller': { en: 'Become a Seller', ar: 'كن بائعاً' },
  'footer.sellerDash': { en: 'Seller Dashboard', ar: 'لوحة البائع' },
  'footer.marketingTools': { en: 'Marketing Tools', ar: 'أدوات التسويق' },
  'footer.pricing': { en: 'Pricing', ar: 'الأسعار' },
  'footer.about': { en: 'About Us', ar: 'عنّا' },
  'footer.beautyGuide': { en: 'Beauty Guide', ar: 'دليل الجمال' },
  'footer.contact': { en: 'Contact', ar: 'تواصلي معنا' },
  'footer.careers': { en: 'Careers', ar: 'وظائف' },
  'footer.rights': { en: '© 2026 GlowMe Kuwait. All rights reserved.', ar: '© 2026 جلو لوكال الكويت. جميع الحقوق محفوظة.' },
  'footer.privacy': { en: 'Privacy', ar: 'الخصوصية' },
  'footer.terms': { en: 'Terms', ar: 'الشروط' },
  'footer.accessibility': { en: 'Accessibility', ar: 'إمكانية الوصول' },

  // Product Page
  'pd.addToCart': { en: 'Add to Cart', ar: 'أضيفي للسلة' },
  'pd.inStock': { en: 'In Stock', ar: 'متوفر' },
  'pd.outOfStock': { en: 'Out of Stock', ar: 'غير متوفر' },
  'pd.description': { en: 'Description', ar: 'الوصف' },
  'pd.reviews': { en: 'Reviews', ar: 'التقييمات' },
  'pd.selectShade': { en: 'Select Shade', ar: 'اختاري الدرجة' },
  'pd.matchesProfile': { en: 'Matches your skin profile', ar: 'يناسب بشرتك' },
  'pd.visitStore': { en: 'Visit Store', ar: 'زوري المتجر' },
  'pd.helpful': { en: 'Helpful', ar: 'مفيد' },
  'pd.alsoLike': { en: 'You May Also Like', ar: 'قد يعجبك أيضاً' },
  'pd.verified': { en: 'Verified Seller', ar: 'بائع موثق' },
  'pd.added': { en: 'Added to cart!', ar: 'تمت الإضافة للسلة!' },

  // Cart
  'cart.title': { en: 'Shopping Cart', ar: 'سلة التسوق' },
  'cart.empty': { en: 'Your cart is empty', ar: 'سلتك فارغة' },
  'cart.emptyDesc': { en: 'Start discovering beauty products near you!', ar: 'ابدئي باكتشاف منتجات التجميل قربك!' },
  'cart.startShopping': { en: 'Start Shopping', ar: 'ابدئي التسوق' },
  'cart.subtotal': { en: 'Subtotal', ar: 'المجموع الفرعي' },
  'cart.delivery': { en: 'Delivery', ar: 'التوصيل' },
  'cart.total': { en: 'Total', ar: 'المجموع' },
  'cart.checkout': { en: 'Proceed to Checkout', ar: 'إتمام الشراء' },
  'cart.remove': { en: 'Remove', ar: 'إزالة' },
  'cart.continueShopping': { en: 'Continue Shopping', ar: 'متابعة التسوق' },
  'cart.calculated': { en: 'Calculated at checkout', ar: 'يحسب عند الدفع' },
  'cart.orderSummary': { en: 'Order Summary', ar: 'ملخص الطلب' },
  'cart.from': { en: 'From', ar: 'من' },

  // Categories Page
  'catPage.title': { en: 'All Categories', ar: 'كل الأقسام' },
  'catPage.subtitle': { en: 'Browse beauty products by category across Kuwait.', ar: 'تصفحي منتجات التجميل حسب القسم في الكويت.' },
  'catPage.shopNow': { en: 'Shop Now', ar: 'تسوقي الآن' },

  // Brands Directory
  'brandsPage.title': { en: 'Local Brands & Stores', ar: 'علامات ومتاجر محلية' },
  'brandsPage.subtitle': { en: 'Verified beauty businesses across Kuwait.', ar: 'مشاريع تجميل موثقة في الكويت.' },
  'brandsPage.follow': { en: 'Follow', ar: 'تابعي' },
  'brandsPage.following': { en: 'Following', ar: 'متابَع' },
  'brandsPage.viewProducts': { en: 'View Products', ar: 'عرض المنتجات' },

  // Deals Page
  'dealsPage.title': { en: 'Deals & Flash Sales', ar: 'عروض وتخفيضات' },
  'dealsPage.subtitle': { en: 'Limited-time offers from Kuwaiti beauty sellers.', ar: 'عروض لفترة محدودة من بائعي التجميل الكويتيين.' },

  // Live Page
  'livePage.title': { en: 'Live Shopping & Tutorials', ar: 'بث مباشر ودروس تجميل' },
  'livePage.subtitle': { en: 'Watch live beauty sessions and shop tagged products instantly.', ar: 'شاهدي جلسات التجميل المباشرة وتسوقي المنتجات فوراً.' },
  'livePage.liveNow': { en: 'Live Now', ar: 'مباشر الآن' },
  'livePage.upcoming': { en: 'Upcoming', ar: 'قادم' },
  'livePage.setReminder': { en: 'Set Reminder', ar: 'ذكريني' },
  'livePage.joinLive': { en: 'Join Live', ar: 'انضمي للبث' },

  // Quiz
  'quizPage.title': { en: 'Shade & Skin Quiz', ar: 'اختبار البشرة والدرجات' },
  'quizPage.subtitle': { en: 'Answer a few quick questions to get personalized product recommendations from local Kuwaiti sellers.', ar: 'أجيبي على بعض الأسئلة السريعة لتحصلي على توصيات مخصصة من بائعين كويتيين.' },
  'quizPage.next': { en: 'Next', ar: 'التالي' },
  'quizPage.back': { en: 'Back', ar: 'السابق' },
  'quizPage.seeResults': { en: 'See My Results', ar: 'شوفي النتائج' },
  'quizPage.startOver': { en: 'Start Over', ar: 'ابدئي من جديد' },
  'quizPage.resultsTitle': { en: 'Your Personalized Matches', ar: 'توصياتك المخصصة' },
  'quizPage.resultsSubtitle': { en: 'Based on your skin profile, we recommend these products from local sellers.', ar: 'بناءً على بشرتك، ننصحك بهذه المنتجات من بائعين محليين.' },
  'quizPage.q1': { en: 'What is your skin tone?', ar: 'ما هي درجة بشرتك؟' },
  'quizPage.q2': { en: 'What is your undertone?', ar: 'ما هو لون بشرتك التحتي؟' },
  'quizPage.q3': { en: 'What is your skin type?', ar: 'ما هو نوع بشرتك؟' },
  'quizPage.q4': { en: 'What are your primary skin concerns?', ar: 'ما هي مشاكل بشرتك الأساسية؟' },

  // Join as Seller
  'join.title': { en: 'Start Selling on GlowMe', ar: 'ابدئي البيع على جلو لوكال' },
  'join.subtitle': { en: 'Join Kuwait\'s growing community of indie beauty businesses.', ar: 'انضمي لمجتمع الكويت المتنامي من مشاريع التجميل المستقلة.' },
  'join.step1': { en: 'Create Your Account', ar: 'أنشئي حسابك' },
  'join.step2': { en: 'Verify Your Business', ar: 'وثقي مشروعك' },
  'join.step3': { en: 'Set Up Your Store', ar: 'جهزي متجرك' },
  'join.step4': { en: 'Start Selling', ar: 'ابدئي البيع' },
  'join.cta': { en: 'Apply Now', ar: 'قدمي الآن' },
  'join.free': { en: 'Free to join · No monthly fees to start', ar: 'مجاني · بدون رسوم شهرية للبدء' },

  // About
  'about.title': { en: 'About GlowMe', ar: 'عن جلو لوكال' },
  'about.mission': { en: 'Our Mission', ar: 'مهمتنا' },
  'about.missionText': { en: 'We believe beauty should be local, authentic, and accessible. GlowMe connects Kuwait\'s independent cosmetics brands, boutiques, and makeup artists with nearby shoppers — making it easy to discover, try, and buy real beauty products from people you can trust.', ar: 'نؤمن أن الجمال يجب أن يكون محلي، أصيل، ومتاح. جلو لوكال يربط علامات التجميل المستقلة والبوتيكات وفنانات المكياج في الكويت بالمتسوقين القريبين — لتسهيل اكتشاف وتجربة وشراء منتجات تجميل حقيقية من أشخاص تثقين فيهم.' },

  // Contact
  'contact.title': { en: 'Contact Us', ar: 'تواصلي معنا' },
  'contact.subtitle': { en: 'Have a question or feedback? We\'d love to hear from you.', ar: 'عندك سؤال أو ملاحظة؟ نحب نسمع منك.' },
  'contact.name': { en: 'Your Name', ar: 'اسمك' },
  'contact.email': { en: 'Email Address', ar: 'البريد الإلكتروني' },
  'contact.message': { en: 'Message', ar: 'الرسالة' },
  'contact.send': { en: 'Send Message', ar: 'أرسلي الرسالة' },
  'contact.sent': { en: 'Message sent! We\'ll get back to you soon.', ar: 'تم إرسال الرسالة! سنرد عليك قريباً.' },

  // Guide/Blog
  'guide.title': { en: 'Beauty Guide', ar: 'دليل الجمال' },
  'guide.subtitle': { en: 'Tips, tutorials, and shade guides from Kuwait\'s beauty community.', ar: 'نصائح ودروس وأدلة ألوان من مجتمع الجمال الكويتي.' },
  'guide.readMore': { en: 'Read More', ar: 'اقرئي المزيد' },
  'guide.minRead': { en: 'min read', ar: 'دقائق قراءة' },

  // Brand Page
  'brand.products': { en: 'Products', ar: 'المنتجات' },
  'brand.about': { en: 'About', ar: 'عن' },
  'brand.reviews': { en: 'Reviews', ar: 'التقييمات' },
  'brand.storeHours': { en: 'Store Hours', ar: 'ساعات العمل' },
  'brand.location': { en: 'Location', ar: 'الموقع' },
};

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('glowme-lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('glowme-lang', lang);
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  }, [lang, dir]);

  const t = (key: string) => translations[key]?.[lang] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LangContext.Provider>
  );
}
