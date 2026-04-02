'use client';

import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';

import ConfirmDialog from '@/components/admin/ConfirmDialog';
import SubcategoryForm from '@/components/admin/SubcategoryForm';
import SubcategoriesHeader from '@/components/admin/subcategories/SubcategoriesHeader';
import SubcategoriesStatsCards from '@/components/admin/subcategories/SubcategoriesStatsCards';
import SubcategoriesTable from '@/components/admin/subcategories/SubcategoriesTable';

const PAGE_SIZE = 5;

function normalizeCategory(category) {
    return {
        id: Number(category?.id),
        name: category?.name || 'Untitled Category',
        slug: category?.slug || '',
        activate: Number(category?.activate ?? 1) === 1 ? 1 : 0,
    };
}

function normalizeSubcategory(subcategory) {
    return {
        id: Number(subcategory?.id),
        category_id: Number(subcategory?.category_id),
        name: subcategory?.name || 'Untitled Sub-Category',
        slug: subcategory?.slug || '',
        category_name: subcategory?.category_name || 'Unknown Category',
        category_slug: subcategory?.category_slug || '',
        product_count: Number(subcategory?.product_count || 0),
        created_at: subcategory?.created_at || null,
    };
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString('en-US');
}

function buildPageNumbers(page, totalPages) {
    if (totalPages <= 3) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(page - 1, totalPages - 2));
    return [start, start + 1, start + 2];
}

function getSubcategoryStatus(subcategory) {
    const hasProducts = Number(subcategory?.product_count || 0) > 0;

    if (hasProducts) {
        return {
            label: 'Active',
            chipClassName: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
            dotClassName: 'bg-green-500',
            filterValue: 'active',
            meta: `${formatNumber(subcategory.product_count)} products assigned`,
        };
    }

    return {
        label: 'Empty',
        chipClassName: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
        dotClassName: 'bg-slate-400',
        filterValue: 'empty',
        meta: 'No products assigned yet',
    };
}
export default function SubcategoriesPage() {
   const { enqueueSnackbar } = useSnackbar();
       const [categories, setCategories] = useState([]);
       const [subcategories, setSubcategories] = useState([]);
       const [loading, setLoading] = useState(true);
       const [page, setPage] = useState(1);
       const [filter, setFilter] = useState('all');
       const [formOpen, setFormOpen] = useState(false);
       const [formMode, setFormMode] = useState('create');
       const [selectedSubcategory, setSelectedSubcategory] = useState(null);
       const [submitting, setSubmitting] = useState(false);
       const [deleteTarget, setDeleteTarget] = useState(null);
       const [deleteLoading, setDeleteLoading] = useState(false);
   
       useEffect(() => {
           let active = true;
   
           const fetchPageData = async () => {
               try {
                   setLoading(true);
   
                   const [subcategoriesResponse, categoriesResponse] = await Promise.all([
                       fetch('/api/admin/subcategories', {
                           headers: { role: 'admin' },
                       }),
                       fetch('/api/admin/categories', {
                           headers: { role: 'admin' },
                       }),
                   ]);
   
                   const [subcategoriesData, categoriesData] = await Promise.all([
                       subcategoriesResponse.json().catch(() => []),
                       categoriesResponse.json().catch(() => []),
                   ]);
   
                   if (!subcategoriesResponse.ok) {
                       throw new Error(subcategoriesData?.error || 'Sub-categories could not be loaded');
                   }
   
                   if (!categoriesResponse.ok) {
                       throw new Error(categoriesData?.error || 'Categories could not be loaded');
                   }
   
                   if (!active) {
                       return;
                   }
   
                   setSubcategories(
                       Array.isArray(subcategoriesData)
                           ? subcategoriesData.map(normalizeSubcategory)
                           : []
                   );
                   setCategories(
                       Array.isArray(categoriesData)
                           ? categoriesData.map(normalizeCategory)
                           : []
                   );
               } catch (error) {
                   if (active) {
                       enqueueSnackbar(error.message || 'Sub-categories could not be loaded', {
                           variant: 'error',
                       });
                   }
               } finally {
                   if (active) {
                       setLoading(false);
                   }
               }
           };
   
           fetchPageData();
   
           return () => {
               active = false;
           };
       }, [enqueueSnackbar]);
   
       const totalSubcategories = subcategories.length;
       const activeSubcategories = subcategories.filter(
           (subcategory) => getSubcategoryStatus(subcategory).filterValue === 'active'
       ).length;
       const emptySubcategories = totalSubcategories - activeSubcategories;
       const totalProducts = subcategories.reduce(
           (sum, subcategory) => sum + Number(subcategory.product_count || 0),
           0
       );
   
       const filteredSubcategories = subcategories.filter((subcategory) => {
           const status = getSubcategoryStatus(subcategory);
           return filter === 'all' ? true : status.filterValue === filter;
       });
   
       const totalPages = Math.max(1, Math.ceil(filteredSubcategories.length / PAGE_SIZE));
       const safePage = Math.min(page, totalPages);
       const startIndex = (safePage - 1) * PAGE_SIZE;
       const visibleSubcategories = filteredSubcategories
           .slice(startIndex, startIndex + PAGE_SIZE)
           .map((subcategory) => ({
               ...subcategory,
               status: getSubcategoryStatus(subcategory),
           }));
       const pageNumbers = buildPageNumbers(safePage, totalPages);
   
       useEffect(() => {
           if (page !== safePage) {
               setPage(safePage);
           }
       }, [page, safePage]);
   
       useEffect(() => {
           setPage(1);
       }, [filter]);
   
       const openCreateModal = () => {
           if (categories.length === 0) {
               enqueueSnackbar('Create a category first before adding a sub-category', {
                   variant: 'warning',
               });
               return;
           }
   
           setFormMode('create');
           setSelectedSubcategory(null);
           setFormOpen(true);
       };
   
       const openEditModal = (subcategory) => {
           setFormMode('edit');
           setSelectedSubcategory(subcategory);
           setFormOpen(true);
       };
   
       const closeFormModal = () => {
           if (submitting) {
               return;
           }
   
           setFormOpen(false);
           setSelectedSubcategory(null);
       };
   
       const handleSubmitSubcategory = async (payload) => {
           const isEditMode = formMode === 'edit' && selectedSubcategory?.id;
           const endpoint = isEditMode
               ? `/api/admin/subcategories/${selectedSubcategory.id}`
               : '/api/admin/subcategories';
   
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
                   throw new Error(data?.error || 'Sub-category could not be saved');
               }
   
               const normalizedSubcategory = normalizeSubcategory(data);
   
               if (isEditMode) {
                   setSubcategories((current) => current.map((subcategory) => (
                       subcategory.id === selectedSubcategory.id
                           ? {
                               ...subcategory,
                               ...normalizedSubcategory,
                               product_count: subcategory.product_count,
                           }
                           : subcategory
                   )));
                   enqueueSnackbar('Sub-category updated', { variant: 'success' });
               } else {
                   setSubcategories((current) => [normalizedSubcategory, ...current]);
                   enqueueSnackbar('Sub-category created', { variant: 'success' });
               }
   
               setFormOpen(false);
               setSelectedSubcategory(null);
           } catch (error) {
               enqueueSnackbar(error.message || 'Sub-category could not be saved', {
                   variant: 'error',
               });
           } finally {
               setSubmitting(false);
           }
       };
   
       const handleDeleteSubcategory = async () => {
           if (!deleteTarget?.id) {
               return;
           }
   
           try {
               setDeleteLoading(true);
   
               const response = await fetch(`/api/admin/subcategories/${deleteTarget.id}`, {
                   method: 'DELETE',
                   headers: { role: 'admin' },
               });
               const data = await response.json().catch(() => null);
   
               if (!response.ok) {
                   throw new Error(data?.error || 'Sub-category could not be deleted');
               }
   
               setSubcategories((current) => current.filter(
                   (subcategory) => subcategory.id !== deleteTarget.id
               ));
               enqueueSnackbar('Sub-category deleted', { variant: 'success' });
               setDeleteTarget(null);
           } catch (error) {
               enqueueSnackbar(error.message || 'Sub-category could not be deleted', {
                   variant: 'error',
               });
           } finally {
               setDeleteLoading(false);
           }
       };
   
       const filters = [
           { value: 'all', label: 'All', count: totalSubcategories },
           { value: 'active', label: 'Active', count: activeSubcategories },
           { value: 'empty', label: 'Empty', count: emptySubcategories },
       ];
   
       return (
           <>
               <div className="-m-8 flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden">
                   <main className="flex-1 overflow-y-auto bg-background-light p-8 dark:bg-background-dark">
                       <div className="mx-auto max-w-7xl">
                           <SubcategoriesHeader
                               totalProducts={totalProducts}
                               categoriesCount={categories.length}
                               loading={loading}
                               hasCategories={categories.length > 0}
                               onCreate={openCreateModal}
                           />
   
                           <SubcategoriesStatsCards
                               totalSubcategories={totalSubcategories}
                               activeSubcategories={activeSubcategories}
                               emptySubcategories={emptySubcategories}
                           />
   
                           <SubcategoriesTable
                               loading={loading}
                               filters={filters}
                               activeFilter={filter}
                               onFilterChange={setFilter}
                               filteredCount={filteredSubcategories.length}
                               visibleSubcategories={visibleSubcategories}
                               startIndex={startIndex}
                               pageSize={PAGE_SIZE}
                               pageNumbers={pageNumbers}
                               safePage={safePage}
                               totalPages={totalPages}
                               onPageChange={setPage}
                               onEdit={openEditModal}
                               onDelete={setDeleteTarget}
                           />
                       </div>
                   </main>
               </div>
   
               <SubcategoryForm
                   open={formOpen}
                   mode={formMode}
                   categories={categories}
                   initialValues={selectedSubcategory}
                   submitting={submitting}
                   onClose={closeFormModal}
                   onSubmit={handleSubmitSubcategory}
               />
   
               <ConfirmDialog
                   open={Boolean(deleteTarget)}
                   title={deleteTarget ? `Delete ${deleteTarget.name}?` : 'Delete sub-category?'}
                   description={deleteTarget
                       ? 'This action will permanently remove the sub-category and unlink its product hierarchy.'
                       : 'This action cannot be undone.'}
                   confirmText="Delete"
                   loading={deleteLoading}
                   onClose={() => setDeleteTarget(null)}
                   onConfirm={handleDeleteSubcategory}
               />
           </>
       );
}
