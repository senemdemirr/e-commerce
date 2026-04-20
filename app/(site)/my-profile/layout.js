import Providers from "@/app/providers";
import ProfileSidebar from "./components/ProfileSidebar/ProfileSidebar";
import { UserProvider } from "@/context/UserContext";
import { getOrCreateUserFromSession } from "@/lib/users";

export default async function MyProfileLayout({ children }) {
    const res = await getOrCreateUserFromSession();
    let user;
    if (res.id) {
        user = res;
    }
    return (
        <UserProvider user={user}>
            <main className="container py-8 mx-auto">
                <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
                    <ProfileSidebar />
                    <div className="flex-1 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
                        <Providers>
                            {children}
                        </Providers>
                    </div>
                </div>
            </main>
        </UserProvider >
    )
}