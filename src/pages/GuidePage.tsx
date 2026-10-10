import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { blogPosts } from '@/data/sampleData';
import { useLang } from '@/lib/lang';

export default function GuidePage() {
  const { t } = useLang();
  const featured = blogPosts[0];
  const rest = blogPosts.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-10 md:py-14">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold">{t('guide.title')}</h1>
          <p className="text-primary-foreground/70 mt-2">{t('guide.subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Featured */}
        {featured && (
          <div className="bg-card rounded-2xl overflow-hidden border border-border mb-10 grid md:grid-cols-2 group cursor-pointer hover:shadow-md transition-all">
            <div className="aspect-video md:aspect-auto">
              <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 md:p-10 flex flex-col justify-center">
              <span className="text-xs font-semibold text-accent uppercase tracking-wide">{featured.category}</span>
              <h2 className="font-display text-2xl md:text-3xl font-bold mt-2 group-hover:text-accent transition-colors">{featured.title}</h2>
              <p className="text-muted-foreground mt-3">{featured.excerpt}</p>
              <div className="flex items-center gap-3 mt-4 text-sm text-muted-foreground">
                <span>{featured.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.readTime} {t('guide.minRead')}</span>
              </div>
              <span className="text-accent font-medium text-sm mt-4 inline-flex items-center gap-1">{t('guide.readMore')} <ArrowRight className="h-3 w-3" /></span>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rest.map(post => (
            <article key={post.id} className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-all group cursor-pointer">
              <div className="aspect-video overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-4">
                <span className="text-[10px] font-semibold text-accent uppercase tracking-wide">{post.category}</span>
                <h3 className="font-semibold text-sm mt-1 group-hover:text-accent transition-colors line-clamp-2">{post.title}</h3>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <span>{post.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
