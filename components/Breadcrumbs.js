"use client";

import { Breadcrumbs as MuiBreadcrumbs, Typography, Link} from "@mui/material";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

const formatLabel = (segment) =>
    decodeURIComponent(segment)
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

export default function Breadcrumbs() {
    const pathname = usePathname();
    let hideHome = pathname === "/" ? true : false;
    const homeLabel = "Home";
    const segments = pathname.split("/").filter(Boolean);

    const crumbs = segments.map((seg, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const label = formatLabel(seg);
        return { href, label };
    });

    return (
        <MuiBreadcrumbs separator="›" aria-label="breadcrumb" className="!container !mt-4 !mx-auto">
            {!hideHome && (
                <Link
                    component={NextLink}
                    href="/"
                    underline="hover"
                    color="inherit"
                >
                    {homeLabel}
                </Link>
            )}

            {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;

                return isLast ? (
                    <Typography
                        key={crumb.href}
                        color="text.primary"
                        fontWeight={500}
                    >
                        {crumb.label}
                    </Typography>
                ) : (
                    <Link
                        key={crumb.href}
                        component={NextLink}
                        href={crumb.href}
                        underline="hover"
                        color="inherit"
                    >
                        {crumb.label}
                    </Link>
                );
            })}
        </MuiBreadcrumbs>
    );
}
