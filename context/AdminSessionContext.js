'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch/fetch';

const AdminSessionContext = createContext({
    admin: null,
    loading: true,
    role: '',
    isSuperAdmin: false,
    canMutate: false,
    refreshAdmin: async () => {},
});

function normalizeRole(role) {
    return typeof role === 'string' ? role.trim().toLowerCase() : '';
}

export function AdminSessionProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    async function refreshAdmin() {
        try {
            setLoading(true);

            const data = await apiFetch('/api/admin/me');
            setAdmin(data);
        } catch {
            setAdmin(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refreshAdmin();
    }, []);

    const role = normalizeRole(admin?.role);

    return (
        <AdminSessionContext.Provider
            value={{
                admin,
                loading,
                role,
                isSuperAdmin: role === 'superadmin',
                canMutate: role === 'superadmin',
                refreshAdmin,
            }}
        >
            {children}
        </AdminSessionContext.Provider>
    );
}

export function useAdminSession() {
    return useContext(AdminSessionContext);
}
