'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import { useSnackbar } from 'notistack';

const STORAGE_KEY = 'admin-general-settings';

const DEFAULT_SETTINGS = {
    siteTitle: 'Iron E-Commerce',
    contactEmail: 'admin@ironecommerce.com',
    currency: 'USD',
    timezone: 'UTC',
};

const CURRENCY_OPTIONS = [
    { value: 'USD', label: 'USD - United States Dollar ($)' },
    { value: 'EUR', label: 'EUR - Euro (€)' },
    { value: 'GBP', label: 'GBP - British Pound Sterling (£)' },
    { value: 'JPY', label: 'JPY - Japanese Yen (¥)' },
];

const TIMEZONE_OPTIONS = [
    { value: 'UTC', label: 'UTC (Universal Coordinated Time)' },
    { value: 'PST', label: 'PST (Pacific Standard Time)' },
    { value: 'EST', label: 'EST (Eastern Standard Time)' },
];

function joinClasses(...classNames) {
    return classNames.filter(Boolean).join(' ');
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Logo could not be read.'));
        reader.readAsDataURL(file);
    });
}

export default function SettingsPage() {
    const { enqueueSnackbar } = useSnackbar();
    const fileInputRef = useRef(null);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [savedSettings, setSavedSettings] = useState(DEFAULT_SETTINGS);
    const [logoPreview, setLogoPreview] = useState('');
    const [savedLogoPreview, setSavedLogoPreview] = useState('');
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        try {
            const rawValue = window.localStorage.getItem(STORAGE_KEY);

            if (!rawValue) {
                return;
            }

            const parsedValue = JSON.parse(rawValue);
            const nextSettings = parsedValue?.settings && typeof parsedValue.settings === 'object'
                ? { ...DEFAULT_SETTINGS, ...parsedValue.settings }
                : DEFAULT_SETTINGS;
            const nextLogoPreview = typeof parsedValue?.logoPreview === 'string' ? parsedValue.logoPreview : '';

            setSettings(nextSettings);
            setSavedSettings(nextSettings);
            setLogoPreview(nextLogoPreview);
            setSavedLogoPreview(nextLogoPreview);
        } catch {
            window.localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings)
        || logoPreview !== savedLogoPreview;

    function updateField(key) {
        return (event) => {
            setSettings((current) => ({
                ...current,
                [key]: event.target.value,
            }));
        };
    }

    function resetFileInput() {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    async function applyLogoFile(file) {
        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            enqueueSnackbar('Please choose a valid image file.', { variant: 'error' });
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            enqueueSnackbar('Logo must be smaller than 10MB.', { variant: 'error' });
            return;
        }

        try {
            const preview = await readFileAsDataUrl(file);
            setLogoPreview(preview);
            enqueueSnackbar('Logo added to draft.', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(error.message || 'Logo could not be loaded.', { variant: 'error' });
        }
    }

    async function handleFileChange(event) {
        const [file] = Array.from(event.target.files || []);
        await applyLogoFile(file);
    }

    async function handleDrop(event) {
        event.preventDefault();
        setDragActive(false);

        const [file] = Array.from(event.dataTransfer.files || []);
        await applyLogoFile(file);
    }

    function handleDiscard() {
        setSettings({ ...savedSettings });
        setLogoPreview(savedLogoPreview);
        setDragActive(false);
        resetFileInput();
        enqueueSnackbar('Changes discarded.', { variant: 'info' });
    }

    function handleSave() {
        if (!hasUnsavedChanges) {
            enqueueSnackbar('No changes to save.', { variant: 'info' });
            return;
        }

        try {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    settings,
                    logoPreview,
                    updatedAt: new Date().toISOString(),
                })
            );
        } catch {
            enqueueSnackbar('Settings updated, but browser storage is unavailable.', { variant: 'warning' });
        }

        setSavedSettings({ ...settings });
        setSavedLogoPreview(logoPreview);
        enqueueSnackbar('General settings saved.', { variant: 'success' });
    }

    function handleReadDocumentation() {
        enqueueSnackbar('Connect this button to your documentation route.', { variant: 'info' });
    }

    return (
        <div className="-m-4 sm:-m-6 lg:-m-8">
            <section className="flex-1 overflow-y-auto bg-background-light px-4 py-6 dark:bg-background-dark sm:px-6 md:py-10 lg:px-8">
                <div className="w-full">
                    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                                General Settings
                            </h1>
                            <p className="mt-1 text-slate-500 dark:text-slate-400">
                                Configure your basic store identity and global preferences.
                            </p>
                        </div>
                    </div>

                    <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-zinc-900">
                        <div className="flex items-center gap-3 border-b border-slate-100 p-6 dark:border-slate-800">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                                <StorefrontRoundedIcon className="!text-[20px]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                                    Store Identity
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Visual branding and core info
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Site Title
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.siteTitle}
                                        onChange={updateField('siteTitle')}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-all focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-zinc-800 dark:text-slate-100"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        value={settings.contactEmail}
                                        onChange={updateField('contactEmail')}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-all focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-zinc-800 dark:text-slate-100"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Store Logo
                                </label>
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDrop={handleDrop}
                                    onDragOver={(event) => {
                                        event.preventDefault();
                                        setDragActive(true);
                                    }}
                                    onDragEnter={(event) => {
                                        event.preventDefault();
                                        setDragActive(true);
                                    }}
                                    onDragLeave={(event) => {
                                        event.preventDefault();
                                        setDragActive(false);
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            fileInputRef.current?.click();
                                        }
                                    }}
                                    className={joinClasses(
                                        'group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors',
                                        dragActive
                                            ? 'border-primary bg-slate-100 dark:bg-zinc-800'
                                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-zinc-800/50 dark:hover:bg-zinc-800'
                                    )}
                                >
                                    <div className="mb-4 flex size-16 items-center justify-center overflow-hidden rounded-full bg-accent-champagne/20 text-accent-champagne transition-transform group-hover:scale-110">
                                        {logoPreview ? (
                                            <div className="relative h-full w-full">
                                                <Image
                                                    src={logoPreview}
                                                    alt="Store logo preview"
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <UploadFileRoundedIcon className="!text-3xl" />
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        PNG, JPG up to 10MB (250x100px recommended)
                                    </p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    hidden
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex justify-end gap-3">
                        <button
                            type="button"
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-zinc-800 dark:text-slate-100 dark:hover:bg-zinc-700"
                            onClick={handleDiscard}
                        >
                            Discard
                        </button>
                        <button
                            type="button"
                            className="rounded-xl bg-primary px-8 py-3 text-base font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90"
                            onClick={handleSave}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
