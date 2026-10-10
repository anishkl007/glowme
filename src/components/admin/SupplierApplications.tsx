import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check, X, Phone, Instagram } from 'lucide-react';
import { adminSupplierApplications, AdminSupplierApplicationsOutputType } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';

type App = AdminSupplierApplicationsOutputType['applications'][0];

export default function SupplierApplications({ onApproved }: { onApproved: () => void }) {
  const [apps, setApps] = useState<App[]>([]);
  const [busy, setBusy] = useState('');
  useEffect(() => { adminSupplierApplications({ action: 'list' }).then(r => setApps(r.applications)).catch(() => {}); }, []);

  const act = async (id: string, action: 'approve' | 'reject') => {
    setBusy(id);
    try {
      const r = await adminSupplierApplications({ action, id });
      setApps(r.applications);
      toast.success(action === 'approve' ? 'Approved — store created and supplier linked' : 'Application rejected');
      if (action === 'approve') onApproved();
    } catch { toast.error('Something went wrong'); } finally { setBusy(''); }
  };

  const pending = apps.filter(a => a.status === 'Pending');
  if (pending.length === 0) return null;
  return (
    <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 space-y-3">
      <p className="font-semibold text-sm">Supplier applications <Badge className="ms-1 bg-accent text-accent-foreground">{pending.length}</Badge></p>
      {pending.map(a => (
        <div key={a.id} className="bg-card rounded-lg border border-border p-3 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 min-w-0 text-sm">
            <p className="font-medium">{a.businessName} <span className="text-muted-foreground font-normal">· {a.businessType} · {a.area || 'No area'}</span></p>
            <p className="text-xs text-muted-foreground">{a.contactName} · {a.email} · <Phone className="inline h-3 w-3" /> {a.phone}{a.instagram && <> · <Instagram className="inline h-3 w-3" /> {a.instagram}</>}</p>
            {a.categories && <p className="text-xs mt-1">Sells: {a.categories}</p>}
            {a.about && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.about}</p>}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={busy === a.id} onClick={() => act(a.id, 'reject')}><X className="h-3.5 w-3.5 me-1" />Reject</Button>
            <Button size="sm" disabled={busy === a.id} onClick={() => act(a.id, 'approve')}><Check className="h-3.5 w-3.5 me-1" />Approve</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
