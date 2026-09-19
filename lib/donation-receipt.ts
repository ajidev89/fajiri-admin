import { format } from "date-fns";
import { Donation, getDonationTitle, getDonationType } from "@/services/donations";

function escapeHtml(value: unknown): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatAmount(amount: number | string | undefined, currency?: string) {
    const value = Number(amount ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${currency ?? ""} ${value}`.trim();
}

export function buildReceiptHtml(donation: Donation): string {
    const type = getDonationType(donation) === "campaign" ? "Campaign" : "Need";
    const date = donation.created_at
        ? format(new Date(donation.created_at), "dd MMM yyyy, HH:mm")
        : "—";
    const rows: [string, string][] = [
        ["Receipt No.", donation.reference],
        ["Date", date],
        ["Donor", donation.name ?? "Anonymous"],
        ["Email", donation.email ?? "—"],
        ["Type", type],
        ["Title", getDonationTitle(donation)],
        ["Payment Medium", donation.medium ?? "—"],
        ["Status", donation.status],
    ];

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Donation Receipt - ${escapeHtml(donation.reference)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #101828; margin: 0; padding: 40px; }
  .card { max-width: 640px; margin: 0 auto; border: 1px solid #EAECF0; border-radius: 16px; overflow: hidden; }
  .head { background: #0E3B5D; color: #fff; padding: 28px 32px; display: flex; justify-content: space-between; align-items: flex-end; }
  .brand { font-size: 22px; font-weight: 800; letter-spacing: .5px; }
  .sub { font-size: 12px; opacity: .8; margin-top: 4px; }
  .amount-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: .8; text-align: right; }
  .amount { font-size: 26px; font-weight: 800; }
  .body { padding: 28px 32px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 10px 0; border-bottom: 1px solid #F2F4F7; font-size: 14px; vertical-align: top; }
  td:first-child { color: #667085; width: 40%; }
  td:last-child { font-weight: 600; text-align: right; text-transform: none; word-break: break-word; }
  .cap { text-transform: capitalize; }
  .foot { padding: 20px 32px 28px; font-size: 12px; color: #667085; line-height: 1.6; }
  @media print { body { padding: 0; } .card { border: none; } @page { margin: 16mm; } }
</style>
</head>
<body>
  <div class="card">
    <div class="head">
      <div>
        <div class="brand">Fajiri</div>
        <div class="sub">Donation Receipt</div>
      </div>
      <div>
        <div class="amount-label">Amount</div>
        <div class="amount">${escapeHtml(formatAmount(donation.amount, donation.currency))}</div>
      </div>
    </div>
    <div class="body">
      <table>
        ${rows
            .map(
                ([label, value]) =>
                    `<tr><td>${escapeHtml(label)}</td><td class="${
                        label === "Payment Medium" || label === "Status" ? "cap" : ""
                    }">${escapeHtml(value)}</td></tr>`,
            )
            .join("")}
      </table>
    </div>
    <div class="foot">
      Thank you for your generosity. This receipt confirms a donation made through Fajiri.
      Generated on ${escapeHtml(format(new Date(), "dd MMM yyyy, HH:mm"))}.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Renders the receipt in a hidden iframe and opens the browser print dialog,
 * where the admin can choose "Save as PDF".
 */
export function downloadDonationReceipt(donation: Donation) {
    if (typeof window === "undefined") return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc || !iframe.contentWindow) {
        iframe.remove();
        throw new Error("Unable to prepare receipt");
    }

    doc.open();
    doc.write(buildReceiptHtml(donation));
    doc.close();

    const win = iframe.contentWindow;
    const cleanup = () => setTimeout(() => iframe.remove(), 1000);
    win.onafterprint = cleanup;

    setTimeout(() => {
        win.focus();
        win.print();
        // Fallback cleanup for browsers that don't fire onafterprint
        setTimeout(() => iframe.isConnected && iframe.remove(), 60000);
    }, 250);
}
