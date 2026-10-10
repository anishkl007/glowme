import { useState, useEffect } from 'react';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Input } from '@project/components/ui/input';
import { Label } from '@project/components/ui/label';
import { Textarea } from '@project/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { Skeleton } from '@project/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@project/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@project/components/ui/alert-dialog';
import { adminInvoices, AdminInvoicesOutputType, printInvoicePdf } from 'zitejs/api';
import { formatPrice } from '@/data/sampleData';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Receipt, Printer, Loader2, Send, CheckCircle2, ChevronRight, Circle } from 'lucide-react';

type Invoice = NonNullable<AdminInvoicesOutputType['invoices']>[0];

const invoiceStages = ['Draft', 'Sent', 'Paid'];
const invoiceStatuses = [...invoiceStages, 'Overdue', 'Cancelled'];

const statusColor: Record<string, string> = {
  Draft: 'bg-muted text-muted-foreground',
  Sent: 'bg-blue-100 text-blue-800',
  Paid: 'bg-green-100 text-green-800',
  Overdue: 'bg-red-100 text-red-800',
  Cancelled: 'bg-muted text-muted-foreground line-through',
};

interface LineItem { description: string; quantity: number; unitPrice: number; barcode?: string; itemCode?: string; }

function InvoiceStageIndicator({ status }: { status: string }) {
  const currentIdx = invoiceStages.indexOf(status);
  if (status === 'Cancelled' || status === 'Overdue') {
    return <Badge variant={status === 'Cancelled' ? 'secondary' : 'destructive'} className="text-xs">{status}</Badge>;
  }
  return (
    <div className="flex items-center gap-1 py-1">
      {invoiceStages.map((stage, i) => {
        const isCompleted = i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={stage} className="flex items-center gap-1">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
              ${isCompleted ? 'bg-green-100 text-green-700' : isCurrent ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30' : 'bg-muted text-muted-foreground'}`}>
              {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
              {stage}
            </div>
            {i < invoiceStages.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
          </div>
        );
      })}
    </div>
  );
}

function InvoiceFormDialog({ invoice, open, onClose, onSaved }: { invoice?: Invoice; open: boolean; onClose: () => void; onSaved: () => void }) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [status, setStatus] = useState('Draft');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [tax, setTax] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (invoice) {
      setCustomerName(invoice.customerName);
      setCustomerEmail(invoice.customerEmail);
      setStatus(invoice.status);
      setPaymentMethod(invoice.paymentMethod);
      setDueDate(invoice.dueDate);
      setNotes(invoice.notes);
      setTax(invoice.tax);
      try { setItems(JSON.parse(invoice.itemsJson)); } catch { setItems([{ description: '', quantity: 1, unitPrice: 0 }]); }
    } else {
      setCustomerName(''); setCustomerEmail(''); setStatus('Draft'); setPaymentMethod('');
      setDueDate(''); setNotes(''); setTax(0); setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
    }
  }, [invoice, open]);

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const total = subtotal + tax;

  const updateItem = (idx: number, key: keyof LineItem, val: any) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: val } : it));
  };

  const handleSave = async () => {
    if (!customerName) { toast.error('Customer name is required'); return; }
    setSaving(true);
    try {
      await adminInvoices({
        action: invoice ? 'update' : 'create',
        id: invoice?.id,
        customerName, customerEmail, status, paymentMethod, dueDate, notes,
        subtotal, tax, total,
        itemsJson: JSON.stringify(items.filter(i => i.description)),
      });
      toast.success(invoice ? 'Invoice updated' : 'Invoice created');
      onSaved(); onClose();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{invoice ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Customer Name *</Label><Input value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
            <div><Label>Customer Email</Label><Input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{invoiceStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Payment Method</Label>
              <Select value={paymentMethod || 'none'} onValueChange={v => setPaymentMethod(v === 'none' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="KNET">KNET</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Due Date</Label><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Line Items</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => setItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0 }])}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
              </Button>
            </div>
            {/* Column headers */}
            <div className="flex gap-2 items-center mb-1 px-0.5">
              <span className="w-24 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Item Code</span>
              <span className="w-28 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Barcode</span>
              <span className="flex-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Description</span>
              <span className="w-16 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Qty</span>
              <span className="w-24 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Price</span>
              <span className="w-20 text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-end">Total</span>
              <span className="w-8" />
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="w-24"><Input placeholder="SKU" value={item.itemCode || ''} onChange={e => updateItem(idx, 'itemCode' as any, e.target.value)} className="text-xs h-9" /></div>
                  <div className="w-28"><Input placeholder="Barcode" value={item.barcode || ''} onChange={e => updateItem(idx, 'barcode' as any, e.target.value)} className="text-xs h-9" /></div>
                  <div className="flex-1"><Input placeholder="Description" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} className="h-9" /></div>
                  <div className="w-16"><Input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} className="h-9" /></div>
                  <div className="w-24"><Input type="number" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} className="h-9" /></div>
                  <p className="text-sm font-medium w-20 text-end">{formatPrice(item.quantity * item.unitPrice)}</p>
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label>Tax (KD)</Label><Input type="number" step="0.01" value={tax} onChange={e => setTax(parseFloat(e.target.value) || 0)} /></div>
            <div className="flex flex-col justify-end">
              <div className="text-sm space-y-1 text-end">
                <p className="text-muted-foreground">Subtotal: {formatPrice(subtotal)}</p>
                <p className="text-muted-foreground">Tax: {formatPrice(tax)}</p>
                <p className="font-bold text-lg">Total: {formatPrice(total)}</p>
              </div>
            </div>
          </div>

          <div><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} /></div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent/90 text-accent-foreground">{saving ? 'Saving...' : 'Save Invoice'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function InvoicesTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | undefined>();
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    adminInvoices({ action: 'list', status: filter === 'all' ? undefined : filter })
      .then(r => setInvoices(r.invoices || []))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filter]);

  const handleDelete = async (id: string) => {
    try { await adminInvoices({ action: 'delete', id }); toast.success('Invoice deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const advanceStatus = async (inv: Invoice) => {
    const idx = invoiceStages.indexOf(inv.status);
    if (idx < 0 || idx >= invoiceStages.length - 1) return;
    const next = invoiceStages[idx + 1];
    try {
      await adminInvoices({ action: 'update', id: inv.id, status: next });
      toast.success(`Invoice → ${next}`);
      load();
    } catch { toast.error('Failed'); }
  };

  const [printingId, setPrintingId] = useState<string | null>(null);
  const handlePrint = async (id: string) => {
    setPrintingId(id);
    try {
      const { url } = await printInvoicePdf({ id });
      window.open(url, '_blank');
    } catch { toast.error('Failed to generate PDF'); }
    setPrintingId(null);
  };

  const confirmAndPrint = async (inv: Invoice) => {
    // First confirm (mark as Paid), then print
    setPrintingId(inv.id);
    try {
      await adminInvoices({ action: 'update', id: inv.id, status: 'Paid' });
      const { url } = await printInvoicePdf({ id: inv.id });
      window.open(url, '_blank');
      toast.success('Invoice confirmed & PDF generated!');
      load();
    } catch { toast.error('Failed'); }
    setPrintingId(null);
  };

  const nextLabel = (status: string) => {
    const idx = invoiceStages.indexOf(status);
    if (idx < 0 || idx >= invoiceStages.length - 1) return null;
    return invoiceStages[idx + 1] === 'Sent' ? 'Mark as Sent' : 'Mark as Paid';
  };

  return (
    <div className="space-y-4">
      {/* Flow guide */}
      <div className="bg-muted/50 rounded-xl px-5 py-3 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
        <span className="bg-background px-2 py-1 rounded-md border border-border">Order Confirmed</span>
        <ChevronRight className="h-3.5 w-3.5" />
        {invoiceStages.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className="bg-background px-2 py-1 rounded-md border border-border">{s}</span>
            {i < invoiceStages.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
          </div>
        ))}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="bg-background px-2 py-1 rounded-md border border-border">🖨️ Print</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Badge variant={filter === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilter('all')}>All</Badge>
          {invoiceStatuses.map(s => <Badge key={s} variant={filter === s ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilter(s)}>{s}</Badge>)}
        </div>
        <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} className="gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="h-4 w-4" /> New Invoice
        </Button>
      </div>

      {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        : invoices.length === 0 ? <p className="text-center py-16 text-muted-foreground">No invoices found</p>
        : (
        <div className="space-y-3">
          {invoices.map(inv => (
            <div key={inv.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-4">
                <Receipt className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">INV-{inv.invoiceNumber} · {inv.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {inv.customerEmail}{inv.dueDate ? ` · Due ${format(new Date(inv.dueDate + 'T00:00:00'), 'MMM d, yyyy')}` : ''}
                    {inv.createdAt ? ` · Created ${format(new Date(inv.createdAt), 'MMM d')}` : ''}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[inv.status] || 'bg-muted text-muted-foreground'}`}>
                  {inv.status}
                </span>
                <span className="font-bold text-sm w-20 text-end">{formatPrice(inv.total)}</span>
              </div>

              {/* Stage progress + actions */}
              <div className="px-5 pb-4 border-t border-border pt-3">
                <InvoiceStageIndicator status={inv.status} />
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {/* Print invoice */}
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled={printingId === inv.id} onClick={() => handlePrint(inv.id)}>
                    {printingId === inv.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />}
                    Print Invoice
                  </Button>

                  {/* Advance stage */}
                  {nextLabel(inv.status) && (
                    <Button size="sm" className="gap-1.5 text-xs bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => advanceStatus(inv)}>
                      {inv.status === 'Draft' ? <Send className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      {nextLabel(inv.status)}
                    </Button>
                  )}

                  {/* Confirm & Print for Sent invoices */}
                  {inv.status === 'Sent' && (
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs border-green-300 text-green-700 hover:bg-green-50" disabled={printingId === inv.id} onClick={() => confirmAndPrint(inv)}>
                      {printingId === inv.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><CheckCircle2 className="h-3.5 w-3.5" /> Confirm & Print</>}
                    </Button>
                  )}

                  <div className="flex-1" />

                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(inv); setDialogOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete invoice INV-{inv.invoiceNumber}?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(inv.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <InvoiceFormDialog invoice={editing} open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={load} />
    </div>
  );
}
