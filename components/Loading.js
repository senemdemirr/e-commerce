"use client";
import { CircularProgress } from "@mui/material";

export default function Loading() {
    return (
        <div className="w-full flex items-center justify-center min-h-[50vh]">
            <CircularProgress sx={{ color: "#8dc8a1" }} />
        </div>
    );
}
