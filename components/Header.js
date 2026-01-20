import Image from "next/image";
import Link from "next/link";
import SearchInput from "@/components/SearchInput";
import Navbar from "@/components/Navbar";
import { Button } from "@mui/material";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import AuthMenu from "@/components/AuthMenu";
import { getOrCreateUserFromSession } from "@/lib/users";
import BasketButton from "./BasketButton";

export default async function Header() {
    const user = await getOrCreateUserFromSession();
    const favoritesHref = user ? "/favorites" : "/auth/login";
    return (
        <div className=" w-full flex flex-col">
            <div className="container mx-auto bg-transparent flex flex-row justify-between items-center">
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
                <SearchInput />
                <div className="flex flex-row justify-center items-center">
                    <AuthMenu />
                    {/* I used button inside Link for style and icon 
                  passHref passes href information to the button
                */}
                        <a href={favoritesHref}>
                            <Button
                                className="!text-gray-600 px-4 py-2 rounded hover:!bg-transparent mr-2"
                                startIcon={<FavoriteBorderOutlinedIcon />}
                            >
                                My Favorites
                            </Button>
                        </a>

                    <BasketButton/>
                </div>
            </div>
            <Navbar />
        </div>
    );
}
