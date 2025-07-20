import Image from "next/image";
import SearchInput from "./SearchInput";
import Navbar from "./Navbar";
import { Button , Link} from "@mui/material";
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AuthMenu from "./AuthMenu";

export default function Header(){
    return (
       <div className="container w-full mx-auto flex flex-col ">
         <div className=" bg-transparent flex flex-row justify-between items-center">
            <Link href="/">
                <Image
                src={"/e-commerce_logo.png"}
                alt="E-Commerce Logo"
                width={200}
                height={50}
                className="cursor-pointer"
                priority
                />
            </Link>
            <SearchInput></SearchInput>
            <div className="flex flex-row justify-center items-center ">
                <AuthMenu></AuthMenu>
                <Button
                    className="text-white px-4 py-2 rounded hover:bg-blue-600 mr-2 border-none cursor-pointer"
                    startIcon={<FavoriteBorderOutlinedIcon />}
                > 
                My Favorite
                </Button> 
                <Button
                    className="text-white px-4 py-2 rounded hover:bg-green-600 border-none cursor-pointer"
                    startIcon={<ShoppingCartOutlinedIcon />}
                > 
                My Basket
                </Button>
            </div>
        </div> 
        <Navbar></Navbar>
       </div>   
    );
}