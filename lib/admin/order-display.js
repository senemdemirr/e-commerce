import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';

const ORDER_STATUS_VARIANTS = {
    order_received: {
        aliases: ['order_received', 'order received'],
        badge: '!bg-accent/15 !text-accent !border-accent/20',
        panel: 'bg-accent/10 border-accent/20 text-accent',
        icon: ScheduleRoundedIcon,
        iconClassName: '!text-accent',
    },
    preparing: {
        aliases: ['preparing'],
        badge: '!bg-accent/10 !text-accent !border-accent/20',
        panel: 'bg-accent/10 border-accent/20 text-accent',
        icon: Inventory2OutlinedIcon,
        iconClassName: '!text-accent',
    },
    shipped: {
        aliases: ['shipped'],
        badge: '!bg-blue-400/15 !text-blue-400 !border-blue-400/20',
        panel: 'bg-blue-400/10 border-blue-400/20 text-blue-400',
        icon: LocalShippingOutlinedIcon,
        iconClassName: '!text-blue-400',
    },
    delivered: {
        aliases: ['delivered'],
        badge: '!bg-primary/15 !text-primary !border-primary/20',
        panel: 'bg-primary/10 border-primary/20 text-primary',
        icon: CheckCircleOutlineRoundedIcon,
        iconClassName: '!text-primary',
    },
    cancelled: {
        aliases: ['cancelled', 'canceled'],
        badge: '!bg-red-400/15 !text-red-400 !border-red-400/20',
        panel: 'bg-red-400/10 border-red-400/20 text-red-400',
        icon: CancelOutlinedIcon,
        iconClassName: '!text-red-400',
    },
};

export function normalizeStatusTitle(value) {
    return String(value || '')
        .trim()
        .toLocaleLowerCase('tr-TR')
        .replace(/\s+/g, '_');
}

export function getOrderStatusKey(value) {
    const normalized = normalizeStatusTitle(value);

    return Object.entries(ORDER_STATUS_VARIANTS).find(([, config]) => {
        return config.aliases.some((alias) => normalizeStatusTitle(alias) === normalized);
    })?.[0] || null;
}

export function isCancelledStatus(value) {
    return getOrderStatusKey(value) === 'cancelled';
}

export function isDeliveredStatus(value) {
    return getOrderStatusKey(value) === 'delivered';
}

export function getStatusClasses(title) {
    const statusKey = getOrderStatusKey(title);

    if (statusKey && ORDER_STATUS_VARIANTS[statusKey]) {
        return ORDER_STATUS_VARIANTS[statusKey];
    }

    return {
        badge: '!bg-accent/10 !text-accent !border-accent/20',
        panel: 'bg-accent/10 border-accent/20 text-accent',
        icon: ScheduleRoundedIcon,
        iconClassName: '!text-accent',
    };
}

export function formatCurrency(amount) {
    return Number(amount || 0).toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
    });
}

export function formatTableDate(dateString) {
    return new Date(dateString).toLocaleString('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatDashboardDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function formatDashboardCurrency(amount) {
    return `$${amount ?? 0}`;
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

export function getInitials(name, fallback = 'Müşteri') {
    const words = String(name || fallback)
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

    return words.map((word) => word[0]).join('').toUpperCase();
}

export function getCustomerName(order, fallback = 'Misafir Müşteri') {
    return order?.shipping_full_name || order?.customer_name || fallback;
}

export function getOrderStatusLabel(order, fallback = '-') {
    return formatText(order?.status_title || order?.status, fallback);
}
