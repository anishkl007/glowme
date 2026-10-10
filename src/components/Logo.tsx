import { Sparkles } from 'lucide-react';
import { cn } from '@project/components/lib/utils';

export default function Logo({ light, className }: { light?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="relative h-8 w-8 rounded-full bg-gradient-to-br from-accent via-[hsl(var(--glow))] to-primary flex items-center justify-center shadow-[0_0_18px_hsl(var(--accent)/0.45)]">
        <Sparkles className="h-4 w-4 text-white" />
      </span>
      <span className={cn('font-display text-2xl font-semibold tracking-tight', light ? 'text-white' : 'text-primary')}>
        Glow<span className="italic bg-gradient-to-r from-accent to-[hsl(var(--glow))] bg-clip-text text-transparent">Me</span>
      </span>
    </span>
  );
}
