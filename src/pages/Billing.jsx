import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { C } from '@/lib/rooted-constants';
import { ChevronLeft, CreditCard, Check, AlertCircle } from 'lucide-react';
import TrialStatus from '@/components/billing/TrialStatus';
import AgencyContactForm from '@/components/billing/AgencyContactForm';

export default function Billing() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const subs = await base44.entities.Subscription.filter(
        { user_email: u.email },
        '-created_date',
        1
      );
      setSubscription(subs[0] || null);
      setLoading(false);
    });
  }, []);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {
        successUrl: window.location.origin + '/billing?success=true',
        cancelUrl: window.location.origin + '/billing'
      });
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Upgrade error:', error);
    } finally {
      setUpgrading(false);
    }
  };

  const showSuccess = searchParams.get('success') === 'true';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.midGreen} transparent ${C.midGreen} ${C.midGreen}` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard">
          <ChevronLeft size={20} color={C.cream} />
        </Link>
        <CreditCard size={16} color={C.lightGreen} />
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Billing & Subscription</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>Manage your account</p>
        </div>
      </div>

      <div className="max-w-[540px] mx-auto px-4 py-5 space-y-5">
        
        {/* SUCCESS MESSAGE */}
        {showSuccess && (
          <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: `${C.midGreen}15`, border: `1px solid ${C.midGreen}` }}>
            <Check size={16} color={C.midGreen} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm" style={{ color: C.midGreen }}>Welcome to Rooted 21!</p>
              <p className="text-xs mt-0.5" style={{ color: C.darkGreen }}>Your subscription is confirmed. Your 7-day trial starts now.</p>
            </div>
          </div>
        )}

        {/* TRIAL/SUBSCRIPTION STATUS */}
        {subscription && <TrialStatus subscription={subscription} />}

        {/* PRICING TIERS */}
        <div>
          <p className="text-[10px] font-extrabold tracking-widest mb-3" style={{ color: C.mutedText }}>PRICING</p>
          
          <div className="space-y-3">
            {/* PRIVATE */}
            <div className="rounded-2xl p-5" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm" style={{ color: C.darkGreen }}>Private Account</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: C.mutedText }}>For parents & families</p>
                </div>
                <span className="text-sm font-extrabold" style={{ color: C.gold }}>$14.99/mo</span>
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: '#3a3028' }}>
                Full access to all Rooted 21 features — curriculum, crisis support, behavioral tracking, and professional messaging.
              </p>
              <ul className="space-y-1.5 mb-4">
                <li className="flex items-center gap-2 text-xs" style={{ color: C.darkGreen }}>
                  <Check size={12} color={C.midGreen} /> 7-day free trial — no charge today
                </li>
                <li className="flex items-center gap-2 text-xs" style={{ color: C.darkGreen }}>
                  <Check size={12} color={C.midGreen} /> $14.99/month after trial
                </li>
                <li className="flex items-center gap-2 text-xs" style={{ color: C.darkGreen }}>
                  <Check size={12} color={C.midGreen} /> Cancel anytime — no penalties
                </li>
              </ul>
              
              {subscription?.account_type === 'private' && subscription?.status === 'active' ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-lg font-bold text-xs"
                  style={{ background: C.midGreen, color: C.white, border: 'none', opacity: 0.6 }}
                >
                  ✓ Current Plan
                </button>
              ) : !subscription || subscription.status === 'trial' ? (
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full py-2.5 rounded-lg font-bold text-xs transition-opacity"
                  style={{
                    background: C.darkGreen,
                    color: C.cream,
                    border: 'none',
                    cursor: 'pointer',
                    opacity: upgrading ? 0.7 : 1
                  }}
                >
                  {upgrading ? 'Processing...' : 'Start Free Trial'}
                </button>
              ) : null}
            </div>

            {/* STARTER */}
            <div className="rounded-2xl p-5" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm" style={{ color: C.darkGreen }}>Starter (Agency)</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: C.mutedText }}>1-3 staff members</p>
                </div>
                <span className="text-sm font-extrabold" style={{ color: C.gold }}>$149</span>
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: '#3a3028' }}>
                Perfect for small counseling practices, therapists, or community programs.
              </p>
              <ul className="space-y-1.5 mb-4">
                <li className="flex items-center gap-2 text-xs" style={{ color: C.darkGreen }}>
                  <Check size={12} color={C.midGreen} /> Manage up to 3 staff
                </li>
                <li className="flex items-center gap-2 text-xs" style={{ color: C.darkGreen }}>
                  <Check size={12} color={C.midGreen} /> Track unlimited families
                </li>
                <li className="flex items-center gap-2 text-xs" style={{ color: C.darkGreen }}>
                  <Check size={12} color={C.midGreen} /> Priority support
                </li>
              </ul>
              <button
                disabled
                className="w-full py-2.5 rounded-lg font-bold text-xs"
                style={{ background: C.cream, color: C.mutedText, border: 'none', cursor: 'not-allowed' }}
              >
                Contact for Details
              </button>
            </div>

            {/* GROWTH */}
            <div className="rounded-2xl p-5" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm" style={{ color: C.darkGreen }}>Growth (Agency)</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: C.mutedText }}>3-10 staff members</p>
                </div>
                <span className="text-sm font-extrabold" style={{ color: C.gold }}>$349</span>
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: '#3a3028' }}>
                For mid-sized agencies, schools, or CPS programs scaling their reach.
              </p>
              <ul className="space-y-1.5 mb-4">
                <li className="flex items-center gap-2 text-xs" style={{ color: C.darkGreen }}>
                  <Check size={12} color={C.midGreen} /> Manage up to 10 staff
                </li>
                <li className="flex items-center gap-2 text-xs" style={{ color: C.darkGreen }}>
                  <Check size={12} color={C.midGreen} /> Custom TBRI® training
                </li>
                <li className="flex items-center gap-2 text-xs" style={{ color: C.darkGreen }}>
                  <Check size={12} color={C.midGreen} /> Dedicated support
                </li>
              </ul>
              <button
                disabled
                className="w-full py-2.5 rounded-lg font-bold text-xs"
                style={{ background: C.cream, color: C.mutedText, border: 'none', cursor: 'not-allowed' }}
              >
                Contact for Details
              </button>
            </div>

            {/* ENTERPRISE */}
            <div className="rounded-2xl p-5" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm" style={{ color: C.darkGreen }}>Enterprise (Agency)</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: C.mutedText }}>10+ staff members</p>
                </div>
                <span className="text-sm font-extrabold" style={{ color: C.gold }}>Custom</span>
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: '#3a3028' }}>
                Large-scale implementation with custom features, integrations, and support.
              </p>
              <ul className="space-y-1.5 mb-4">
                <li className="flex items-center gap-2 text-xs" style={{ color: C.darkGreen }}>
                  <Check size={12} color={C.midGreen} /> Unlimited staff
                </li>
                <li className="flex items-center gap-2 text-xs" style={{ color: C.darkGreen }}>
                  <Check size={12} color={C.midGreen} /> Custom integrations
                </li>
                <li className="flex items-center gap-2 text-xs" style={{ color: C.darkGreen }}>
                  <Check size={12} color={C.midGreen} /> Dedicated account manager
                </li>
              </ul>
              <button
                disabled
                className="w-full py-2.5 rounded-lg font-bold text-xs"
                style={{ background: C.cream, color: C.mutedText, border: 'none', cursor: 'not-allowed' }}
              >
                Contact for Details
              </button>
            </div>
          </div>
        </div>

        {/* AGENCY CONTACT FORM */}
        <AgencyContactForm />

        {/* BILLING INFO */}
        <div className="rounded-xl p-4" style={{ background: C.cream }}>
          <p className="text-[11px] leading-relaxed" style={{ color: C.mutedText }}>
            <strong>Billing:</strong> Your subscription renews automatically each month. You can cancel anytime in your account settings. For questions, contact <strong>billing@rooted21.org</strong>
          </p>
        </div>

        <div className="pb-6" />
      </div>
    </div>
  );
}