import fs from "fs";
import path from "path";

export async function GET() {
    const filePath = path.join(process.cwd(), "swagger.json");
    const fileContents = fs.readFileSync(filePath, "utf-8");

    return new Response(fileContents, {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        }
    })
}