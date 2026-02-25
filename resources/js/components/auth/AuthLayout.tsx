import { ReactNode } from 'react';
import LogoMark from '../layout/LogoMark';

interface Props {
    title: string;
    subtitle: string;
    children: ReactNode;
    footer?: ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: Props) {
    return (
        <div className="min-h-screen px-4 py-10">
            <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="card flex flex-col justify-between p-7 sm:p-9">
                    <div className="space-y-3">
                        <LogoMark variant="full" />
                        <h1 className="text-3xl font-extrabold">{title}</h1>
                        <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>{subtitle}</p>
                    </div>
                    <div className="mt-8 rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-4">
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            Professional bed-capacity operations with secure access and live status updates.
                        </p>
                    </div>
                </section>

                <section className="card p-7 sm:p-9">
                    {children}
                    {footer && <div className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-600">{footer}</div>}
                </section>
            </div>
        </div>
    );
}
