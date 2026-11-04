export interface Member {
  id: string;
  name: string;
  phone: string;
  cardId: string;
  points: number; // 1 point = 1 sen
  joinedDate: string;
  avatarUrl?: string;
  pointsExpiryDate?: string; // e.g. '2026-11-08 18:00'
  expiredPointsTotal?: number;
}

export interface Seller {
  id: string;
  stallNumber: string;
  businessName: string;
  ownerName: string;
  category: 'Ayam & Daging' | 'Sayur-Sayuran' | 'Beras & Keperluan Asas' | 'Buah-buahan' | 'Ikan & Makanan Laut';
  location: string;
  qrPayload: string;
  totalCollectedSen: number;
  unclaimedSen: number;
}

export interface Transaction {
  id: string;
  timestamp: string;
  type: 'PAYMENT' | 'OWNER_GRANT' | 'EXPIRY';
  memberId: string;
  memberName: string;
  sellerId?: string;
  sellerName?: string;
  stallNumber?: string;
  amountSen: number;
  amountPoints: number;
  amountRM: number;
  note?: string;
  status: 'SUCCESS' | 'FLAGGED';
}

export interface ReimbursementClaim {
  id: string;
  sellerId: string;
  sellerName: string;
  stallNumber: string;
  amountRM: number;
  timestamp: string;
  status: 'PENDING' | 'APPROVED' | 'PAID';
}

export interface ProductItem {
  id: string;
  name: string;
  category: 'Ayam Segar' | 'Telur Ayam' | 'Buah Tempatan' | 'Sayur Kampung';
  sellerId: string;
  sellerName: string;
  stallNumber: string;
  priceRM: number;
  pointsNeeded: number; // 1 sen = 1 point
  originalPriceRM: number;
  badge: string;
  iconType: 'CHICKEN' | 'EGGS' | 'FRUITS' | 'VEG';
  description: string;
  imageUrl?: string;
}
