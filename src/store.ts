import { Member, Seller, Transaction, ReimbursementClaim, ProductItem } from './types';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'MEM-001',
    name: 'Puan Rosnah binti Karim',
    phone: '012-3849102',
    cardId: 'JAM-MY-88219',
    points: 1500, // RM 15.00
    joinedDate: '2026-09-15',
    pointsExpiryDate: '2026-11-08 18:00',
    expiredPointsTotal: 0,
  },
  {
    id: 'MEM-002',
    name: 'Encik Samad bin Hassan',
    phone: '019-8237194',
    cardId: 'JAM-MY-54109',
    points: 2500, // RM 25.00
    joinedDate: '2026-10-01',
    pointsExpiryDate: '2026-11-08 18:00',
    expiredPointsTotal: 0,
  },
  {
    id: 'MEM-003',
    name: 'Siti Sarah binti Razak',
    phone: '017-6421908',
    cardId: 'JAM-MY-33901',
    points: 800, // RM 8.00
    joinedDate: '2026-10-20',
    pointsExpiryDate: '2026-11-15 18:00',
    expiredPointsTotal: 0,
  },
];

export const INITIAL_SELLERS: Seller[] = [
  {
    id: 'STALL-001',
    stallNumber: 'A-01',
    businessName: 'Gerai Ayam Segar Bismi MADANI',
    ownerName: 'Pak Ali',
    category: 'Ayam & Daging',
    location: 'Zon Unggas & Daging',
    qrPayload: 'JAM-MERCHANT:STALL-001',
    totalCollectedSen: 4500, // RM 45.00
    unclaimedSen: 4500,
  },
  {
    id: 'STALL-004',
    stallNumber: 'B-04',
    businessName: 'Sayur Segar Kampung Kak Som',
    ownerName: 'Kak Som',
    category: 'Sayur-Sayuran',
    location: 'Zon Hasil Tani Hijau',
    qrPayload: 'JAM-MERCHANT:STALL-004',
    totalCollectedSen: 2800, // RM 28.00
    unclaimedSen: 2800,
  },
  {
    id: 'STALL-007',
    stallNumber: 'C-07',
    businessName: 'Pusat Edaran Beras & Telur JAM',
    ownerName: 'Haji Ramli',
    category: 'Beras & Keperluan Asas',
    location: 'Zon Barangan Runcit & Rangsangan',
    qrPayload: 'JAM-MERCHANT:STALL-007',
    totalCollectedSen: 6000, // RM 60.00
    unclaimedSen: 6000,
  },
  {
    id: 'STALL-012',
    stallNumber: 'D-12',
    businessName: 'Buah-buahan Tempatan Abang Din',
    ownerName: 'Abang Din',
    category: 'Buah-buahan',
    location: 'Zon Buah Musim & Tropika',
    qrPayload: 'JAM-MERCHANT:STALL-012',
    totalCollectedSen: 1500, // RM 15.00
    unclaimedSen: 1500,
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-9021',
    timestamp: '2026-11-04 08:30:15',
    type: 'OWNER_GRANT',
    memberId: 'MEM-001',
    memberName: 'Puan Rosnah binti Karim',
    amountSen: 1000,
    amountPoints: 1000,
    amountRM: 10.0,
    note: 'Subsidi Khas Pembukaan Jualan Agro MADANI (RM10)',
    status: 'SUCCESS',
  },
  {
    id: 'TXN-9022',
    timestamp: '2026-11-04 09:12:44',
    type: 'PAYMENT',
    memberId: 'MEM-001',
    memberName: 'Puan Rosnah binti Karim',
    sellerId: 'STALL-004',
    sellerName: 'Sayur Segar Kampung Kak Som',
    stallNumber: 'B-04',
    amountSen: 500,
    amountPoints: 500,
    amountRM: 5.0,
    note: 'Belian Sayur Bayam & Cili Kulai (Imbas QR)',
    status: 'SUCCESS',
  },
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'PRD-01',
    name: 'Ayam Segar MADANI (1 Ekor Bersih)',
    category: 'Ayam Segar',
    sellerId: 'STALL-001',
    sellerName: 'Gerai Ayam Segar Bismi MADANI',
    stallNumber: 'A-01',
    priceRM: 10.0,
    pointsNeeded: 1000,
    originalPriceRM: 14.5,
    badge: 'Subsidi Khas JAM',
    iconType: 'CHICKEN',
    description: 'Ayam segar halal bersih (~1.8kg) terus dari ladang kontrak tempatan.',
    imageUrl: '/ayam_segar.png',
  },
  {
    id: 'PRD-02',
    name: 'Sepapan Telur Ayam Segar (Gred A - 30 Biji)',
    category: 'Telur Ayam',
    sellerId: 'STALL-007',
    sellerName: 'Pusat Edaran Beras & Telur JAM',
    stallNumber: 'C-07',
    priceRM: 12.0,
    pointsNeeded: 1200,
    originalPriceRM: 16.5,
    badge: 'Segar Dari Reban',
    iconType: 'EGGS',
    description: 'Telur gred A segar berkualiti tinggi, kaya dengan protein.',
    imageUrl: '/telur_ayam.png',
  },
  {
    id: 'PRD-03',
    name: 'Nenas MD2 Manis & Tembikai Tempatan',
    category: 'Buah Tempatan',
    sellerId: 'STALL-012',
    sellerName: 'Buah-buahan Tempatan Abang Din',
    stallNumber: 'D-12',
    priceRM: 8.0,
    pointsNeeded: 800,
    originalPriceRM: 12.0,
    badge: 'Manis Terpilih',
    iconType: 'FRUITS',
    description: 'Nenas MD2 tanpa lidas, tembikai merah manis & pisang emas segar.',
    imageUrl: '/buah_tempatan.png',
  },
  {
    id: 'PRD-04',
    name: 'Set Kombo Sayur Kampung (4 Jenis)',
    category: 'Sayur Kampung',
    sellerId: 'STALL-004',
    sellerName: 'Sayur Segar Kampung Kak Som',
    stallNumber: 'B-04',
    priceRM: 5.0,
    pointsNeeded: 500,
    originalPriceRM: 8.0,
    badge: 'Petik Pagi Ini',
    iconType: 'VEG',
    description: 'Bayam, kangkung, sawi dan cili padi kampung segar tanpa racun berbahaya.',
    imageUrl: '/sayur_kampung.png',
  },
];

export const INITIAL_CLAIMS: ReimbursementClaim[] = [
  {
    id: 'CLM-101',
    sellerId: 'STALL-007',
    sellerName: 'Pusat Edaran Beras & Telur JAM',
    stallNumber: 'C-07',
    amountRM: 50.0,
    timestamp: '2026-11-03 13:45:00',
    status: 'PAID',
  },
];

export function playCashierChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // First chime bell (high pleasant pitch)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    
    gain1.gain.setValueAtTime(0.4, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.5);

    // Second bell harmony
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1318.51, ctx.currentTime); // E6
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.4);
      } catch (err) {
        // Audio error silent fallback
      }
    }, 120);
  } catch (e) {
    console.error('Audio play error:', e);
  }
}
