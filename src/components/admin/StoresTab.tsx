import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, UserPlus, X, ShieldCheck } from 'lucide-react';
import { adminStores, AdminStoresOutputType, AdminStoresInputType } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Label } from '@project/components/ui/label';
import { Badge } from '@project/components/ui/badge';
import { Switch } from '@project/components/ui/switch';
import { Skeleton } from '@project/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@project/components/ui/dialog';
import SupplierApplications from './SupplierApplications';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@project/components/ui/alert-dialog';

type StoreT = AdminStoresOutputType['stores'][0];
type Form = NonNullable<AdminStoresInputType['store']>;
const blank: Form = { name: '', type: 'Brand', tagline: '', area: '', logo: '🛍️', image: '', categories: '', tags: '', phone: '', verified: false, active: true };

export default function StoresTab() {
  const [stores, setStores] = useState<StoreT[] | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [del, setDel] = useState<StoreT | null>(null);
  const [emails, setEmails] = useState<Record<string, string>>({});

  const run = async (input: AdminStoresInputType, ok?: string) => {
    try { const r = await adminStores(input); setStores(r.stores); if (ok) toast.success(ok); return true; }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Something went wrong'); return false; }
  };
  useEffect(() => { run({ action: 'list' }); }, []);

  if (!stores) return <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>;

  const edit = (s: StoreT) => setForm({ id: s.id, name: s.name, type: s.type, tagline: s.tagline, area: s.area, logo: s.logo, image: s.image, categories: s.categories.join(', '), tags: s.tags.join(', '), phone: s.phone, verified: s.verified, active: s.active });
  const addSupplier = async (s: StoreT) => {
    if (await run({ action: 'addSupplier', id: s.id, email: emails[s.id] }, 'Supplier added')) setEmails({ ...emails, [s.id]: '' });
  };

  return (
    <div className="space-y-4">
      <SupplierApplications onApproved={() => run({ action: 'list' })} />
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Local brands & stores. Suppliers can manage their own products and stock — not orders.</p>
        <Button onClick={() => setForm(blank)}><Plus className="h-4 w-4 me-1" />Add store</Button>
      </div>
      {stores.map(s => (
        <div key={s.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{s.logo}</span>
              <div>
                <p className="font-semibold flex items-center gap-1.5">{s.name}{s.verified && <ShieldCheck className="h-4 w-4 text-amber-500" />}</p>
                <p className="text-xs text-muted-foreground">{s.type} · {s.area || 'No area'} · {s.productCount} products</p>
              </div>
              {!s.active && <Badge variant="outline">Hidden</Badge>}
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => edit(s)}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setDel(s)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Suppliers:</span>
            {s.suppliers.length === 0 && <span className="text-xs text-muted-foreground">none</span>}
            {s.suppliers.map(u => (
              <Badge key={u.id} variant="secondary" className="gap-1">{u.name || u.email}
                <button onClick={() => run({ action: 'removeSupplier', id: s.id, userId: u.id }, 'Supplier removed')}><X className="h-3 w-3" /></button>
              </Badge>
            ))}
            <div className="flex gap-1 ms-auto">
              <Input value={emails[s.id] || ''} onChange={e => setEmails({ ...emails, [s.id]: e.target.value })} placeholder="supplier@email.com" className="h-8 w-52" />
              <Button size="sm" variant="outline" disabled={!/\S+@\S+\.\S+/.test(emails[s.id] || '')} onClick={() => addSupplier(s)}><UserPlus className="h-3.5 w-3.5 me-1" />Add</Button>
            </div>
          </div>
        </div>
      ))}

      <StoreDialog form={form} setForm={setForm} onSave={async f => { if (await run({ action: 'save', store: f }, 'Store saved')) setForm(null); }} />
      <AlertDialog open={!!del} onOpenChange={o => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete {del?.name}?</AlertDialogTitle>
            <AlertDialogDescription>The store page will be removed. Its products stay in your catalogue.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { run({ action: 'delete', id: del!.id }, 'Store deleted'); setDel(null); }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StoreDialog({ form, setForm, onSave }: { form: Form | null; setForm: (f: Form | null) => void; onSave: (f: Form) => void }) {
  if (!form) return null;
  const txt = (k: keyof Form, label: string, cls = '') => (
    <div className={cls}><Label>{label}</Label><Input className="mt-1" value={String(form[k] ?? '')} onChange={e => setForm({ ...form, [k]: e.target.value })} /></div>
  );
  return (
    <Dialog open onOpenChange={o => !o && setForm(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{form.id ? 'Edit store' : 'Add store'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {txt('name', 'Name', 'col-span-2')}
          <div><Label>Type</Label>
            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Brand">Local brand</SelectItem><SelectItem value="Store">Store</SelectItem></SelectContent></Select>
          </div>
          {txt('logo', 'Logo (emoji)')}
          {txt('tagline', 'Tagline', 'col-span-2')}
          {txt('area', 'Area')}
          {txt('phone', 'Phone')}
          {txt('image', 'Cover image URL', 'col-span-2')}
          {txt('categories', 'Categories (comma separated)', 'col-span-2')}
          {txt('tags', 'Tags (comma separated)', 'col-span-2')}
          <label className="flex items-center gap-2 text-sm"><Switch checked={form.verified} onCheckedChange={v => setForm({ ...form, verified: v })} />Verified</label>
          <label className="flex items-center gap-2 text-sm"><Switch checked={form.active} onCheckedChange={v => setForm({ ...form, active: v })} />Visible on site</label>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          <Button disabled={!form.name.trim()} onClick={() => onSave(form)}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
