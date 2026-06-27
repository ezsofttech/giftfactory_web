'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthModal } from '@/provider/auth-modal-provider';
import { 
  Bell, Check, Shield, Users, Building2, Package, 
  X, Inbox, Clock
} from 'lucide-react';
import { 
  useNotifications, 
  useMarkAsRead,
  useRetentionRecommendations,
  mapRetentionProductToDisplay,
  NotificationItem
} from '@/store/notification-store';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/card/main-product-card';

export function NotificationDropdown() {
  const router = useRouter();
  const { status } = useSession();
  const { openAuthModal } = useAuthModal();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'offers'>('all');
  const [mounted, setMounted] = useState(false);

  // Dynamic Island States ('hidden' | 'notch' | 'expanded')
  const [activeState, setActiveState] = useState<'hidden' | 'notch' | 'expanded'>('hidden');
  const [islandNotification, setIsIslandNotification] = useState<NotificationItem | null>(null);
  const [islandEnabled, setIslandEnabled] = useState(true);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  
  // Track previous notifications to identify new arrivals
  const prevNotificationsRef = useRef<NotificationItem[]>([]);

  // API Queries & Mutations
  const { data: notifications = [], isLoading } = useNotifications({
    enabled: status === 'authenticated',
  });
  const markAsRead = useMarkAsRead();

  const { data: recProducts = [], isLoading: recLoading } = useRetentionRecommendations({
    enabled: status === 'authenticated' && activeTab === 'offers',
  });

  // Responsive width tracking to prevent screen overflow
  const [dropdownWidth, setDropdownWidth] = useState(420);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dynamic_island_enabled');
      if (stored !== null) {
        setIslandEnabled(stored === 'true');
      }

      const handleResize = () => {
        setDropdownWidth(window.innerWidth < 640 ? window.innerWidth - 32 : 420);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Compute unread count
  const unreadCount = useMemo(() => {
    if (status !== 'authenticated') return 0;
    return notifications.filter(n => !n.isRead).length;
  }, [notifications, status]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter(n => !n.isRead);
    }
    return notifications;
  }, [notifications, activeTab]);

  // Compare incoming notifications to detect brand new arrivals and run iPhone animations
  useEffect(() => {
    if (status !== 'authenticated' || isLoading) return;

    // Cache the first load to avoid spamming alerts upon login
    if (prevNotificationsRef.current.length === 0) {
      prevNotificationsRef.current = notifications;
      return;
    }

    const prevIds = new Set(prevNotificationsRef.current.map(n => n.id));
    const newArrivals = notifications.filter(n => !prevIds.has(n.id));

    if (newArrivals.length > 0 && islandEnabled) {
      const latest = newArrivals[0];
      setIsIslandNotification(latest);
      
      // Step 1: Slide down Notch
      setActiveState('notch');
      
      // Step 2: Liquid expand to reveal notification content (iOS animation delay)
      const expandTimer = setTimeout(() => {
        setActiveState('expanded');
      }, 350);

      // Step 3: Shrink back to notch after 4.5 seconds
      const shrinkTimer = setTimeout(() => {
        setActiveState('notch');
      }, 4500);

      // Step 4: Hide notch and slide up completely
      const hideTimer = setTimeout(() => {
        setActiveState('hidden');
      }, 4850);

      return () => {
        clearTimeout(expandTimer);
        clearTimeout(shrinkTimer);
        clearTimeout(hideTimer);
      };
    }

    prevNotificationsRef.current = notifications;
  }, [notifications, isLoading, islandEnabled, status]);

  // Safely measure positioning rect of the button trigger
  const handleToggle = () => {
    if (status !== 'authenticated') {
      openAuthModal({ message: 'Sign in to view your notifications', callbackUrl: '/notification' });
      return;
    }
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    setIsOpen(!isOpen);
  };

  // Re-calculate rect on scroll/resize to prevent shifting
  useEffect(() => {
    if (!isOpen) return;
    const updateRect = () => {
      if (triggerRef.current) {
        setTriggerRect(triggerRef.current.getBoundingClientRect());
      }
    };
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    for (const item of unread) {
      await markAsRead.mutateAsync(item.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'CREDIT_LIMIT':
      case 'FINANCIAL':
        return <Building2 className="w-4 h-4 text-emerald-600" />;
      case 'STOCK':
      case 'INVENTORY':
        return <Package className="w-4 h-4 text-pink-600" />;
      case 'USER':
      case 'FRANCHISE':
        return <Users className="w-4 h-4 text-violet-600" />;
      case 'SYSTEM':
      default:
        return <Shield className="w-4 h-4 text-blue-600" />;
    }
  };

  const resolveNotificationRoute = (item: NotificationItem) => {
    const type = String(item.type || '').toUpperCase();
    const metaType = String(item.metadata?.type || '').toUpperCase();

    if (type.includes('STOCK') || metaType.includes('STOCK')) {
      return '/orders';
    }

    if (type.includes('FRANCHISE') || metaType.includes('FRANCHISE')) {
      return '/profile';
    }

    return null;
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await markAsRead.mutateAsync(item.id);
      } catch {
        // Continue
      }
    }

    const route = resolveNotificationRoute(item);
    if (route) {
      router.push(route);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Bell Trigger Icon */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className={cn(
          "group relative flex items-center justify-center w-10 h-10 rounded-md hover:bg-muted transition-colors",
          isOpen && "bg-muted text-primary"
        )}
        aria-label="Toggle notifications panel"
      >
        <Bell className={cn("w-5 h-5 text-foreground group-hover:text-primary transition-colors", unreadCount > 0 && "animate-[bell-swing_1s_infinite]")} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-4 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Styled Portal-Mounted Dropdown Panel */}
      {isOpen && mounted && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop overlay to click away safely */}
          <div 
            className="fixed top-0 left-0 w-screen h-screen bg-black/5 z-[9998]" 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }} 
          />
          
          <div 
            className="fixed max-h-[640px] rounded-2xl border border-rose-100 bg-white shadow-2xl shadow-rose-950/15 z-[9999] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300"
            style={{
              top: triggerRect ? `${triggerRect.top + triggerRect.height + 12}px` : '80px',
              left: triggerRect ? `${Math.max(16, Math.min(window.innerWidth - dropdownWidth - 16, triggerRect.right - dropdownWidth))}px` : 'calc(100vw - 436px)',
              width: `${dropdownWidth}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-b from-rose-50 to-white border-b border-rose-100/60 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Alerts & Messages</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {unreadCount > 0 ? `You have ${unreadCount} unread alerts` : 'All caught up!'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="p-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 hover:bg-rose-50 rounded-lg transition"
                    title="Mark all as read"
                  >
                    Mark all read
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
              {(['all', 'unread', 'offers'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all duration-200",
                    activeTab === tab 
                      ? "bg-white text-pink-600 shadow-sm border border-rose-100/50 scale-[1.02]" 
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                  )}
                >
                  {tab === 'all' && 'All'}
                  {tab === 'unread' && `Unread (${unreadCount})`}
                  {tab === 'offers' && (
                    <span className="flex items-center justify-center gap-1">
                      <span>Offers</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-pink-500 text-white animate-pulse">
                        HOT
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>

             {/* List / Tabs Content */}
            <div className="flex-1 overflow-y-auto min-h-[350px] max-h-[440px] no-scrollbar">
              
              {/* Notifications List */}
              {(activeTab === 'all' || activeTab === 'unread') && (
                isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-8 h-8 border-2 border-slate-300 border-t-pink-500 rounded-full animate-spin" />
                    <span className="text-xs text-slate-500">Retrieving system alerts...</span>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-4 animate-bounce">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">Caught Up!</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                      No new alerts match your search filters.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredNotifications.map((item) => (
                      <div 
                        key={item.id} 
                        role="button"
                        tabIndex={0}
                        onClick={() => handleNotificationClick(item)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            void handleNotificationClick(item);
                          }
                        }}
                        className={cn(
                          "p-4 flex gap-3 transition-colors duration-200 hover:bg-slate-50 relative group cursor-pointer focus:outline-none focus:bg-slate-50",
                          !item.isRead && "bg-rose-50/20"
                        )}
                      >
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                          {getNotificationIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn("text-xs font-bold text-slate-800", !item.isRead && "text-slate-900 font-extrabold")}>
                              {item.title}
                            </p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                              {!item.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead.mutate(item.id);
                                  }}
                                  className="opacity-100 group-hover:opacity-100 w-5 h-5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition"
                                  title="Mark as read"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            {item.body}
                          </p>
                        </div>
                        {!item.isRead && (
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-pink-500" />
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Recommended Gifts / Offers List */}
              {activeTab === 'offers' && (
                recLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-8 h-8 border-2 border-slate-300 border-t-pink-500 rounded-full animate-spin" />
                    <span className="text-xs text-slate-500">Retrieving special offers...</span>
                  </div>
                ) : recProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-4 animate-bounce">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">No Offers Right Now</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                      Check back later for personalized recommendations and exclusive deals!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 p-3 max-h-[440px] overflow-y-auto">
                    {recProducts.map((p) => {
                      const mapped = mapRetentionProductToDisplay(p);
                      return (
                        <ProductCard
                          key={mapped.id}
                          product={mapped}
                          className="w-full scale-95 hover:scale-[0.98] transition-transform duration-200 border border-slate-100"
                        />
                      );
                    })}
                  </div>
                )
              )}
          </div>
        </div>
      </>,
      document.body
    )}

      {/* High-Fidelity iPhone Dynamic Island popup */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => {
            if (activeState === 'expanded') {
              setActiveState('notch');
              setTimeout(() => setActiveState('hidden'), 300);
              setIsOpen(true);
            }
          }}
          className={cn(
            "fixed left-1/2 -translate-x-1/2 z-[200000] bg-slate-950 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-600 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] select-none cursor-pointer border border-white/5",
            activeState === 'hidden' && "top-0 -translate-y-16 w-[110px] h-[30px] opacity-0 scale-75 pointer-events-none",
            activeState === 'notch' && "top-4 w-[110px] h-[30px] opacity-100 scale-100",
            activeState === 'expanded' && "top-4 w-[420px] h-[98px] opacity-100 scale-100 px-5 py-3.5 border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]"
          )}
        >
          {/* Content inside Notch State (Camera lens and sensor dots) */}
          {activeState === 'notch' && (
            <div className="flex items-center justify-between w-full px-3.5 h-full">
              {/* Camera Lens Glare */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center relative">
                  <span className="w-1 h-1 rounded-full bg-pink-100" />
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-900" />
              </div>
              
              <span className="text-[8px] font-black tracking-[0.25em] text-pink-400 uppercase animate-pulse">
                LIVE
              </span>
              
              {/* Active Sensor Green Dot */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
              </div>
            </div>
          )}

          {/* Content inside Expanded State */}
          {activeState === 'expanded' && islandNotification && (
            <div className="w-full h-full flex flex-col justify-between animate-in fade-in zoom-in-95 duration-300 delay-100">
              <div className="flex items-center gap-3.5">
                {/* App / Notification Icon with glowing ambient ring */}
                <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-white/[0.08] flex items-center justify-center shrink-0 relative shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-rose-500/20 rounded-2xl opacity-100" />
                  <div className="relative z-10 text-pink-400">
                    {getNotificationIcon(islandNotification.type)}
                  </div>
                  {/* Outer pulsating ring */}
                  <div className="absolute -inset-1 rounded-[18px] border border-pink-500/20 animate-pulse" />
                </div>

                {/* Notification Metadata */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-pink-400 bg-pink-950/40 border border-pink-500/10 px-2 py-0.5 rounded-full">
                      {islandNotification.type || 'Alert'}
                    </span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                      Live
                    </span>
                  </div>
                  <h5 className="text-xs font-black text-white truncate mt-1">
                    {islandNotification.title}
                  </h5>
                  <p className="text-[10px] text-slate-300 truncate mt-0.5 font-medium leading-relaxed">
                    {islandNotification.body}
                  </p>
                </div>

                {/* Dismiss Trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveState('notch');
                    setTimeout(() => setActiveState('hidden'), 300);
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition shrink-0 border border-transparent hover:border-white/5"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Physical Drag handle at bottom center */}
              <div className="w-12 h-1 bg-white/15 rounded-full mx-auto" />
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
