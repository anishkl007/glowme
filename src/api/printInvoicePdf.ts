import { enrichCurrentUser } from '../lib/currentUser';
import { z } from 'zod';
import { zite } from 'zitejs/db';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { ZitePdf } from 'zitejs/pdf';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({ id: z.string() }),
  outputSchema: z.object({ url: z.string() }),
  execute: async ({ input, context }) => {
    await enrichCurrentUser(context);
    if (context.user.role !== 'Admin') throw new ZiteError({ code: 'FORBIDDEN', message: 'Admin only' });

    const inv = await zite.invoices.findOne({ id: input.id });
    if (!inv) throw new ZiteError({ code: 'NOT_FOUND', message: 'Invoice not found' });

    const escapeHtml = (s: unknown) =>
      String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const safeNum = (n: unknown) => {
      const v = Number(n);
      return Number.isFinite(v) ? v : 0;
    };

    let items: { description: string; quantity: number; unitPrice: number; barcode?: string; itemCode?: string }[] = [];
    try { items = JSON.parse(inv.itemsJson || '[]'); } catch { items = []; }

    // Look up barcode/itemCode from Products if not already in items
    const needsLookup = items.some(i => !i.barcode && !i.itemCode);
    let productMap: Record<string, { barcode: string; itemCode: string }> = {};
    if (needsLookup) {
      const { records: prods } = await zite.products.findAll({ limit: 500, fields: ['name', 'barcode', 'itemCode'] });
      for (const p of prods) {
        if (p.name) productMap[p.name.toLowerCase()] = { barcode: p.barcode || '', itemCode: p.itemCode || '' };
      }
    }

    const subtotal = safeNum(inv.subtotal);
    const tax = safeNum(inv.tax);
    const total = safeNum(inv.total);

    const rowsHtml = items
      .map((li, i) => {
        const qty = safeNum(li.quantity);
        const unit = safeNum(li.unitPrice);
        // Try to get barcode/itemCode from item data or lookup by product name
        const descClean = (li.description || '').replace(/\s*\(.*\)$/, '').toLowerCase();
        const lookup = productMap[descClean] || { barcode: '', itemCode: '' };
        const barcode = li.barcode || lookup.barcode || '—';
        const itemCode = li.itemCode || lookup.itemCode || '—';
        return `<tr>
          <td>${i + 1}</td>
          <td>${escapeHtml(itemCode)}</td>
          <td>${escapeHtml(barcode)}</td>
          <td>${escapeHtml(li.description)}</td>
          <td class="num">${qty}</td>
          <td class="num">${unit.toFixed(3)} KD</td>
          <td class="num">${(qty * unit).toFixed(3)} KD</td>
        </tr>`;
      })
      .join('');

    const dueDateStr = inv.dueDate
      ? new Date(inv.dueDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '—';
    const createdStr = inv.createdAt
      ? new Date(inv.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const statusBadge = inv.status === 'Paid'
      ? '<span style="background:#dcfce7;color:#166534;padding:4px 12px;border-radius:20px;font-size:9pt;font-weight:600;">PAID</span>'
      : inv.status === 'Overdue'
      ? '<span style="background:#fee2e2;color:#991b1b;padding:4px 12px;border-radius:20px;font-size:9pt;font-weight:600;">OVERDUE</span>'
      : `<span style="background:#f1f5f9;color:#475569;padding:4px 12px;border-radius:20px;font-size:9pt;font-weight:600;">${escapeHtml(inv.status || 'Draft')}</span>`;

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @page { size: a4; margin: 0.75in; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; font-size: 10.5pt; line-height: 1.5; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
      .logo { font-size: 22pt; font-weight: 800; letter-spacing: -0.02em; }
      .logo span { color: #e11d48; }
      .inv-title { text-align: right; }
      .inv-title h1 { font-size: 14pt; margin: 0; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
      .inv-title .inv-num { font-size: 20pt; font-weight: 800; margin: 4px 0 8px; color: #111827; }
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
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">Glow<span>Me</span></div>
      <div class="inv-title">
        <h1>Invoice</h1>
        <div class="inv-num">INV-${escapeHtml(inv.invoiceNumber)}</div>
        ${statusBadge}
      </div>
    </div>

    <div class="meta">
      <div class="meta-group">
        <dl>
          <dt>Bill To</dt>
          <dd>${escapeHtml(inv.customerName)}</dd>
          <dt>Email</dt>
          <dd>${escapeHtml(inv.customerEmail || '—')}</dd>
        </dl>
      </div>
      <div class="meta-group" style="text-align:right;">
        <dl style="text-align:right;">
          <dt>Invoice Date</dt>
          <dd>${createdStr}</dd>
          <dt>Due Date</dt>
          <dd>${dueDateStr}</dd>
          <dt>Payment Method</dt>
          <dd>${escapeHtml(inv.paymentMethod || '—')}</dd>
        </dl>
      </div>
    </div>

    <table>
      <thead><tr><th>#</th><th>Item Code</th><th>Barcode</th><th>Description</th><th class="num">Qty</th><th class="num">Unit Price</th><th class="num">Amount</th></tr></thead>
      <tbody>${rowsHtml || '<tr><td colspan="7" style="text-align:center;color:#94a3b8;">No items</td></tr>'}</tbody>
    </table>

    <div class="totals">
      <div class="totals-row"><span>Subtotal</span><span>${subtotal.toFixed(3)} KD</span></div>
      <div class="totals-row"><span>Tax</span><span>${tax.toFixed(3)} KD</span></div>
      <div class="totals-row final"><span>Total</span><span>${total.toFixed(3)} KD</span></div>
    </div>

    ${inv.notes ? `<div class="notes"><strong>Notes:</strong> ${escapeHtml(inv.notes)}</div>` : ''}

    <div class="footer">
      GlowMe Kuwait · Thank you for your business
    </div>
  </body>
</html>`;

    const { url } = await ZitePdf.renderHtml({
      html,
      filename: `invoice-INV-${inv.invoiceNumber}.pdf`,
    });

    return { url };
  },
});
