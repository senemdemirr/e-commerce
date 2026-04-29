'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { apiFetch } from '@/lib/apiFetch/fetch';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await apiFetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            enqueueSnackbar('Login successful, redirecting...', { variant: 'success' });
            router.push('/admin');
        } catch (error) {
            enqueueSnackbar(error.message || 'Server connection error', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background-light-admin dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-[480px]">
                {/* Login Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-primary/10">
                    {/* Header/Logo Area */}
                    <div className="p-8 pb-0 flex flex-col items-center text-center">
                        <div className="size-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                            <AdminPanelSettingsOutlinedIcon className="text-primary" sx={{ fontSize: 36 }} />
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Iron E-Commerce
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                            Enter your credentials to access the admin panel.
                        </p>
                    </div>
                    {/* Form Area */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            {/* Email Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                    Email Address
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 text-slate-400 flex items-center justify-center">
                                        <MailOutlineIcon />
                                    </div>
                                    <input
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-slate-900 dark:text-white"
                                        placeholder="admin@ironecommerce.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            {/* Password Input */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Password
                                    </label>
                                </div>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 text-slate-400 flex items-center justify-center">
                                        <LockOutlinedIcon />
                                    </div>
                                    <input
                                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-slate-900 dark:text-white"
                                        placeholder="••••••••"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center outline-none"
                                    >
                                        {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                                    </button>
                                </div>
                            </div>
                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group mt-2 disabled:opacity-75 disabled:cursor-not-allowed text-white"
                            >
                                <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                                {!isLoading && <LoginOutlinedIcon className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>
                    </div>
                    {/* Footer Decoration */}
                    <div className="h-2 w-full flex">
                        <div className="h-full flex-1 bg-primary"></div>
                        <div className="h-full flex-1 bg-secondary"></div>
                        <div className="h-full flex-1 bg-accent"></div>
                    </div>
                </div>
                {/* External Support Link */}
                <div className="mt-8 text-center flex flex-col gap-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                        © 2026 Iron E-Commerce Admin Panel. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
