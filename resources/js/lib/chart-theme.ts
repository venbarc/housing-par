export function getCSSVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function getBedStatusColors() {
    return {
        available: getCSSVar('--status-available-fg'),
        occupied: getCSSVar('--status-occupied-fg'),
        cleaning: getCSSVar('--status-cleaning-fg'),
        maintenance: getCSSVar('--status-maintenance-fg'),
    };
}

export function getChartTextColor(): string {
    return getCSSVar('--text-muted');
}

export function getChartGridColor(): string {
    return getCSSVar('--border-soft');
}

export function getCardBg(): string {
    return getCSSVar('--card');
}
