import Image from "next/image";
import Link from "next/link";
import SearchInput from "./SearchInput";
import Navbar from "./Navbar";
import { Button } from "@mui/material";
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AuthMenu from "./AuthMenu";

export default function Header(){
    return (
       <div className="container w-full mx-auto flex flex-col">
         <div className="bg-transparent flex flex-row justify-between items-center">
            <Link href="/" passHref>
                <Image
                    src="/e-commerce_logo.png"
                    alt="E-Commerce Logo"
                    width={200}
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

                <Link href="/favorites" passHref>
                    <Button
                        className="!text-gray-600 px-4 py-2 rounded hover:!bg-transparent mr-2 border-none cursor-pointer"
                        startIcon={<FavoriteBorderOutlinedIcon />}
                    >
                        My Favorite
                    </Button>
                </Link>
                <Link href="/basket" passHref>
                    <Button
                        className="!text-gray-600 px-4 py-2 rounded hover:!bg-transparent border-none cursor-pointer"
                        startIcon={<ShoppingCartOutlinedIcon />}
                    >
                        My Basket
                    </Button>
                </Link>
            </div>
        </div> 
        <Navbar />
       </div>   
    );
}
