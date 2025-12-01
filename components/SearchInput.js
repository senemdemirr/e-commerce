"use client";
import { Input } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import { useRouter , useSearchParams, usePathname} from "next/navigation";

export default function SearchInput() {

   const [searchValue, setSearchValue] = useState("");
   const searchParams = useSearchParams();
   const pathName = usePathname();
   const router = useRouter();

   function handleQueryChange(query) {
      router.push(`${pathName}?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), query }).toString()}`);
   }
   function onSubmit(e) {
      e.preventDefault();
      handleQueryChange(searchValue.trim());
   }


   return (
      <form onSubmit={onSubmit} role="search" className="w-full max-w-md border-gray-300 border-1 rounded-sm px-2 py-1 shadow-none ">
         <Input
            type="search"
            placeholder="Search products..."
            onChange={(e) => setSearchValue(e.target.value)}
            disableUnderline
            className="w-full"
            style={{ margin: "0 auto" }}
            inputProps={{ "aria-label": "Search products" }}
            endAdornment={<SearchIcon color="disabled"></SearchIcon>}
         />
      </form>
   )
}