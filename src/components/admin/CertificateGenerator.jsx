import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const C = {
  darkGreen: '#0d2818',
  midGreen: '#48D17A',
  offWhite: '#f5e6c8',
  cream: '#E6D8B8',
  mutedText: '#BFAF8A',
  gold: '#c9973a',
};

export default function CertificateGenerator() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [downloaded, setDownloaded] = useState(new Set());
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
      // Filter to users with parent data (not admin)
      const parentUsers = allUsers.filter(u => u.role !== 'admin' && u.email);
      setUsers(parentUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateCertificate(userEmail, userName) {
    setGenerating(userEmail);
    try {
      const response = await base44.functions.invoke('generateParentProgressCertificate', {
        parent_email: userEmail,
      });

      if (response.status === 200) {
        // Trigger download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${userName}_progress_certificate.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // Mark as downloaded
        setDownloaded(prev => new Set([...prev, userEmail]));
      } else {
        alert('Error generating certificate. Check console.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate certificate.');
    } finally {
      setGenerating(null);
    }
  }

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: C.cream }}>
        <div className="flex items-center gap-2 mb-2">
          <span style={{ fontSize: 18 }}>🎓</span>
          <p className="font-bold" style={{ color: C.darkGreen }}>Parent Progress Certificates</p>
        </div>
        <p className="text-[10px] leading-relaxed" style={{ color: C.mutedText }}>
          Generate and download beautiful PDF certificates for parents based on their milestones and case plan progress.
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name or email..."
        className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
        style={{ borderColor: C.cream, background: '#fff' }}
      />

      {/* Users list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin" color={C.midGreen} />
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="text-xs text-center" style={{ color: C.mutedText }}>No users found</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: '#fff', border: `1px solid ${C.cream}` }}
            >
              <div className="flex-1">
                <p className="text-xs font-bold" style={{ color: C.darkGreen }}>
                  {user.full_name}
                </p>
                <p className="text-[10px]" style={{ color: C.mutedText }}>
                  {user.email}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {downloaded.has(user.email) && (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={14} color={C.midGreen} />
                    <span className="text-[9px] font-bold" style={{ color: C.midGreen }}>Downloaded</span>
                  </div>
                )}

                <button
                  onClick={() => handleGenerateCertificate(user.email, user.full_name)}
                  disabled={generating === user.email}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-xs"
                  style={{
                    background: generating === user.email ? `${C.midGreen}50` : C.midGreen,
                    color: '#fff',
                    border: 'none',
                    cursor: generating === user.email ? 'default' : 'pointer',
                    opacity: generating === user.email ? 0.7 : 1,
                  }}
                  title="Generate and download certificate"
                >
                  {generating === user.email ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Download size={12} />
                  )}
                  {generating === user.email ? 'Generating...' : 'Certificate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}