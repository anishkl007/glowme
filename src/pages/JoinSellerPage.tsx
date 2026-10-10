import { Store, ShieldCheck, Palette, Rocket, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { useLang } from '@/lib/lang';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import SupplierApplyDialog from '@/components/supplier/SupplierApplyDialog';

const benefits = [
  { icon: Store, en: 'Beautiful online storefront', ar: 'واجهة متجر إلكترونية جميلة' },
  { icon: Palette, en: 'Marketing tools & social post generator', ar: 'أدوات تسويق ومنشئ بوستات' },
  { icon: ShieldCheck, en: 'Verified seller badge', ar: 'شارة بائع موثق' },
  { icon: Rocket, en: 'Local visibility & discovery', ar: 'ظهور واكتشاف محلي' },
];

export default function JoinSellerPage() {
  const { t, lang, dir } = useLang();
  const [open, setOpen] = useState(false);
  const steps = [t('join.step1'), t('join.step2'), t('join.step3'), t('join.step4')];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold">{t('join.title')}</h1>
          <p className="text-primary-foreground/70 mt-4 text-lg">{t('join.subtitle')}</p>
          <Button size="lg" className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-14 px-10 text-lg"
            onClick={() => setOpen(true)}>
            {t('join.cta')} {dir === 'rtl' ? '←' : '→'}
          </Button>
          <p className="text-sm text-primary-foreground/50 mt-3">{t('join.free')}</p>
          <p className="text-sm text-primary-foreground/70 mt-4">Already a supplier? <Link to="/supplier" className="underline font-semibold">Go to My Store</Link> · <Link to="/brands" className="underline">See local brands</Link></p>
        </div>
      </div>

      {/* Steps */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {steps.map((label, i) => (
            <button key={i} onClick={() => setOpen(true)} className="text-center group">
              <div className="h-14 w-14 rounded-full bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors flex items-center justify-center text-xl font-bold mx-auto mb-3">
                {i + 1}
              </div>
              <p className="text-sm font-medium group-hover:text-accent transition-colors">{label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-10">
            {lang === 'ar' ? 'ما نقدمه لك' : 'What You Get'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-4 bg-card p-5 rounded-xl border border-border">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <b.icon className="h-5 w-5 text-accent" />
                </div>
                <span className="font-medium text-sm">{lang === 'ar' ? b.ar : b.en}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SupplierApplyDialog open={open} onClose={() => setOpen(false)} />

      {/* Pricing */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-card rounded-2xl border-2 border-accent p-8 text-center">
          <span className="text-xs font-bold text-accent uppercase tracking-widest">{lang === 'ar' ? 'ابدئي مجاناً' : 'Start Free'}</span>
          <h3 className="font-display text-3xl font-bold mt-2">{lang === 'ar' ? '0 د.ك / شهر' : '0 KD / month'}</h3>
          <p className="text-muted-foreground text-sm mt-2">{lang === 'ar' ? 'عمولة 10% فقط على المبيعات المكتملة' : '10% commission on completed sales only'}</p>
          <ul className="text-start mt-6 space-y-2">
            {['Unlimited product listings', 'Promo codes & flash sales', 'Stock management portal', 'Your own store page', 'Local discovery placement'].map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> {f}</li>
            ))}
          </ul>
          <Button className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-12"
            onClick={() => setOpen(true)}>
            {t('join.cta')} <ArrowRight className="h-4 w-4 ms-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
