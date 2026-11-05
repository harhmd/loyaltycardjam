export interface MemberClaimedEvent {
  eventId: string;
  eventName: string;
  eventLocation: string;
  claimedAt: string;
  pointsClaimed: number;
  expiryDate: string;
  isExpired?: boolean;
}

export interface MyDigitalIdUser {
  sub: string;
  nama: string;
  nric: string;
  phone: string;
  email?: string;
  certificateStatus: 'VALID' | 'REVOKED' | 'EXPIRED';
  ocspVerified: boolean;
  authTimestamp: string;
}

export interface EventLocation {
  id: string;
  name: string;
  venue: string;
  state: string;
  dateStr: string;
  startTime: string;
  endTime: string;
  status: 'ACTIVE' | 'ENDED' | 'UPCOMING';
  subsidyAmountRM: number;
  subsidyPoints: number;
  totalQuota: number;
  claimedCount: number;
  description: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  icNumber?: string;
  cardId: string;
  points: number; // 1 point = 1 sen
  joinedDate: string;
  avatarUrl?: string;
  pointsExpiryDate?: string; // e.g. '2026-11-08 18:00'
  expiredPointsTotal?: number;
  isMyDigitalIdVerified?: boolean;
  myDigitalIdAuthTime?: string;
  claimedEvents?: MemberClaimedEvent[];
  activeEventId?: string;
  activeEventName?: string;
  activeEventLocation?: string;
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
  bankName?: string;
  bankAccountNumber?: string;
  accountHolderName?: string;
}

export interface Transaction {
  id: string;
  timestamp: string;
  type: 'PAYMENT' | 'OWNER_GRANT' | 'EXPIRY';
  memberId: string;
  memberName: string;
  memberIc?: string;
  memberPhone?: string;
  sellerId?: string;
  sellerName?: string;
  stallNumber?: string;
  amountSen: number;
  amountPoints: number;
  amountRM: number;
  note?: string;
  status: 'SUCCESS' | 'FLAGGED';
  claimId?: string;
  auditFlags?: string[];
}

export interface ReimbursementClaim {
  id: string;
  sellerId: string;
  sellerName: string;
  stallNumber: string;
  amountRM: number;
  timestamp: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  receiptUrl?: string;
  receiptName?: string;
  notes?: string;
  bankName?: string;
  bankAccountNumber?: string;
  accountHolderName?: string;
  linkedTransactionIds?: string[];
  riskScore?: 'LOW' | 'MEDIUM' | 'HIGH';
  auditFlags?: string[];
  isTally?: boolean;
  duplicateIcCount?: number;
  duplicatePhoneCount?: number;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: 'Ayam Segar' | 'Telur Ayam' | 'Buah Tempatan' | 'Sayur Kampung' | 'Beras & Keperluan Asas' | 'Ikan & Makanan Laut' | string;
  sellerId: string;
  sellerName: string;
  stallNumber: string;
  priceRM: number;
  pointsNeeded: number; // 1 sen = 1 point
  originalPriceRM: number;
  badge: string;
  iconType: 'CHICKEN' | 'EGGS' | 'FRUITS' | 'VEG' | 'RICE' | 'FISH';
  description: string;
  imageUrl?: string;
}
