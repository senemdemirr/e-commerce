// Keep route fixtures small: add only records that are required by test assertions.
const FALLBACK_COLORS = [
    {
        id: 1,
        name: 'Midnight Black',
        hex: '#111827',
        created_at: '2026-03-04T09:00:00.000Z',
        product_count: 1,
        variant_count: 1,
    },
    {
        id: 2,
        name: 'Cloud White',
        hex: '#F9FAFB',
        created_at: '2026-03-01T09:00:00.000Z',
        product_count: 0,
        variant_count: 0,
    },
];

const FALLBACK_SIZES = [
    {
        id: 1,
        name: 'S',
        created_at: '2026-03-04T09:00:00.000Z',
        product_count: 1,
        variant_count: 1,
    },
    {
        id: 3,
        name: 'XL',
        created_at: '2026-03-01T09:00:00.000Z',
        product_count: 0,
        variant_count: 0,
    },
];

const FALLBACK_CATEGORIES = [
    {
        id: 1,
        name: 'Eski İsim',
        slug: 'eski-slug',
        activate: 1,
        created_at: '2026-01-01T00:00:00.000Z',
        product_count: 0,
        subcategory_count: 1,
        subcategories: [
            {
                id: 1,
                category_id: 1,
                name: 'Eski Alt Kategori',
                slug: 'eski-alt-slug',
                created_at: '2026-01-01T00:00:00.000Z',
                product_count: 0,
            },
        ],
    },
    {
        id: 2,
        name: 'Elektronik',
        slug: 'elektronik',
        activate: 0,
        created_at: '2026-01-02T00:00:00.000Z',
        product_count: 0,
        subcategory_count: 0,
        subcategories: [],
    },
];

const FALLBACK_PARENT_CATEGORIES = [
    { id: 1, name: 'Moda', slug: 'moda' },
    { id: 2, name: 'Elektronik', slug: 'elektronik' },
];

const FALLBACK_SUBCATEGORIES = [
    {
        id: 1,
        category_id: 1,
        name: 'Eski İsim',
        slug: 'eski-slug',
        activate: 1,
        created_at: '2026-01-01T00:00:00.000Z',
        product_count: 0,
    },
];

const FALLBACK_PRODUCT_CATEGORIES = [
    { id: 1, name: 'Moda', slug: 'moda' },
];

const FALLBACK_PRODUCT_SUBCATEGORIES = [
    { id: 1, category_id: 1, name: 'Sweatshirt', slug: 'sweatshirt' },
];

const FALLBACK_PRODUCTS = [
    {
        id: 1,
        sub_category_id: 1,
        title: 'Fixture Hoodie',
        description: 'Minimal product fixture for admin route tests.',
        sku: 'FIXTURE-HOODIE-01',
        price: 100,
        image: 'data:image/png;base64,AA==',
        brand: 'Fixture Brand',
        colors_id: [1],
        sizes_id: [1],
        colors: [{ id: 1, name: 'Midnight Black', hex: '#111827' }],
        sizes: ['S'],
        details: {
            material: ['Cotton'],
            care: ['Wash cold'],
            bullet_point: ['Minimal fixture'],
            description_long: ['Only the fields required by route tests are included.'],
        },
        variants: [
            {
                id: 101,
                product_id: 1,
                sku: 'FIXTURE-HOODIE-01-BLACK-S',
                price: 100,
                stock: 1,
                is_default: true,
                color_name: 'Midnight Black',
                color_hex: '#111827',
                size_label: 'S',
            },
        ],
        created_at: '2026-03-01T10:00:00.000Z',
    },
];

const FALLBACK_USERS = [
    {
        id: 1,
        auth0_sub: 'auth0|customer-1',
        email: 'user@example.com',
        password: 'password123',
        name: 'Test',
        surname: 'Customer',
        phone: '+90 555 000 00 01',
        role: 'customer',
        activate: 1,
        email_verified: true,
        created_at: '2026-04-03T10:00:00.000Z',
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
];

const FALLBACK_ORDERS = [
    {
        id: 101,
        user_id: 1,
        order_number: 'ORD-1001',
        shipping_full_name: 'Test Customer',
        total_amount: 100,
        status: 'Delivered',
        created_at: '2026-04-09T11:45:00.000Z',
    },
];

let fallbackSettings = {
    shipping_fee: 49.9,
    free_shipping_threshold: 1000,
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

export function listFallbackColorRecords() {
    return clone(FALLBACK_COLORS);
}

export function listFallbackSizeRecords() {
    return clone(FALLBACK_SIZES);
}

export function listFallbackCategoryRecords() {
    return clone(FALLBACK_CATEGORIES);
}

export function listFallbackParentCategoryRecords() {
    return clone(FALLBACK_PARENT_CATEGORIES);
}

export function listFallbackSubcategoryRecords() {
    return clone(FALLBACK_SUBCATEGORIES);
}

export function listFallbackProductCategoryRecords() {
    return clone(FALLBACK_PRODUCT_CATEGORIES);
}

export function listFallbackProductSubcategoryRecords() {
    return clone(FALLBACK_PRODUCT_SUBCATEGORIES);
}

export function listFallbackProductRecords() {
    return clone(FALLBACK_PRODUCTS);
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
