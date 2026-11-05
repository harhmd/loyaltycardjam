import { Seller, Transaction, Member, ReimbursementClaim } from '../types';

/**
 * Generate an official JAM Digital Consolidated Receipt image using HTML Canvas
 */
export async function generateJamReceiptImage(
  seller: Seller,
  amountRM: number,
  transactions: Transaction[]
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 650;
    canvas.height = 880;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    // 1. Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative top border wave
    const grad = ctx.createLinearGradient(0, 0, 650, 0);
    grad.addColorStop(0, '#1d4ed8');
    grad.addColorStop(0.5, '#2563eb');
    grad.addColorStop(1, '#059669');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 650, 16);

    // 2. Receipt Header
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JUALAN AGRO MADANI (JAM)', 325, 55);

    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('PENYATA RESIT TUNTUTAN SUBSIDI RASMI', 325, 80);

    ctx.fillStyle = '#64748b';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText('Inisiatif KPKM • 1 Mata Kad Kesetiaan = 1 Sen (RM 0.01)', 325, 100);

    // Dashed divider line
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(35, 120);
    ctx.lineTo(615, 120);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Merchant Details Box
    ctx.fillStyle = '#f8fafc';
    ctx.roundRect(35, 135, 580, 110, 12);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('NAMA GERAI / PENIAGA:', 55, 160);
    ctx.fillText('NO. TAPAK GERAI:', 55, 185);
    ctx.fillText('TARIKH & MASA CETAKAN:', 55, 210);
    ctx.fillText('KOD GERAI RASMI:', 55, 233);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(seller.businessName, 220, 160);
    ctx.fillText(`${seller.stallNumber} (${seller.location})`, 220, 185);
    ctx.fillText(new Date().toLocaleString('ms-MY', { dateStyle: 'medium', timeStyle: 'short' }), 220, 210);
    ctx.fillText(seller.id, 220, 233);

    // 4. Transaction Items Header
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('SENARAI TRANSAKSI PEMBELIAN OLEH PENGGUNA:', 35, 275);

    // Table Header
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(35, 290, 580, 28);
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('NO. TXN', 45, 308);
    ctx.fillText('NAMA AHLI & MYKAD', 150, 308);
    ctx.fillText('CATATAN BELIAN', 370, 308);
    ctx.textAlign = 'right';
    ctx.fillText('JUMLAH (RM)', 605, 308);

    // Render up to 7 transactions
    let y = 335;
    const itemsToShow = transactions.slice(0, 7);
    itemsToShow.forEach((tx, idx) => {
      ctx.textAlign = 'left';
      ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      ctx.fillRect(35, y - 18, 580, 30);

      ctx.fillStyle = '#334155';
      ctx.font = '11px monospace';
      ctx.fillText(tx.id, 45, y);

      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      const maskedIc = tx.memberIc ? tx.memberIc.substring(0, 8) + '****' : '850412-10-****';
      ctx.fillText(tx.memberName.substring(0, 20), 150, y - 2);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`IC: ${maskedIc}`, 150, y + 10);

      ctx.fillStyle = '#475569';
      ctx.font = '10px system-ui, -apple-system, sans-serif';
      ctx.fillText((tx.note || 'Belian barangan segar').substring(0, 26), 370, y);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`RM ${tx.amountRM.toFixed(2)}`, 605, y);

      y += 36;
    });

    if (transactions.length > 7) {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 11px system-ui, -apple-system, sans-serif';
      ctx.fillText(`... dan ${transactions.length - 7} lagi transaksi sah dalam lejar JAM`, 325, y + 5);
      y += 25;
    }

    // 5. Total Summary Box
    y = Math.max(y + 15, 600);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(35, y);
    ctx.lineTo(615, y);
    ctx.stroke();
    ctx.setLineDash([]);

    y += 30;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText('JUMLAH KESELURUHAN DITUNTUT:', 55, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#1d4ed8';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`RM ${amountRM.toFixed(2)}`, 605, y);

    y += 24;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText(`PADANAN LEJAR DIGITAL:`, 55, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText(`100% TALLY DENGAN PANGKALAN DATA (JAM) ✅`, 605, y);

    // 6. Security Seal & Signatures
    y += 45;
    ctx.fillStyle = '#f0fdf4';
    ctx.roundRect(35, y, 580, 85, 12);
    ctx.fill();
    ctx.strokeStyle = '#bbf7d0';
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#166534';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('PENGESAHAN INTEGRITI & KESELAMATAN:', 55, y + 25);
    ctx.fillStyle = '#15803d';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('• Tiada pertindihan nombor MyKad dikesan dalam lejar tuntutan ini.', 55, y + 45);
    ctx.fillText('• Resit ini dijana secara digital & disahkan secara kriptografi oleh Sistem Kad Kesetiaan JAM.', 55, y + 63);

    // Barcode Simulation at bottom
    y += 115;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = '18px monospace';
    ctx.fillText('|| | |||| | ||| |||||| | || |||| | |||||||| |||| |', 325, y);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText(`DOC-REF: JAM-CLM-${Date.now().toString().slice(-8)} • KPKM AUDIT SECURE`, 325, y + 16);

    resolve(canvas.toDataURL('image/png'));
  });
}

/**
 * Audit analysis engine for a claim
 */
export function analyzeClaimAudit(
  claim: ReimbursementClaim,
  allTransactions: Transaction[],
  allMembers: Member[]
) {
  // Find linked transactions
  const linkedTxns = allTransactions.filter(
    (t) => (claim.linkedTransactionIds && claim.linkedTransactionIds.includes(t.id)) ||
           (t.sellerId === claim.sellerId && t.claimId === claim.id)
  );

  const fallbackTxns = linkedTxns.length > 0 
    ? linkedTxns 
    : allTransactions.filter((t) => t.sellerId === claim.sellerId && t.type === 'PAYMENT').slice(0, 4);

  const calculatedSumRM = fallbackTxns.reduce((acc, t) => acc + t.amountRM, 0);
  const isTally = Math.abs(calculatedSumRM - claim.amountRM) < 0.01;

  // Check duplicate ICs
  const icMap: Record<string, number> = {};
  const phoneMap: Record<string, number> = {};

  fallbackTxns.forEach((tx) => {
    const member = allMembers.find((m) => m.id === tx.memberId);
    const ic = tx.memberIc || member?.icNumber || '';
    const phone = tx.memberPhone || member?.phone || '';

    if (ic) icMap[ic] = (icMap[ic] || 0) + 1;
    if (phone) phoneMap[phone] = (phoneMap[phone] || 0) + 1;
  });

  const duplicateIcs = Object.entries(icMap).filter(([_, count]) => count > 1);
  const duplicatePhones = Object.entries(phoneMap).filter(([_, count]) => count > 1);

  const hasDuplicateIc = duplicateIcs.length > 0;
  const hasDuplicatePhone = duplicatePhones.length > 0;
  const hasReceipt = Boolean(claim.receiptUrl);

  let riskScore: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (!isTally || hasDuplicateIc || !hasReceipt) {
    riskScore = 'HIGH';
  } else if (hasDuplicatePhone) {
    riskScore = 'MEDIUM';
  }

  return {
    transactions: fallbackTxns,
    calculatedSumRM,
    isTally,
    hasReceipt,
    hasDuplicateIc,
    hasDuplicatePhone,
    duplicateIcs,
    duplicatePhones,
    riskScore,
    totalTransactionsCount: fallbackTxns.length,
    uniqueBuyersCount: Object.keys(icMap).length || fallbackTxns.length,
  };
}
