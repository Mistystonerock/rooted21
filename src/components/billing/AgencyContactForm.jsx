import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { C } from '@/lib/rooted-constants';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function AgencyContactForm() {
  const [formData, setFormData] = useState({
    agency_name: '',
    staff_size: '',
    contact_email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agency_name.trim() || !formData.contact_email.trim()) return;

    setLoading(true);
    try {
      await base44.functions.invoke('sendAgencyPricingEmail', formData);
      setSubmitted(true);
      setFormData({ agency_name: '', staff_size: '', contact_email: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error sending inquiry:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: C.white, border: `1.5px solid ${C.cream}` }}>
      <h3 className="font-serif font-bold text-base mb-2" style={{ color: C.darkGreen }}>
        🏢 Enterprise Pricing
      </h3>
      <p className="text-xs mb-4" style={{ color: C.mutedText }}>
        Rooted 21 is customizable for agencies, schools, and organizations. Get a personalized quote.
      </p>

      {submitted && (
        <div className="rounded-xl p-3 mb-4 flex items-center gap-2" style={{ background: `${C.midGreen}15` }}>
          <CheckCircle2 size={16} color={C.midGreen} />
          <p className="text-xs font-bold" style={{ color: C.midGreen }}>
            Thanks! Misty will reach out within 2 business days.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="agency_name"
          placeholder="Agency or Organization Name *"
          value={formData.agency_name}
          onChange={handleChange}
          required
          className="w-full rounded-lg px-3 py-2.5 text-xs font-sans"
          style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
        />

        <select
          name="staff_size"
          value={formData.staff_size}
          onChange={handleChange}
          className="w-full rounded-lg px-3 py-2.5 text-xs font-sans"
          style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
        >
          <option value="">Staff Size (optional)</option>
          <option value="1-3">1-3 staff</option>
          <option value="4-10">4-10 staff</option>
          <option value="11-25">11-25 staff</option>
          <option value="26+">26+ staff</option>
        </select>

        <input
          type="email"
          name="contact_email"
          placeholder="Your Email *"
          value={formData.contact_email}
          onChange={handleChange}
          required
          className="w-full rounded-lg px-3 py-2.5 text-xs font-sans"
          style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
        />

        <textarea
          name="message"
          placeholder="Tell us about your needs (optional)"
          value={formData.message}
          onChange={handleChange}
          rows="3"
          className="w-full rounded-lg px-3 py-2.5 text-xs font-sans resize-none"
          style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
        />

        <button
          type="submit"
          disabled={loading || !formData.agency_name.trim() || !formData.contact_email.trim()}
          className="w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-opacity"
          style={{
            background: C.darkGreen,
            color: C.cream,
            border: 'none',
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          <Mail size={13} />
          {loading ? 'Sending...' : 'Request Pricing'}
        </button>
      </form>
    </div>
  );
}