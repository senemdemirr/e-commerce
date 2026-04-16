"use client";

import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HomeIcon from "@mui/icons-material/Home";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";

export default function AddressCard({
    addresses,
    selectedAddressId,
    onAddressSelect,
    onAddAddress,
}) {
    return (
        <div className="bg-white dark:bg-surface-dark rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                <h2 className="text-primary text-xl font-bold leading-tight flex items-center gap-2">
                    <span className="bg-primary/10 p-2 rounded-lg">
                        <LocationOnIcon className="text-primary" />
                    </span>
                    1. Delivery Address
                </h2>
                <button
                    onClick={onAddAddress}
                    className="text-primary font-bold text-sm hover:underline flex items-center gap-1"
                >
                    <AddIcon fontSize="small" />
                    Add New Address
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                    <div
                        key={address.id}
                        onClick={() => onAddressSelect(address.id)}
                        className={`relative border-2 p-4 rounded-xl cursor-pointer transition-all ${
                            selectedAddressId === address.id
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 dark:border-gray-800 hover:border-primary/50"
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                {address.address_title?.toLowerCase().includes("home") ? (
                                    <HomeIcon fontSize="small" className="text-text-muted" />
                                ) : (
                                    <WorkIcon fontSize="small" className="text-text-muted" />
                                )}
                                <p className="text-text-dark dark:text-white font-bold">
                                    {address.address_title}
                                </p>
                            </div>
                            {selectedAddressId === address.id && (
                                <CheckCircleIcon className="text-primary" />
                            )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            {address.recipient_first_name} {address.recipient_last_name}
                            <br />
                            {address.address_line}
                            <br />
                            {address.neighborhood_name}, {address.district_name}, {address.city_name}
                        </p>
                        <p className="mt-3 text-xs font-bold text-gray-400">
                            {address.recipient_phone}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
