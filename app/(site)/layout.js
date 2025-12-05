import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import { Suspense } from "react";
import { auth0 } from "@/lib/auth0";

export default async function SiteLayout({ children }) {
    const session = await auth0.getSession();
    const user = session?.user || null;
    return (
        <>
            <Suspense fallback={null}>
                <Header user={user} />
            </Suspense>

            <main className="container mx-auto px-4">
                <Auth0Provider>
                    {children}
                </Auth0Provider>
            </main>

            <Footer />
        </>
    )
}