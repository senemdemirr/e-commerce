"use client";

import { Box } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';

export default function ProductRatingStars({ rating = 0, size = 20, className = '' }) {
    const normalizedRating = Number(rating || 0);
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 >= 0.5;

    return (
        <Box className={`flex items-center gap-0.5 ${className}`}>
            {[1, 2, 3, 4, 5].map((star) => {
                if (star <= fullStars) {
                    return (
                        <StarIcon
                            key={star}
                            sx={{ fontSize: size, color: '#F0B48C' }}
                        />
                    );
                }

                if (star === fullStars + 1 && hasHalfStar) {
                    return (
                        <StarHalfIcon
                            key={star}
                            sx={{ fontSize: size, color: '#F0B48C' }}
                        />
                    );
                }

                return (
                    <StarIcon
                        key={star}
                        sx={{ fontSize: size, color: 'rgba(156, 163, 175, 0.2)' }}
                    />
                );
            })}
        </Box>
    );
}
