"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthModal } from "@/provider/auth-modal-provider";
import { fetchLoyaltyBalance, fetchLoyaltyHistory } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useReferralInvite } from "@/store/notification-store";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Gift,
  Users,
  Compass,
  ArrowLeft,
  Calendar,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Send,
  Copy,
  Check
} from "lucide-react";

// Large Loyalty Coin Icon
const LargeLoyaltyCoin = ({ tier }: { tier?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | string }) => {
  let gradientColors = ["#CD7F32", "#A57128"]; // Bronze default
  let glowColor = "rgba(205, 127, 50, 0.4)";
  if (tier === "SILVER") {
    gradientColors = ["#CBD5E1", "#64748B"];
    glowColor = "rgba(148, 163, 184, 0.4)";
  } else if (tier === "GOLD") {
    gradientColors = ["#F59E0B", "#D97706"];
    glowColor = "rgba(245, 158, 11, 0.4)";
  } else if (tier === "PLATINUM") {
    gradientColors = ["#38BDF8", "#0284C7"];
    glowColor = "rgba(2, 132, 199, 0.4)";
  }

  return (
    <div className="relative group flex items-center justify-center w-36 h-36 md:w-44 md:h-44 shrink-0 mx-auto">
      {/* Outer pulsing glow */}
      <div 
        className="absolute inset-0 rounded-full blur-2xl opacity-70 group-hover:scale-110 transition-transform duration-700 animate-pulse"
        style={{ backgroundColor: glowColor }}
      />
      
      {/* Coin SVG */}
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" className="relative drop-shadow-2xl transition-transform duration-500 hover:rotate-12">
        <defs>
          <linearGradient id={`largeCoinGrad-${tier}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors[0]} />
            <stop offset="100%" stopColor={gradientColors[1]} />
          </linearGradient>
        </defs>
        
        {/* Main Coin Circle */}
        <circle cx="12" cy="12" r="10" fill={`url(#largeCoinGrad-${tier})`} stroke="#ffffff" strokeWidth="1.2" />
        {/* Inner details */}
        <circle cx="12" cy="12" r="8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" strokeDasharray="1 0.7" />
        <circle cx="12" cy="12" r="7" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        
        {/* Lightning bolt inside */}
        <path d="M13 3.5L6.5 12.5H12L11 20.5L17.5 11.5H12L13 3.5Z" fill="#ffffff" />
      </svg>
    </div>
  );
};

export default function LoyaltyPage() {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();
  const authOpenedRef = useRef(false);

  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  const [refeeEmail, setRefeeEmail] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const inviteMutation = useReferralInvite();

  const actualReferrerId = session?.userId || (session?.user as any)?.customerId || session?.user?.id || "";

  const handleCopyReferralCode = async () => {
    if (!actualReferrerId) return;
    try {
      await navigator.clipboard.writeText(actualReferrerId);
      setIsCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refeeEmail) return;
    if (!actualReferrerId) {
      toast.error("Please sign in to invite friends.");
      return;
    }

    inviteMutation.mutate(
      {
        referrerCode: actualReferrerId,
        refereeEmail: refeeEmail,
      },
      {
        onSuccess: (data: any) => {
          const msg = data?.message || `Referral invite registered for ${refeeEmail}`;
          toast.success(msg);
          setRefeeEmail("");
        },
        onError: (err: any) => {
          console.error("Referral failed:", err);
          toast.error(err?.response?.data?.message || "Failed to send referral invite.");
        },
      }
    );
  };

  useEffect(() => {
    if (status !== "authenticated" && status !== "loading" && !authOpenedRef.current) {
      authOpenedRef.current = true;
      openAuthModal({ message: "Sign in to view your Loyalty points dashboard", callbackUrl: "/loyalty" });
      router.replace("/");
    }
  }, [status, openAuthModal, router]);

  const { data: balanceRes, isLoading: balanceLoading } = useQuery({
    queryKey: ["customer", "loyalty", "balance"],
    queryFn: fetchLoyaltyBalance,
    enabled: status === "authenticated",
  });

  const { data: historyRes, isLoading: historyLoading } = useQuery({
    queryKey: ["customer", "loyalty", "history"],
    queryFn: fetchLoyaltyHistory,
    enabled: status === "authenticated",
  });

  const loyalty = balanceRes?.data;
  const history = historyRes?.data;

  if (status === "loading" || (status === "authenticated" && balanceLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium animate-pulse">Loading Loyalty Rewards...</p>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  const points = loyalty?.points ?? 0;
  const tier = loyalty?.tier ?? "BRONZE";
  const stage = loyalty?.stage ?? "Bronze Member";

  // Tier info & thresholds configuration
  const tierConfig: Record<string, { label: string; text: string; bg: string; border: string; textCol: string; nextTier: string | null; nextPoints: number }> = {
    BRONZE: {
      label: "Bronze",
      text: "Start earning coins on every purchase!",
      bg: "from-amber-700/10 to-amber-900/5",
      border: "border-amber-700/25",
      textCol: "text-amber-800",
      nextTier: "SILVER",
      nextPoints: 100
    },
    SILVER: {
      label: "Silver",
      text: "Enjoy premium benefits and customized discounts!",
      bg: "from-slate-400/10 to-slate-600/5",
      border: "border-slate-400/25",
      textCol: "text-slate-700",
      nextTier: "GOLD",
      nextPoints: 500
    },
    GOLD: {
      label: "Gold",
      text: "Priority delivery, exclusive events and higher multipliers!",
      bg: "from-yellow-500/10 to-amber-600/5",
      border: "border-yellow-500/25",
      textCol: "text-yellow-600 font-bold",
      nextTier: "PLATINUM",
      nextPoints: 1000
    },
    PLATINUM: {
      label: "Platinum",
      text: "The ultimate level: free concierge, early access and unlimited hampers!",
      bg: "from-sky-500/10 to-blue-600/5",
      border: "border-sky-500/25",
      textCol: "text-sky-600 font-bold",
      nextTier: null,
      nextPoints: 0
    }
  };

  const currentTierInfo = tierConfig[tier] || tierConfig.BRONZE;
  const progressToNext = currentTierInfo.nextTier 
    ? Math.min(100, Math.round((points / currentTierInfo.nextPoints) * 100))
    : 100;

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Top Banner with back button */}
      <div className="container mx-auto px-4 pt-6 max-w-5xl">
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-primary transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Store
        </Link>
      </div>

      <div className="container mx-auto px-4 max-w-5xl space-y-6">
        {/* HERO CARD - SuperCoin Balance */}
        <div className={`relative overflow-hidden rounded-2xl border ${currentTierInfo.border} bg-gradient-to-br ${currentTierInfo.bg} p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12`}>
          {/* Decorative Sparkles */}
          <div className="absolute top-4 right-4 text-amber-500/20 animate-spin-slow">
            <Sparkles className="w-12 h-12" />
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-gray-200 text-xs font-semibold text-gray-800 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>{stage}</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                SuperCoin Balance
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                {currentTierInfo.text}
              </p>
            </div>

            {/* Big Points Counter */}
            <div className="flex items-baseline justify-center md:justify-start gap-2 pt-2">
              <span className="text-5xl md:text-6xl font-black text-gray-950 tracking-tighter">
                {points}
              </span>
              <span className="text-lg md:text-xl font-bold text-gray-500">
                Coins
              </span>
            </div>

            {/* Next tier target progress */}
          
          

            {!currentTierInfo.nextTier && (
              <div className="flex items-center justify-center md:justify-start gap-1.5 text-amber-600 text-xs font-bold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg w-max">
                <Zap className="w-3.5 h-3.5 animate-bounce" />
                Ultimate Tier Reached! Peak benefits enabled.
              </div>
            )}
          </div>

          {/* Large dynamic coin graphic */}
          <LargeLoyaltyCoin tier={tier} />
        </div>

        {/* PROMOTIONAL GRID SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Coupons */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 group">
            <div className="space-y-2">
              <div className="p-3 bg-red-50 text-red-500 rounded-lg w-fit group-hover:scale-105 transition-transform">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Exclusive Coupons</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Unlock extra discounts on your checkout totals using coins. Convert points directly to flat discounts.
              </p>
            </div>
            <Link href="/products?deals=1" className="text-xs font-semibold text-primary hover:underline flex items-center pt-2">
              Explore Deals & Coupons
            </Link>
          </div>

          {/* Card 2: Partners */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 group">
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 text-blue-500 rounded-lg w-fit group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Loyalty Partners</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Connect and spend coins across verified Gift Factory partners. Get custom merchant deals.
              </p>
            </div>
            <Link href="/sell" className="text-xs font-semibold text-primary hover:underline flex items-center pt-2">
              Join Partner Club
            </Link>
          </div>

          {/* Card 3: Hampers & Gifting */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 group">
            <div className="space-y-2">
              <div className="p-3 bg-amber-50 text-amber-500 rounded-lg w-fit group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Premium Destination</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Spend coins on customized corporate gift hampers, premium flower packages, and curated bundles.
              </p>
            </div>
            <Link href="/products?categoryId=hampers" className="text-xs font-semibold text-primary hover:underline flex items-center pt-2">
              View Gift Hampers
            </Link>
          </div>
        </div>

        {/* REFER A FRIEND SECTION */}
        <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-xs relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between relative z-10">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-pink-50 text-primary rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Refer a Friend, Share the Love! 🤝</h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Invite your friends to Gift Factory. When they sign up and place their first order, you both earn bonus SuperCoins!
              </p>

              {/* Referral code display */}
              {actualReferrerId && (
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="text-gray-500">Your Referral Code:</span>
                  <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2 py-1 rounded font-mono font-bold text-gray-800">
                    <span>{actualReferrerId}</span>
                    <button
                      type="button"
                      onClick={handleCopyReferralCode}
                      className="text-gray-400 hover:text-primary transition-colors focus:outline-none cursor-pointer"
                      title="Copy Code"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Email form */}
            <form onSubmit={handleSendInvite} className="w-full lg:w-96 flex flex-col sm:flex-row gap-2 shrink-0">
              <div className="relative flex-1">
                <input
                  type="email"
                  required
                  placeholder="Enter friend's email"
                  value={refeeEmail}
                  onChange={(e) => setRefeeEmail(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all  dark:border-zinc-700 text-gray-900"
                />
              </div>
              <Button
                type="submit"
                disabled={inviteMutation.isPending}
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/95 text-white shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                {inviteMutation.isPending ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Invite</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* ACCORDION 1: Transaction ledger (Coin activity) */}
        <div className="bg-white border border-gray-150 rounded-xl overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setIsActivityOpen(!isActivityOpen)}
            className="w-full flex items-center justify-between p-5 font-bold text-gray-900 hover:bg-gray-50/50 transition-colors text-left"
          >
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Coin Activity Ledger
            </span>
            {isActivityOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          </button>

          {isActivityOpen && (
            <div className="border-t border-gray-100 p-5 pt-2">
              {historyLoading ? (
                <div className="py-12 text-center text-sm text-gray-500 animate-pulse">
                  Fetching transaction ledger...
                </div>
              ) : !history?.transactions || history.transactions.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-500 space-y-2">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
                  <p>No coin transaction activities recorded yet.</p>
                  <p className="text-xs text-gray-400">Coins will appear here as soon as you place an order!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <th className="py-3 px-2">Date & Time</th>
                        <th className="py-3 px-2">Activity Details</th>
                        <th className="py-3 px-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                      {history.transactions.map((tx) => {
                        const isEarned = tx.type === "EARNED";
                        const dateFormatted = new Date(tx.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <tr key={tx._id} className="hover:bg-gray-50/20 transition-colors">
                            <td className="py-3.5 px-2 text-xs text-gray-400 font-medium whitespace-nowrap">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gray-300" />
                                {dateFormatted}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 font-medium text-gray-800 break-words max-w-xs md:max-w-md">
                              {tx.reason}
                            </td>
                            <td className="py-3.5 px-2 text-right font-bold whitespace-nowrap">
                              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-black ${
                                isEarned 
                                  ? "bg-green-50 text-green-700" 
                                  : "bg-red-50 text-red-700"
                              }`}>
                                {isEarned ? (
                                  <ArrowUpRight className="w-3 h-3 text-green-600" />
                                ) : (
                                  <ArrowDownRight className="w-3.5 h-3.5 text-red-600" />
                                )}
                                {isEarned ? "+" : "-"}{tx.points}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ACCORDION 2: Help & Guidelines */}
        <div className="bg-white border border-gray-150 rounded-xl overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setIsFaqOpen(!isFaqOpen)}
            className="w-full flex items-center justify-between p-5 font-bold text-gray-900 hover:bg-gray-50/50 transition-colors text-left"
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-gray-500" />
              What are SuperCoins? (Loyalty FAQ)
            </span>
            {isFaqOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          </button>

          {isFaqOpen && (
            <div className="border-t border-gray-100 p-5 space-y-4 text-sm text-gray-600 leading-relaxed">
              <div>
                <h4 className="font-bold text-gray-900 mb-1">How do I earn SuperCoins?</h4>
                <p>You automatically earn SuperCoins whenever you place an order on Gift Factory! For every ₹100 spent, you earn 1 SuperCoin. Additional bonus coins are rewarded during seasonal sales and festival milestones.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">What are the benefits of higher Loyalty Tiers?</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Bronze:</strong> Base entry. Earn coins on all checkout baskets.</li>
                  <li><strong>Silver (100+ points):</strong> Custom discount coupons unlocked.</li>
                  <li><strong>Gold (500+ points):</strong> 1.5x coin earnings multiplier, priority order processing, and custom florist/hamper customization requests.</li>
                  <li><strong>Platinum (1000+ points):</strong> 2x coin multiplier, complimentary express shipping on all orders, and personal concierge service.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Do SuperCoins expire?</h4>
                <p>Yes, earned SuperCoins expire 1 year (365 days) from the date they are credited to your account. The transaction ledger always details expiration warnings when applicable.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
