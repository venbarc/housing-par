import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';
type ThemeContextType = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };

const ThemeContext = createContext<ThemeContextType>({ theme: 'light', setTheme: () => {}, toggle: () => {} });
const STORAGE_KEY = 'hb-theme';

const getSystemTheme = (): Theme =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'light';
        const saved = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
        return saved ?? getSystemTheme();
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(STORAGE_KEY, theme);
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => setTheme((prev) => {
            const saved = window.localStorage.getItem(STORAGE_KEY);
            return saved ? prev : (mq.matches ? 'dark' : 'light');
        });
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const value = useMemo(() => ({
        theme,
        setTheme,
        toggle: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    return useContext(ThemeContext);
}
