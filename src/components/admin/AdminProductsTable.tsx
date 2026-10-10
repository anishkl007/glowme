import { useMemo, useState } from 'react';
import { ArrowUpDown, Pencil, Trash2 } from 'lucide-react';
import { GetProductsOutputType } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@project/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@project/components/ui/alert-dialog';
import { formatPrice } from '@/data/sampleData';

type P = GetProductsOutputType['products'][0];
type Key = 'name' | 'store' | 'category' | 'itemCode' | 'barcode' | 'price' | 'stock';
const PAGE = 25;

export default function AdminProductsTable({ products, storeName, onEdit, onDelete }: {
  products: P[]; storeName: (p: P) => string; onEdit: (p: P) => void; onDelete: (id: string) => void;
}) {
  const [sort, setSort] = useState<{ k: Key; dir: 1 | -1 }>({ k: 'name', dir: 1 });
  const [page, setPage] = useState(0);

  const rows = useMemo(() => {
    const val = (p: P): string | number => sort.k === 'store' ? storeName(p) : sort.k === 'stock' ? (p.stockQuantity ?? -1) : sort.k === 'price' ? p.price : (p[sort.k] || '');
    return [...products].sort((a, b) => { const x = val(a), y = val(b); return (x > y ? 1 : x < y ? -1 : 0) * sort.dir; });
  }, [products, sort, storeName]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const cur = Math.min(page, pages - 1);
  const shown = rows.slice(cur * PAGE, cur * PAGE + PAGE);

  const H = ({ k, label, cls = '' }: { k: Key; label: string; cls?: string }) => (
    <TableHead className={cls}>
      <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => setSort(s => ({ k, dir: s.k === k ? (s.dir === 1 ? -1 : 1) : 1 }))}>
        {label}<ArrowUpDown className={`h-3 w-3 ${sort.k === k ? 'text-accent' : 'opacity-40'}`} />
      </button>
    </TableHead>
  );

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="w-14" />
            <H k="name" label="Product" /><H k="store" label="Store" /><H k="category" label="Category" />
            <H k="itemCode" label="Item Code" /><H k="barcode" label="Barcode" />
            <H k="price" label="Price" cls="text-right" /><H k="stock" label="Stock" cls="text-right" />
            <TableHead>Status</TableHead><TableHead className="w-20" />
          </TableRow></TableHeader>
          <TableBody>
            {shown.map(p => (
              <TableRow key={p.id}>
                <TableCell><img src={p.image} alt="" className="h-10 w-10 rounded-md object-cover bg-muted" /></TableCell>
                <TableCell className="font-medium max-w-[220px] truncate">{p.name}</TableCell>
                <TableCell className="whitespace-nowrap">{storeName(p) || <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell className="text-muted-foreground">{p.category}</TableCell>
                <TableCell className="font-mono text-xs">{p.itemCode || '—'}</TableCell>
                <TableCell className="font-mono text-xs">{p.barcode || '—'}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {formatPrice(p.price)}{p.originalPrice ? <span className="block text-[10px] text-muted-foreground line-through">{formatPrice(p.originalPrice)}</span> : null}
                </TableCell>
                <TableCell className={`text-right ${p.stockQuantity != null && p.stockQuantity <= 5 ? 'text-destructive font-semibold' : ''}`}>{p.stockQuantity ?? '—'}</TableCell>
                <TableCell><Badge variant={p.inStock ? 'secondary' : 'outline'} className="whitespace-nowrap">{p.inStock ? 'In stock' : 'Out of stock'}</Badge></TableCell>
                <TableCell>
                  <div className="flex">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete "{p.name}"?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(p.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <Button size="sm" variant="outline" disabled={cur === 0} onClick={() => setPage(cur - 1)}>Previous</Button>
          <span className="text-muted-foreground">Page {cur + 1} of {pages}</span>
          <Button size="sm" variant="outline" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
