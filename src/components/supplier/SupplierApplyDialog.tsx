import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle, Clock } from 'lucide-react';
import { useAuth, loginWithRedirect } from 'zitejs/auth';
import { supplierApply, SupplierApplyOutputType } from 'zitejs/api';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@project/components/ui/dialog';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Label } from '@project/components/ui/label';
import { Textarea } from '@project/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';

const blank = { businessName: '', businessType: 'Brand', contactName: '', phone: '', area: '', categories: '', instagram: '', about: '' };

export default function SupplierApplyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [f, setF] = useState(blank);
  const [status, setStatus] = useState<SupplierApplyOutputType | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      setF(prev => ({ ...prev, contactName: prev.contactName || [user.firstName, user.lastName].filter(Boolean).join(' ') }));
      supplierApply({}).then(setStatus).catch(() => setStatus({ status: null, businessName: null }));
    }
  }, [open, user]);

  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const errs = { businessName: !f.businessName.trim(), contactName: !f.contactName.trim(), phone: f.phone.replace(/\D/g, '').length < 7 };
  const valid = !Object.values(errs).some(Boolean);

  const submit = async () => {
    setSaving(true);
    try { setStatus(await supplierApply({ application: f })); toast.success('Application sent!'); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Could not send application'); } finally { setSaving(false); }
  };

  const body = !user ? (
    <div className="text-center py-4">
      <p className="text-sm text-muted-foreground mb-4">Create a free account or sign in first — your supplier access will be linked to it.</p>
      <Button onClick={() => loginWithRedirect()}>Sign in / Create account</Button>
    </div>
  ) : !status ? <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
    : status.status === 'Approved' ? (
      <div className="text-center py-4"><CheckCircle className="h-10 w-10 text-accent mx-auto mb-2" />
        <p className="font-semibold">You're approved!</p><p className="text-sm text-muted-foreground mt-1">Manage your products and stock from your store portal.</p>
        <Button asChild className="mt-4"><Link to="/supplier" onClick={onClose}>Go to My Store</Link></Button></div>
    ) : status.status === 'Pending' ? (
      <div className="text-center py-4"><Clock className="h-10 w-10 text-accent mx-auto mb-2" />
        <p className="font-semibold">Application received</p>
        <p className="text-sm text-muted-foreground mt-1">We're reviewing {status.businessName}. You'll get access to My Store once approved.</p></div>
    ) : (
      <div className="grid grid-cols-2 gap-3">
        {status.status === 'Rejected' && <p className="col-span-2 text-sm text-destructive">Your previous application wasn't approved — you can apply again.</p>}
        <F label="Business name *" cls="col-span-2" err={f.businessName && errs.businessName}><Input value={f.businessName} onChange={set('businessName')} /></F>
        <div><Label>Type</Label>
          <Select value={f.businessType} onValueChange={v => setF({ ...f, businessType: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Brand">Local brand</SelectItem><SelectItem value="Store">Beauty store</SelectItem></SelectContent></Select></div>
        <F label="Area"><Input value={f.area} onChange={set('area')} placeholder="Salmiya" /></F>
        <F label="Contact name *"><Input value={f.contactName} onChange={set('contactName')} /></F>
        <F label="Phone *" err={f.phone && errs.phone ? 'Enter a valid phone' : ''}><Input value={f.phone} onChange={set('phone')} placeholder="+965" /></F>
        <F label="What do you sell?" cls="col-span-2"><Input value={f.categories} onChange={set('categories')} placeholder="Skincare, Makeup" /></F>
        <F label="Instagram" cls="col-span-2"><Input value={f.instagram} onChange={set('instagram')} placeholder="@yourbrand" /></F>
        <F label="Tell us about your business" cls="col-span-2"><Textarea rows={3} value={f.about} onChange={set('about')} /></F>
      </div>
    );

  const showSubmit = user && status && (status.status === null || status.status === 'Rejected');
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Apply to sell on GlowMe</DialogTitle>
          <DialogDescription>Approved suppliers manage their own products and stock.</DialogDescription></DialogHeader>
        {body}
        {showSubmit && <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!valid || saving} className="bg-accent text-accent-foreground hover:bg-accent/90">{saving ? 'Sending…' : 'Submit application'}</Button></DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

function F({ label, cls, err, children }: { label: string; cls?: string; err?: string | boolean; children: React.ReactNode }) {
  return <div className={cls}><Label>{label}</Label><div className="mt-1">{children}</div>{err && <p className="text-xs text-destructive mt-1">{typeof err === 'string' ? err : 'Required'}</p>}</div>;
}
