// js/config.js
tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace']
            },
            colors: {
                brand: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    900: '#14532d',
                },
                dark: {
                    bg: '#090d16',
                    card: '#111827',
                    border: '#1f2937',
                    hover: '#1e293b'
                },
                accent: {
                    cyan: '#06b6d4',
                    purple: '#a855f7',
                    amber: '#f59e0b',
                    rose: '#f43f5e',
                    pink: '#ec4899',
                    emerald: '#10b981'
                }
            }
        }
    }
};
