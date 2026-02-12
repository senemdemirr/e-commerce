"use client";

import { useEffect, useRef } from "react";
import SwaggerUI from "swagger-ui-dist/swagger-ui-bundle";
import "swagger-ui-dist/swagger-ui.css";

export default function ApiDocsPage() {
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        SwaggerUI({
            dom_id: "#swagger-ui",
            url: "/api/swagger",
            deepLinking: true
        });
    }, []);

    return <div id="swagger-ui" style={{ height: "100vh" }} />;
}
