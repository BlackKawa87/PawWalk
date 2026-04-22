import type { Booking } from "./booking";

function fmtCurrency(amount: number, currency: string): string {
  const symbol = currency === "GBP" ? "£" : "$";
  return `${symbol}${amount.toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function downloadInvoice(booking: Booking): void {
  const amountPaid = booking.total + booking.serviceFee - (booking.creditsUsed ?? 0);
  const invoiceNumber = `PG-${booking.id.slice(0, 8).toUpperCase()}`;
  const issuedDate = formatDate(booking.createdAt);
  const walkDate = new Date(booking.date + "T00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoiceNumber} — PawGo</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 14px;
      color: #1a1a1a;
      background: #fff;
      padding: 48px;
      max-width: 680px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 2px solid #2d6a4f;
    }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-name { font-size: 22px; font-weight: 800; color: #2d6a4f; }
    .brand-paw { font-size: 26px; }
    .invoice-label { text-align: right; }
    .invoice-label h1 { font-size: 20px; font-weight: 700; color: #1a1a1a; }
    .invoice-label .number { font-size: 13px; color: #666; margin-top: 4px; }
    .invoice-label .date { font-size: 13px; color: #666; margin-top: 2px; }
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 36px;
    }
    .party-block h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 8px; }
    .party-block p { font-size: 14px; line-height: 1.6; }
    .party-block .name { font-weight: 600; font-size: 15px; }
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #888;
      margin-bottom: 12px;
    }
    .service-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    .service-table th {
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #888;
      padding: 0 0 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .service-table th:last-child { text-align: right; }
    .service-table td {
      padding: 10px 0;
      border-bottom: 1px solid #f3f4f6;
      font-size: 14px;
      vertical-align: top;
    }
    .service-table td:last-child { text-align: right; font-weight: 500; }
    .service-table td .sub { font-size: 12px; color: #666; margin-top: 2px; }
    .totals { margin-left: auto; width: 280px; }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 14px;
    }
    .totals-row.credit { color: #15803d; }
    .totals-row.free { color: #15803d; }
    .totals-divider { border: none; border-top: 1px solid #e5e7eb; margin: 8px 0; }
    .totals-row.total {
      font-weight: 700;
      font-size: 16px;
      padding: 10px 0 0 0;
    }
    .status-badge {
      display: inline-block;
      background: #dcfce7;
      color: #15803d;
      font-size: 12px;
      font-weight: 600;
      padding: 2px 10px;
      border-radius: 99px;
      margin-left: 8px;
      vertical-align: middle;
    }
    .footer {
      margin-top: 48px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 12px;
      color: #999;
    }
    .footer .ref { font-family: monospace; font-size: 11px; }
    .note { background: #f9fafb; border-radius: 8px; padding: 14px 16px; font-size: 13px; color: #555; margin-bottom: 28px; line-height: 1.5; }
    @media print {
      body { padding: 32px; }
      @page { margin: 20mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <span class="brand-paw">🐾</span>
      <span class="brand-name">PawGo</span>
    </div>
    <div class="invoice-label">
      <h1>INVOICE</h1>
      <div class="number">${invoiceNumber}</div>
      <div class="date">Issued: ${issuedDate}</div>
    </div>
  </div>

  <div class="parties">
    <div class="party-block">
      <h3>From</h3>
      <p class="name">PawGo Platform</p>
      <p>pawgo-six.vercel.app</p>
      <p>support@pawgo.app</p>
    </div>
    <div class="party-block">
      <h3>Billed to</h3>
      <p class="name">${booking.ownerName}</p>
      <p>Dog: ${booking.ownerDog}</p>
    </div>
  </div>

  <p class="section-title">Service details</p>
  <table class="service-table">
    <thead>
      <tr>
        <th>Description</th>
        <th>Details</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          Dog walking service
          <div class="sub">Walker: ${booking.walkerName}</div>
        </td>
        <td>
          ${walkDate}<br/>
          ${booking.time} · ${booking.duration} min
        </td>
        <td>${fmtCurrency(booking.total, booking.currency)}</td>
      </tr>
      <tr>
        <td>Service fee</td>
        <td>${booking.serviceFee > 0 ? "Platform service charge" : "Active member — waived"}</td>
        <td>${booking.serviceFee > 0 ? fmtCurrency(booking.serviceFee, booking.currency) : '<span style="color:#15803d;">Free</span>'}</td>
      </tr>
      ${(booking.creditsUsed ?? 0) > 0 ? `<tr>
        <td>PawGo credits applied</td>
        <td>Account credit</td>
        <td style="color:#15803d;">-${fmtCurrency(booking.creditsUsed, booking.currency)}</td>
      </tr>` : ""}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Walk</span>
      <span>${fmtCurrency(booking.total, booking.currency)}</span>
    </div>
    <div class="totals-row">
      <span>Service fee</span>
      <span class="${booking.serviceFee === 0 ? "free" : ""}">${booking.serviceFee > 0 ? fmtCurrency(booking.serviceFee, booking.currency) : "Free"}</span>
    </div>
    ${(booking.creditsUsed ?? 0) > 0 ? `<div class="totals-row credit">
      <span>Credits</span>
      <span>-${fmtCurrency(booking.creditsUsed, booking.currency)}</span>
    </div>` : ""}
    <hr class="totals-divider" />
    <div class="totals-row total">
      <span>Total paid <span class="status-badge">PAID</span></span>
      <span>${fmtCurrency(amountPaid, booking.currency)}</span>
    </div>
  </div>

  <div class="note">
    <strong>Independent contractor notice:</strong> ${booking.walkerName} is an independent contractor who provides services through the PawGo platform. PawGo is not responsible for the walking services provided. This invoice serves as proof of payment for platform services and walker fees.
  </div>

  <div class="footer">
    <div>
      <div>PawGo · pawgo-six.vercel.app</div>
      <div>Thank you for using PawGo 🐾</div>
    </div>
    <div class="ref">Booking ref: ${booking.id.slice(0, 8).toUpperCase()}</div>
  </div>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 600);
}
