"use client";

import { Box, Tab, Tabs } from '@mui/material';
import DryCleaningIcon from '@mui/icons-material/DryCleaning';
import IronIcon from '@mui/icons-material/Iron';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import ProductRatingStars from './ProductRatingStars';

function ProductDetailsTab({ product, longDescription, bulletPoints, materialItems, careItems }) {
    return (
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Box className="text-[#6d7e73] dark:text-[#a0aead] space-y-4">
                <Box component="p">{longDescription || product.description}</Box>
                {bulletPoints.length > 0 && (
                    <Box component="ul" className="list-disc pl-5 space-y-2 mt-4">
                        {bulletPoints.map((point, index) => (
                            <Box component="li" key={`${point}-${index}`}>{point}</Box>
                        ))}
                    </Box>
                )}
            </Box>
            <Box className="bg-primary/5 dark:bg-primary/10 p-6 rounded-xl">
                <Box component="h4" className="font-bold text-lg mb-4 text-text-dark dark:text-white">Material & Care</Box>
                {(materialItems.length > 0 || careItems.length > 0) && (
                    <Box className="mb-6 space-y-4 text-sm text-[#6d7e73] dark:text-[#a0aead]">
                        {materialItems.length > 0 && (
                            <Box>
                                <Box component="p" className="font-semibold text-text-dark dark:text-white">Material</Box>
                                <Box component="p" className="mt-1">{materialItems.join(', ')}</Box>
                            </Box>
                        )}
                        {careItems.length > 0 && (
                            <Box>
                                <Box component="p" className="font-semibold text-text-dark dark:text-white">Care</Box>
                                <Box component="ul" className="mt-2 list-disc pl-5 space-y-1">
                                    {careItems.map((item, index) => (
                                        <Box component="li" key={`${item}-${index}`}>{item}</Box>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}
                <Box className="flex gap-6 mb-6">
                    <Box className="flex flex-col items-center gap-2 text-center w-20">
                        <Box className="w-12 h-12 rounded-full bg-white dark:bg-[#2a362f] flex items-center justify-center text-primary shadow-sm">
                            <LocalLaundryServiceIcon />
                        </Box>
                        <Box component="span" className="text-xs text-[#6d7e73]">30° Wash</Box>
                    </Box>
                    <Box className="flex flex-col items-center gap-2 text-center w-20">
                        <Box className="w-12 h-12 rounded-full bg-white dark:bg-[#2a362f] flex items-center justify-center text-primary shadow-sm">
                            <IronIcon />
                        </Box>
                        <Box component="span" className="text-xs text-[#6d7e73]">Low Heat</Box>
                    </Box>
                    <Box className="flex flex-col items-center gap-2 text-center w-20">
                        <Box className="w-12 h-12 rounded-full bg-white dark:bg-[#2a362f] flex items-center justify-center text-primary shadow-sm">
                            <DryCleaningIcon />
                        </Box>
                        <Box component="span" className="text-xs text-[#6d7e73]">Dry Clean</Box>
                    </Box>
                </Box>
                <Box className="text-xs text-[#6d7e73] dark:text-[#a0aead]">
                    *Product color may vary slightly due to photographic lighting sources.
                </Box>
            </Box>
        </Box>
    );
}

function ReviewsTab({ reviews = [] }) {
    if (!reviews.length) {
        return (
            <Box className="py-10 text-center text-[#6d7e73]">
                No reviews yet.
            </Box>
        );
    }

    return (
        <Box className="py-5">
            <Box className="space-y-8">
                {reviews.map((review, index) => (
                    <Box key={`${review.user_name || 'review'}-${index}`} className="border-b border-gray-100 dark:border-gray-800 pb-6">
                        <Box className="flex justify-between items-start mb-2">
                            <Box>
                                <ProductRatingStars rating={review.rating} className="text-accent-champagne mb-1" />
                                <Box component="p" className="font-bold text-text-dark dark:text-white">{review.user_name}</Box>
                            </Box>
                            <Box component="span" className="text-xs text-text-muted">
                                {new Date(review.created_at).toLocaleDateString()}
                            </Box>
                        </Box>
                        <Box component="p" className="text-text-muted dark:text-gray-400">
                            {review.comment}
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

function DeliveryReturnsTab() {
    return (
        <Box className="py-10 text-[#6d7e73]">
            <Box component="p">Standard delivery time is 2-4 business days. You have the right to free return within 14 days.</Box>
        </Box>
    );
}

export default function ProductDetailTabs({
    product,
    longDescription,
    bulletPoints,
    materialItems,
    careItems,
    tabValue,
    onTabChange,
    reviewsRef,
}) {
    return (
        <Box className="mt-20 border-t border-[#f1f3f2] dark:border-[#2a362f] pt-10" ref={reviewsRef}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs
                    value={tabValue}
                    onChange={(event, nextValue) => onTabChange(nextValue)}
                    textColor="inherit"
                    indicatorColor="primary"
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 'bold',
                            fontSize: '1.125rem',
                            color: '#6d7e73',
                            '&.Mui-selected': {
                                color: '#8dc8a1',
                            },
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#8dc8a1',
                        }
                    }}
                >
                    <Tab label="Product Details" />
                    <Tab label={`Reviews (${product.review_count || 0})`} />
                    <Tab label="Delivery & Returns" />
                </Tabs>
            </Box>

            {tabValue === 0 && (
                <ProductDetailsTab
                    product={product}
                    longDescription={longDescription}
                    bulletPoints={bulletPoints}
                    materialItems={materialItems}
                    careItems={careItems}
                />
            )}
            {tabValue === 1 && <ReviewsTab reviews={product.reviews || []} />}
            {tabValue === 2 && <DeliveryReturnsTab />}
        </Box>
    );
}
