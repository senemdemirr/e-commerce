"use client";
import { Typography, Button, CircularProgress, Dialog, DialogTitle, IconButton, DialogContent } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch/fetch";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from '@mui/icons-material/Close';
import NewAdresForm from "./NewAdresForm";

export default function UserAdresses() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openNewAddress, setOpenNewAddress] = useState(false);

    const handleOpen = () => {
        setOpenNewAddress(true);
    }
    const handleClose = () => {
        setOpenNewAddress(false);
    }

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await apiFetch("/api/my-profile/my-addresses");
                setAddresses(res);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        }
        fetchAddresses();
    }, []);

    return (
        <div className="container">
            <div className="flex flex-row justify-between items-center mb-5">
                <Typography className="!text-[#131614] !font-bold">My Addresses</Typography>
                <Button
                    variant="text"
                    startIcon={<AddCircleOutlineIcon />}
                    className="!rounded-lg !text-[#8DC8A1] !font-bold"
                    onClick={handleOpen}
                >Add new address</Button>
            </div>
            <Dialog
                open={openNewAddress}
                onClose={handleClose}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    Add new adress
                    <IconButton onClick={handleClose}>
                        <CloseIcon></CloseIcon>
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <NewAdresForm
                        
                    ></NewAdresForm>
                </DialogContent>
            </Dialog>
            {loading ?
                <div className="flex flex-row justify-center items-center mt-6">
                    <CircularProgress sx={{ color: "#8DC8A1" }}></CircularProgress>
                </div>
                :
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {addresses.map((item) => {
                        return (
                            <div key={item.id} className="group relative rounded-xl border border-gray-200  bg-white p-5 transition-all hover:border-[#8DC8A1] hover:shadow-md">
                                <div className="group flex flex-row justify-between items-center">
                                    <div className="flex flex-row items-center">
                                        <div className="w-12 h-12 text-[#8DC8A1] bg-[#8DC8A11A] rounded-full flex items-center justify-center">
                                            <HomeOutlinedIcon />
                                        </div>
                                        <Typography className="!ml-2  !font-bold !text-base">{item.address_title}</Typography>
                                    </div>
                                    <div className="flex flex-row opacity-0 group-hover:opacity-100 transition-opacitiy duration-200">
                                        <div className="cursor-pointer text-[#6D7E73] w-10 h-10 hover:bg-[#8DC8A11A] hover:text-[#8DC8A1] rounded-full flex items-center justify-center">
                                            <EditOutlinedIcon />
                                        </div>
                                        <div className="cursor-pointer text-[#6D7E73] w-10 h-10 hover:bg-red-50 hover:text-red-500 rounded-full flex items-center justify-center">
                                            <DeleteOutlineOutlinedIcon />
                                        </div>
                                    </div>
                                </div>
                                <Typography className="!font-medium !my-2 !text-sm">{item.recipient_first_name} {item.recipient_last_name}</Typography>
                                <Typography className="!text-xs !mb-2 !text-[#6D7E73]">{item.recipient_phone}</Typography>
                                <Typography className="!text-sm !mb-2 !text-[#6D7E73]">{item.neighborhood_name} {item.address_line}</Typography>
                                <Typography className="!text-xs !text-[#6D7E73] !font-bold">{item.district_name} / {item.city_name}</Typography>
                            </div>
                        )
                    })}
                </div>}

        </div>
    )
}