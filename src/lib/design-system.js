/**
 * ROOTED 21 SEMANTIC DESIGN SYSTEM
 * 
 * Visual Reference: Onboarding Modal
 * All components follow this color and contrast standard
 * 
 * Color Palette:
 * - Dark Background: #060d08 (primary app bg)
 * - Dark Green: #0a3d20 (dark surfaces)
 * - Mid Green: #0c1610 (cards, elevated surfaces)
 * - Light Green: #48d17a (accents, success)
 * - Gold: #c9973a (secondary accent, highlights)
 * - Cream/Light: #f5e6c8 (headings, primary text on dark)
 * - Muted Light: #bfaf8a (secondary text on dark)
 * - White: #ffffff (light surfaces, modals)
 * - Dark Text: #060d08 (text on light surfaces)
 * - Muted Dark: #666666 (secondary text on light)
 */

export const SURFACES = {
  // Primary app background
  appBg: '#faf6f1',
  
  // Card and container surfaces
  darkCard: '#ffffff',
  darkCardBorder: 'rgba(120,85,60,0.2)',
  
  lightCard: '#ffffff',
  lightCardBorder: 'rgba(120,85,60,0.2)',
  
  // Elevated surfaces
  darkCardElevated: '#f5ede2',
  darkCardElevatedBorder: 'rgba(120,85,60,0.2)',
  
  // Modal and overlay
  modalBg: '#ffffff',
  modalBgLight: '#ffffff',
  modalOverlay: 'rgba(61, 40, 23, 0.45)',
  
  // Dashboard specific
  dashboardBg: '#faf6f1',
  dashboardCard: '#ffffff',
  
  // Form and input
  formFieldBg: '#ffffff',
  formFieldBorder: 'rgba(120,85,60,0.2)',
  formFieldBorderFocus: '#6b9d6e',
  
  // Button surfaces
  buttonPrimary: '#6b9d6e',
  buttonPrimaryText: '#ffffff',
  buttonSecondary: '#ffffff',
  buttonSecondaryBorder: '#6b9d6e',
  
  // Alert and danger
  alertBg: 'rgba(184, 76, 42, 0.1)',
  alertBorder: 'rgba(184, 76, 42, 0.25)',
  alertText: '#B84C2A',
  
  // Success
  successBg: 'rgba(107, 157, 110, 0.1)',
  successBorder: 'rgba(107, 157, 110, 0.3)',
  
  // Tab surfaces
  tabInactive: 'transparent',
  tabActive: '#ffffff',
  tabActiveBorder: '#6b9d6e',
  
  // SOS/Emergency cards
  sosBg: '#ffffff',
  sosBorder: '#B84C2A',
  
  // Gold accent
  goldBg: 'rgba(166, 124, 82, 0.12)',
  goldBorder: 'rgba(166, 124, 82, 0.35)',
};

export const TEXT = {
  // Primary text
  onDark: '#1a1a1a',
  onDarkSecondary: '#5a3d28',
  onDarkMuted: '#8b6f54',
  
  // Text on light surfaces
  onLight: '#1a1a1a',
  onLightSecondary: '#5a3d28',
  onLightMuted: '#8b6f54',
  
  // Semantic text colors
  accent: '#6b9d6e',
  accentSecondary: '#a67c52',
  danger: '#B84C2A',
  success: '#6b9d6e',
  warning: '#a67c52',
  
  // Heading
  headingDark: '#1a1a1a',
  headingLight: '#1a1a1a',
  
  // Muted variants
  mutedDark: '#8b6f54',
  mutedLight: '#8b6f54',
  
  // Special
  placeholder: '#8b6f54',
  disabled: '#8b6f54',
};

export const BORDERS = {
  light: 'rgba(120, 85, 60, 0.15)',
  medium: 'rgba(120, 85, 60, 0.2)',
  strong: 'rgba(107, 157, 110, 0.45)',
};

export const SHADOWS = {
  sm: '0 2px 8px rgba(61, 40, 23, 0.06)',
  md: '0 8px 24px rgba(61, 40, 23, 0.08)',
  lg: '0 12px 34px rgba(61, 40, 23, 0.12)',
  glow: '0 8px 28px rgba(107, 157, 110, 0.12), 0 0 0 1px rgba(120,85,60,0.12)',
};

/**
 * Component-specific surface utilities
 * Use these to ensure consistency across the app
 */
// Quick action card colors
export const CARD_COLORS = {
  sos: {
    border: '#e74c3c',
    icon: '#e74c3c',
    label: '#ffffff',
  },
  checkin: {
    border: '#6b9d6e',
    icon: '#6b9d6e',
    label: '#1a1a1a',
  },
  behavior: {
    border: '#9b59b6',
    icon: '#9b59b6',
    label: '#ffffff',
  },
  safety: {
    border: '#3498db',
    icon: '#3498db',
    label: '#ffffff',
  },
};

export const getComponentStyle = (component, variant = 'default') => {
  const styles = {
    card: {
      default: {
        background: SURFACES.darkCard,
        border: `1px solid ${SURFACES.darkCardBorder}`,
        borderRadius: '12px',
        color: TEXT.onDark,
      },
      elevated: {
        background: SURFACES.darkCardElevated,
        border: `1.5px solid ${SURFACES.darkCardElevatedBorder}`,
        borderRadius: '14px',
        color: TEXT.onDark,
        boxShadow: SHADOWS.glow,
      },
      light: {
        background: SURFACES.lightCard,
        border: `1px solid ${SURFACES.lightCardBorder}`,
        borderRadius: '12px',
        color: TEXT.onLight,
      },
      sos: {
        background: SURFACES.darkCard,
        border: `2px solid ${CARD_COLORS.sos.border}`,
        borderRadius: '12px',
        color: TEXT.onDark,
      },
      checkin: {
        background: SURFACES.darkCard,
        border: `2px solid ${CARD_COLORS.checkin.border}`,
        borderRadius: '12px',
        color: TEXT.onDark,
      },
      behavior: {
        background: SURFACES.darkCard,
        border: `2px solid ${CARD_COLORS.behavior.border}`,
        borderRadius: '12px',
        color: TEXT.onDark,
      },
      safety: {
        background: SURFACES.darkCard,
        border: `2px solid ${CARD_COLORS.safety.border}`,
        borderRadius: '12px',
        color: TEXT.onDark,
      },
    },
    button: {
      primary: {
        background: SURFACES.buttonPrimary,
        color: SURFACES.buttonPrimaryText,
        border: 'none',
        borderRadius: '10px',
      },
      secondary: {
        background: SURFACES.buttonSecondary,
        border: `1.5px solid ${SURFACES.buttonSecondaryBorder}`,
        color: TEXT.onDark,
        borderRadius: '10px',
      },
    },
    alert: {
      default: {
        background: SURFACES.alertBg,
        border: `1px solid ${SURFACES.alertBorder}`,
        color: SURFACES.alertText,
        borderRadius: '10px',
      },
    },
    input: {
      default: {
        background: SURFACES.formFieldBg,
        border: `1.5px solid ${SURFACES.formFieldBorder}`,
        color: TEXT.onDark,
        borderRadius: '10px',
      },
    },
  };
  
  return styles[component]?.[variant] || styles[component]?.default;
};