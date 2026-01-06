"use client";
import { Box, Link, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { useUser } from "@/context/UserContext";
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
// import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import { usePathname } from "next/navigation";
import styles from "./ProfileSidebar.module.scss";

const menuItems = [
    { label: "My user information", href: "/my-profile/user-information", icon: <PersonIcon></PersonIcon> },
    { label: "My adresses", href: "/my-profile/my-adresses", icon: <LocationOnIcon></LocationOnIcon> },
    // { label: "Change to password", href: "/my-profile/change-password", icon: <LockIcon></LockIcon> }
]

export default function ProfileSidebar() {
    const user = useUser();
    const pathname = usePathname();
    const firstOfName = user?.name?.charAt(0);
    const firstOfSurname = user?.surname?.charAt(0);

    return (
        <Box component="aside" className={`flex flex-col lg-w-72 md-w-full ${styles.page}`}>
            <Box className="bg-white min-h-48 rounded-xl p-6 shadow-sm border !border-gray-100 flex flex-col items-center text-center justify-center">
                <Box className="bg-[#F0B48C] w-20 h-20 flex items-center justify-center rounded-full border-4 border-[#f1f3f2]">
                    <Typography className="text-white !text-2xl !font-bold">{firstOfName}{firstOfSurname}</Typography>
                </Box>
                <Typography variant="h6" className="text-[#131614] text-lg !font-semibold">{user?.name} {user?.surname}</Typography>
                <Typography className="text-[#6D7E73] !text-sm">{user?.email}</Typography>
            </Box>
            <List className="!mt-4 !p-0 bg-white rounded-xl shadow-sm border !border-gray-100 flex flex-col">
                {menuItems.map((item) => {
                    const isActive = pathname == item.href;

                    return (
                        <ListItem
                            key={item.href}
                            disablePadding
                            className={`${styles.listItem} ${isActive ? styles.active : ""}`}
                        >
                            <ListItemButton
                                href={item.href}
                                component={Link}
                                className="!p-3 "
                            >
                                <ListItemIcon className={`${isActive ? "!text-[#8DC8A1]" : "!text-[#6D7E73]"} ${styles.icon}`}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.label} className="subpixel-antialiased"></ListItemText>
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>
        </Box>
    );
}