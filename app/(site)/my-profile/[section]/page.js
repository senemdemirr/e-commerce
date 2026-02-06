import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LockIcon from '@mui/icons-material/Lock';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import UserInfo from "../components/UserInfo/UserInfo";
import UserAdresses from "../components/UserAdresses/UserAdresses";
import ChangePassword from "../components/ChangePassword/ChangePassword";
import { Typography, Box } from '@mui/material';

export default async function Section({ params }) {
    const param = await params;
    const pagesAndInformation = [
        {
            slug: "user-information",
            component: UserInfo,
            title: "Account Information",
            description: "You can update your personal information here.",
            icon: ManageAccountsIcon
        },
        {
            slug: "my-adresses",
            component: UserAdresses,
            title: "Address Information",
            description: "You can manage your registered delivery and billing addresses here.",
            icon: LocationOnIcon
        },
        {
            slug: "change-password",
            component: ChangePassword,
            title: "Password Change",
            description: "To ensure the security of your account, update your password regularly.",
            icon: LockIcon
        },
        {
            slug: "saved-cards",
            component: () => <div className="p-8 text-center text-text-muted">Saved cards feature coming soon.</div>,
            title: "Saved Cards",
            description: "Manage your saved payment methods securely.",
            icon: CreditCardIcon
        }
    ]
    const current = pagesAndInformation.find((page) => page.slug === param.section);

    if (!current) {
        return (
            <div className="p-12 text-center">
                <Typography variant="h6" className="text-text-main !font-bold">Section Not Found</Typography>
                <Typography className="text-text-muted mt-2">The profile section you are looking for could not be found.</Typography>
            </div>
        );
    }

    const Component = current.component;
    const Icon = current.icon;

    return (
        <Box className="flex flex-col flex-1">
            <Box className="relative h-32 bg-gradient-to-r from-primary/20 via-secondary/10 to-background-light dark:from-primary/10 dark:to-surface-dark p-6 flex items-end">
                <Box className="relative z-10 w-full flex justify-between items-end">
                    <Box>
                        <h2 className="text-2xl font-bold text-text-main dark:text-white mb-1">{current.title}</h2>
                        <p className="text-text-muted dark:text-gray-400 text-sm">{current.description}</p>
                    </Box>
                    <Box className="hidden sm:block">
                        <Icon sx={{ fontSize: 60 }} className="text-primary/20 absolute bottom-[-10px] right-0 rotate-12 select-none" />
                    </Box>
                </Box>
            </Box>
            <div className='p-6 md:p-8'>
                <Component />
            </div>
        </Box>
    )
}