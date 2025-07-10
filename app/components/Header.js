import Image from "next/image";
import SearchInput from "./SearchInput";
import Navbar from "./Navbar";
import { Button } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

export default function Header(){
    return (
       <div className="container w-full m-auto flex flex-col ">
         <div className=" bg-transparent flex flex-row justify-center items-center">
            <Image
            src={"/e-commerce_logo.png"}
            alt="E-Commerce Logo"
            width={200}
            height={50}
            className="cursor-pointer"
            priority
            />
            <SearchInput></SearchInput>
            <div>
                <Button
                    variant="contained"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2 border-none cursor-pointer"
                > 
                <PersonIcon
                    className="mr-2"
                ></PersonIcon>
                Sign In</Button>
                <Button
                    variant="contained"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2 border-none cursor-pointer"
                > 
                <FavoriteBorderOutlinedIcon
                    className="mr-2"
                ></FavoriteBorderOutlinedIcon>
                My Favorite
                </Button> 
                <Button
                    variant="contained"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 border-none cursor-pointer"
                > 
                <ShoppingCartOutlinedIcon
                    className="mr-2"
                ></ShoppingCartOutlinedIcon>
                My Basket
                </Button>
            </div>
        </div> 
        <Navbar></Navbar>
       </div>   
    );
}