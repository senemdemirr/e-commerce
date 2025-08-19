import { Input } from "@mui/material";
import SearcIcon from "@mui/icons-material/Search";

export default function SearchInput(){
   return(
     <Input
        type="text"
        placeholder="Search products..."
        disableUnderline
        className="w-full max-w-md border-gray-300 border-1 rounded-sm px-2 py-1 shadow-none flex justify-between items-center"
        style={{ margin: "0 auto"}}
        inputProps={{ "aria-label": "Search products" }}
        endAdornment={<SearcIcon></SearcIcon>}
    />
   )
}