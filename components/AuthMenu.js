"use client"
import Link from "next/link";
import PersonIcon from '@mui/icons-material/Person2Outlined';
import { useUser } from "@/context/UserContext";

export default function AuthMenu() {
    const user = useUser();
    return (
        <>
            <ul className="px-4 py-2 flex">
                <li className="cursor-pointer relative group">
                    <PersonIcon sx={{ color: "#6E7982", width: "21px", height: "21px" }}></PersonIcon>
                    <span className="ms-2 !text-gray-600 text-[14.5px]">{user ? "MY ACCOUNT" : "SIGN IN"}</span>

                    <ul className="invisible absolute left-0 top-full z-50 mt-2 w-48 rounded-md bg-white shadow-lg opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                        <li>
                            {user ? (
                                <Link href={"/my-profile/user-information"} className="block px-4 py-2 text-sm hover:bg-gray-100"> My Profile
                                </Link>
                            )
                                :
                                (
                                    <a href="/auth/login" className="block px-4 py-2 text-sm hover:bg-gray-100"> Sign in
                                    </a>
                                )}
                        </li>
                        {user ?
                            (
                                <>
                                    <a href="/my-profile/orders" className="block px-4 py-2 text-sm hover:bg-gray-100">
                                        All My Orders
                                    </a>
                                    <a href="/auth/logout" className="block px-4 py-2 text-sm hover:bg-gray-100">
                                        Log Out
                                    </a>
                                </>
                            )
                            :
                            (
                                ""
                            )
                        }

                    </ul>
                </li>

            </ul>
        </>
    )
} 