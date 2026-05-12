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
  appBg: '#060d08',
  
  // Card and container surfaces
  darkCard: '#0c1610',
  darkCardBorder: 'rgba(74, 222, 128, 0.25)',
  
  lightCard: '#ffffff',
  lightCardBorder: '#f5e6c8',
  
  // Elevated surfaces
  darkCardElevated: '#132d1f',
  darkCardElevatedBorder: 'rgba(74, 222, 128, 0.4)',
  
  // Modal and overlay
  modalBg: '#060d08',
  modalBgLight: '#ffffff',
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
  
  // Dashboard specific
  dashboardBg: '#060d08',
  dashboardCard: '#0c1610',
  
  // Form and input
  formFieldBg: '#0a0f0c',
  formFieldBorder: 'rgba(74, 222, 128, 0.2)',
  formFieldBorderFocus: '#48d17a',
  
  // Button surfaces
  buttonPrimary: '#48d17a',
  buttonPrimaryText: '#060d08',
  buttonSecondary: 'transparent',
  buttonSecondaryBorder: 'rgba(74, 222, 128, 0.4)',
  
  // Alert and danger
  alertBg: 'rgba(192, 57, 43, 0.12)',
  alertBorder: 'rgba(192, 57, 43, 0.3)',
  alertText: '#FF6B5A',
  
  // Success
  successBg: 'rgba(74, 222, 128, 0.12)',
  successBorder: 'rgba(74, 222, 128, 0.3)',
  
  // Tab surfaces
  tabInactive: 'transparent',
  tabActive: 'transparent',
  tabActiveBorder: '#48d17a',
  
  // SOS/Emergency cards
  sosBg: '#0a3d20',
  sosBorder: '#48d17a',
  
  // Gold accent
  goldBg: 'rgba(201, 151, 58, 0.15)',
  goldBorder: 'rgba(201, 151, 58, 0.4)',
};

export const TEXT = {
  // Primary text on dark surfaces
  onDark: '#f5e6c8',
  onDarkSecondary: '#bfaf8a',
  onDarkMuted: '#999999',
  
  // Text on light surfaces
  onLight: '#060d08',
  onLightSecondary: '#666666',
  onLightMuted: '#999999',
  
  // Semantic text colors
  accent: '#48d17a',
  accentSecondary: '#c9973a',
  danger: '#FF6B5A',
  success: '#48d17a',
  warning: '#f59e0b',
  
  // Heading
  headingDark: '#f5e6c8',
  headingLight: '#060d08',
  
  // Muted variants
  mutedDark: '#bfaf8a',
  mutedLight: '#999999',
  
  // Special
  placeholder: '#888070',
  disabled: '#666666',
};

export const BORDERS = {
  light: 'rgba(245, 230, 200, 0.45)',
  medium: 'rgba(74, 222, 128, 0.25)',
  strong: 'rgba(74, 222, 128, 0.4)',
};

export const SHADOWS = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
  md: '0 4px 16px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
  glow: '0 0 20px rgba(74, 222, 128, 0.08), 0 0 1px rgba(74, 222, 128, 0.2)',
};

/**
 * Component-specific surface utilities
 * Use these to ensure consistency across the app
 */
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