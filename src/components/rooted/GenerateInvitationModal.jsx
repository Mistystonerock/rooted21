import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { C } from '@/lib/rooted-constants';
import { X, Copy, CheckCircle2, Loader2 } from 'lucide-react';

export default function GenerateInvitationModal({ childName, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateInvitationCode', {
        child_name: childName
      });
      setCode(response.data.code);
      onSuccess?.();
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50">
      <div className="w-full rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto" style={{ background: C.white }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-base" style={{ color: C.darkGreen }}>
            Generate Invitation Code
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-opacity-80 transition"
            style={{ background: C.cream, border: 'none', cursor: 'pointer' }}
          >
            <X size={18} color={C.darkGreen} />
          </button>
        </div>

        {code ? (
          // SUCCESS STATE
          <div className="space-y-4">
            <div className="rounded-2xl p-6 text-center" style={{ background: `${C.midGreen}12`, border: `1.5px solid ${C.midGreen}` }}>
              <CheckCircle2 size={32} color={C.midGreen} className="mx-auto mb-3" />
              <p className="font-bold text-sm mb-1" style={{ color: C.darkGreen }}>
                Code Generated!
              </p>
              <p className="text-xs mb-4" style={{ color: C.mutedText }}>
                Share this code with your professional for 30 days
              </p>

              {/* CODE DISPLAY */}
              <div className="rounded-xl p-4 mb-4 font-mono font-bold text-2xl tracking-widest"
                style={{ background: C.darkGreen, color: C.cream }}>
                {code}
              </div>

              {/* COPY BUTTON */}
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all"
                style={{
                  background: C.darkGreen,
                  color: C.cream,
                  border: 'none',
                  cursor: 'pointer',
                  opacity: copied ? 0.7 : 1
                }}
              >
                {copied ? (
                  <><CheckCircle2 size={14} /> Copied!</>
                ) : (
                  <><Copy size={14} /> Copy Code</>
                )}
              </button>
            </div>

            {/* INSTRUCTIONS */}
            <div className="rounded-xl p-3.5 space-y-2" style={{ background: C.cream }}>
              <p className="text-xs font-bold" style={{ color: C.darkGreen }}>
                📋 What to do next:
              </p>
              <ol className="text-xs space-y-1.5" style={{ color: C.mutedText }}>
                <li>• Copy the code above</li>
                <li>• Share it with your {childName ? `${childName}'s` : 'assigned'} professional</li>
                <li>• They'll enter it in their app to link to your account</li>
                <li>• Your data will be automatically shared with them</li>
              </ol>
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg font-bold text-sm"
              style={{ background: C.cream, color: C.darkGreen, border: 'none', cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        ) : (
          // INITIAL STATE
          <div className="space-y-4">
            <p className="text-xs leading-relaxed" style={{ color: C.mutedText }}>
              Generate a unique code to invite a professional (therapist, caseworker, counselor, etc.) to your account.
              They can enter this code instead of waiting for an access code from you.
            </p>

            <div className="rounded-xl p-3.5" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              <p className="text-[10px] font-bold mb-1" style={{ color: C.mutedText }}>FOR</p>
              <p className="font-bold text-sm" style={{ color: C.darkGreen }}>
                {childName || 'Your family'}
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
              style={{
                background: C.darkGreen,
                color: C.cream,
                border: 'none',
                cursor: 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Generating...</>
              ) : (
                '+ Generate Code'
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg font-bold text-sm"
              style={{ background: C.cream, color: C.darkGreen, border: 'none', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}