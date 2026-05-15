import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { C } from '@/lib/rooted-constants';
import { X, Check, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

const ROLES = ["Counselor", "Caseworker", "CPS Worker", "Court Staff", "Mentor", "Behavioral Health Worker", "School Staff", "Therapist", "Juvenile Probation", "Other"];

export default function RedeemInvitationModal({ onClose, onSuccess }) {
  const [code, setCode] = useState('');
  const [role, setRole] = useState('Counselor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showRoleDrawer, setShowRoleDrawer] = useState(false);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('redeemInvitationCode', {
        code: code.toUpperCase().trim(),
        professional_role: role
      });

      setSuccess(response.data);
      onSuccess?.();
      setTimeout(() => onClose(), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to redeem code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-end z-50">
        <div className="w-full rounded-t-2xl p-5" style={{ background: C.white }}>
          <div className="text-center space-y-3">
            <Check size={40} color={C.midGreen} className="mx-auto" />
            <p className="font-bold text-base" style={{ color: C.darkGreen }}>
              ✓ Successfully Linked!
            </p>
            <p className="text-sm" style={{ color: C.mutedText }}>
              You're now connected to {success.assignment.family_name}'s account
            </p>
            <p className="text-sm font-bold mt-2" style={{ color: C.midGreen }}>
              Data is now being shared with you
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50">
      <div className="w-full rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto" style={{ background: C.white }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-base" style={{ color: C.darkGreen }}>
            Enter Invitation Code
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-opacity-80 transition"
            style={{ background: C.cream, border: 'none', cursor: 'pointer' }}
          >
            <X size={18} color={C.darkGreen} />
          </button>
        </div>

        <form onSubmit={handleRedeem} className="space-y-3">
          <p className="text-sm" style={{ color: C.mutedText }}>
            Enter the 6-character professional access code provided by the parent/family you work with.
          </p>

          {error && (
            <div className="rounded-lg p-3 flex gap-2" style={{ background: '#FEF3EE', border: '1px solid #F4C9B8' }}>
              <AlertCircle size={14} color="#B84C2A" className="flex-shrink-0 mt-0.5" />
              <p className="text-sm" style={{ color: '#B84C2A' }}>{error}</p>
            </div>
          )}

          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: C.mutedText }}>
              INVITATION CODE
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., AB12CD"
              maxLength="6"
              className="w-full rounded-lg px-3 py-3 text-center text-lg font-mono font-bold tracking-widest"
              style={{ border: `1.5px solid ${C.cream}`, background: C.offWhite }}
            />
          </div>

          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: C.mutedText }}>
              YOUR ROLE
            </label>
            <button
              type="button"
              onClick={() => setShowRoleDrawer(true)}
              className="w-full rounded-lg px-3 py-2.5 text-sm font-sans flex items-center justify-between"
              style={{ border: `1px solid ${C.cream}`, background: C.offWhite, cursor: "pointer" }}
            >
              {role}
              <ChevronDown size={14} color={C.mutedText} />
            </button>
            
            <Drawer open={showRoleDrawer} onOpenChange={setShowRoleDrawer}>
              <DrawerContent style={{ background: C.white }}>
                <DrawerHeader>
                  <DrawerTitle style={{ color: C.darkGreen }}>Select Your Role</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-6 space-y-2">
                  {ROLES.map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        setRole(r);
                        setShowRoleDrawer(false);
                      }}
                      className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-all"
                      style={{
                        background: role === r ? `${C.midGreen}15` : C.offWhite,
                        border: role === r ? `2px solid ${C.midGreen}` : `1px solid ${C.cream}`,
                        color: C.darkGreen,
                        cursor: "pointer"
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
            style={{
              background: C.darkGreen,
              color: C.cream,
              border: 'none',
              cursor: 'pointer',
              opacity: (loading || !code.trim()) ? 0.6 : 1
            }}
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Verifying...</>
            ) : (
              '✓ Link Account'
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-lg font-bold text-sm"
            style={{ background: C.cream, color: C.darkGreen, border: 'none', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}