import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import { Suspense } from "react";
import { getOrCreateUserFromSession } from "@/lib/users";
import EmailVerified from "@/components/EmailVerified";
import Providers from "../providers";

export default async function SiteLayout({ children }) {
    const res = await getOrCreateUserFromSession();
    let user;
    if (res.id) {
        user = res;
    }
    return (
        <>
            <Suspense fallback={null}>
                <Header user={user} />
            </Suspense>
            <Providers>
                {
                    user && (user.email_verified == false) 
                    ?
                    <EmailVerified></EmailVerified>
                    :
                    ("")
                }
                <main className="container mx-auto">
                    <Auth0Provider>
                        {children}
                    </Auth0Provider>
                </main>
            </Providers>
            <Footer />
        </>
    )
}