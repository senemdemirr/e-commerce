import ProfileSidebar from "@/components/ProfileSidebar/ProfileSidebar";
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
            <div className="container flex flex-row w-full mx-auto py-8 justify-between">
                <ProfileSidebar></ProfileSidebar>
                <div className="container bg-white rounded-xl p-6 shadow-sm border !border-gray-100 flex-1 ml-8 ">
                    {children}
                </div>
            </div>
        </UserProvider >
    )
}