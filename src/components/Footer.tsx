import { Link } from 'react-router-dom';
import { useLang } from '@/lib/lang';
import Logo from '@/components/Logo';

export default function Footer() {
  const { t } = useLang();

  const footerLinks = {
    [t('footer.shop')]: [
      { label: t('footer.discoverNear'), to: '/discover' },
      { label: t('nav.categories'), to: '/categories' },
      { label: t('footer.dealsFlash'), to: '/deals' },
      { label: t('footer.shadeQuiz'), to: '/quiz' },
    ],
    [t('footer.forSellers')]: [
      { label: t('footer.becomeSeller'), to: '/join-as-seller' },
      { label: t('footer.sellerDash'), to: '/app/seller' },
      { label: t('footer.marketingTools'), to: '/app/seller' },
      { label: t('footer.pricing'), to: '/join-as-seller' },
    ],
    [t('footer.company')]: [
      { label: t('footer.about'), to: '/about' },
      { label: t('footer.beautyGuide'), to: '/guide' },
      { label: t('footer.contact'), to: '/contact' },
      { label: t('footer.careers'), to: '/about' },
    ],
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Logo light className="mb-4" />
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/50">{t('footer.rights')}</p>
          <div className="flex gap-6">
            <Link to="/about" className="text-xs text-primary-foreground/50 hover:text-primary-foreground/80">{t('footer.privacy')}</Link>
            <Link to="/about" className="text-xs text-primary-foreground/50 hover:text-primary-foreground/80">{t('footer.terms')}</Link>
            <Link to="/about" className="text-xs text-primary-foreground/50 hover:text-primary-foreground/80">{t('footer.accessibility')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
