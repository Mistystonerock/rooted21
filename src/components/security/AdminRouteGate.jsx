import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield } from 'lucide-react';
import { isAdminOrFounder, isAdminSessionValid } from '@/lib/permissions';

const BG = '#faf6f1';
const DARK = '#5a3d28';
const MUTED = '#8b6f54';

export default function AdminRouteGate({ children, founderOnly = false }) {
  const [state, setState] = useState({ loading: true, allowed: false });

  useEffect(() => {
    async function checkAccess() {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        base44.auth.redirectToLogin(window.location.pathname);
        return;
      }
      const user = await base44.auth.me();
      const founderAllowed = user?.role === 'founder' && user?.email?.toLowerCase() === 'misty.stonerock88@gmail.com';
      const adminAllowed = user?.role === 'admin' && isAdminSessionValid(user);
      const allowed = founderOnly ? founderAllowed : (founderAllowed || adminAllowed);
      setState({ loading: false, allowed });
    }
    checkAccess();
  }, [founderOnly]);

  if (state.loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}><div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: `${DARK} transparent ${DARK} ${DARK}` }} /></div>;
  }

  if (!state.allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: BG }}>
        <div className="max-w-sm rounded-3xl bg-white p-8 text-center shadow-sm">
          <Shield className="mx-auto mb-3" color={DARK} />
          <h1 className="font-serif text-xl font-bold" style={{ color: DARK }}>Restricted access</h1>
          <p className="mt-2 text-sm" style={{ color: MUTED }}>This area is only available to authorized Rooted 21 admins or the founder.</p>
        </div>
      </div>
    );
  }

  return children;
}