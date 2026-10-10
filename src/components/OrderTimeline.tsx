import { Check, ClipboardList, PackageCheck, Truck, Home, XCircle } from 'lucide-react';
import { cn } from '@project/components/lib/utils';

const steps = [
  { key: 'Pending', label: 'Placed', icon: ClipboardList },
  { key: 'Confirmed', label: 'Confirmed', icon: Check },
  { key: 'Preparing', label: 'Preparing', icon: PackageCheck },
  { key: 'Out for Delivery', label: 'On the way', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: Home },
];

export default function OrderTimeline({ status }: { status: string }) {
  if (status === 'Cancelled') {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
        <XCircle className="h-4 w-4" /> This order was cancelled
      </div>
    );
  }
  const current = Math.max(0, steps.findIndex(s => s.key === status));

  return (
    <div className="flex items-start pb-1">
      {steps.map((s, i) => {
        const done = i <= current;
        const Icon = s.icon;
        return (
          <div key={s.key} className="flex-1 flex flex-col items-center relative">
            {i > 0 && (
              <div className={cn('absolute top-4 right-1/2 w-full h-0.5 -z-0', i <= current ? 'bg-accent' : 'bg-border')} />
            )}
            <div className={cn('relative z-10 h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors',
              done ? 'bg-accent border-accent text-accent-foreground' : 'bg-background border-border text-muted-foreground',
              i === current && 'ring-4 ring-accent/20')}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <span className={cn('mt-1.5 text-[10px] sm:text-xs text-center leading-tight', done ? 'font-semibold text-foreground' : 'text-muted-foreground')}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}
