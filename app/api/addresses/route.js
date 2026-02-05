import { pool } from "@/lib/db";
import { getOrCreateUserFromSession } from "@/lib/users";
import { NextResponse } from "next/server";

// GET - Fetch all addresses for the logged-in user
export async function GET() {
    try {
        const user = await getOrCreateUserFromSession();
        if (!user.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const result = await pool.query(
            `SELECT * FROM addresses 
             WHERE user_id = $1 
             ORDER BY is_default DESC, created_at DESC`,
            [user.id]
        );

        return NextResponse.json(
            { addresses: result.rows },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/addresses error:", error);
        return NextResponse.json(
            { message: `Error fetching addresses: ${error.message}` },
            { status: 500 }
        );
    }
}

// POST - Create a new address
export async function POST(request) {
    try {
        const user = await getOrCreateUserFromSession();
        if (!user.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            address_type,
            title,
            full_name,
            phone,
            address_line,
            city,
            district,
            postal_code,
            is_default = false
        } = body;

        // Validate required fields
        if (!title || !full_name || !phone || !address_line || !city) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // If this is set as default, unset other defaults
        if (is_default) {
            await pool.query(
                "UPDATE addresses SET is_default = FALSE WHERE user_id = $1",
                [user.id]
            );
        }

        const result = await pool.query(
            `INSERT INTO addresses 
             (user_id, address_type, title, full_name, phone, address_line, city, district, postal_code, is_default) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
             RETURNING *`,
            [
                user.id,
                address_type || 'other',
                title,
                full_name,
                phone,
                address_line,
                city,
                district,
                postal_code,
                is_default
            ]
        );

        return NextResponse.json(
            { message: "Address created successfully", address: result.rows[0] },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/addresses error:", error);
        return NextResponse.json(
            { message: `Error creating address: ${error.message}` },
            { status: 500 }
        );
    }
}

// PUT - Update an existing address
export async function PUT(request) {
    try {
        const user = await getOrCreateUserFromSession();
        if (!user.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            id,
            address_type,
            title,
            full_name,
            phone,
            address_line,
            city,
            district,
            postal_code,
            is_default
        } = body;

        if (!id) {
            return NextResponse.json(
                { message: "Address ID is required" },
                { status: 400 }
            );
        }

        // If this is set as default, unset other defaults
        if (is_default) {
            await pool.query(
                "UPDATE addresses SET is_default = FALSE WHERE user_id = $1",
                [user.id]
            );
        }

        const result = await pool.query(
            `UPDATE addresses 
             SET address_type = $1, title = $2, full_name = $3, phone = $4, 
                 address_line = $5, city = $6, district = $7, postal_code = $8, 
                 is_default = $9, updated_at = NOW()
             WHERE id = $10 AND user_id = $11
             RETURNING *`,
            [
                address_type,
                title,
                full_name,
                phone,
                address_line,
                city,
                district,
                postal_code,
                is_default,
                id,
                user.id
            ]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { message: "Address not found or unauthorized" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Address updated successfully", address: result.rows[0] },
            { status: 200 }
        );
    } catch (error) {
        console.error("PUT /api/addresses error:", error);
        return NextResponse.json(
            { message: `Error updating address: ${error.message}` },
            { status: 500 }
        );
    }
}

// DELETE - Delete an address
export async function DELETE(request) {
    try {
        const user = await getOrCreateUserFromSession();
        if (!user.id) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const addressId = searchParams.get('id');

        if (!addressId) {
            return NextResponse.json(
                { message: "Address ID is required" },
                { status: 400 }
            );
        }

        const result = await pool.query(
            "DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *",
            [addressId, user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { message: "Address not found or unauthorized" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Address deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("DELETE /api/addresses error:", error);
        return NextResponse.json(
            { message: `Error deleting address: ${error.message}` },
            { status: 500 }
        );
    }
}
