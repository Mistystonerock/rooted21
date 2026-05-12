import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, MapPin, Phone, Globe, Heart, AlertCircle } from 'lucide-react';

const C = {
  darkGreen: '#0a3d20',
  midGreen: '#48D17A',
  cream: '#F5E6BF',
  gold: '#c9973a',
  text: '#F3E6C8',
  mutedText: '#D8C8A3',
  card: 'rgba(5, 42, 24, 0.92)',
  border: 'rgba(255, 231, 190, 0.65)',
};

const NEEDS = [
  { value: 'food', label: '🍽️ Food Assistance', icon: '🍽️' },
  { value: 'housing', label: '🏠 Housing Support', icon: '🏠' },
  { value: 'counseling', label: '🧠 Mental Health Counseling', icon: '🧠' },
  { value: 'therapy', label: '💜 Behavioral Therapy', icon: '💜' },
  { value: 'support_group', label: '🤝 Support Groups', icon: '🤝' },
  { value: 'legal_aid', label: '⚖️ Legal Aid', icon: '⚖️' },
  { value: 'education', label: '📚 Education Services', icon: '📚' },
  { value: 'medical', label: '🏥 Medical Care', icon: '🏥' },
  { value: 'respite', label: '💙 Respite Care', icon: '💙' },
  { value: 'crisis', label: '🚨 Crisis Resources', icon: '🚨' },
];

export default function ResourceMatcher() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    county: '',
    child_age: '',
    primary_need: '',
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch() {
    if (!formData.county || !formData.child_age || !formData.primary_need) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('matchCommunityResources', formData);
      setResults(response.data);
      setStep(3);
    } catch (err) {
      setError('Failed to find resources. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveResource(resource) {
    try {
      await base44.entities.SavedResource.create({
        owner_email: (await base44.auth.me()).email,
        resource_name: resource.name,
        resource_type: resource.type,
        phone: resource.phone,
        website: resource.website,
        address: resource.address,
        location_label: resource.location_label,
        description: resource.description,
        is_favorite: true,
      });
      setResults(prev => ({
        ...prev,
        matched_resources: prev.matched_resources.map(r =>
          r.id === resource.id ? { ...r, is_saved: true } : r
        ),
      }));
    } catch (err) {
      console.error('Failed to save resource:', err);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.darkGreen, color: C.text, padding: '16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Find Local Support
        </h1>
        <p style={{ color: C.mutedText, fontSize: 14 }}>
          Discover resources tailored to your family's needs
        </p>
      </div>

      {/* Step 1: Collect Metadata */}
      {step === 1 && (
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* County/Location */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, color: C.cream }}>
              County or Region
            </label>
            <input
              type="text"
              placeholder="e.g., Franklin County, OH or Zip Code"
              value={formData.county}
              onChange={e => setFormData({ ...formData, county: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: `1.5px solid ${C.border}`,
                borderRadius: 12,
                background: 'rgba(0,0,0,0.3)',
                color: C.text,
                fontSize: 14,
                boxSizing: 'border-box',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>

          {/* Child's Age */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, color: C.cream }}>
              Child's Age
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {['0-3', '4-8', '9-13', '14-18'].map(age => (
                <button
                  key={age}
                  onClick={() => setFormData({ ...formData, child_age: age })}
                  style={{
                    padding: '12px',
                    borderRadius: 10,
                    border: `2px solid ${formData.child_age === age ? C.midGreen : C.border}`,
                    background: formData.child_age === age ? `${C.midGreen}20` : 'rgba(0,0,0,0.3)',
                    color: formData.child_age === age ? C.midGreen : C.text,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Need */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, color: C.cream }}>
              What do you need most right now?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {NEEDS.map(need => (
                <button
                  key={need.value}
                  onClick={() => setFormData({ ...formData, primary_need: need.value })}
                  style={{
                    padding: '12px',
                    borderRadius: 12,
                    border: `1.5px solid ${formData.primary_need === need.value ? C.midGreen : C.border}`,
                    background: formData.primary_need === need.value ? `${C.midGreen}20` : 'rgba(0,0,0,0.3)',
                    color: C.text,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 12,
                    textAlign: 'left',
                  }}
                >
                  {need.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(192,57,43,0.15)',
              border: '1px solid rgba(192,57,43,0.3)',
              borderRadius: 10,
              padding: '12px',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
            }}>
              <AlertCircle size={16} color="#ff8070" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 12, color: '#FF6B5A' }}>{error}</p>
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: '14px',
              background: C.midGreen,
              border: 'none',
              borderRadius: 12,
              color: C.darkGreen,
              fontWeight: 800,
              fontSize: 14,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Finding resources...
              </>
            ) : (
              'Find Resources'
            )}
          </button>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && results && (
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          {/* AI Recommendations Summary */}
          <div style={{
            background: C.card,
            border: `1.5px solid ${C.border}`,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.cream, marginBottom: 12 }}>
              AI-Matched Recommendations
            </h2>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: C.mutedText, whiteSpace: 'pre-wrap' }}>
              {results.ai_recommendations}
            </p>
          </div>

          {/* Matched Resources */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.cream, marginBottom: 12 }}>
              Available in {results.search_params.county}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.matched_resources.length > 0 ? (
                results.matched_resources.map(resource => (
                  <div
                    key={resource.id}
                    style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      borderRadius: 14,
                      padding: 14,
                    }}
                  >
                    <div style={{ marginBottom: 10 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.cream, marginBottom: 4 }}>
                        {resource.name}
                      </h3>
                      <span style={{
                        display: 'inline-block',
                        background: `${C.gold}20`,
                        border: `1px solid ${C.gold}50`,
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                        color: C.gold,
                      }}>
                        {resource.type}
                      </span>
                    </div>

                    {resource.description && (
                      <p style={{ fontSize: 12, color: C.mutedText, marginBottom: 10, lineHeight: 1.5 }}>
                        {resource.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                      {resource.phone && (
                        <a href={`tel:${resource.phone}`} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          color: C.midGreen,
                          textDecoration: 'none',
                          fontSize: 12,
                          fontWeight: 600,
                        }}>
                          <Phone size={14} />
                          {resource.phone}
                        </a>
                      )}
                      {resource.website && (
                        <a href={resource.website} target="_blank" rel="noopener noreferrer" style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          color: C.midGreen,
                          textDecoration: 'none',
                          fontSize: 12,
                          fontWeight: 600,
                        }}>
                          <Globe size={14} />
                          Visit Website
                        </a>
                      )}
                      {resource.address && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                          color: C.mutedText,
                          fontSize: 12,
                        }}>
                          <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                          <span>{resource.address}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleSaveResource(resource)}
                      disabled={resource.is_saved}
                      style={{
                        width: '100%',
                        padding: '9px',
                        background: resource.is_saved ? `${C.midGreen}30` : 'transparent',
                        border: `1.5px solid ${resource.is_saved ? C.midGreen : C.border}`,
                        borderRadius: 10,
                        color: resource.is_saved ? C.midGreen : C.cream,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: resource.is_saved ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <Heart size={12} fill={resource.is_saved ? C.midGreen : 'none'} />
                      {resource.is_saved ? 'Saved' : 'Save Resource'}
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ color: C.mutedText, textAlign: 'center', padding: '20px' }}>
                  No resources found. Try a different search.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => { setStep(1); setResults(null); }}
            style={{
              marginTop: 20,
              marginBottom: 40,
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: `1.5px dashed ${C.border}`,
              borderRadius: 12,
              color: C.cream,
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            New Search
          </button>
        </div>
      )}
    </div>
  );
}