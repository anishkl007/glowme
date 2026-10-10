import { Heart, MapPin, ShieldCheck, Users } from 'lucide-react';
import { useLang } from '@/lib/lang';

export default function AboutPage() {
  const { t, lang } = useLang();

  const stats = [
    { value: '150+', label: lang === 'ar' ? 'بائع محلي' : 'Local Sellers' },
    { value: '2,500+', label: lang === 'ar' ? 'منتج' : 'Products' },
    { value: '10K+', label: lang === 'ar' ? 'متسوق نشط' : 'Active Shoppers' },
    { value: '15', label: lang === 'ar' ? 'منطقة في الكويت' : 'Areas in Kuwait' },
  ];

  const values = [
    { icon: MapPin, title: lang === 'ar' ? 'محلي أولاً' : 'Local First', desc: lang === 'ar' ? 'نعطي الأولوية للمنتجات والعلامات المحلية في الكويت.' : 'We prioritize Kuwaiti products and homegrown brands.' },
    { icon: ShieldCheck, title: lang === 'ar' ? 'الثقة والأمان' : 'Trust & Safety', desc: lang === 'ar' ? 'كل بائع موثق وكل منتج يخضع لمراجعة الامتثال.' : 'Every seller is verified and every product undergoes compliance review.' },
    { icon: Heart, title: lang === 'ar' ? 'الشمولية' : 'Inclusivity', desc: lang === 'ar' ? 'درجات ومنتجات لكل لون بشرة ونوعها.' : 'Shades and products for every skin tone and type.' },
    { icon: Users, title: lang === 'ar' ? 'المجتمع' : 'Community', desc: lang === 'ar' ? 'نبني مجتمع جمال حقيقي، مش سوق عشوائي.' : 'We\'re building a real beauty community, not a random marketplace.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold">{t('about.title')}</h1>
        </div>
      </div>

      {/* Mission */}
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">{t('about.mission')}</h2>
        <p className="text-foreground/80 leading-relaxed text-lg">{t('about.missionText')}</p>
      </div>

      {/* Stats */}
      <div className="bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl md:text-4xl font-bold text-accent">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-10">{lang === 'ar' ? 'قيمنا' : 'Our Values'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {values.map(v => (
            <div key={v.title} className="bg-card rounded-xl p-6 border border-border">
              <v.icon className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-semibold text-lg mb-1">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
