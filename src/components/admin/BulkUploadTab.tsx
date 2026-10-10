import { useState, useRef } from 'react';
import { Button } from '@project/components/ui/button';
import { Textarea } from '@project/components/ui/textarea';
import { Badge } from '@project/components/ui/badge';
import { adminBulkUploadProducts } from 'zitejs/api';
import { toast } from 'sonner';
import { Upload, FileText, Download, AlertCircle, CheckCircle2 } from 'lucide-react';

const CSV_TEMPLATE = `name,brand,store,price,originalPrice,category,image,tags,skinTypes,stockQuantity,pickupAvailable,sameDayDelivery,itemCode,barcode
"Matte Lipstick Rose","Glowme","Glowme Products",5.5,7,"Makeup","https://example.com/img.jpg","Clean Beauty,Vegan","All",25,true,false,"SKU-001","6291234567890"
"Hydrating Serum","Skin Lab","Glowme Products",12,,"Skincare","","Natural,Organic","Dry,Normal",10,false,true,"SKU-002","6291234567891"`;

function parseCSV(text: string) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue; }
      current += char;
    }
    values.push(current.trim());
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return {
      name: obj.name || '',
      brand: obj.brand || '',
      store: obj.store || '',
      price: parseFloat(obj.price) || 0,
      originalPrice: obj.originalPrice ? parseFloat(obj.originalPrice) || undefined : undefined,
      stockQuantity: obj.stockQuantity !== '' && obj.stockQuantity !== undefined && !isNaN(parseInt(obj.stockQuantity)) ? parseInt(obj.stockQuantity) : undefined,
      category: obj.category || 'Makeup',
      image: obj.image || '',
      tags: obj.tags || '',
      skinTypes: obj.skinTypes || '',
      inStock: obj.inStock === 'false' ? false : obj.inStock === 'true' ? true : undefined,
      pickupAvailable: obj.pickupAvailable === 'true',
      sameDayDelivery: obj.sameDayDelivery === 'true',
      barcode: obj.barcode || '',
      itemCode: obj.itemCode || '',
    };
  });
}

export default function BulkUploadTab() {
  const [csv, setCsv] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: { row: number; message: string }[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setCsv(ev.target?.result as string || ''); setResult(null); };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    const products = parseCSV(csv);
    if (products.length === 0) { toast.error('No valid products found in CSV'); return; }
    if (products.length > 100) { toast.error('Maximum 100 products per upload'); return; }
    setUploading(true);
    setResult(null);
    try {
      const res = await adminBulkUploadProducts({ products });
      setResult(res);
      if (res.created > 0) toast.success(`${res.created} products created!`);
      if (res.errors.length > 0) toast.error(`${res.errors.length} rows had errors`);
    } catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'products_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const parsed = csv ? parseCSV(csv) : [];

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Bulk Upload Products</h3>
            <p className="text-sm text-muted-foreground mt-1">Upload a CSV file or paste CSV data to add multiple products at once.</p>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-1.5">
            <Download className="h-4 w-4" /> Download Template
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-1.5">
              <FileText className="h-4 w-4" /> Choose CSV File
            </Button>
          </div>

          <Textarea
            value={csv}
            onChange={e => { setCsv(e.target.value); setResult(null); }}
            rows={10}
            placeholder={`Paste CSV data here...\n\n${CSV_TEMPLATE}`}
            className="font-mono text-xs"
          />

          {parsed.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">{parsed.length} products detected:</p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {parsed.slice(0, 20).map((p, i) => (
                  <div key={i} className="text-xs flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{i + 1}</Badge>
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground">· {p.brand}{p.store ? ` · ${p.store}` : ''} · {p.price} KD · {p.category}{(p as any).itemCode ? ` · ${(p as any).itemCode}` : ''}{(p as any).barcode ? ` · BC:${(p as any).barcode}` : ''}</span>
                  </div>
                ))}
                {parsed.length > 20 && <p className="text-xs text-muted-foreground">...and {parsed.length - 20} more</p>}
              </div>
            </div>
          )}

          {result && (
            <div className={`rounded-lg p-4 ${result.errors.length > 0 ? 'bg-destructive/10' : 'bg-green-50 dark:bg-green-950/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.created > 0 && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                {result.errors.length > 0 && <AlertCircle className="h-4 w-4 text-destructive" />}
                <span className="text-sm font-medium">
                  {result.created} created{result.errors.length > 0 ? `, ${result.errors.length} errors` : ''}
                </span>
              </div>
              {result.errors.map((e, i) => (
                <p key={i} className="text-xs text-destructive">Row {e.row}: {e.message}</p>
              ))}
            </div>
          )}

          <Button onClick={handleUpload} disabled={uploading || parsed.length === 0} className="gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground">
            <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : `Upload ${parsed.length} Products`}
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h4 className="font-semibold mb-3">CSV Format Guide</h4>
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Required columns:</strong> name, brand, price</p>
          <p><strong>Optional columns:</strong> store, originalPrice, category, image, tags, skinTypes, stockQuantity, inStock, pickupAvailable, sameDayDelivery, itemCode, barcode</p>
          <p><strong>Store:</strong> store name or key from the Stores tab (e.g. &quot;Glowme Products&quot;). Leave blank to use Glowme Products.</p>
          <p><strong>Stock quantity:</strong> whole number; products with 0 are marked out of stock.</p>
          <p><strong>Category values:</strong> Skincare, Makeup, Haircare, Fragrance, Tools, Salon Services</p>
          <p><strong>Boolean values:</strong> true / false</p>
          <p><strong>Tags/SkinTypes:</strong> Comma-separated within quotes, e.g. &quot;Clean Beauty,Vegan&quot;</p>
        </div>
      </div>
    </div>
  );
}
