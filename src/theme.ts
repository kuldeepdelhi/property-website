// Theme configuration based on mobile app theme.ts
export const colors = {
  // Blue palette from brand
  BLUE_B50: '#EAF2FE',
  BLUE_B100: '#CCDDFC',
  BLUE_B200: '#B3CCFB',
  BLUE_B300: '#99BBF9',
  BLUE_B400: '#6699F7',
  BLUE_B500: '#3377F4',
  BLUE_PRIMARY: '#0055F1',
  BLUE_B700: '#0044C1',
  BLUE_B800: '#003391',
  BLUE_B900: '#002260',
  BLUE_B1000: '#001A48',

  // UI color mappings
  PRIMARY_COLOR: '#0055F1',
  SECONDARY_COLOR: '#003391',
  ACCENT_COLOR: '#CCDDFC',
  INPUT_BORDER_COLOR: '#B3CCFB',
  INPUT_BG_COLOR: '#EAF2FE',
  TEXT_COLOR: '#001A48',
  SUCCESS_GREEN: '#1DB954',
  
  // Additional colors for web
  WHITE: '#FFFFFF',
  GRAY_50: '#F9FAFB',
  GRAY_100: '#F3F4F6',
  GRAY_200: '#E5E7EB',
  GRAY_300: '#D1D5DB',
  GRAY_400: '#9CA3AF',
  GRAY_500: '#6B7280',
  GRAY_600: '#4B5563',
  GRAY_700: '#374151',
  GRAY_800: '#1F2937',
  GRAY_900: '#111827',
  
  // Status colors
  ERROR_RED: '#EF4444',
  WARNING_ORANGE: '#F59E0B',
  INFO_BLUE: '#3B82F6',
  SUCCESS_GREEN_LIGHT: '#10B981',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

// Simplified animations - only spring drop effect
export const animations = {
  springDrop: {
    type: "spring" as const,
    stiffness: 100,
    damping: 15,
    mass: 1,
  },
};

// Simple spring drop variant
export const variants = {
  springDrop: {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -50, opacity: 0 },
  },
}; 