'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface PublicAppointment {
  name: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  cancel_reason: string | null;
}

function formatDateHe(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('he-IL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function AppointmentStatusPage() {
  const { token } = useParams<{ token: string }>();
  const [appt, setAppt]             = useState<PublicAppointment | null>(null);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/appointment/${token}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then(data => { if (data) setAppt(data); })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleCancel() {
    setCancelling(true);
    const res = await fetch(`/api/appointment/${token}/cancel`, { method: 'POST' });
    if (res.ok) setAppt(prev => prev ? { ...prev, status: 'cancelled_by_customer' } : prev);
    setCancelling(false);
    setConfirmOpen(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#100c08]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#95122c] border-t-transparent animate-spin" />
          <p className="text-[#a09080]/40 text-xs tracking-[0.25em] uppercase">טוען...</p>
        </div>
      </main>
    );
  }

  if (notFound || !appt) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#100c08] px-4">
        <div className="text-center">
          <div className="text-4xl mb-5 opacity-40">✦</div>
          <h1 className="font-display text-2xl font-light text-[#f5f0eb]/70 mb-2">תור לא נמצא</h1>
          <p className="text-[#a09080]/45 text-sm mb-8">הקישור אינו תקין או שהתור הוסר</p>
          <a href="/" className="btn btn-ghost btn-sm">← חזרה לדף הבית</a>
        </div>
      </main>
    );
  }

  const isConfirmed        = appt.status === 'confirmed';
  const isCancelledAdmin   = appt.status === 'cancelled_by_admin';
  const isCancelledCustomer = appt.status === 'cancelled_by_customer';
  const isCancelled        = isCancelledAdmin || isCancelledCustomer;
  const isCompleted        = appt.status === 'completed';

  return (
    <main className="min-h-screen bg-[#100c08] relative overflow-hidden" dir="rtl">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(149,18,44,0.09) 0%, transparent 65%)' }} />

      <div className="relative z-10 max-w-md mx-auto px-5 py-12">

        {/* Header */}
        <div className="text-center mb-9">
          <div className="mb-2">
            <span className="text-[#95122c]/50 text-sm">✦</span>
          </div>
          <h1 className="font-display text-[1.8rem] font-light text-[#f5f0eb]/80 tracking-wide mb-1">מספרה</h1>
          <p className="text-[#a09080]/40 text-[0.6rem] tracking-[0.28em] uppercase">סטטוס התור שלך</p>
        </div>

        {/* Status banners */}
        {isConfirmed && (
          <div className="card-luxury border-[#95122c]/20 p-5 mb-6 text-center"
            style={{ boxShadow: '0 0 40px rgba(149,18,44,0.08)' }}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#95122c]/10 border border-[#95122c]/25 mb-3"
              style={{ boxShadow: '0 0 20px rgba(149,18,44,0.15)' }}>
              <span className="text-[#95122c] text-lg">✦</span>
            </div>
            <p className="font-display text-xl font-light text-[#f5f0eb]/90 mb-0.5">התור מאושר</p>
            <p className="text-[#a09080]/50 text-xs tracking-[0.2em] uppercase">נתראה בקרוב</p>
          </div>
        )}

        {isCancelledAdmin && (
          <div className="card-luxury border-[#95122c]/30 p-5 mb-6 text-center">
            <div className="text-[#95122c]/60 text-2xl mb-3">✕</div>
            <p className="font-display text-xl font-light text-[#f5f0eb]/80 mb-1">התור שלך בוטל</p>
            <p className="text-[#a09080]/50 text-xs mb-3">התור בוטל על ידי העסק</p>
            {appt.cancel_reason && (
              <div className="bg-[#95122c]/08 border border-[#95122c]/15 rounded-lg p-3 mb-4">
                <p className="text-[#a09080]/70 text-xs">
                  <span className="text-[#f5f0eb]/50">סיבת הביטול: </span>{appt.cancel_reason}
                </p>
              </div>
            )}
            <a href="/book" className="btn btn-outline btn-sm">הזמינו תור חדש</a>
          </div>
        )}

        {isCancelledCustomer && (
          <div className="card-luxury p-5 mb-6 text-center">
            <div className="text-[#a09080]/30 text-2xl mb-3">◈</div>
            <p className="font-display text-xl font-light text-[#f5f0eb]/70 mb-4">ביטלת את התור</p>
            <a href="/book" className="btn btn-outline btn-sm">הזמינו תור חדש</a>
          </div>
        )}

        {isCompleted && (
          <div className="card-luxury border-white/10 p-5 mb-6 text-center">
            <div className="text-[#f5f0eb]/20 text-2xl mb-3">◆</div>
            <p className="font-display text-xl font-light text-[#f5f0eb]/80 mb-1">התור הושלם</p>
            <p className="text-[#a09080]/50 text-xs mb-4">תודה שביקרת אצלנו!</p>
            <a href="/book" className="btn btn-outline btn-sm">הזמינו תור נוסף</a>
          </div>
        )}

        {/* Appointment details */}
        <div className="card-luxury p-6 mb-7">
          <p className="label-overline mb-5" style={{ color: 'rgba(160,144,128,0.45)' }}>פרטי התור</p>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-[#a09080]/50">שם</span>
              <span className="font-medium text-[#f5f0eb]/80">{appt.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#a09080]/50">שירות</span>
              <span className="font-medium text-[#f5f0eb]/80">{appt.service}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#a09080]/50">משך</span>
              <span className="text-[#f5f0eb]/60">{appt.duration} דקות</span>
            </div>
            <div className="h-px bg-white/[0.05]" />
            <div className="flex justify-between items-start">
              <span className="text-[#a09080]/50">תאריך</span>
              <span className="font-medium text-[#f5f0eb]/80 text-xs text-left">{formatDateHe(appt.date)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#a09080]/50">שעה</span>
              <span className="font-bold text-[#95122c] text-base">{appt.time}</span>
            </div>
          </div>
        </div>

        {/* Cancel flow */}
        {isConfirmed && (
          <div className="text-center">
            {!confirmOpen ? (
              <button
                onClick={() => setConfirmOpen(true)}
                className="text-[#a09080]/25 hover:text-[#95122c]/50 text-xs tracking-[0.2em] uppercase transition-colors duration-300 underline underline-offset-4 decoration-dotted"
              >
                ביטול התור
              </button>
            ) : (
              <div className="card-luxury border-[#95122c]/20 p-5 text-right">
                <p className="font-medium text-[#f5f0eb]/70 text-sm mb-1">האם לבטל את התור?</p>
                <p className="text-[#a09080]/45 text-xs mb-5">לא ניתן לבטל פעולה זו</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmOpen(false)} className="btn btn-ghost flex-1 btn-sm">
                    חזרה
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="flex-1 btn btn-sm border border-[#95122c]/40 text-[#95122c]/80 hover:bg-[#95122c] hover:text-white hover:border-[#95122c] transition-all duration-300"
                  >
                    {cancelling ? 'מבטל...' : 'אשר ביטול'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 text-center">
          <a href="/" className="text-[#a09080]/20 hover:text-[#a09080]/45 text-[0.55rem] tracking-[0.25em] uppercase transition-colors duration-300">
            ← חזרה לדף הבית
          </a>
        </div>
      </div>
    </main>
  );
}
