import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { C } from '@/lib/rooted-constants';
import { ChevronLeft, Copy, CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react';

export default function OwnerDashboard() {
  const [user, setUser] = useState(null);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(null);
  const [formData, setFormData] = useState({
    professional_email: '',
    professional_name: '',
    professional_role: 'Counselor'
  });

  const ROLES = ["Counselor", "Caseworker", "CPS Worker", "Court Staff", "Mentor", "Behavioral Health Worker", "School Staff", "Therapist", "Juvenile Probation", "Other"];

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.email === 'rooted21parenting@rooted21.org') {
        loadCodes();
      }
    });
  }, []);

  const loadCodes = async () => {
    const allCodes = await base44.entities.AccessCode.list('-created_date', 100);
    setCodes(allCodes);
    setLoading(false);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.professional_email || !formData.professional_name) return;

    setGenerating(true);
    try {
      await base44.functions.invoke('createOwnerAccessCode', formData);
      setFormData({ professional_email: '', professional_name: '', professional_role: 'Counselor' });
      setShowForm(false);
      await loadCodes();
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (codeId) => {
    await base44.entities.AccessCode.delete(codeId);
    await loadCodes();
  };

  if (!user || user.email !== 'rooted21parenting@rooted21.org') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.offWhite }}>
        <div className="text-center">
          <p className="font-serif font-bold text-lg" style={{ color: C.darkGreen }}>Owner Access Only</p>
          <p className="text-sm mt-2" style={{ color: C.mutedText }}>This dashboard is restricted to the platform owner.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.offWhite }}>
      <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: C.darkGreen }}>
        <Link to="/dashboard"><ChevronLeft size={20} color={C.cream} /></Link>
        <div>
          <p className="font-serif font-bold text-sm" style={{ color: C.cream }}>Owner Dashboard</p>
          <p className="text-[10px]" style={{ color: C.lightGreen }}>Generate access codes for professionals</p>
        </div>
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">
        {/* Generate form */}
        {showForm && (
          <form onSubmit={handleGenerate} className="rounded-2xl p-4 space-y-3" style={{ background: C.white, border: `1.5px solid ${C.midGreen}` }}>
            <h3 className="font-bold text-sm" style={{ color: C.darkGreen }}>Generate New Code</h3>
            
            <input
              type="email"
              value={formData.professional_email}
              onChange={(e) => setFormData(f => ({ ...f, professional_email: e.target.value }))}
              placeholder="Professional email"
              required
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
            />
            
            <input
              type="text"
              value={formData.professional_name}
              onChange={(e) => setFormData(f => ({ ...f, professional_name: e.target.value }))}
              placeholder="Professional name"
              required
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
            />
            
            <select
              value={formData.professional_role}
              onChange={(e) => setFormData(f => ({ ...f, professional_role: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
            >
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 rounded-lg font-bold text-sm"
                style={{ background: C.cream, color: C.mutedText, border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generating}
                className="flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1"
                style={{ background: C.darkGreen, color: C.white, border: 'none', cursor: 'pointer', opacity: generating ? 0.7 : 1 }}
              >
                {generating ? <Loader2 size={13} className="animate-spin" /> : 'Generate'}
              </button>
            </div>
          </form>
        )}

        {/* Generate button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: C.darkGreen, color: C.white, border: 'none', cursor: 'pointer' }}
          >
            <Plus size={14} /> Generate New Code
          </button>
        )}

        {/* Codes list */}
        {loading ? (
          <div className="text-center py-8">
            <Loader2 size={20} className="mx-auto animate-spin" color={C.midGreen} />
          </div>
        ) : codes.length === 0 ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: C.white, border: `1px dashed ${C.cream}` }}>
            <p className="text-sm font-bold" style={{ color: C.darkGreen }}>No codes generated yet</p>
            <p className="text-xs mt-1" style={{ color: C.mutedText }}>Create one to give to a professional</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-bold" style={{ color: C.mutedText }}>ACTIVE CODES ({codes.filter(c => !c.used).length})</p>
            {codes.map(code => (
              <div key={code.id} className="rounded-lg p-3.5 flex items-center gap-3" style={{ background: C.white, border: `1px solid ${C.cream}` }}>
                <div className="flex-1 min-w-0">
                  <div className="font-mono font-bold text-base" style={{ color: C.darkGreen }}>{code.code}</div>
                  <p className="text-[10px] mt-0.5" style={{ color: C.mutedText }}>
                    {code.professional_name} ({code.professional_role})
                  </p>
                  {code.used && <p className="text-[10px]" style={{ color: '#B84C2A' }}>✓ Used by {code.used_by_email}</p>}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleCopy(code.code)}
                    className="p-1.5 rounded-lg"
                    style={{ background: C.cream, border: 'none', cursor: 'pointer' }}
                  >
                    {copied === code.code ? (
                      <CheckCircle2 size={14} color={C.midGreen} />
                    ) : (
                      <Copy size={14} color={C.mutedText} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(code.id)}
                    className="p-1.5 rounded-lg"
                    style={{ background: C.cream, border: 'none', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} color="#B84C2A" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}