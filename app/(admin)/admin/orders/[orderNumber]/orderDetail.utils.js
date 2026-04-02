import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';

export function normalizeStatusTitle(value) {
    return String(value || '')
        .trim()
        .toLocaleLowerCase('tr-TR')
        .replace(/\s+/g, '_');
}

export function getStatusClasses(title) {
    const normalized = normalizeStatusTitle(title);

    if (normalized.includes('iptal')) {
        return {
            badge: 'bg-accent/15 text-accent border-accent/20',
            panel: 'bg-accent/10 border-accent/20 text-accent',
            icon: CancelOutlinedIcon,
            iconClassName: '!text-accent',
        };
    }

    if (normalized.includes('teslim') || normalized.includes('tamam')) {
        return {
            badge: 'bg-primary/15 text-primary border-primary/20',
            panel: 'bg-primary/10 border-primary/20 text-primary',
            icon: CheckCircleOutlineRoundedIcon,
            iconClassName: '!text-primary',
        };
    }

    if (normalized.includes('kargo')) {
        return {
            badge: 'bg-text-dark/10 text-text-dark border-text-dark/10',
            panel: 'bg-text-dark/5 border-text-dark/10 text-text-dark',
            icon: LocalShippingOutlinedIcon,
            iconClassName: '!text-text-dark',
        };
    }

    if (normalized.includes('hazır') || normalized.includes('işlen') || normalized.includes('hazırlan')) {
        return {
            badge: 'bg-secondary/15 text-secondary border-secondary/20',
            panel: 'bg-secondary/10 border-secondary/20 text-secondary',
            icon: Inventory2OutlinedIcon,
            iconClassName: '!text-secondary',
        };
    }

    return {
        badge: 'bg-primary/10 text-primary border-primary/15',
        panel: 'bg-primary/10 border-primary/20 text-primary',
        icon: ScheduleRoundedIcon,
        iconClassName: '!text-primary',
    };
}

export function formatCurrency(amount) {
    return Number(amount || 0).toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
    });
}

export function formatDate(dateString) {
    return new Date(dateString).toLocaleString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatText(value, fallback = '-') {
    return value ? String(value) : fallback;
}

export function formatPaymentMethod(method) {
    const normalized = String(method || '').toLowerCase();

    if (normalized === 'credit_card') {
        return 'Kredi Kartı';
    }

    return formatText(method);
}

export function formatPaymentStatus(status) {
    const normalized = String(status || '').toLowerCase();

    if (normalized === 'completed') {
        return 'Tamamlandı';
    }

    if (normalized === 'pending') {
        return 'Beklemede';
    }

    if (normalized === 'failed') {
        return 'Başarısız';
    }

    return formatText(status);
}

export function getInitials(name) {
    const words = String(name || 'Müşteri')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

    return words.map((word) => word[0]).join('').toUpperCase();
}
