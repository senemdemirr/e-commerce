"use client";
import { Input } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function SearchInput() {

   const searchParams = useSearchParams();
   const currentQuery = searchParams.get("query") || "";
   const [searchValue, setSearchValue] = useState(currentQuery);
   const pathName = usePathname();
   const router = useRouter();

   useEffect(() => {
      setSearchValue(currentQuery);
   }, [currentQuery]);

   function handleQueryChange(query) {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
         params.set("query", query);
      } else {
         params.delete("query");
      }

      const queryString = params.toString();
      router.push(queryString ? `${pathName}?${queryString}` : pathName);
   }
   function onSubmit(e) {
      e.preventDefault();
      handleQueryChange(searchValue.trim());
   }


   return (
      <form onSubmit={onSubmit} role="search" className="w-full max-w-md border-gray-300 px-2 py-1 pl-4 shadow-none rounded-full bg-[#f1f3f2] placeholder:text-text-muted">
         <Input
            type="search"
            placeholder="Search products..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            disableUnderline
            className="w-full"
            style={{ margin: "0 auto" }}
            inputProps={{ "aria-label": "Search products" }}
            endAdornment={
               <IconButton type="submit" aria-label="Submit product search" size="small">
                  <SearchIcon color="disabled"></SearchIcon>
               </IconButton>
            }
         />
      </form>
   )
}
