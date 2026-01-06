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
            <div className="container flex lg:flex-row flex-col w-full mx-auto py-8 justify-between">
                <ProfileSidebar></ProfileSidebar>
                <div className="container bg-white rounded-xl shadow-sm border !border-gray-100 flex-1 lg:ml-8 ">
                    <Providers>
                        {children}
                    </Providers>
                </div>
            </div>
        </UserProvider >
    )
}