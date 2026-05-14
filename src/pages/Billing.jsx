import { Link } from 'react-router-dom';
import { C } from '@/lib/rooted-constants';
import { ChevronLeft, HeartHandshake, Check } from 'lucide-react';

export default function Billing() {
  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard">
          <ChevronLeft size={20} color={C.cream} />
        </Link>
        <HeartHandshake size={16} color={C.lightGreen} />
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Nonprofit Access</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>Rooted 21 is free for families</p>
        </div>
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-5 space-y-5">
        <div className="rounded-2xl p-5" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
          <p className="text-4xl mb-3">🌿</p>
          <h1 className="font-serif font-bold text-2xl" style={{ color: C.darkGreen }}>No subscription charges</h1>
          <p className="text-sm leading-relaxed mt-3" style={{ color: C.mutedText }}>
            Rooted 21 is becoming a nonprofit, so families are not charged for access to parenting tools, crisis support, lessons, documents, or care resources.
          </p>
        </div>

        <div className="rounded-2xl p-5" style={{ background: C.cream }}>
          <p className="text-[10px] font-extrabold tracking-widest mb-3" style={{ color: C.mutedText }}>WHAT THIS MEANS</p>
          <div className="space-y-3">
            {[
              'No monthly family membership fees',
              'No free-trial billing or automatic subscription charges',
              'Donations remain optional and go directly to supporting Rooted 21 families',
            ].map(item => (
              <div key={item} className="flex items-start gap-2 text-sm" style={{ color: C.darkGreen }}>
                <Check size={14} color={C.midGreen} className="mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <Link
          to="/donate"
          className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center"
          style={{ background: C.darkGreen, color: C.cream, textDecoration: 'none' }}
        >
          Support Rooted 21 With an Optional Donation
        </Link>
      </div>
    </div>
  );
}