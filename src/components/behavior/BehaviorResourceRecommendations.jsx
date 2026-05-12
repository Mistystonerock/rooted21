import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertCircle, Heart, Phone, Globe, MapPin } from 'lucide-react';
import { C } from '@/lib/rooted-constants';

export default function BehaviorResourceRecommendations({ childName, logs }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecommendations();
  }, [childName, logs?.length]);

  async function loadRecommendations() {
    if (!childName || !logs || logs.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('recommendResourcesFromBehavior', {
        child_name: childName,
      });
      setRecommendations(response.data);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Unable to load resource recommendations.');
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
      setRecommendations(prev => ({
        ...prev,
        recommendations: prev.recommendations.map(r =>
          r.id === resource.id ? { ...r, is_saved: true } : r
        ),
      }));
    } catch (err) {
      console.error('Error saving resource:', err);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Loader2 size={24} color={C.midGreen} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
        <p style={{ fontSize: 12, color: C.mutedText }}>Analyzing behavior patterns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'rgba(192,57,43,0.12)',
        border: `1px solid rgba(192,57,43,0.3)`,
        borderRadius: 12,
        padding: '12px 14px',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}>
        <AlertCircle size={16} color="#FF6B5A" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 12, color: '#FF6B5A' }}>{error}</p>
      </div>
    );
  }

  if (!recommendations || recommendations.recommendations.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{
        background: `${C.midGreen}15`,
        border: `1.5px solid ${C.midGreen}40`,
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: C.midGreen, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          💡 AI-Matched Resources
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: C.darkGreen, marginBottom: 10 }}>
          <strong>Based on {recommendations.logs_analyzed} behavior log entries:</strong>
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
          {recommendations.struggle_summary.primary_moods.length > 0 && (
            <div>
              <p style={{ color: C.mutedText, fontWeight: 600, marginBottom: 3 }}>Most Common Moods</p>
              <p style={{ color: C.darkGreen, fontWeight: 700 }}>{recommendations.struggle_summary.primary_moods.join(', ')}</p>
            </div>
          )}
          {recommendations.struggle_summary.peak_difficulty_times.length > 0 && (
            <div>
              <p style={{ color: C.mutedText, fontWeight: 600, marginBottom: 3 }}>Challenging Times</p>
              <p style={{ color: C.darkGreen, fontWeight: 700 }}>{recommendations.struggle_summary.peak_difficulty_times.join(', ')}</p>
            </div>
          )}
        </div>

        {recommendations.analysis && (
          <p style={{ fontSize: 12, color: C.darkText, marginTop: 10, lineHeight: 1.5, fontStyle: 'italic' }}>
            "{recommendations.analysis}"
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {recommendations.recommendations.map((resource, idx) => (
          <div
            key={resource.id}
            style={{
              background: C.white,
              border: `1px solid ${C.cream}`,
              borderRadius: 12,
              padding: 14,
              position: 'relative',
            }}
          >
            <div style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: resource.confidence === 'high' ? `${C.midGreen}20` : `${C.gold}20`,
              border: `1px solid ${resource.confidence === 'high' ? C.midGreen : C.gold}40`,
              borderRadius: 6,
              padding: '3px 8px',
              fontSize: 10,
              fontWeight: 700,
              color: resource.confidence === 'high' ? C.midGreen : C.gold,
            }}>
              {resource.confidence} match
            </div>

            <div style={{ marginBottom: 10, paddingRight: 80 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: C.darkGreen, marginBottom: 3 }}>
                {idx + 1}. {resource.name}
              </h3>
              <span style={{
                display: 'inline-block',
                background: `${C.gold}15`,
                border: `1px solid ${C.gold}40`,
                borderRadius: 5,
                padding: '3px 8px',
                fontSize: 10,
                fontWeight: 600,
                color: C.gold,
              }}>
                {resource.type}
              </span>
            </div>

            {resource.why_it_matches && (
              <p style={{ fontSize: 12, color: C.darkText, marginBottom: 8, lineHeight: 1.5 }}>
                <strong style={{ color: C.darkGreen }}>Why it helps:</strong> {resource.why_it_matches}
              </p>
            )}

            {resource.best_time_to_contact && (
              <p style={{ fontSize: 11, color: C.mutedText, marginBottom: 10, paddingLeft: 10, borderLeft: `2px solid ${C.cream}` }}>
                <strong style={{ color: C.darkGreen }}>Best time:</strong> {resource.best_time_to_contact}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
              {resource.phone && (
                <a href={`tel:${resource.phone}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: C.midGreen,
                  textDecoration: 'none',
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  <Phone size={12} />
                  {resource.phone}
                </a>
              )}
              {resource.website && (
                <a href={resource.website} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: C.midGreen,
                  textDecoration: 'none',
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  <Globe size={12} />
                  Visit Website
                </a>
              )}
              {resource.address && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 6,
                  color: C.mutedText,
                  fontSize: 11,
                }}>
                  <MapPin size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{resource.address}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleSaveResource(resource)}
              disabled={resource.is_saved}
              style={{
                width: '100%',
                padding: '8px',
                background: resource.is_saved ? `${C.midGreen}25` : 'transparent',
                border: `1.5px solid ${resource.is_saved ? C.midGreen : C.cream}`,
                borderRadius: 8,
                color: resource.is_saved ? C.midGreen : C.darkGreen,
                fontWeight: 700,
                fontSize: 11,
                cursor: resource.is_saved ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <Heart size={11} fill={resource.is_saved ? C.midGreen : 'none'} />
              {resource.is_saved ? 'Saved' : 'Save Resource'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}