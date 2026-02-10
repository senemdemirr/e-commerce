"use client";
import { Typography, Button, Dialog, DialogTitle, IconButton, DialogContent, DialogActions } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch/fetch";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from '@mui/icons-material/Close';
import NewAdresForm from "./NewAdresForm";
import Loading from "@/components/Loading";
import { useSnackbar } from "notistack";

export default function UserAdresses() {
    const { enqueueSnackbar } = useSnackbar();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [mode, setMode] = useState("create");
    const [selectedAddress, setSelectedAddress] = useState(null);

    const [openConfirm, setOpenConfirm] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const res = await apiFetch("/api/my-profile/my-addresses");
            setAddresses(Array.isArray(res) ? res : []);
        } catch (error) {
            console.log(error);
            enqueueSnackbar("An error occurred while loading addresses.", { variant: "error" });
        } finally {
            setLoading(false);
        }
    }

    const handleOpenCreate = () => {
        setMode("create");
        setSelectedAddress(null);
        setOpenModal(true);
    }
    const handleOpenEdit = (item) => {
        setMode("edit");
        setSelectedAddress(item);
        setOpenModal(true);
    }
    const handleClose = () => {
        setMode("create");
        setSelectedAddress(null);
        setOpenModal(false);
    }
    const handleSuccess = async () => {
        await fetchAddresses();
        handleClose();
    };

    const openConfirmDelete = (item) => {
        setAddressToDelete(item);
        setOpenConfirm(true);
    };

    const closeConfirm = () => {
        setOpenConfirm(false);
        setAddressToDelete(null);
    };

    const handleDeleteConfirmed = async () => {
        if (!addressToDelete?.id) return;

        try {
            setDeleting(true);

            const res = await apiFetch(`/api/my-profile/my-addresses/${addressToDelete.id}`, {
                method: "DELETE",
            });
            if (res?.message !== "It is deleted") {
                throw new Error(res?.message || "Failed to delete address.");
            }

            setAddresses((prev) => prev.filter((a) => a.id !== addressToDelete.id));
            enqueueSnackbar("Address deleted successfully.", { variant: "success" });
            // await fetchAddresses();

            closeConfirm();
        } catch (error) {
            console.log(error);
            enqueueSnackbar("An error occurred while deleting the address.", { variant: "error" });
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    return (
        <div className="container">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-4 sm:gap-0">
                <Typography className="!text-text-main !font-bold">My Addresses</Typography>
                <Button
                    variant="text"
                    startIcon={<AddCircleOutlineIcon />}
                    className="!rounded-lg !text-primary !font-bold"
                    onClick={handleOpenCreate}
                >Add new address</Button>
            </div>
            <Dialog open={openModal} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle className="flex flex-row justify-between items-center">
                    {mode === "create" ? "Add new adress" : "Edit address"}
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <NewAdresForm
                        mode={mode}
                        initialData={selectedAddress}
                        onCancel={handleClose}
                        onSuccess={handleSuccess}
                    />
                </DialogContent>
            </Dialog>
            <Dialog open={openConfirm} onClose={closeConfirm}>
                <DialogContent>
                    Are you sure you want to delete?
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirm} disabled={deleting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirmed}
                        disabled={deleting || !addressToDelete}
                        color="error"
                    >
                        {deleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
            {loading ?
                <Loading />
                :
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {addresses.map((item) => {
                        return (
                            <div key={item.id} className="group relative rounded-xl border border-gray-200  bg-white p-5 transition-all hover:border-primary hover:shadow-md">
                                <div className="group flex flex-row justify-between items-center">
                                    <div className="flex flex-row items-center">
                                        <div className="w-12 h-12 text-primary bg-primary/10 rounded-full flex items-center justify-center">
                                            <HomeOutlinedIcon />
                                        </div>
                                        <Typography className="!ml-2  !font-bold !text-base">{item.address_title}</Typography>
                                    </div>
                                    <div className="flex flex-row opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                                        <div
                                            onClick={() => handleOpenEdit(item)}
                                            className="cursor-pointer text-text-muted w-10 h-10 hover:bg-primary/10 hover:text-primary rounded-full flex items-center justify-center">
                                            <EditOutlinedIcon />
                                        </div>
                                        <div
                                            onClick={() => openConfirmDelete(item)}
                                            className="cursor-pointer text-text-muted w-10 h-10 hover:bg-red-50 hover:text-red-500 rounded-full flex items-center justify-center">
                                            <DeleteOutlineOutlinedIcon />
                                        </div>
                                    </div>
                                </div>
                                <Typography className="!font-medium !my-2 !text-sm">{item.recipient_first_name} {item.recipient_last_name}</Typography>
                                <Typography className="!text-xs !mb-2 !text-text-muted">{item.recipient_phone}</Typography>
                                <Typography className="!text-sm !mb-2 !text-text-muted">{item.neighborhood_name} {item.address_line}</Typography>
                                <Typography className="!text-xs !text-text-muted !font-bold">{item.district_name} / {item.city_name}</Typography>
                            </div>
                        )
                    })}
                </div>}

        </div>
    )
}
