import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './components/layout/ThemeProvider';

const appName = import.meta.env.VITE_APP_NAME || 'Hospital Bed Manager';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <ThemeProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            borderRadius: '12px',
                            border: '1px solid var(--border-soft)',
                            background: 'var(--card)',
                            color: 'var(--text-strong)',
                        },
                    }}
                />
                <App {...props} />
            </ThemeProvider>,
        );
    },
    progress: {
        color: '#6fa7f5',
    },
});
