import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { C } from '@/lib/rooted-constants';
import { Mail, CheckCircle2, ChevronDown } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

export default function AgencyContactForm() {
  const [formData, setFormData] = useState({
    agency_name: '',
    staff_size: '',
    contact_email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showStaffDrawer, setShowStaffDrawer] = useState(false);

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
      <p className="text-sm mb-4" style={{ color: C.mutedText }}>
        Rooted 21 is customizable for agencies, schools, and organizations. Get a personalized quote.
      </p>

      {submitted && (
        <div className="rounded-xl p-3 mb-4 flex items-center gap-2" style={{ background: `${C.midGreen}15` }}>
          <CheckCircle2 size={16} color={C.midGreen} />
          <p className="text-sm font-bold" style={{ color: C.midGreen }}>
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
          className="w-full rounded-lg px-3 py-2.5 text-sm font-sans"
          style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
        />

        <>
          <button
            type="button"
            onClick={() => setShowStaffDrawer(true)}
            className="w-full rounded-lg px-3 py-2.5 text-sm font-sans flex items-center justify-between"
            style={{ border: `1px solid ${C.cream}`, background: C.offWhite, cursor: "pointer" }}
          >
            {formData.staff_size || "Staff Size (optional)"}
            <ChevronDown size={14} color={C.mutedText} />
          </button>
          
          <Drawer open={showStaffDrawer} onOpenChange={setShowStaffDrawer}>
            <DrawerContent style={{ background: C.white }}>
              <DrawerHeader>
                <DrawerTitle style={{ color: C.darkGreen }}>Select Staff Size</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-6 space-y-2">
                {["Staff Size (optional)", "1-3 staff", "4-10 staff", "11-25 staff", "26+ staff"].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, staff_size: option === "Staff Size (optional)" ? "" : option }));
                      setShowStaffDrawer(false);
                    }}
                    className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-all"
                    style={{
                      background: (formData.staff_size === option || (!formData.staff_size && option === "Staff Size (optional)")) ? `${C.midGreen}15` : C.offWhite,
                      border: (formData.staff_size === option || (!formData.staff_size && option === "Staff Size (optional)")) ? `2px solid ${C.midGreen}` : `1px solid ${C.cream}`,
                      color: C.darkGreen,
                      cursor: "pointer"
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
        </>
        

        <input
          type="email"
          name="contact_email"
          placeholder="Your Email *"
          value={formData.contact_email}
          onChange={handleChange}
          required
          className="w-full rounded-lg px-3 py-2.5 text-sm font-sans"
          style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
        />

        <textarea
          name="message"
          placeholder="Tell us about your needs (optional)"
          value={formData.message}
          onChange={handleChange}
          rows="3"
          className="w-full rounded-lg px-3 py-2.5 text-sm font-sans resize-none"
          style={{ border: `1px solid ${C.cream}`, background: C.offWhite }}
        />

        <button
          type="submit"
          disabled={loading || !formData.agency_name.trim() || !formData.contact_email.trim()}
          className="w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
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