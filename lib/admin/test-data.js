const FALLBACK_USERS = [
    {
        id: 1,
        auth0_sub: 'auth0|customer-1',
        email: 'customer@example.com',
        password: 'password123',
        name: 'Ayse',
        surname: 'Yilmaz',
        phone: '+90 555 111 22 33',
        role: 'customer',
        activate: 1,
        email_verified: true,
        created_at: '2026-04-03T10:00:00.000Z',
    },
    {
        id: 2,
        auth0_sub: 'auth0|customer-2',
        email: 'user@example.com',
        password: 'password123',
        name: 'Kerem',
        surname: 'Kaya',
        phone: '+90 555 444 55 66',
        role: 'customer',
        activate: 1,
        email_verified: false,
        created_at: '2026-03-12T09:30:00.000Z',
    },
    {
        id: 3,
        auth0_sub: 'auth0|customer-3',
        email: 'prospect@example.com',
        password: 'password123',
        name: 'Deniz',
        surname: 'Arslan',
        phone: '+90 555 777 88 99',
        role: 'customer',
        activate: 0,
        email_verified: true,
        created_at: '2026-04-08T14:15:00.000Z',
    },
    {
        id: 10,
        auth0_sub: 'auth0|admin-1',
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin',
        surname: 'User',
        phone: null,
        role: 'admin',
        activate: 1,
        email_verified: true,
        created_at: '2026-01-15T08:00:00.000Z',
    },
    {
        id: 11,
        auth0_sub: 'auth0|superadmin-1',
        email: 'superadmin@example.com',
        password: 'password123',
        name: 'Super',
        surname: 'Admin',
        phone: null,
        role: 'superadmin',
        activate: 1,
        email_verified: true,
        created_at: '2026-01-10T08:00:00.000Z',
    },
];

const FALLBACK_ORDERS = [
    {
        id: 101,
        user_id: 1,
        order_number: 'ORD-1001',
        shipping_full_name: 'Ayse Yilmaz',
        total_amount: 2450,
        status: 'Delivered',
        created_at: '2026-04-09T11:45:00.000Z',
    },
    {
        id: 102,
        user_id: 1,
        order_number: 'ORD-1002',
        shipping_full_name: 'Ayse Yilmaz',
        total_amount: 899.9,
        status: 'pending',
        created_at: '2026-04-08T15:20:00.000Z',
    },
    {
        id: 103,
        user_id: 2,
        order_number: 'ORD-1003',
        shipping_full_name: 'Kerem Kaya',
        total_amount: 1599.5,
        status: 'Shipped',
        created_at: '2026-03-20T09:00:00.000Z',
    },
];

let fallbackSettings = {
    shipping_fee: 49.9,
    free_shipping_threshold: 1000,
    site_title: 'Iron E-Commerce',
    contact_email: 'admin@ironecommerce.com',
};

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function sortByDateDesc(items = []) {
    return [...items].sort((left, right) => {
        const leftTime = Date.parse(left.created_at || 0);
        const rightTime = Date.parse(right.created_at || 0);

        if (rightTime !== leftTime) {
            return rightTime - leftTime;
        }

        return Number(right.id || 0) - Number(left.id || 0);
    });
}

function isCurrentMonth(dateValue) {
    const date = new Date(dateValue);
    const now = new Date();

    return date.getUTCFullYear() === now.getUTCFullYear()
        && date.getUTCMonth() === now.getUTCMonth();
}

export function isAdminTestMode() {
    return process.env.NODE_ENV === 'test';
}

export function listFallbackUsers() {
    return clone(FALLBACK_USERS);
}

export function findFallbackUserByEmail(email) {
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    return listFallbackUsers().find(
        (user) => String(user.email || '').toLowerCase() === normalizedEmail
    ) || null;
}

export function listFallbackOrders() {
    return sortByDateDesc(clone(FALLBACK_ORDERS)).map((order) => ({
        ...order,
        total_amount: Number(order.total_amount || 0),
    }));
}

export function listFallbackOrdersForCustomer(customerId) {
    const normalizedId = Number(customerId);

    return listFallbackOrders().filter((order) => Number(order.user_id) === normalizedId);
}

export function listFallbackCustomers() {
    const orders = listFallbackOrders();

    return sortByDateDesc(
        listFallbackUsers()
            .filter((user) => user.role === 'customer')
            .map((user) => {
                const customerOrders = orders.filter((order) => Number(order.user_id) === Number(user.id));

                return {
                    ...user,
                    activate: Number(user.activate ?? 1) === 1 ? 1 : 0,
                    order_count: customerOrders.length,
                    total_spent: customerOrders.reduce(
                        (sum, order) => sum + Number(order.total_amount || 0),
                        0
                    ),
                    last_order_date: customerOrders[0]?.created_at || null,
                };
            })
    );
}

export function findFallbackCustomerById(id) {
    const normalizedId = Number(id);

    return listFallbackCustomers().find(
        (customer) => Number(customer.id) === normalizedId
    ) || null;
}

export function updateFallbackCustomer(id, payload = {}) {
    const customer = findFallbackCustomerById(id);

    if (!customer) {
        return null;
    }

    return {
        ...customer,
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.surname !== undefined ? { surname: payload.surname } : {}),
        ...(payload.phone !== undefined ? { phone: payload.phone } : {}),
        ...(payload.activate !== undefined ? { activate: Number(payload.activate) === 1 ? 1 : 0 } : {}),
    };
}

export function getFallbackSettings() {
    return clone(fallbackSettings);
}

export function updateFallbackSettings(payload = {}) {
    fallbackSettings = {
        ...fallbackSettings,
        ...payload,
    };

    return getFallbackSettings();
}

export function getFallbackCustomerSummary() {
    const customers = listFallbackCustomers();

    return {
        total: customers.length,
        newThisMonth: customers.filter((customer) => isCurrentMonth(customer.created_at)).length,
        active: customers.filter((customer) => Number(customer.activate ?? 1) === 1).length,
        prospect: customers.filter((customer) => Number(customer.activate ?? 1) === 0).length,
        verified: customers.filter((customer) => customer.email_verified === true).length,
    };
}
