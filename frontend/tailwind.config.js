/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        graphite: {
          DEFAULT: '#151718',
          soft: '#1D2021',
          line: '#2D3132',
        },
        mist: {
          DEFAULT: '#E7EBEC',
          dim: '#9AA5A8',
        },
        teal: {
          DEFAULT: '#3FBFAD',
          bright: '#5FD8C6',
          dim: '#276F64',
        },
        signal: {
          go: '#4FBE87',
          hold: '#E0A94A',
          stop: '#DB6558',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.2em',
      },
      boxShadow: {
        console: '0 0 0 1px rgba(63,191,173,0.2), 0 10px 28px -10px rgba(0,0,0,0.7)',
      },
    },
  },
  plugins: [],
}
