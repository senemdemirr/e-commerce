import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import { UserProvider } from "@/context/UserContext";
import { Suspense } from "react";
import { getOrCreateUserFromSession } from "@/lib/users";
import EmailVerified from "@/components/EmailVerified";
import Providers from "../providers";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CartProvider } from "@/context/CartContext";

import Loading from "@/components/Loading";

export default async function SiteLayout({ children }) {
    const res = await getOrCreateUserFromSession();
    let user;
    if (res.id) {
        user = res;
    }
    return (

        <UserProvider user={user}>
            <CartProvider>
                <div className="min-h-screen flex flex-col">
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
                        <main className="bg-[#F6F7F7] flex-1 pb-[53px] px-4 md:px-8">
                            <Breadcrumbs></Breadcrumbs>
                            <Auth0Provider>
                                <Suspense fallback={<Loading />}>
                                    {children}
                                </Suspense>
                            </Auth0Provider>
                        </main>
                    </Providers>
                    <Footer />
                </div>
            </CartProvider>
        </UserProvider >

    )
}