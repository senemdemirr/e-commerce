import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import { UserProvider } from "@/context/UserContext";
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
            <UserProvider user={user}>
                <Suspense fallback={null}>
                    <Header />
                </Suspense>
                <Providers>
                    {
                        user && (user.email_verified == false)
                            ?
                            <EmailVerified></EmailVerified>
                            :
                            ("")
                    }
                    <main className="bg-[#F6F7F7]">
                        <Auth0Provider>
                            {children}
                        </Auth0Provider>
                    </main>
                </Providers>
                <Footer />
            </UserProvider >
        </>
    )
}