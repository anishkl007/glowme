import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supplierManageProduct, SupplierGetMyStoreOutputType } from 'zitejs/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@project/components/ui/dialog';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Label } from '@project/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { useUpload } from 'zitejs/upload';

export type SupplierProduct = SupplierGetMyStoreOutputType['products'][0];
type StoreT = SupplierGetMyStoreOutputType['stores'][0];
const CATS = ['Skincare', 'Makeup', 'Haircare', 'Fragrance', 'Tools', 'Salon Services'];

const blank = { name: '', price: '', originalPrice: '', category: 'Makeup', image: '', barcode: '', itemCode: '', tags: '', skinTypes: '', stock: '0' };

export default function SupplierProductDialog({ open, product, stores, onClose, onSaved }: {
  open: boolean; product?: SupplierProduct; stores: StoreT[]; onClose: () => void; onSaved: () => void;
}) {
  const [f, setF] = useState(blank);
  const [storeKey, setStoreKey] = useState('');
  const [saving, setSaving] = useState(false);
  const { upload, isUploading } = useUpload();

  useEffect(() => {
    if (!open) return;
    setStoreKey(product?.brandId || stores[0]?.key || '');
    setF(product ? {
      name: product.name, price: String(product.price), originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      category: product.category || 'Makeup', image: product.image, barcode: product.barcode, itemCode: product.itemCode,
      tags: product.tags, skinTypes: product.skinTypes, stock: String(product.stockQuantity),
    } : blank);
  }, [open, product, stores]);

  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const price = Number(f.price);
  const errors = { name: !f.name.trim() ? 'Name is required' : '', price: !(price > 0) ? 'Enter a price above 0' : '', stock: Number(f.stock) < 0 || !Number.isFinite(Number(f.stock)) ? 'Stock must be 0 or more' : '' };
  const valid = !errors.name && !errors.price && !errors.stock && !!storeKey;

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const { url } = await upload(file); setF(prev => ({ ...prev, image: url })); } catch { toast.error('Image upload failed'); }
  };

  const save = async () => {
    setSaving(true);
    try {
      await supplierManageProduct({
        action: 'save', id: product?.id, storeKey, stockQuantity: Number(f.stock),
        product: {
          name: f.name, price, originalPrice: f.originalPrice ? Number(f.originalPrice) : undefined, category: f.category,
          image: f.image, barcode: f.barcode, itemCode: f.itemCode, tags: f.tags, skinTypes: f.skinTypes, shadesJson: product?.shadesJson || '[]',
        },
      });
      toast.success(product ? 'Product updated' : 'Product added');
      onSaved(); onClose();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not save'); } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{product ? 'Edit product' : 'Add product'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {stores.length > 1 && !product && (
            <div className="col-span-2"><Label>Store</Label>
              <Select value={storeKey} onValueChange={setStoreKey}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{stores.map(s => <SelectItem key={s.key} value={s.key}>{s.name}</SelectItem>)}</SelectContent></Select>
            </div>
          )}
          <Field label="Name" className="col-span-2" error={f.name || product ? errors.name : ''}><Input value={f.name} onChange={set('name')} /></Field>
          <Field label="Price (KD)" error={f.price ? errors.price : ''}><Input type="number" step="0.001" value={f.price} onChange={set('price')} /></Field>
          <Field label="Original price (optional)"><Input type="number" step="0.001" value={f.originalPrice} onChange={set('originalPrice')} /></Field>
          <Field label="Stock quantity" error={errors.stock}><Input type="number" min={0} value={f.stock} onChange={set('stock')} /></Field>
          <div><Label>Category</Label>
            <Select value={f.category} onValueChange={v => setF({ ...f, category: v })}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          </div>
          <Field label="Item code / SKU"><Input value={f.itemCode} onChange={set('itemCode')} /></Field>
          <Field label="Barcode"><Input value={f.barcode} onChange={set('barcode')} /></Field>
          <Field label="Tags (comma separated)" className="col-span-2"><Input value={f.tags} onChange={set('tags')} placeholder="Vegan, Cruelty-Free" /></Field>
          <div className="col-span-2"><Label>Image</Label>
            <div className="flex gap-3 items-center mt-1">
              {f.image && <img src={f.image} alt="" className="h-14 w-14 rounded-md object-cover border border-border" />}
              <Input type="file" accept="image/*" onChange={onFile} disabled={isUploading} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!valid || saving || isUploading}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return <div className={className}><Label>{label}</Label><div className="mt-1">{children}</div>{error && <p className="text-xs text-destructive mt-1">{error}</p>}</div>;
}
