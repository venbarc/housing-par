import { useMemo } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { useTheme } from '../layout/ThemeProvider';
import { getCSSVar } from '../../lib/chart-theme';

interface Props {
    occupied: number;
    total: number;
}

function getGaugeColor(pct: number): string {
    if (pct < 50) return getCSSVar('--status-available-fg');
    if (pct < 80) return getCSSVar('--status-cleaning-fg');
    return getCSSVar('--status-maintenance-fg');
}

export default function OccupancyGauge({ occupied, total }: Props) {
    const { theme } = useTheme();

    const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
    const fillColor = useMemo(() => getGaugeColor(pct), [pct, theme]);

    const data = [{ value: pct, fill: fillColor }];

    return (
        <div className="relative mx-auto" style={{ width: 80, height: 80 }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    startAngle={90}
                    endAngle={-270}
                    data={data}
                    barSize={8}
                >
                    <RadialBar
                        dataKey="value"
                        cornerRadius={4}
                        background={{ fill: 'var(--surface-strong)' }}
                    />
                </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-[var(--text-strong)]">{pct}%</span>
            </div>
        </div>
    );
}
