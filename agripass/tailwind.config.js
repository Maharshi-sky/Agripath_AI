const v = (n) => `rgb(var(--c-${n}) / <alpha-value>)`;
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: v('paper'), surface: v('surface'), surface2: v('surface2'), ink: v('ink'), muted: v('muted'), line: v('line'),
        brand: v('brand'), brandink: v('brandink'), brandsoft: v('brandsoft'),
        auto: v('auto'), autobg: v('autobg'), manual: v('manual'), manualbg: v('manualbg'),
        danger: v('danger'), dangerbg: v('dangerbg'), info: v('info'), infobg: v('infobg'),
      },
      fontFamily: {
        sans: ['Archivo', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
        display: ['Archivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        serif: ['"Source Serif 4"', 'Georgia', 'Cambria', 'serif'],
      },
      keyframes: {
        flash: { '0%': { boxShadow: '0 0 0 0 rgb(var(--c-auto) / 0.55)' }, '100%': { boxShadow: '0 0 0 10px rgb(var(--c-auto) / 0)' } },
        rise: { '0%': { transform: 'translateY(6px)', opacity: '0.4' }, '100%': { transform: 'none', opacity: '1' } },
        fill: { '0%': { backgroundColor: 'rgb(var(--c-autobg))' }, '100%': { backgroundColor: 'transparent' } },
      },
      animation: { flash: 'flash 1.1s ease-out 2', rise: 'rise .25s ease-out', fill: 'fill 1.6s ease-out' },
    },
  },
  plugins: [],
};
