import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LockIcon from '@mui/icons-material/Lock';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import UserInfo from "../components/UserInfo/UserInfo";
import UserAdresses from "../components/UserAdresses/UserAdresses";
import ChangePassword from "../components/ChangePassword/ChangePassword";
import { Typography } from '@mui/material';

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
            title: "Adress Information",
            description: "You can manage your registered delivery and billing addresses here.",
            icon: LocationOnIcon
        },
        {
            slug: "change-password",
            component: ChangePassword,
            title: "Password Change",
            description: "To ensure the security of your account, update your password regularly.",
            icon: LockIcon
        }
    ]
    const current = pagesAndInformation.find((page) => page.slug === param.section);
    const Component = current.component;
    const Icon = current.icon;
    return (
        <div>
            <div className="w-full flex flex-row h-32 relative bg-gradient-to-r from-[#8DC8A1]/20 via-[#A0C8A0]/10 to-[#f6f7f7] p-6 justify-between items-center">

                <div className='left'>
                    <Typography className='!text-xl !font-bold text-[#131614]'>{current.title}</Typography>
                    <Typography className='!text-sm !text-[#6D7E73]'>{current.description}</Typography>
                </div>
                <div className='opacity-25'>
                    <Icon sx={{fontSize:65}} className='absolute bottom-2 right-5 rotate-18 !text-[#8DC8A1]'/>
                </div>
            </div>
            <div className='p-6'>
                <Component />
            </div>
        </div>
    )
}