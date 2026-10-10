import { enrichCurrentUser } from '../lib/currentUser';
import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { ZitePdf } from 'zitejs/pdf';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({ id: z.string(), docType: z.enum(['quotation', 'purchase_order', 'product_receipt', 'bill']).optional() }),
  outputSchema: z.object({ url: z.string() }),
  execute: async ({ input, context }) => {
    await enrichCurrentUser(context);
    if (context.user.role !== 'Admin') throw new ZiteError({ code: 'FORBIDDEN', message: 'Admin only' });

    const po = await zite.purchaseOrders.findOne({ id: input.id });
    if (!po) throw new ZiteError({ code: 'NOT_FOUND', message: 'Purchase order not found' });

    const escapeHtml = (s: unknown) =>
      String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const safeNum = (n: unknown) => {
      const v = Number(n);
      return Number.isFinite(v) ? v : 0;
    };

    let items: { productName: string; quantity: number; unitCost: number; barcode?: string; itemCode?: string }[] = [];
    try { items = JSON.parse(po.itemsJson || '[]'); } catch { items = []; }

    const totalCost = safeNum(po.totalCost);

    // Determine document type based on status or explicit docType
    const docType = input.docType || (() => {
      switch (po.status) {
        case 'Quotation': return 'quotation';
        case 'Purchase Order': return 'purchase_order';
        case 'Product Receipt': return 'product_receipt';
        case 'Bill Confirmed': return 'bill';
        default: return 'quotation';
      }
    })();

    const docTitles: Record<string, string> = {
      quotation: 'Quotation',
      purchase_order: 'Purchase Order',
      product_receipt: 'Product Receipt',
      bill: 'Bill / Tax Invoice',
    };
    const docTitle = docTitles[docType] || 'Document';

    const docColors: Record<string, { bg: string; fg: string; accent: string }> = {
      quotation: { bg: '#f0f9ff', fg: '#0c4a6e', accent: '#0284c7' },
      purchase_order: { bg: '#eff6ff', fg: '#1e3a5f', accent: '#2563eb' },
      product_receipt: { bg: '#fefce8', fg: '#713f12', accent: '#ca8a04' },
      bill: { bg: '#f0fdf4', fg: '#14532d', accent: '#16a34a' },
    };
    const colors = docColors[docType] || docColors.quotation;

    const rowsHtml = items
      .map((li, i) => {
        const qty = safeNum(li.quantity);
        const cost = safeNum(li.unitCost);
        return `<tr>
          <td>${i + 1}</td>
          <td>${escapeHtml(li.itemCode || '—')}</td>
          <td>${escapeHtml(li.barcode || '—')}</td>
          <td>${escapeHtml(li.productName)}</td>
          <td class="num">${qty}</td>
          <td class="num">${cost.toFixed(3)} KD</td>
          <td class="num">${(qty * cost).toFixed(3)} KD</td>
        </tr>`;
      })
      .join('');

    const expectedStr = po.expectedDelivery
      ? new Date(po.expectedDelivery + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '—';
    const createdStr = po.createdAt
      ? new Date(po.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const stageLabels = ['Quotation', 'Purchase Order', 'Product Receipt', 'Bill Confirmed'];
    const currentStageIdx = stageLabels.indexOf(po.status || 'Quotation');
    const stagesHtml = stageLabels.map((label, i) => {
      const isActive = i <= currentStageIdx;
      const isCurrent = i === currentStageIdx;
      return `<div style="display:flex;align-items:center;gap:6px;">
        <div style="width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;
          ${isActive ? `background:${colors.accent};color:white;` : 'background:#e2e8f0;color:#94a3b8;'}">
          ${i + 1}
        </div>
        <span style="font-size:8.5pt;font-weight:${isCurrent ? '700' : '400'};color:${isActive ? '#111827' : '#94a3b8'};">${escapeHtml(label)}</span>
        ${i < stageLabels.length - 1 ? `<div style="width:24px;height:2px;background:${isActive && i < currentStageIdx ? colors.accent : '#e2e8f0'};margin:0 2px;"></div>` : ''}
      </div>`;
    }).join('');

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @page { size: a4; margin: 0.75in; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; font-size: 10.5pt; line-height: 1.5; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
      .logo { font-size: 22pt; font-weight: 800; letter-spacing: -0.02em; }
      .logo span { color: #e11d48; }
      .doc-title { text-align: right; }
      .doc-title h1 { font-size: 13pt; margin: 0; color: ${colors.fg}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
      .doc-title .doc-num { font-size: 20pt; font-weight: 800; margin: 4px 0 8px; color: #111827; }
      .doc-badge { background: ${colors.bg}; color: ${colors.fg}; padding: 4px 14px; border-radius: 20px; font-size: 9pt; font-weight: 700; border: 1px solid ${colors.accent}30; }
      .stages { display: flex; align-items: center; gap: 4px; margin-bottom: 24px; padding: 14px 20px; background: #f8fafc; border-radius: 8px; justify-content: center; }
      .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; padding: 20px; background: #f8fafc; border-radius: 8px; }
      .meta-group dt { color: #64748b; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px; }
      .meta-group dd { margin: 0 0 10px; font-weight: 600; font-size: 10.5pt; }
      table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; margin-bottom: 20px; }
      th { text-align: left; font-size: 8pt; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; padding: 10px 8px; }
      td { padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-size: 10pt; }
      td.num, th.num { text-align: right; }
      .totals { margin-left: auto; width: 260px; }
      .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 10pt; }
      .totals-row.final { border-top: 2px solid #111827; padding-top: 10px; margin-top: 6px; font-weight: 800; font-size: 13pt; }
      .notes { margin-top: 28px; padding: 16px; background: #f8fafc; border-radius: 8px; font-size: 9.5pt; color: #475569; }
      .notes strong { color: #111827; }
      .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 8.5pt; color: #94a3b8; }
      .signature { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
      .sig-box { border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 9pt; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">Glow<span>Me</span></div>
      <div class="doc-title">
        <h1>${escapeHtml(docTitle)}</h1>
        <div class="doc-num">PO-${escapeHtml(po.poNumber)}</div>
        <span class="doc-badge">${escapeHtml(po.status || 'Quotation')}</span>
      </div>
    </div>

    <div class="stages">${stagesHtml}</div>

    <div class="meta">
      <div class="meta-group">
        <dl>
          <dt>Supplier</dt>
          <dd>${escapeHtml(po.supplier)}</dd>
        </dl>
      </div>
      <div class="meta-group" style="text-align:right;">
        <dl style="text-align:right;">
          <dt>Document Date</dt>
          <dd>${createdStr}</dd>
          <dt>Expected Delivery</dt>
          <dd>${expectedStr}</dd>
        </dl>
      </div>
    </div>

    <table>
      <thead><tr><th>#</th><th>Item Code</th><th>Barcode</th><th>Product</th><th class="num">Qty</th><th class="num">Unit Cost</th><th class="num">Total</th></tr></thead>
      <tbody>${rowsHtml || '<tr><td colspan="7" style="text-align:center;color:#94a3b8;">No items</td></tr>'}</tbody>
    </table>

    <div class="totals">
      <div class="totals-row final"><span>Total</span><span>${totalCost.toFixed(3)} KD</span></div>
    </div>

    ${po.notes ? `<div class="notes"><strong>Notes:</strong> ${escapeHtml(po.notes)}</div>` : ''}

    <div class="signature">
      <div class="sig-box">Authorized Signature (GlowMe)</div>
      <div class="sig-box">Supplier Signature</div>
    </div>

    <div class="footer">
      GlowMe Kuwait · ${escapeHtml(docTitle)} Document · PO-${escapeHtml(po.poNumber)}
    </div>
  </body>
</html>`;

    const { url } = await ZitePdf.renderHtml({
      html,
      filename: `${docType}-PO-${po.poNumber}.pdf`,
    });

    return { url };
  },
});
