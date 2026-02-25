export default function LogoMark({ variant = 'full', className = '' }: { variant?: 'full' | 'icon'; className?: string }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span
                className="grid h-9 w-9 place-items-center rounded-xl"
                style={{
                    background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                    color: '#fff',
                    fontWeight: 800,
                    letterSpacing: '-0.05em',
                    fontSize: '14px',
                }}
            >
                HB
            </span>
            {variant === 'full' && (
                <span className="leading-tight">
                    <p className="text-sm font-extrabold" style={{ color: 'var(--text-strong)' }}>
                        Bed Manager
                    </p>
                    <p className="text-[11px] font-semibold" style={{ color: 'var(--text-subtle)', letterSpacing: '0.08em' }}>
                        HOSPITAL OPS
                    </p>
                </span>
            )}
        </div>
    );
}
