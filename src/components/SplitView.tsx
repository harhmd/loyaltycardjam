import React from 'react';
import { Member, Seller, Transaction, ReimbursementClaim, EventLocation } from '../types';
import { BuyerPortal } from './BuyerPortal';
import { SellerPortal } from './SellerPortal';
import { Smartphone, Store, ArrowRightLeft, Sparkles } from 'lucide-react';

interface SplitViewProps {
  currentMember: Member;
  allMembers: Member[];
  onSelectMember: (memberId: string) => void;
  currentSeller: Seller;
  allSellers: Seller[];
  onSelectSeller: (sellerId: string) => void;
  onMakePayment: (
    memberId: string,
    sellerId: string,
    amountRM: number,
    note: string
  ) => { success: boolean; message?: string; transaction?: Transaction };
  transactions: Transaction[];
  claims: ReimbursementClaim[];
  onSubmitClaim: (
    sellerId: string,
    amountRM: number,
    claimData?: {
      receiptUrl?: string;
      receiptName?: string;
      notes?: string;
      bankName?: string;
      bankAccountNumber?: string;
      accountHolderName?: string;
    }
  ) => void;
  events?: EventLocation[];
  onClaimEventPoints?: (
    eventId: string,
    event: EventLocation
  ) => { success: boolean; message: string };
  onAuthenticateMyDigitalId?: (userData: {
    nama: string;
    nric: string;
    phone: string;
    memberId?: string;
  }) => void;
  onLogoutMyDigitalId?: () => void;
  onToggleEventStatus?: (eventId: string) => void;
}

export const SplitView: React.FC<SplitViewProps> = (props) => {
  return (
    <div className="space-y-4">
      {/* Simulation Info Banner */}
      <div className="glass-card rounded-[28px] p-4 border border-white shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl btn-gradient-blue text-white flex items-center justify-center font-bold">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                SIMULASI SERENTAK (LIVE DEMO)
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Aliran Sebenar di Tapak Pasar
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Cuba tekan <strong>"Imbas & Bayar QR Gerai"</strong> di telefon pembeli (kiri). Skrin gerai peniaga (kanan) akan berbunyi & menerima bayaran secara langsung!
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-white px-3.5 py-1.5 rounded-full border border-blue-100 text-blue-700 font-bold shadow-2xs">
          <Sparkles className="w-4 h-4 text-amber-500" /> 1 Mata = 1 Sen (RM 0.01)
        </div>
      </div>

      {/* Grid with 2 columns: Left is Buyer Mobile Phone, Right is Seller Standee / Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Mobile View */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between px-3 text-xs font-black text-slate-700">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-600" /> Skrin Telefon Pembeli (Ahli JAM)
            </span>
            <span className="text-[10px] text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold">
              Pelanggan
            </span>
          </div>

          <BuyerPortal
            currentMember={props.currentMember}
            allMembers={props.allMembers}
            onSelectMember={props.onSelectMember}
            sellers={props.allSellers}
            onMakePayment={props.onMakePayment}
            transactions={props.transactions}
            events={props.events}
            onClaimEventPoints={props.onClaimEventPoints}
            onAuthenticateMyDigitalId={props.onAuthenticateMyDigitalId}
            onLogoutMyDigitalId={props.onLogoutMyDigitalId}
            onToggleEventStatus={props.onToggleEventStatus}
          />
        </div>

        {/* Right: Seller Standee & Cashier Screen */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between px-3 text-xs font-black text-slate-700">
            <span className="flex items-center gap-1.5">
              <Store className="w-4 h-4 text-emerald-600" /> Layar QR & Terminal Peniaga (Gerai JAM)
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
              Peniaga
            </span>
          </div>

          <SellerPortal
            currentSeller={props.currentSeller}
            allSellers={props.allSellers}
            allMembers={props.allMembers}
            events={props.events}
            onSelectSeller={props.onSelectSeller}
            transactions={props.transactions}
            claims={props.claims}
            onSubmitClaim={props.onSubmitClaim}
            onMakePayment={props.onMakePayment}
          />
        </div>
      </div>
    </div>
  );
};
