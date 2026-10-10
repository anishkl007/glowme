import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, loginWithRedirect } from 'zitejs/auth';
import { getReviews, addReview, GetReviewsOutputType } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Textarea } from '@project/components/ui/textarea';
import { Skeleton } from '@project/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';

const SKIN = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];

function Stars({ value, size = 'h-4 w-4', onPick }: { value: number; size?: string; onPick?: (n: number) => void }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" disabled={!onPick} onClick={() => onPick?.(n)} className={onPick ? 'cursor-pointer' : 'cursor-default'}>
          <Star className={`${size} ${n <= Math.round(value) ? 'fill-current' : ''}`} />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ productId, onDone }: { productId: string; onDone: () => void }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [skin, setSkin] = useState<string>();
  const [saving, setSaving] = useState(false);

  if (!user) return (
    <div className="p-4 rounded-xl border border-dashed border-border text-sm flex items-center justify-between gap-3">
      <span className="text-muted-foreground">Sign in to share your review</span>
      <Button size="sm" variant="outline" onClick={() => loginWithRedirect()}>Sign in</Button>
    </div>
  );

  const valid = rating > 0 && text.trim().length >= 3;
  const submit = async () => {
    setSaving(true);
    try {
      await addReview({ productId, rating, text, skinType: skin });
      toast.success('Thanks for your review!');
      setRating(0); setText(''); setSkin(undefined);
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not post review');
    } finally { setSaving(false); }
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-card space-y-3">
      <p className="font-semibold text-sm">Write a review</p>
      <Stars value={rating} size="h-6 w-6" onPick={setRating} />
      <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="What did you think?" rows={3} maxLength={2000} />
      <div className="flex gap-3 flex-wrap">
        <Select value={skin} onValueChange={setSkin}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Skin type (optional)" /></SelectTrigger>
          <SelectContent>{SKIN.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Button onClick={submit} disabled={!valid || saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
          {saving ? 'Posting…' : 'Post review'}
        </Button>
      </div>
    </div>
  );
}

export default function ProductReviews({ productId, onStats }: { productId: string; onStats?: (avg: number, count: number) => void }) {
  const [data, setData] = useState<GetReviewsOutputType | null>(null);
  const load = () => getReviews({ productId }).then(d => { setData(d); onStats?.(d.average, d.count); });
  useEffect(() => { setData(null); load(); }, [productId]);

  return (
    <div className="space-y-4 max-w-2xl">
      {data && data.count > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold">{data.average}</span>
          <div><Stars value={data.average} /><p className="text-xs text-muted-foreground">{data.count} review{data.count > 1 ? 's' : ''}</p></div>
        </div>
      )}
      <ReviewForm productId={productId} onDone={load} />
      {!data ? <Skeleton className="h-24 w-full rounded-xl" /> : data.count === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No reviews yet — be the first!</p>
      ) : data.reviews.map(r => (
        <div key={r.id} className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-sm">{r.author}</span>
              {r.skinType && <span className="text-xs text-muted-foreground ms-2">{r.skinType} skin</span>}
            </div>
            <Stars value={r.rating} size="h-3 w-3" />
          </div>
          <p className="text-sm mt-2 text-foreground/80 whitespace-pre-line">{r.text}</p>
          {r.createdAt && <p className="text-xs text-muted-foreground mt-3">{new Date(r.createdAt).toLocaleDateString()}</p>}
        </div>
      ))}
    </div>
  );
}
