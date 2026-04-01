'use client';

import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Header = () => {
    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-primary/10 flex items-center justify-between px-8 py-4 sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative max-w-md w-full">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 !text-xl" />
                    <input
                        className="w-full bg-background-light dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary text-sm outline-none"
                        placeholder="Search orders, customers, items..."
                        type="text"
                    />
                </div>
            </div>
            <div className="flex items-center gap-6">
                <button className="relative text-slate-500 hover:text-primary">
                    <NotificationsIcon />
                    <span className="absolute top-0 right-0 size-2 bg-accent-champagne rounded-full border-2 border-white dark:border-slate-900"></span>
                </button>
                <div className="flex items-center gap-3 pl-6 border-l border-primary/10">
                    <div className="text-right">
                        <p className="text-sm font-bold">Alex Iron</p>
                        <p className="text-[10px] text-slate-500">Store Manager</p>
                    </div>
                    <div
                        className="size-10 rounded-full bg-secondary border-2 border-primary/20 bg-cover bg-center"
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDl_KZuxOIDFrJEg76maaotFvEPdLD1ll01z8r5tFj-JIumHgjTOCCQWM5JJDdD6IvjfUx9YCUl3pU314ZkPtqzQHhwNYtOSSIT-8u4Cu28aKKNzCTLMSYsaM4zuraCbnRQduLBC2n2oCLOkXgkQ9GDp93mHePUMv9gbKtIOCvPO_1hNBqfzIJrvZjTymP1zrzFDaBjPv6JfYJzh0_Q0CaLcZmCzXxxM9B3pCfW2u3Yj3MOgMAhdiyF3iZKe-2o1dyWdNoykb2WnPQ')" }}
                    ></div>
                </div>
            </div>
        </header>
    );
};

export default Header;
