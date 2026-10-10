import { Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Textarea } from '@project/components/ui/textarea';
import { useLang } from '@/lib/lang';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ContactPage() {
  const { t, lang } = useLang();
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success(t('contact.sent'));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold">{t('contact.title')}</h1>
          <p className="text-primary-foreground/70 mt-2">{t('contact.subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('contact.name')}</label>
              <Input required placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full name'} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('contact.email')}</label>
              <Input required type="email" placeholder="email@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('contact.message')}</label>
              <Textarea required rows={5} placeholder={lang === 'ar' ? 'اكتبي رسالتك هنا...' : 'Write your message here...'} />
            </div>
            <Button type="submit" disabled={sent} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-12 w-full">
              {sent ? '✓ ' + t('contact.sent') : t('contact.send')}
            </Button>
          </form>

          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-semibold mb-4">{lang === 'ar' ? 'تواصلي معنا' : 'Get in Touch'}</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-accent" /> hello@glowme.kw</div>
                <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-accent" /> +965 2222 3333</div>
                <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-accent" /> {lang === 'ar' ? 'الكويت، السالمية' : 'Salmiya, Kuwait'}</div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-semibold mb-2">{lang === 'ar' ? 'ساعات العمل' : 'Working Hours'}</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{lang === 'ar' ? 'السبت – الخميس: 9 صباحاً – 6 مساءً' : 'Sat – Thu: 9:00 AM – 6:00 PM'}</p>
                <p>{lang === 'ar' ? 'الجمعة: مغلق' : 'Friday: Closed'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
