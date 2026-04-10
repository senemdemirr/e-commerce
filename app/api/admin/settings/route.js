import { NextResponse } from 'next/server';
import { requireAdminReadAccess } from '@/lib/admin/auth';
import {
    getFallbackSettings,
    updateFallbackSettings,
} from '@/lib/admin/test-data';

function normalizeNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(req) {
    const denied = await requireAdminReadAccess(req);
    if (denied) {
        return denied;
    }

    return NextResponse.json(getFallbackSettings(), { status: 200 });
}

export async function PUT(req) {
    const denied = await requireAdminReadAccess(req);
    if (denied) {
        return denied;
    }

    const body = await req.json().catch(() => ({}));
    const currentSettings = getFallbackSettings();
    const nextSettings = updateFallbackSettings({
        ...body,
        shipping_fee: normalizeNumber(body?.shipping_fee, currentSettings.shipping_fee),
        free_shipping_threshold: normalizeNumber(
            body?.free_shipping_threshold,
            currentSettings.free_shipping_threshold
        ),
    });

    return NextResponse.json(nextSettings, { status: 200 });
}
