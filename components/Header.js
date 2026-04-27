import Image from "next/image";
import Link from "next/link";
import SearchInput from "@/components/SearchInput";
import Navbar from "@/components/Navbar";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import AuthMenu from "@/components/AuthMenu";
import { getOrCreateUserFromSession } from "@/lib/users";
import BasketButton from "./BasketButton";
import MobileMenu from "./MobileMenu";

export default async function Header() {
    const user = await getOrCreateUserFromSession();
    const favoritesHref = user ? "/favorites" : "/auth/login";
    return (
        <div className="w-full flex flex-col">
            <div className="container mx-auto bg-transparent px-4 lg:px-0 py-2 lg:py-0 flex flex-row justify-between items-center">
                {/* Mobile Layout: Hamburger + Logo */}
                <div className="flex lg:hidden items-center gap-4">
                    <MobileMenu />
                    <Link href="/" passHref>
                        <Image
                            src="/e-commerce_logo.jpg"
                            alt="E-Commerce Logo"
                            width={100}
                            height={40}
                            className="cursor-pointer"
                            style={{ width: "auto", height: "auto" }}
                            priority
                        />
                    </Link>
                </div>

                {/* Desktop Layout: Logo */}
                <div className="hidden lg:block">
                    <Link href="/" passHref>
                        <Image
                            src="/e-commerce_logo.jpg"
                            alt="E-Commerce Logo"
                            width={130}
                            height={50}
                            className="cursor-pointer"
                            priority
                        />
                    </Link>
                </div>

                {/* Desktop: Search Input */}
                <div className="hidden lg:block flex-1 mx-8 max-w-2xl">
                    <SearchInput />
                </div>

                {/* Desktop: Actions */}
                <div className="hidden lg:flex flex-row justify-center items-center gap-2">
                    <AuthMenu />
                    {/* Favorites */}
                    <Link
                        href={favoritesHref}
                        className="inline-flex items-center gap-2 rounded px-4 py-2 transition-colors hover:bg-transparent"
                    >
                        <FavoriteBorderOutlinedIcon className="!h-[21px] !w-[21px] text-[#6E7982]" />
                        <span className="text-[14.5px] text-gray-800">My Favorites</span>
                    </Link>
                    <BasketButton />
                </div>
            </div>

            {/* Desktop Navbar */}
            <div className="hidden lg:block">
                <Navbar />
            </div>
        </div>
    );
}
