import { Play, Bell, Radio } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { liveSessions } from '@/data/sampleData';
import { useLang } from '@/lib/lang';
import { toast } from 'sonner';

export default function LivePage() {
  const { t } = useLang();
  const live = liveSessions.filter(s => s.isLive);
  const upcoming = liveSessions.filter(s => !s.isLive);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-10 md:py-14">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold">{t('livePage.title')}</h1>
          <p className="text-primary-foreground/70 mt-2">{t('livePage.subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Live Now */}
        {live.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Radio className="h-5 w-5 text-red-500 animate-pulse" />
              <h2 className="font-display text-2xl font-bold">{t('livePage.liveNow')}</h2>
            </div>
            {live.map(s => (
              <div key={s.id} className="bg-card rounded-2xl overflow-hidden border border-border max-w-3xl">
                <div className="relative aspect-video">
                  <img src={s.thumbnail} alt={s.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                      <Play className="h-7 w-7 text-accent-foreground fill-accent-foreground" />
                    </div>
                  </div>
                  <span className="absolute top-4 start-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" /> LIVE · {s.viewers} {t('live.watching')}
                  </span>
                  <span className="absolute top-4 end-4 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">{s.products} {t('live.products')}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold">{s.title}</h3>
                  <div className="flex items-center gap-3 mt-3">
                    <img src={s.hostImage} alt={s.host} className="h-10 w-10 rounded-full object-cover" />
                    <span className="font-medium text-sm">{s.host}</span>
                  </div>
                  <Button className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                    <Play className="h-4 w-4 me-2" /> {t('livePage.joinLive')}
                  </Button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Upcoming */}
        <section>
          <h2 className="font-display text-2xl font-bold mb-6">{t('livePage.upcoming')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map(s => (
              <div key={s.id} className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-all group">
                <div className="relative aspect-video">
                  <img src={s.thumbnail} alt={s.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold">{s.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <img src={s.hostImage} alt={s.host} className="h-6 w-6 rounded-full object-cover" />
                    <span className="text-xs text-muted-foreground">{s.host}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">{s.startTime}</span>
                    <Button size="sm" variant="outline" onClick={() => toast.success(t('livePage.setReminder'))}>
                      <Bell className="h-3 w-3 me-1" /> {t('livePage.setReminder')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
