"use client";
import { Box, Link, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { useUser } from "@/context/UserContext";
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LockIcon from '@mui/icons-material/Lock';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import { usePathname } from "next/navigation";

const menuItems = [
    { label: "My Information", href: "/my-profile/user-information", icon: <PersonIcon /> },
    { label: "All My Orders", href: "/my-profile/orders", icon: <ShoppingBagIcon /> },
    { label: "My Addresses", href: "/my-profile/my-adresses", icon: <LocationOnIcon /> },
    { label: "Change Password", href: "/my-profile/change-password", icon: <LockIcon /> },
]

export default function ProfileSidebar() {
    const user = useUser();
    const pathname = usePathname();
    const firstOfName = user?.name?.charAt(0) || "U";
    const firstOfSurname = user?.surname?.charAt(0) || "";

    return (
        <Box component="aside" className="w-full lg:w-72 flex-shrink-0 space-y-6">
            {/* User Info Card */}
            <Box className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border !border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
                <Box className="relative mb-4">
                    <Box className="bg-primary/20 w-20 h-20 flex items-center justify-center rounded-full border-4 border-[#f1f3f2] dark:border-[#2a342d]">
                        <Typography className="text-primary !text-2xl !font-bold">{firstOfName}{firstOfSurname}</Typography>
                    </Box>
                    <button className="absolute bottom-0 right-0 bg-primary hover:bg-primary-dark text-white rounded-full p-1.5 shadow-md transition-colors border-2 border-surface-light dark:border-surface-dark">
                        <EditIcon sx={{ fontSize: 16, display: 'block' }} />
                    </button>
                </Box>
                <Typography className="text-text-main dark:text-white !text-lg !font-bold">
                    {user?.name} {user?.surname}
                </Typography>
                <Typography className="text-text-muted dark:text-gray-400 !text-sm">
                    {user?.email}
                </Typography>
            </Box>

            {/* Navigation Menu */}
            <Box className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border !border-gray-100 dark:border-gray-800 overflow-hidden">
                <List className="!p-0 flex flex-col">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <ListItem
                                key={item.href}
                                disablePadding
                                className={`border-l-4 transition-all ${isActive ? "bg-primary/5 border-primary" : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                            >
                                <ListItemButton
                                    href={item.href}
                                    component={Link}
                                    className="!px-6 !py-3"
                                >
                                    <ListItemIcon className={`!min-w-0 !mr-4 ${isActive ? "!text-primary" : "!text-text-muted"}`}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            className: `!text-sm !font-bold ${isActive ? "text-text-main dark:text-white" : "text-text-muted dark:text-gray-400"}`
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        )
                    })}
                </List>
            </Box>

            {/* Logout Button */}
            <button className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 text-text-main dark:text-gray-300 font-bold text-sm hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors">
                <LogoutIcon sx={{ fontSize: 20 }} />
                <span>Logout</span>
            </button>
        </Box>
    );
}