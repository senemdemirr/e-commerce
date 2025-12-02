import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import { Suspense } from "react";

export default function SiteLayout({ children }) {
    return (
        <>
            <Suspense fallback={null}>
                <Header/>
            </Suspense>

            <main className="container mx-auto px-4">
                <Auth0Provider>
                    {children}
                </Auth0Provider>
            </main>

            <Footer/>
        </>
    )
}