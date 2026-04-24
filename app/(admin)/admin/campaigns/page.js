'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import CampaignForm from '@/components/admin/campaigns/CampaignForm';
import CampaignsHeader from '@/components/admin/campaigns/CampaignsHeader';
import CampaignsStatsCards from '@/components/admin/campaigns/CampaignsStatsCards';
import CampaignsTable from '@/components/admin/campaigns/CampaignsTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import ReadOnlyNotice from '@/components/admin/ReadOnlyNotice';
import { useAdminSession } from '@/context/AdminSessionContext';
import { normalizeCampaignRecord } from '@/lib/admin/campaigns';

const PAGE_SIZE = 8;

function buildPageNumbers(page, totalPages) {
    if (totalPages <= 3) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(page - 1, totalPages - 2));
    return [start, start + 1, start + 2];
}

function campaignMatchesSearch(campaign, search) {
    if (!search) {
        return true;
    }

    const normalizedSearch = search.toLocaleLowerCase('tr-TR');
    return [
        campaign.title,
        campaign.code,
        campaign.description,
        campaign.status,
    ].filter(Boolean).some((value) => (
        String(value).toLocaleLowerCase('tr-TR').includes(normalizedSearch)
    ));
}

export default function CampaignsPage() {
    const { enqueueSnackbar } = useSnackbar();
    const { canMutate, loading: adminLoading } = useAdminSession();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        let active = true;

        async function fetchCampaigns() {
            try {
                setLoading(true);

                const response = await fetch('/api/admin/campaigns', {
                    headers: { role: 'admin' },
                });
                const data = await response.json().catch(() => []);

                if (!response.ok) {
                    throw new Error(data?.error || 'Campaigns could not be loaded');
                }

                if (!active) {
                    return;
                }

                setCampaigns(Array.isArray(data) ? data.map((campaign) => normalizeCampaignRecord(campaign)) : []);
            } catch (error) {
                if (active) {
                    enqueueSnackbar(error.message || 'Campaigns could not be loaded', { variant: 'error' });
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        fetchCampaigns();

        return () => {
            active = false;
        };
    }, [enqueueSnackbar]);

    const filteredCampaigns = useMemo(() => (
        campaigns.filter((campaign) => {
            const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
            return matchesStatus && campaignMatchesSearch(campaign, search);
        })
    ), [campaigns, search, statusFilter]);

    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter((campaign) => campaign.status === 'active').length;
    const scheduledCampaigns = campaigns.filter((campaign) => campaign.status === 'scheduled').length;
    const inactiveCampaigns = campaigns.filter((campaign) => (
        campaign.status === 'inactive' || campaign.status === 'expired'
    )).length;
    const totalFilteredCampaigns = filteredCampaigns.length;
    const totalPages = Math.max(1, Math.ceil(totalFilteredCampaigns / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;
    const visibleCampaigns = filteredCampaigns.slice(startIndex, startIndex + PAGE_SIZE);
    const pageNumbers = buildPageNumbers(safePage, totalPages);

    useEffect(() => {
        if (page !== safePage) {
            setPage(safePage);
        }
    }, [page, safePage]);

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter]);

    const openCreateModal = () => {
        if (!canMutate) {
            enqueueSnackbar('Only superadmin can create campaigns.', { variant: 'warning' });
            return;
        }

        setFormMode('create');
        setSelectedCampaign(null);
        setFormOpen(true);
    };

    const openEditModal = (campaign) => {
        if (!canMutate) {
            enqueueSnackbar('Only superadmin can edit campaigns.', { variant: 'warning' });
            return;
        }

        setFormMode('edit');
        setSelectedCampaign(campaign);
        setFormOpen(true);
    };

    const openDeleteDialog = (campaign) => {
        if (!canMutate) {
            enqueueSnackbar('Only superadmin can delete campaigns.', { variant: 'warning' });
            return;
        }

        if (campaign?.is_used) {
            enqueueSnackbar(
                `This campaign has ${Number(campaign.used_count || 0)} redemptions and cannot be deleted.`,
                { variant: 'warning' }
            );
            return;
        }

        setDeleteTarget(campaign);
    };

    const closeFormModal = () => {
        if (submitting) {
            return;
        }

        setFormOpen(false);
        setSelectedCampaign(null);
    };

    const closeDeleteDialog = () => {
        if (deleteLoading) {
            return;
        }

        setDeleteTarget(null);
    };

    const handleSubmitCampaign = async (payload) => {
        if (!canMutate) {
            enqueueSnackbar('Only superadmin can save campaign changes.', { variant: 'warning' });
            return;
        }

        const isEditMode = formMode === 'edit' && selectedCampaign?.id;
        const endpoint = isEditMode
            ? `/api/admin/campaigns/${selectedCampaign.id}`
            : '/api/admin/campaigns';

        try {
            setSubmitting(true);

            const response = await fetch(endpoint, {
                method: isEditMode ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    role: 'admin',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.error || 'Campaign could not be saved');
            }

            const normalizedCampaign = normalizeCampaignRecord(data);

            if (isEditMode) {
                setCampaigns((current) => current.map((campaign) => (
                    campaign.id === selectedCampaign.id ? normalizedCampaign : campaign
                )));
                enqueueSnackbar('Campaign updated', { variant: 'success' });
            } else {
                setCampaigns((current) => [normalizedCampaign, ...current]);
                enqueueSnackbar('Campaign created', { variant: 'success' });
            }

            setFormOpen(false);
            setSelectedCampaign(null);
        } catch (error) {
            enqueueSnackbar(error.message || 'Campaign could not be saved', { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCampaign = async () => {
        if (!deleteTarget?.id) {
            return;
        }

        try {
            setDeleteLoading(true);

            const response = await fetch(`/api/admin/campaigns/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: { role: 'admin' },
            });
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.error || 'Campaign could not be deleted');
            }

            setCampaigns((current) => current.filter((campaign) => campaign.id !== deleteTarget.id));
            enqueueSnackbar('Campaign deleted', { variant: 'success' });
            setDeleteTarget(null);
        } catch (error) {
            enqueueSnackbar(error.message || 'Campaign could not be deleted', { variant: 'error' });
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <>
            <div className="-m-4 flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden sm:-m-6 lg:-m-8">
                <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 dark:bg-background-dark/50 sm:p-6 lg:p-8">
                    <div className="w-full">
                        {!adminLoading && !canMutate ? (
                            <ReadOnlyNotice className="mb-6" description="This account can review campaign data but campaign creation, editing, and deletion are limited to superadmin." />
                        ) : null}

                        <CampaignsHeader onCreate={openCreateModal} canMutate={canMutate} />

                        <CampaignsStatsCards
                            totalCampaigns={totalCampaigns}
                            activeCampaigns={activeCampaigns}
                            scheduledCampaigns={scheduledCampaigns}
                            inactiveCampaigns={inactiveCampaigns}
                        />

                        <div className="mb-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search campaigns by title, code, or status"
                                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                            />
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                            >
                                <option value="all">All statuses</option>
                                <option value="active">Active</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="inactive">Inactive</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>

                        <CampaignsTable
                            loading={loading}
                            visibleCampaigns={visibleCampaigns}
                            totalCampaigns={totalFilteredCampaigns}
                            startIndex={startIndex}
                            pageSize={PAGE_SIZE}
                            pageNumbers={pageNumbers}
                            safePage={safePage}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            onEdit={openEditModal}
                            onDelete={openDeleteDialog}
                            canMutate={canMutate}
                        />
                    </div>
                </div>
            </div>

            <CampaignForm
                open={formOpen}
                mode={formMode}
                initialValues={selectedCampaign}
                submitting={submitting}
                onClose={closeFormModal}
                onSubmit={handleSubmitCampaign}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete campaign?"
                description={deleteTarget
                    ? `The campaign "${deleteTarget.title}" will be removed from the campaigns table. This action cannot be undone.`
                    : 'This action cannot be undone.'}
                confirmText="Delete"
                loading={deleteLoading}
                onClose={closeDeleteDialog}
                onConfirm={handleDeleteCampaign}
            />
        </>
    );
}
