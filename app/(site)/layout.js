import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import { Suspense } from "react";
import { getOrCreateUserFromSession } from "@/lib/users";

export default async function SiteLayout({ children }) {
    const res = await getOrCreateUserFromSession();
    let user;
    if(res.id){
        user = res;
    }
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