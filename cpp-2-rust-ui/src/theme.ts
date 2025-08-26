import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7C4DFF', contrastText: '#FFFFFF' }, // violet
    secondary: { main: '#64FFDA', contrastText: '#00332B' }, // aqua
    error: { main: '#FF5252' },
    warning: { main: '#FFB020' },
    info: { main: '#64B5F6' },
    success: { main: '#22C55E' },
    background: { default: '#0B0F14', paper: '#0F172A' },
    divider: 'rgba(148, 163, 184, 0.18)',
    text: { primary: '#E5E7EB', secondary: '#94A3B8' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily:
      'Roboto, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.02em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (t) => ({
        ':root': { colorScheme: 'dark' },
        body: {
          backgroundColor: t.palette.background.default,
          backgroundImage:
            'radial-gradient(1000px 400px at -10% -20%, rgba(124,77,255,0.12) 0%, rgba(10,10,10,0) 60%),\n             radial-gradient(800px 300px at 120% 10%, rgba(100,255,218,0.12) 0%, rgba(10,10,10,0) 60%)',
          overscrollBehaviorY: 'none',
        },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(148,163,184,0.35)',
          borderRadius: 8,
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
        },
        '*::-webkit-scrollbar-thumb:hover': { backgroundColor: 'rgba(148,163,184,0.5)' },
      }),
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'transparent' },
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(148,163,184,0.12)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
          border: '1px solid rgba(148,163,184,0.12)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#0F172A',
          backgroundImage:
            'linear-gradient(180deg, rgba(124,77,255,0.08), rgba(124,77,255,0) 35%),\n             linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02))',
          border: '1px solid rgba(124,77,255,0.18)',
          boxShadow:
            '0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: { borderRadius: 12, paddingInline: 16 },
        containedPrimary: {
          backgroundImage: 'linear-gradient(135deg, #7C4DFF 0%, #3D5BFF 100%)',
          boxShadow: '0 8px 20px rgba(60, 99, 255, 0.35)',
          ':hover': {
            filter: 'brightness(1.05)',
            boxShadow: '0 10px 24px rgba(60, 99, 255, 0.5)',
          },
        },
        containedSecondary: {
          backgroundImage: 'linear-gradient(135deg, #64FFDA 0%, #00E3A2 100%)',
          color: '#00332B',
          ':hover': { filter: 'brightness(1.05)' },
        },
        outlined: {
          borderColor: 'rgba(148,163,184,0.3)',
          ':hover': {
            borderColor: '#7C4DFF',
            backgroundColor: 'rgba(124,77,255,0.08)',
          },
        },
        textPrimary: {
          color: '#B5C0FF',
          ':hover': { backgroundColor: 'rgba(124,77,255,0.08)' },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(148,163,184,0.25)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(148,163,184,0.4)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#7C4DFF',
          },
        },
        input: { '::placeholder': { opacity: 0.7 } },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#0B1220',
          border: '1px solid rgba(148,163,184,0.2)',
          color: '#E5E7EB',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: '1px solid rgba(148,163,184,0.2)',
          backgroundColor: 'rgba(124,77,255,0.1)',
        },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: 'rgba(148,163,184,0.12)' } } },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #7C4DFF 0%, #3D5BFF 100%)',
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
