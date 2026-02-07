const { pool } = require("./lib/db");

async function updateOrderStatus() {
    try {
        console.log("Updating order_status table...");

        // 1. Delete existing rows
        await pool.query("TRUNCATE TABLE order_status CASCADE");

        // 2. Insert new statuses
        const statuses = [
            { code: 'order_received', title: 'Order Received', sort_order: 10, is_final: false },
            { code: 'preparing', title: 'Preparing', sort_order: 20, is_final: false },
            { code: 'shipped', title: 'Shipped', sort_order: 30, is_final: false },
            { code: 'delivered', title: 'Delivered', sort_order: 40, is_final: true },
            { code: 'cancelled', title: 'Cancelled', sort_order: 50, is_final: true }
        ];

        for (const status of statuses) {
            await pool.query(
                "INSERT INTO order_status (code, title, sort_order, is_final) VALUES ($1, $2, $3, $4)",
                [status.code, status.title, status.sort_order, status.is_final]
            );
            console.log(`Inserted: ${status.code}`);
        }

        console.log("Successfully updated order_status table.");
        process.exit(0);
    } catch (error) {
        console.error("Error updating order_status table:", error);
        process.exit(1);
    }
}

updateOrderStatus();
