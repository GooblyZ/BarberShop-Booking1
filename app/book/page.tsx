'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { generateSlots, timeToMinutes, hasOverlap, isValidIsraeliPhone } from '@/lib/services';
import type { Service } from '@/lib/services';
import type { Appointment } from '@/app/api/appointments/route';
import type { BlockedRange } from '@/app/api/blocked-ranges/route';
import type { Settings } from '@/app/api/settings/route';

type Step = 'service' | 'datetime' | 'details' | 'done';

interface Availability {
  settings:      Settings;
  nonWorkingDay: boolean;
  dayOff:        boolean;
  booked:        Appointment[];
  blockedRanges: BlockedRange[];
}

const STEP_LABELS: Record<Exclude<Step, 'done'>, string> = {
  service:  'שירות',
  datetime: 'מועד',
  details:  'פרטים',
};
const STEPS: Exclude<Step, 'done'>[] = ['service', 'datetime', 'details'];

function BookingFlow() {
  const searchParams = useSearchParams();

  const [step, setStep]             = useState<Step>('service');
  const [services, setServices]     = useState<Service[]>([]);
  const [serviceId, setServiceId]   = useState<number | null>(null);
  const [date, setDate]             = useState('');
  const [time, setTime]             = useState('');
  const [name, setName]             = useState('');
  const [phone, setPhone]           = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [bookingToken, setBookingToken] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const service = services.find(s => s.id === serviceId);
  const today   = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const preselect = Number(searchParams.get('serviceId')) || null;
    fetch('/api/services?active=1')
      .then(r => r.json())
      .then((data: Service[]) => {
        setServices(data);
        // If a valid serviceId was passed in the URL, skip straight to date/time
        if (preselect) {
          const match = data.find(s => s.id === preselect);
          if (match) {
            setServiceId(match.id);
            setStep('datetime');
          }
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!date) { setAvailability(null); return; }
    fetch(`/api/availability?date=${date}`).then(r => r.json()).then(setAvailability);
  }, [date]);

  const availableSlots: string[] = (() => {
    if (!service || !availability) return [];
    const { settings, nonWorkingDay, dayOff, booked, blockedRanges } = availability;
    if (nonWorkingDay || dayOff) return [];
    const closeMins = settings.close_hour * 60;
    return generateSlots(settings.open_hour, settings.close_hour).filter(slot => {
      const start = timeToMinutes(slot);
      const end   = start + service.duration;
      if (end > closeMins) return false;
      if (date === today) {
        const now     = new Date();
        const nowMins = now.getHours() * 60 + now.getMinutes();
        if (start <= nowMins) return false;
      }
      if (blockedRanges.some(r => {
        const rStart    = timeToMinutes(r.start_time);
        const rDuration = timeToMinutes(r.end_time) - rStart;
        return hasOverlap(start, service.duration, rStart, rDuration);
      })) return false;
      return !booked.some(b =>
        hasOverlap(start, service.duration, timeToMinutes(b.time), b.duration)
      );
    });
  })();

  function handlePhoneChange(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    if (digits.length > 0 && !isValidIsraeliPhone(digits)) {
      setPhoneError('מספר טלפון לא תקין (לדוגמה: 0501234567)');
    } else {
      setPhoneError('');
    }
  }

  async function handleSubmit() {
    if (!isValidIsraeliPhone(phone)) {
      setPhoneError('מספר טלפון לא תקין (לדוגמה: 0501234567)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, serviceId, date, time }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'שגיאה בהזמנה');
      } else {
        const data = await res.json();
        setBookingToken(data.token ?? '');
        setStep('done');
      }
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep('service'); setServiceId(null); setDate(''); setTime('');
    setName(''); setPhone(''); setPhoneError(''); setError(''); setAvailability(null);
    setBookingToken(''); setLinkCopied(false);
  }

  function copyLink() {
    const url = `${window.location.origin}/appointment/${bookingToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    });
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(149,18,44,0.10) 0%, transparent 65%)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(149,18,44,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-lg mx-auto px-5 py-12 flex-1">

        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/"
            className="inline-flex items-center gap-2 text-[#a09080]/50 hover:text-[#a09080]/80 transition-colors duration-300 text-[0.6rem] tracking-[0.3em] uppercase mb-7">
            ← חזרה
          </Link>
          <div className="mb-1">
            <span className="text-[#95122c]/60 text-sm">✦</span>
          </div>
          <h1 className="font-display text-[2.2rem] font-light text-[#f5f0eb] tracking-wide leading-none mb-2">
            מספרה
          </h1>
          <p className="text-[#a09080]/55 text-xs tracking-[0.25em] uppercase">הזמינו תור בקלות</p>
        </div>

        {/* Step indicators */}
        {step !== 'done' && (
          <div className="flex items-center justify-center gap-0 mb-10">
            {STEPS.map((s, i) => {
              const idx   = STEPS.indexOf(step as Exclude<Step, 'done'>);
              const done  = i < idx;
              const active = s === step;
              return (
                <div key={s} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[0.65rem] font-medium transition-all duration-400 ${
                      active
                        ? 'bg-[#95122c] text-white shadow-[0_0_16px_rgba(149,18,44,0.45)]'
                        : done
                          ? 'bg-[#95122c]/20 text-[#95122c] border border-[#95122c]/30'
                          : 'bg-white/[0.04] text-[#a09080]/40 border border-white/[0.08]'
                    }`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className={`text-[0.55rem] tracking-[0.2em] uppercase transition-colors duration-300 ${
                      active ? 'text-[#f5f0eb]/70' : done ? 'text-[#95122c]/50' : 'text-[#a09080]/30'
                    }`}>
                      {STEP_LABELS[s]}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-14 h-px mx-3 mb-4 transition-colors duration-400 ${
                      done ? 'bg-[#95122c]/30' : 'bg-white/[0.06]'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Step 1 — Service ── */}
        {step === 'service' && (
          <div>
            <h2 className="text-[#f5f0eb]/80 text-sm font-medium tracking-wide mb-5">בחרו שירות</h2>
            <div className="grid gap-3">
              {services.length === 0 && (
                <p className="text-[#a09080]/50 text-center py-10 text-sm">טוען שירותים...</p>
              )}
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setServiceId(s.id); setStep('datetime'); }}
                  className="w-full text-right card-luxury card-luxury-glow p-5 hover:bg-[#1a0d10]/80 transition-all duration-400 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-right flex-1">
                      <div className="font-medium text-[#f5f0eb] text-base group-hover:text-white transition-colors duration-300 mb-1">
                        {s.name}
                      </div>
                      <div className="text-[#a09080]/60 text-xs tracking-wide">
                        {s.duration} דקות
                        {s.price != null && (
                          <span className="mr-3 text-[#95122c]/80">₪{s.price}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[#95122c]/25 group-hover:text-[#95122c]/60 transition-colors duration-300 text-lg mr-3 select-none">
                      ✦
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2 — Date & Time ── */}
        {step === 'datetime' && (
          <div>
            <h2 className="text-[#f5f0eb]/80 text-sm font-medium tracking-wide mb-5">בחרו תאריך ושעה</h2>

            <label className="block mb-2 text-[0.65rem] tracking-[0.22em] uppercase text-[#a09080]/55">תאריך</label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={e => { setDate(e.target.value); setTime(''); }}
              className="input-luxury mb-7"
            />

            {date && availability && (
              <>
                {availability.nonWorkingDay && (
                  <div className="card-luxury p-4 mb-5">
                    <p className="text-amber-400/70 text-sm">📅 יום זה אינו יום עבודה</p>
                  </div>
                )}
                {availability.dayOff && (
                  <div className="card-luxury p-4 mb-5">
                    <p className="text-amber-400/70 text-sm">🚫 יום זה מסומן כחופשה</p>
                  </div>
                )}
                {!availability.nonWorkingDay && !availability.dayOff && (
                  <>
                    <label className="block mb-3 text-[0.65rem] tracking-[0.22em] uppercase text-[#a09080]/55">שעה פנויה</label>
                    {availableSlots.length === 0 ? (
                      <p className="text-[#95122c]/60 text-sm mb-5">אין שעות פנויות בתאריך זה</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {availableSlots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => setTime(slot)}
                            className={`slot-btn ${time === slot ? 'active' : ''}`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {date && !availability && (
              <p className="text-[#a09080]/40 text-sm mb-4">טוען...</p>
            )}

            <div className="flex gap-3 mt-7">
              <button onClick={() => setStep('service')} className="btn btn-ghost flex-1">
                חזרה
              </button>
              <button
                onClick={() => setStep('details')}
                disabled={!date || !time || serviceId === null}
                className="btn btn-primary flex-1"
              >
                המשך
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 — Details ── */}
        {step === 'details' && (
          <div>
            <h2 className="text-[#f5f0eb]/80 text-sm font-medium tracking-wide mb-5">הפרטים שלכם</h2>

            {/* Booking summary */}
            <div className="card-luxury p-5 mb-7">
              <p className="label-overline mb-4" style={{ color: 'rgba(160,144,128,0.55)' }}>סיכום הזמנה</p>
              <div className="grid gap-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[#a09080]/55">שירות</span>
                  <span className="font-medium text-[#f5f0eb]">{service?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#a09080]/55">משך</span>
                  <span className="text-[#f5f0eb]/70">{service?.duration} דקות</span>
                </div>
                {service?.price != null && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#a09080]/55">מחיר</span>
                    <span className="font-medium text-[#95122c]">₪{service.price}</span>
                  </div>
                )}
                <div className="h-px bg-white/[0.06] my-1" />
                <div className="flex justify-between items-center">
                  <span className="text-[#a09080]/55">תאריך</span>
                  <span className="font-medium text-[#f5f0eb] text-xs text-left">
                    {new Date(date + 'T12:00:00').toLocaleDateString('he-IL', {
                      weekday: 'long', day: 'numeric', month: 'long',
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#a09080]/55">שעה</span>
                  <span className="font-bold text-[#95122c] text-base">{time}</span>
                </div>
              </div>
            </div>

            <label className="block mb-2 text-[0.65rem] tracking-[0.22em] uppercase text-[#a09080]/55">שם מלא</label>
            <input
              type="text"
              placeholder="ישראל ישראלי"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-luxury mb-5"
            />

            <label className="block mb-2 text-[0.65rem] tracking-[0.22em] uppercase text-[#a09080]/55">טלפון</label>
            <input
              type="tel"
              placeholder="0501234567"
              value={phone}
              onChange={e => handlePhoneChange(e.target.value)}
              maxLength={10}
              className={`input-luxury ${phoneError ? 'input-error' : ''} mb-1`}
            />
            {phoneError
              ? <p className="text-[#95122c]/70 text-xs mb-5 tracking-wide">{phoneError}</p>
              : <div className="mb-5" />
            }

            {error && <p className="text-[#95122c]/70 mb-4 text-sm">{error}</p>}

            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep('datetime')} className="btn btn-ghost flex-1">
                חזרה
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name || !phone || !!phoneError || loading}
                className="btn btn-primary flex-1"
              >
                {loading ? 'שולח...' : 'אשרו תור'}
              </button>
            </div>
          </div>
        )}

        {/* ── Done ── */}
        {step === 'done' && (
          <div className="py-4">
            {/* Success mark */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-[#95122c]/30 bg-[#95122c]/10 mb-5"
                style={{ boxShadow: '0 0 40px rgba(149,18,44,0.20)' }}>
                <span className="text-[#95122c] text-xl">✦</span>
              </div>
              <h2 className="font-display text-[1.8rem] font-light text-[#f5f0eb] mb-1">התור נקבע בהצלחה</h2>
              <p className="text-[#a09080]/50 text-xs tracking-[0.2em] uppercase">נתראה בקרוב</p>
            </div>

            {/* Booking summary card */}
            <div className="card-luxury p-6 mb-5">
              <p className="label-overline mb-4" style={{ color: 'rgba(160,144,128,0.55)' }}>פרטי התור שלכם</p>
              <div className="grid gap-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#a09080]/55">שירות</span>
                  <span className="font-medium text-[#f5f0eb]">{service?.name}</span>
                </div>
                {service?.price != null && (
                  <div className="flex justify-between">
                    <span className="text-[#a09080]/55">מחיר</span>
                    <span className="font-medium text-[#95122c]">₪{service.price}</span>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <span className="text-[#a09080]/55">תאריך</span>
                  <span className="font-medium text-[#f5f0eb] text-xs text-left">
                    {new Date(date + 'T12:00:00').toLocaleDateString('he-IL', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a09080]/55">שעה</span>
                  <span className="font-bold text-[#95122c] text-base">{time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a09080]/55">שם</span>
                  <span className="text-[#f5f0eb]/80">{name}</span>
                </div>
              </div>
            </div>

            {/* Personal link */}
            {bookingToken && (
              <div className="card-luxury p-5 mb-5 border-[#95122c]/20">
                <p className="font-medium text-[#f5f0eb]/80 text-sm mb-0.5">🔗 קישור אישי לתור</p>
                <p className="text-[#a09080]/45 text-xs mb-4">שמרו את הקישור לצפייה ובביטול</p>
                <div className="flex gap-2">
                  <a
                    href={`/appointment/${bookingToken}`}
                    target="_blank"
                    className="flex-1 text-center py-2.5 text-xs bg-white/[0.03] border border-white/[0.08] rounded-lg text-[#a09080]/60 hover:text-[#f5f0eb]/70 truncate transition-colors duration-300"
                  >
                    /appointment/{bookingToken.slice(0, 12)}...
                  </a>
                  <button
                    onClick={copyLink}
                    className={`px-5 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all duration-300 ${
                      linkCopied
                        ? 'bg-emerald-800/60 text-emerald-300 border border-emerald-700/40'
                        : 'bg-[#95122c] text-white hover:bg-[#be1a3f] border border-[#95122c]'
                    }`}
                  >
                    {linkCopied ? 'הועתק ✓' : 'העתק'}
                  </button>
                </div>
              </div>
            )}

            <button onClick={reset} className="btn btn-primary w-full">
              הזמינו תור נוסף
            </button>

            <div className="mt-7 text-center">
              <Link href="/" className="text-[#a09080]/25 hover:text-[#a09080]/50 text-xs tracking-[0.2em] uppercase transition-colors duration-300">
                חזרה לדף הבית
              </Link>
            </div>
          </div>
        )}

        <div className="mt-14 text-center">
          <a href="/admin" className="text-[#a09080]/12 hover:text-[#a09080]/25 text-[0.55rem] tracking-[0.2em] uppercase transition-colors duration-300">
            ניהול
          </a>
        </div>
      </div>
    </main>
  );
}

/* Suspense boundary required by Next.js for useSearchParams */
export default function BookingPage() {
  return (
    <Suspense>
      <BookingFlow />
    </Suspense>
  );
}
