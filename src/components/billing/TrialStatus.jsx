import { useEffect, useState } from 'react';
import { C } from '@/lib/rooted-constants';
import { Clock, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';

export default function TrialStatus({ subscription }) {
  const [daysLeft, setDaysLeft] = useState(0);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (!subscription?.trial_end_date) return;

    const now = new Date();
    const trialEnd = new Date(subscription.trial_end_date);
    const trialStart = new Date(subscription.trial_start_date);
    
    const totalDays = (trialEnd - trialStart) / (1000 * 60 * 60 * 24);
    const remaining = (trialEnd - now) / (1000 * 60 * 60 * 24);
    
    setDaysLeft(Math.ceil(Math.max(0, remaining)));
    setPercentage(Math.max(0, Math.min(100, (remaining / totalDays) * 100)));
  }, [subscription]);

  if (subscription?.status === 'active') {
    return (
      <div className="rounded-2xl p-4" style={{ background: `${C.midGreen}12`, border: `1.5px solid ${C.midGreen}` }}>
        <div className="flex items-start gap-3">
          <CheckCircle2 size={18} color={C.midGreen} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: C.darkGreen }}>
              ✓ Subscription Active
            </p>
            <p className="text-xs mt-0.5" style={{ color: C.mutedText }}>
              Renews {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (subscription?.status === 'past_due') {
    return (
      <div className="rounded-2xl p-4" style={{ background: '#FEF3EE', border: '1.5px solid #F4C9B8' }}>
        <div className="flex items-start gap-3">
          <AlertCircle size={18} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: '#B84C2A' }}>
              ⚠ Payment Failed
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#3a3028' }}>
              Update your payment method to continue
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Trial status
  return (
    <div className="rounded-2xl p-4" style={{ background: `${C.gold}12`, border: `1.5px solid ${C.gold}` }}>
      <div className="flex items-start gap-3 mb-3">
        <Clock size={18} color={C.brown} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bold text-sm" style={{ color: C.darkGreen }}>
            Free Trial Active
          </p>
          <p className="text-xs mt-0.5" style={{ color: C.mutedText }}>
            {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
          </p>
        </div>
      </div>
      
      <div className="h-2 rounded-full overflow-hidden" style={{ background: `${C.gold}30` }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percentage}%`, background: C.gold }}
        />
      </div>

      <p className="text-[10px] mt-2" style={{ color: C.mutedText }}>
      Rooted 21 access is free for families as part of our nonprofit mission.
      </p>
    </div>
  );
}