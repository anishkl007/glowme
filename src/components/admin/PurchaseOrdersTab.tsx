import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Input } from '@project/components/ui/input';
import { Label } from '@project/components/ui/label';
import { Textarea } from '@project/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { Skeleton } from '@project/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@project/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@project/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@project/components/ui/popover';
import { adminPurchaseOrders, AdminPurchaseOrdersOutputType, printPurchaseOrderPdf } from 'zitejs/api';
import { formatPrice } from '@/data/sampleData';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Truck, Printer, Loader2, ChevronRight, CheckCircle2, Circle, Search, Upload, FileSpreadsheet, X } from 'lucide-react';

type PO = NonNullable<AdminPurchaseOrdersOutputType['purchaseOrders']>[0];
type ProductOption = NonNullable<AdminPurchaseOrdersOutputType['products']>[0];

const poStages = ['Quotation', 'Purchase Order', 'Product Receipt', 'Bill Confirmed'];
const poStatuses = [...poStages, 'Cancelled'];

const stageColors: Record<string, string> = {
  Quotation: 'bg-muted text-muted-foreground',
  'Purchase Order': 'bg-blue-100 text-blue-800',
  'Product Receipt': 'bg-yellow-100 text-yellow-800',
  'Bill Confirmed': 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const docTypeMap: Record<string, 'quotation' | 'purchase_order' | 'product_receipt' | 'bill'> = {
  Quotation: 'quotation',
  'Purchase Order': 'purchase_order',
  'Product Receipt': 'product_receipt',
  'Bill Confirmed': 'bill',
};

interface POItem { productName: string; quantity: number; unitCost: number; barcode?: string; itemCode?: string; }

function StageIndicator({ currentStatus }: { currentStatus: string }) {
  const currentIdx = poStages.indexOf(currentStatus);
  if (currentStatus === 'Cancelled') {
    return <div className="flex items-center gap-1.5 py-2"><Badge variant="destructive" className="text-xs">Cancelled</Badge></div>;
  }
  return (
    <div className="flex items-center gap-1 flex-wrap py-2">
      {poStages.map((stage, i) => {
        const isCompleted = i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={stage} className="flex items-center gap-1">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
              ${isCompleted ? 'bg-green-100 text-green-700' : isCurrent ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30' : 'bg-muted text-muted-foreground'}`}>
              {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
              {stage}
            </div>
            {i < poStages.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
          </div>
        );
      })}
    </div>
  );
}

/* ── Product search picker ────────────────────────────────── */
function ProductPicker({ products, value, onChange }: { products: ProductOption[]; value: string; onChange: (name: string, price: number, barcode: string, itemCode: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  }, [products, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="flex items-center w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-left truncate hover:bg-muted/50 transition-colors" onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}>
          {value || <span className="text-muted-foreground">Select product…</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input ref={inputRef} placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
          </div>
        </div>
        <div className="max-h-48 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No products found</p>
          ) : (
            filtered.map(p => (
              <button key={p.id} type="button" className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors" onClick={() => { onChange(p.name, p.price, p.barcode || '', p.itemCode || ''); setOpen(false); setSearch(''); }}>
                <span className="font-medium">{p.name}</span>
                <span className="text-muted-foreground text-xs ml-2">{p.brand} · {formatPrice(p.price)}</span>
                {(p.itemCode || p.barcode) && <span className="block text-[10px] text-muted-foreground">{p.itemCode ? `Code: ${p.itemCode}` : ''}{p.itemCode && p.barcode ? ' · ' : ''}{p.barcode ? `BC: ${p.barcode}` : ''}</span>}
              </button>
            ))
          )}
        </div>
        {/* manual entry hint */}
        <div className="border-t border-border p-2">
          <p className="text-[10px] text-muted-foreground text-center">Or type a custom product name in the field</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ── Bulk upload modal ────────────────────────────────────── */
function BulkUploadSection({ onImport }: { onImport: (items: POItem[]) => void }) {
  const [show, setShow] = useState(false);
  const [csv, setCsv] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCsv = (text: string): POItem[] => {
    const lines = text.trim().split('\n').filter(Boolean);
    const items: POItem[] = [];
    for (const line of lines) {
      const parts = line.split(/[,\t]/).map(s => s.trim().replace(/^["']|["']$/g, ''));
      if (parts.length < 3) continue;
      const productName = parts[0];
      const quantity = parseInt(parts[1]) || 1;
      const unitCost = parseFloat(parts[2]) || 0;
      if (productName) items.push({ productName, quantity, unitCost });
    }
    return items;
  };

  const handleImport = () => {
    const items = parseCsv(csv);
    if (items.length === 0) { toast.error('No valid items found. Use format: Product Name, Quantity, Unit Cost'); return; }
    onImport(items);
    setCsv('');
    setShow(false);
    toast.success(`Imported ${items.length} item(s)`);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setCsv((ev.target?.result as string) || ''); };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!show) {
    return (
      <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setShow(true)}>
        <Upload className="h-3.5 w-3.5" /> Bulk Upload
      </Button>
    );
  }

  return (
    <div className="border border-dashed border-border rounded-lg p-4 space-y-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Bulk Upload Products</span>
        </div>
        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShow(false)}><X className="h-3.5 w-3.5" /></Button>
      </div>
      <p className="text-xs text-muted-foreground">Paste CSV or upload a file. Format: <code className="bg-muted px-1 rounded text-[11px]">Product Name, Quantity, Unit Cost</code> (one per line)</p>
      <Textarea placeholder={"Velvet Matte Lipstick, 50, 4.5\nSaffron Glow Serum, 30, 8.0\nSilk Foundation SPF 30, 20, 9.5"} value={csv} onChange={e => setCsv(e.target.value)} rows={4} className="text-xs font-mono" />
      <div className="flex items-center gap-2">
        <input ref={fileRef} type="file" accept=".csv,.txt,.tsv" className="hidden" onChange={handleFile} />
        <Button type="button" variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => fileRef.current?.click()}>
          <Upload className="h-3 w-3" /> Upload CSV
        </Button>
        <div className="flex-1" />
        <Button type="button" size="sm" className="text-xs bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleImport} disabled={!csv.trim()}>
          Import Items
        </Button>
      </div>
    </div>
  );
}

/* ── Supplier picker (searchable from existing POs) ───────── */
function SupplierInput({ value, onChange, existingSuppliers }: { value: string; onChange: (v: string) => void; existingSuppliers: string[] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const unique = useMemo(() => {
    const set = new Set(existingSuppliers.filter(Boolean));
    const arr = Array.from(set);
    if (!search) return arr;
    const q = search.toLowerCase();
    return arr.filter(s => s.toLowerCase().includes(q));
  }, [existingSuppliers, search]);

  return (
    <div className="space-y-1">
      <Label>Supplier *</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input value={value} onChange={e => { onChange(e.target.value); setSearch(e.target.value); }} placeholder="Type or select supplier…" onFocus={() => setOpen(true)} />
          </div>
        </PopoverTrigger>
        {unique.length > 0 && (
          <PopoverContent className="w-64 p-1" align="start" onOpenAutoFocus={e => e.preventDefault()}>
            <div className="max-h-36 overflow-y-auto">
              {unique.map(s => (
                <button key={s} type="button" className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-muted transition-colors" onClick={() => { onChange(s); setOpen(false); }}>
                  {s}
                </button>
              ))}
            </div>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}

/* ── Form dialog ──────────────────────────────────────────── */
function POFormDialog({ po, open, onClose, onSaved, products, existingSuppliers }: {
  po?: PO; open: boolean; onClose: () => void; onSaved: () => void;
  products: ProductOption[]; existingSuppliers: string[];
}) {
  const [supplier, setSupplier] = useState('');
  const [status, setStatus] = useState('Quotation');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<POItem[]>([{ productName: '', quantity: 1, unitCost: 0 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (po) {
      setSupplier(po.supplier); setStatus(po.status); setExpectedDelivery(po.expectedDelivery);
      setNotes(po.notes);
      try { setItems(JSON.parse(po.itemsJson)); } catch { setItems([{ productName: '', quantity: 1, unitCost: 0 }]); }
    } else {
      setSupplier(''); setStatus('Quotation'); setExpectedDelivery('');
      setNotes(''); setItems([{ productName: '', quantity: 1, unitCost: 0 }]);
    }
  }, [po, open]);

  const totalCost = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);

  const updateItem = (idx: number, key: keyof POItem, val: any) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: val } : it));
  };

  const handleBulkImport = (imported: POItem[]) => {
    setItems(prev => {
      // remove empty rows then append
      const existing = prev.filter(i => i.productName);
      return [...existing, ...imported];
    });
  };

  const handleSave = async () => {
    if (!supplier) { toast.error('Supplier is required'); return; }
    setSaving(true);
    try {
      await adminPurchaseOrders({
        action: po ? 'update' : 'create',
        id: po?.id,
        supplier, status, expectedDelivery, notes, totalCost,
        itemsJson: JSON.stringify(items.filter(i => i.productName)),
      });
      toast.success(po ? 'Purchase order updated' : 'Quotation created');
      onSaved(); onClose();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{po ? 'Edit Purchase Order' : 'New Quotation'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <SupplierInput value={supplier} onChange={setSupplier} existingSuppliers={existingSuppliers} />
            <div>
              <Label>Stage</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{poStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {po && <StageIndicator currentStatus={status} />}

          <div><Label>Expected Delivery</Label><Input type="date" value={expectedDelivery} onChange={e => setExpectedDelivery(e.target.value)} /></div>

          {/* Items section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Items</Label>
              <div className="flex gap-2">
                <BulkUploadSection onImport={handleBulkImport} />
                <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setItems(prev => [...prev, { productName: '', quantity: 1, unitCost: 0 }])}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
                </Button>
              </div>
            </div>

            {/* Column headers */}
            <div className="flex gap-2 items-center mb-1 px-0.5">
              <span className="flex-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Product</span>
              <span className="w-24 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Item Code</span>
              <span className="w-28 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Barcode</span>
              <span className="w-16 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Qty</span>
              <span className="w-24 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Unit Cost</span>
              <span className="w-20 text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-end">Total</span>
              <span className="w-8" />
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <ProductPicker
                      products={products}
                      value={item.productName}
                      onChange={(name, price, barcode, itemCode) => {
                        setItems(prev => prev.map((it, i) => i === idx ? { ...it, productName: name, unitCost: it.unitCost || price, barcode, itemCode } : it));
                      }}
                    />
                  </div>
                  <div className="w-24"><Input placeholder="SKU" value={item.itemCode || ''} onChange={e => updateItem(idx, 'itemCode' as any, e.target.value)} className="text-xs h-9" /></div>
                  <div className="w-28"><Input placeholder="Barcode" value={item.barcode || ''} onChange={e => updateItem(idx, 'barcode' as any, e.target.value)} className="text-xs h-9" /></div>
                  <div className="w-16"><Input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} className="h-9" /></div>
                  <div className="w-24"><Input type="number" step="0.01" value={item.unitCost} onChange={e => updateItem(idx, 'unitCost', parseFloat(e.target.value) || 0)} className="h-9" /></div>
                  <p className="text-sm font-medium w-20 text-end">{formatPrice(item.quantity * item.unitCost)}</p>
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <p className="font-bold text-lg">Total: {formatPrice(totalCost)}</p>
          </div>

          <div><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} /></div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent/90 text-accent-foreground">{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main tab ─────────────────────────────────────────────── */
export default function PurchaseOrdersTab() {
  const [pos, setPos] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PO | undefined>();
  const [filter, setFilter] = useState('all');
  const [products, setProducts] = useState<ProductOption[]>([]);

  const existingSuppliers = useMemo(() => pos.map(p => p.supplier), [pos]);

  const load = () => {
    setLoading(true);
    adminPurchaseOrders({ action: 'list', status: filter === 'all' ? undefined : filter })
      .then(r => setPos(r.purchaseOrders || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  // Load products once
  useEffect(() => {
    adminPurchaseOrders({ action: 'listProducts' }).then(r => setProducts(r.products || []));
  }, []);

  const handleDelete = async (id: string) => {
    try { await adminPurchaseOrders({ action: 'delete', id }); toast.success('PO deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const advanceStage = async (po: PO) => {
    const idx = poStages.indexOf(po.status);
    if (idx < 0 || idx >= poStages.length - 1) return;
    const next = poStages[idx + 1];
    try {
      await adminPurchaseOrders({ action: 'update', id: po.id, status: next });
      toast.success(`Advanced to: ${next}`);
      load();
    } catch { toast.error('Failed'); }
  };

  const [printingId, setPrintingId] = useState<string | null>(null);
  const handlePrint = async (id: string, docType?: 'quotation' | 'purchase_order' | 'product_receipt' | 'bill') => {
    setPrintingId(id);
    try {
      const { url } = await printPurchaseOrderPdf({ id, docType });
      window.open(url, '_blank');
    } catch { toast.error('Failed to generate PDF'); }
    setPrintingId(null);
  };

  const printLabel = (status: string) => {
    switch (status) {
      case 'Quotation': return 'Print Quotation';
      case 'Purchase Order': return 'Print PO';
      case 'Product Receipt': return 'Print Receipt';
      case 'Bill Confirmed': return 'Print Bill';
      default: return 'Print';
    }
  };

  const nextStageLabel = (status: string) => {
    const idx = poStages.indexOf(status);
    if (idx < 0 || idx >= poStages.length - 1) return null;
    return `Advance to ${poStages[idx + 1]}`;
  };

  return (
    <div className="space-y-4">
      {/* Flow guide */}
      <div className="bg-muted/50 rounded-xl px-5 py-3 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
        {poStages.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className="bg-background px-2 py-1 rounded-md border border-border">{s}</span>
            {i < poStages.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Badge variant={filter === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilter('all')}>All</Badge>
          {poStatuses.map(s => <Badge key={s} variant={filter === s ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilter(s)}>{s}</Badge>)}
        </div>
        <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="h-4 w-4" /> New Quotation
        </Button>
      </div>

      {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        : pos.length === 0 ? <p className="text-center py-16 text-muted-foreground">No purchase orders found</p>
        : (
        <div className="space-y-3">
          {pos.map(po => (
            <div key={po.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-4">
                <Truck className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">PO-{po.poNumber} · {po.supplier}</p>
                  <p className="text-xs text-muted-foreground">
                    {po.expectedDelivery ? `Expected ${format(new Date(po.expectedDelivery + 'T00:00:00'), 'MMM d, yyyy')}` : 'No delivery date'}
                    {po.createdAt ? ` · Created ${format(new Date(po.createdAt), 'MMM d')}` : ''}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${stageColors[po.status] || 'bg-muted text-muted-foreground'}`}>
                  {po.status}
                </span>
                <span className="font-bold text-sm w-20 text-end">{formatPrice(po.totalCost)}</span>
              </div>

              <div className="px-5 pb-4 border-t border-border pt-3">
                <StageIndicator currentStatus={po.status} />
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled={printingId === po.id} onClick={() => handlePrint(po.id, docTypeMap[po.status])}>
                    {printingId === po.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
                    {printLabel(po.status)}
                  </Button>

                  {nextStageLabel(po.status) && (
                    <Button size="sm" className="gap-1.5 text-xs bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => advanceStage(po)}>
                      <ChevronRight className="h-3.5 w-3.5" />
                      {nextStageLabel(po.status)}
                    </Button>
                  )}

                  <div className="flex-1" />

                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(po); setDialogOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete PO-{po.poNumber}?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(po.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <POFormDialog po={editing} open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={load} products={products} existingSuppliers={existingSuppliers} />
    </div>
  );
}
