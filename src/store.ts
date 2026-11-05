import { Member, Seller, Transaction, ReimbursementClaim, ProductItem, EventLocation } from './types';

export const INITIAL_EVENT_LOCATIONS: EventLocation[] = [
  {
    id: 'EVT-PUTRAJAYA',
    name: 'Jualan Agro MADANI Putrajaya Presint 2',
    venue: 'Tapak Pasar Tani Mega, Presint 2, Putrajaya',
    state: 'W.P. Putrajaya',
    dateStr: '06 Nov 2026 (Hari Ini)',
    startTime: '08:00',
    endTime: '18:00',
    status: 'ACTIVE',
    subsidyAmountRM: 10.0,
    subsidyPoints: 1000,
    totalQuota: 1000,
    claimedCount: 432,
    description: 'Program Jualan Agro MADANI Kebangsaan di Presint 2 menawarkan subsidi RM10 (1,000 Mata) bagi pembelian barangan segar terus dari ladang.',
  },
  {
    id: 'EVT-SERDANG',
    name: 'Jualan Agro MADANI MAEPS Serdang',
    venue: 'Laman Florikultur, Dewan D MAEPS, Serdang',
    state: 'Selangor',
    dateStr: '06 Nov 2026 (Hari Ini)',
    startTime: '09:00',
    endTime: '20:00',
    status: 'ACTIVE',
    subsidyAmountRM: 10.0,
    subsidyPoints: 1000,
    totalQuota: 1500,
    claimedCount: 812,
    description: 'Jualan Agro MADANI berskala besar di MAEPS Serdang. Tebus subsidi RM10 dan gunakan kod QR anda di semua gerai peniaga.',
  },
  {
    id: 'EVT-SELAYANG',
    name: 'Jualan Agro MADANI Pasar Borong Selayang',
    venue: 'Kompleks Pasar Borong Selayang, Batu Caves',
    state: 'Selangor',
    dateStr: '06 Nov 2026 (Pagi Tadi)',
    startTime: '07:00',
    endTime: '13:00',
    status: 'ENDED',
    subsidyAmountRM: 10.0,
    subsidyPoints: 1000,
    totalQuota: 500,
    claimedCount: 500,
    description: 'Acara telah tamat pada jam 13:00. Semua mata subsidi yang belum dibelanjakan bagi lokasi ini telah dilupuskan secara automatik seiring tamatnya program.',
  },
  {
    id: 'EVT-MELAWATI',
    name: 'Jualan Agro MADANI Stadium Melawati Shah Alam',
    venue: 'Perkarangan Stadium Tertutup Melawati, Seksyen 13',
    state: 'Selangor',
    dateStr: '07 Nov 2026 (Esok)',
    startTime: '08:00',
    endTime: '17:00',
    status: 'UPCOMING',
    subsidyAmountRM: 10.0,
    subsidyPoints: 1000,
    totalQuota: 800,
    claimedCount: 0,
    description: 'Tuntutan subsidi RM10 dibuka untuk warga Shah Alam. Mata sah laku bermula esok 08:00 sehingga acara selesai pada 17:00.',
  },
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'MEM-001',
    name: 'Puan Siti Norhaliza binti Daud',
    phone: '012-3849102',
    icNumber: '850412-10-5432',
    cardId: 'JAM-MY-88219',
    points: 1000, // RM 10.00
    joinedDate: '2026-09-15',
    pointsExpiryDate: '2026-11-06 18:00',
    expiredPointsTotal: 0,
    isMyDigitalIdVerified: true,
    myDigitalIdAuthTime: '2026-11-06 08:15:20',
    activeEventId: 'EVT-PUTRAJAYA',
    activeEventName: 'Jualan Agro MADANI Putrajaya Presint 2',
    activeEventLocation: 'Tapak Pasar Tani Mega, Presint 2, Putrajaya',
    claimedEvents: [
      {
        eventId: 'EVT-PUTRAJAYA',
        eventName: 'Jualan Agro MADANI Putrajaya Presint 2',
        eventLocation: 'Presint 2, Putrajaya',
        claimedAt: '2026-11-06 08:30:15',
        pointsClaimed: 1000,
        expiryDate: '2026-11-06 18:00',
        isExpired: false,
      },
    ],
  },
  {
    id: 'MEM-002',
    name: 'Encik Samad bin Hassan',
    phone: '019-8237194',
    icNumber: '780220-14-5123',
    cardId: 'JAM-MY-54109',
    points: 0, // Auto-expired because Selayang ended!
    joinedDate: '2026-10-01',
    pointsExpiryDate: '2026-11-06 13:00',
    expiredPointsTotal: 1000,
    isMyDigitalIdVerified: true,
    myDigitalIdAuthTime: '2026-11-06 07:05:00',
    activeEventId: 'EVT-SELAYANG',
    activeEventName: 'Jualan Agro MADANI Pasar Borong Selayang',
    activeEventLocation: 'Kompleks Pasar Borong Selayang, Batu Caves',
    claimedEvents: [
      {
        eventId: 'EVT-SELAYANG',
        eventName: 'Jualan Agro MADANI Pasar Borong Selayang',
        eventLocation: 'Kompleks Pasar Borong Selayang',
        claimedAt: '2026-11-06 07:15:00',
        pointsClaimed: 1000,
        expiryDate: '2026-11-06 13:00',
        isExpired: true,
      },
    ],
  },
  {
    id: 'MEM-003',
    name: 'Siti Sarah binti Razak',
    phone: '017-6421908',
    icNumber: '901103-08-6044',
    cardId: 'JAM-MY-33901',
    points: 0, // Fresh citizen: Needs to claim points!
    joinedDate: '2026-10-20',
    pointsExpiryDate: '',
    expiredPointsTotal: 0,
    isMyDigitalIdVerified: false, // Unverified - must do MyDigital ID SSO
    claimedEvents: [],
  },
  {
    id: 'MEM-004',
    name: 'Faiz bin Samad (Keluarga Ahli)',
    phone: '019-8237194', // Shared phone with MEM-002
    icNumber: '030914-14-1021',
    cardId: 'JAM-MY-99042',
    points: 0,
    joinedDate: '2026-11-01',
    pointsExpiryDate: '',
    expiredPointsTotal: 0,
    isMyDigitalIdVerified: false,
    claimedEvents: [],
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
    bankName: 'Maybank',
    bankAccountNumber: '5142 8829 1042',
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
    bankName: 'CIMB Bank',
    bankAccountNumber: '8601 2948 5512',
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
    bankName: 'Bank Islam',
    bankAccountNumber: '1209 8830 1928',
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
    bankName: 'Bank Muamalat',
    bankAccountNumber: '1402 7719 2831',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-9021',
    timestamp: '2026-11-04 08:30:15',
    type: 'OWNER_GRANT',
    memberId: 'MEM-001',
    memberName: 'Puan Siti Norhaliza binti Daud',
    memberIc: '850412-10-5432',
    memberPhone: '012-3849102',
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
    memberName: 'Puan Siti Norhaliza binti Daud',
    memberIc: '850412-10-5432',
    memberPhone: '012-3849102',
    sellerId: 'STALL-004',
    sellerName: 'Sayur Segar Kampung Kak Som',
    stallNumber: 'B-04',
    amountSen: 1000,
    amountPoints: 1000,
    amountRM: 10.0,
    note: 'Belian Sayur Bayam & Cili Kulai (Imbas QR)',
    status: 'SUCCESS',
  },
  {
    id: 'TXN-9023',
    timestamp: '2026-11-04 10:05:12',
    type: 'PAYMENT',
    memberId: 'MEM-001',
    memberName: 'Puan Siti Norhaliza binti Daud',
    memberIc: '850412-10-5432',
    memberPhone: '012-3849102',
    sellerId: 'STALL-001',
    sellerName: 'Gerai Ayam Segar Bismi MADANI',
    stallNumber: 'A-01',
    amountSen: 2500,
    amountPoints: 2500,
    amountRM: 25.0,
    note: 'Belian Ayam Segar MADANI (2 ekor)',
    status: 'SUCCESS',
    claimId: 'CLM-102',
  },
  {
    id: 'TXN-9024',
    timestamp: '2026-11-04 11:20:40',
    type: 'PAYMENT',
    memberId: 'MEM-002',
    memberName: 'Encik Samad bin Hassan',
    memberIc: '780220-14-5123',
    memberPhone: '019-8237194',
    sellerId: 'STALL-001',
    sellerName: 'Gerai Ayam Segar Bismi MADANI',
    stallNumber: 'A-01',
    amountSen: 2000,
    amountPoints: 2000,
    amountRM: 20.0,
    note: 'Belian Ayam Segar MADANI & Rempah',
    status: 'SUCCESS',
    claimId: 'CLM-102',
  },
  {
    id: 'TXN-9025',
    timestamp: '2026-11-04 14:15:30',
    type: 'PAYMENT',
    memberId: 'MEM-002',
    memberName: 'Encik Samad bin Hassan',
    memberIc: '780220-14-5123',
    memberPhone: '019-8237194',
    sellerId: 'STALL-007',
    sellerName: 'Pusat Edaran Beras & Telur JAM',
    stallNumber: 'C-07',
    amountSen: 3000,
    amountPoints: 3000,
    amountRM: 30.0,
    note: 'Belian Beras MADANI 5kg',
    status: 'SUCCESS',
    claimId: 'CLM-101',
  },
  {
    id: 'TXN-9026',
    timestamp: '2026-11-04 14:18:02',
    type: 'PAYMENT',
    memberId: 'MEM-004',
    memberName: 'Faiz bin Samad (Keluarga Ahli)',
    memberIc: '030914-14-1021',
    memberPhone: '019-8237194', // Trigger: Same phone number
    sellerId: 'STALL-007',
    sellerName: 'Pusat Edaran Beras & Telur JAM',
    stallNumber: 'C-07',
    amountSen: 3000,
    amountPoints: 3000,
    amountRM: 30.0,
    note: 'Belian Telur Gred A Sepapan',
    status: 'SUCCESS',
    claimId: 'CLM-101',
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
    amountRM: 60.0,
    timestamp: '2026-11-03 13:45:00',
    status: 'PAID',
    receiptUrl: 'https://images.unsplash.com/photo-1554415707-9e4966abb0e3?auto=format&fit=crop&w=600&q=80',
    receiptName: 'Resit_Penyata_Penebusan_STALL007.jpg',
    bankName: 'Bank Islam',
    bankAccountNumber: '1209 8830 1928',
    accountHolderName: 'Pusat Edaran Beras JAM Enterprise',
    notes: 'Tuntutan 6,000 mata bagi sesi jualan beras & telur MADANI.',
    linkedTransactionIds: ['TXN-9025', 'TXN-9026'],
    riskScore: 'MEDIUM',
    isTally: true,
    duplicatePhoneCount: 1, // Alert: Phone number shared
    auditFlags: ['MATCHED_LEDGER_TALLY', 'TRIGGER_SHARED_PHONE_DETECTED', 'RECEIPT_ATTACHED'],
    approvedAt: '2026-11-03 15:30:00',
    approvedBy: 'Urusetia Pusat JAM',
  },
  {
    id: 'CLM-102',
    sellerId: 'STALL-001',
    sellerName: 'Gerai Ayam Segar Bismi MADANI',
    stallNumber: 'A-01',
    amountRM: 45.0,
    timestamp: '2026-11-04 16:20:00',
    status: 'PENDING',
    receiptUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    receiptName: 'Resit_Penebusan_Ayam_Bismi.jpg',
    bankName: 'Maybank',
    bankAccountNumber: '5142 8829 1042',
    accountHolderName: 'Perniagaan Ayam Bismi Ali',
    notes: 'Tuntutan 4,500 mata untuk jualan ayam segar bersih (2 pembeli unik).',
    linkedTransactionIds: ['TXN-9023', 'TXN-9024'],
    riskScore: 'LOW',
    isTally: true,
    duplicateIcCount: 0,
    duplicatePhoneCount: 0,
    auditFlags: ['MATCHED_LEDGER_TALLY', 'ALL_ICS_UNIQUE', 'ALL_PHONES_UNIQUE', 'RECEIPT_ATTACHED'],
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
