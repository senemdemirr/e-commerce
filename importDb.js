import fs from "fs";
import { pool } from "./db.js";

const data = JSON.parse(fs.readFileSync("./lib/data/data.json", "utf-8"));

async function importData() {
    try {
        for (const category of data.categories) {
            const catRes = await pool.query("INSERT INTO categories(name,slug) VALUES ($1,$2) RETURNING id", [category.name,category.slug]);
            const categoryId = catRes.rows[0].id;

            for(const sub of category.children){
                const subRes = await pool.query("INSERT INTO sub_categories(name,slug,category_id) VALUES ($1,$2,$3) RETURNING id", [sub.name,sub.slug,categoryId]);
                const subCategoryId = subRes.rows[0].id;

                for(const product of sub.products){
                    await pool.query("INSERT INTO products (sub_category_id,title,description,price,image,brand,sku) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id", [subCategoryId,product.title,product.description,product.price,product.image,product.brand,product.sku]);

                }
            }
        }
        console.log("tüm veriler eklendi");
        process.exit();
    }

    catch (error) {
        console.log(error);
    }
}

importData();