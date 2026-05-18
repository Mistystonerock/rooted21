import { AlertTriangle } from 'lucide-react';

const CREAM = '#f5ede2';
const DARK = '#5a3d28';
const MUTED = '#8b6f54';

export default function FounderReauthNotice() {
  return (
    <div className="rounded-2xl border p-4 text-sm" style={{ background: CREAM, borderColor: '#d7c7aa', color: DARK }}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" color={DARK} />
        <div>
          <p className="font-bold">Founder password confirmation required for sensitive actions</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: MUTED }}>
            Admin promotions, removals, invitation codes, and security changes require a fresh secure session. Confirm your password from your account security flow, then return here.
          </p>
        </div>
      </div>
    </div>
  );
}