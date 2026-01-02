import { Typography, Button } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function UserAdresses() {
    return (
        <div className="container">
            <div className="flex flex-row justify-between items-center">
                <Typography className="!text-[#131614] !font-bold">Kayıtlı Adreslerim</Typography>
                <Button
                    variant="text"
                    startIcon={<AddCircleOutlineIcon />}
                    className="!rounded-lg !text-[#8DC8A1] !font-bold"
                >Yeni Adres Ekle</Button>
            </div>
        </div>
    )
}