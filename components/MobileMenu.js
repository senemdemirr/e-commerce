"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { IconButton, Collapse } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person2Outlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { apiFetch } from "@/lib/apiFetch/fetch";

export default function MobileMenu() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [openCategory, setOpenCategory] = useState(null);
    const user = useUser();

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await apiFetch("/api/categories");
                setCategories(res);
            } catch (error) {
                console.log("Category route error: ", error);
            }
        }
        fetchCategories();
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleCategoryClick = (id) => {
        setOpenCategory(openCategory === id ? null : id);
    };

    const isActive = (path) => pathname === path;

    return (
        <div className="lg:hidden">
            <IconButton onClick={toggleMenu} aria-label="menu">
                <MenuIcon className="text-text-main" />
            </IconButton>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 backdrop-blur-sm bg-black/5 z-[60]"
                    onClick={toggleMenu}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-surface-light shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } overflow-y-auto`}
            >
                <div className="p-5 flex justify-between items-center border-b border-text-muted/10">
                    <span className="text-xl font-bold text-primary tracking-tight">Menu</span>
                    <IconButton onClick={toggleMenu} aria-label="close">
                        <CloseIcon className="text-text-muted hover:text-red-500 transition-colors" />
                    </IconButton>
                </div>

                <div className="py-6">
                    {/* User Section */}
                    <div className="px-5 mb-4">
                        {user ? (
                            <div>
                                <div className="flex items-center gap-3 mb-3 text-text-main font-semibold">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                                        <PersonIcon />
                                    </div>
                                    <span>My Account</span>
                                </div>
                                <div className="pl-12 flex flex-col gap-2">
                                    <Link
                                        href="/my-profile/user-information"
                                        className={`py-2 block transition-colors ${isActive('/my-profile/user-information') ? 'text-primary font-bold' : 'text-text-muted hover:text-primary'}`}
                                        onClick={toggleMenu}
                                    >
                                        My Profile
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="flex items-center gap-3 text-text-main hover:text-primary py-3 font-semibold group"
                                onClick={toggleMenu}
                            >
                                <div className="p-2 bg-gray-100 group-hover:bg-primary/10 rounded-full transition-colors">
                                    <PersonIcon className="text-gray-500 group-hover:text-primary" />
                                </div>
                                <span>Sign In</span>
                            </Link>
                        )}
                    </div>

                    <div className="border-t border-text-muted/10 my-3"></div>

                    {/* Main Links */}
                    <div className="px-3 flex flex-col gap-1">
                        <Link
                            href={user ? "/favorites" : "/auth/login"}
                            className={`flex items-center gap-3 py-3 px-3 rounded-lg transition-all ${isActive('/favorites') ? 'bg-primary/10 text-primary font-bold' : 'text-text-main hover:bg-background-light'}`}
                            onClick={toggleMenu}
                        >
                            <FavoriteBorderOutlinedIcon className={isActive('/favorites') ? "text-primary" : "text-text-muted"} />
                            <span>My Favorites</span>
                        </Link>

                        <Link
                            href="/basket"
                            className={`flex items-center gap-3 py-3 px-3 rounded-lg transition-all ${isActive('/basket') ? 'bg-primary/10 text-primary font-bold' : 'text-text-main hover:bg-background-light'}`}
                            onClick={toggleMenu}
                        >
                            <ShoppingCartOutlinedIcon className={isActive('/basket') ? "text-primary" : "text-text-muted"} />
                            <span>My Basket</span>
                        </Link>
                    </div>

                    <div className="border-t border-text-muted/10 my-3"></div>

                    {/* Categories */}
                    <div className="px-3">
                        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider px-3 mb-3 mt-1">CATEGORIES</h3>
                        <div className="flex flex-col gap-1">
                            {categories.map((category) => {
                                const isCategoryActive = pathname === `/${category.slug}`;
                                return (
                                    <div key={category.id}>
                                        <div
                                            className={`flex justify-between items-center py-3 px-3 rounded-lg cursor-pointer transition-colors ${openCategory === category.id || isCategoryActive ? 'bg-background-light' : 'hover:bg-background-light'}`}
                                            onClick={() => category.subcategories?.length > 0 ? handleCategoryClick(category.id) : null}
                                        >
                                            <Link
                                                href={`/${category.slug}`}
                                                onClick={(e) => {
                                                    toggleMenu();
                                                }}
                                                className={`flex-grow font-medium ${isCategoryActive ? 'text-primary font-bold' : 'text-text-main'}`}
                                            >
                                                {category.name}
                                            </Link>
                                            {category.subcategories?.length > 0 && (
                                                <div onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    handleCategoryClick(category.id);
                                                }} className="p-1 text-text-muted hover:text-primary">
                                                    {openCategory === category.id ? <ExpandLess /> : <ExpandMore />}
                                                </div>
                                            )}
                                        </div>

                                        <Collapse in={openCategory === category.id} timeout="auto" unmountOnExit>
                                            <div className="pl-4 pr-2 py-1 flex flex-col gap-1">
                                                {category.subcategories?.map((subcategory) => {
                                                    const subPath = `/${category.slug}/${subcategory.slug}`;
                                                    return (
                                                        <Link
                                                            key={subcategory.id}
                                                            href={subPath}
                                                            className={`py-2 px-3 rounded text-sm transition-colors block ${isActive(subPath) ? 'text-primary font-bold bg-primary/5' : 'text-text-muted hover:text-primary hover:bg-background-light/50'}`}
                                                            onClick={toggleMenu}
                                                        >
                                                            {subcategory.name}
                                                        </Link>
                                                    )
                                                })}
                                            </div>
                                        </Collapse>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Logout */}
                    {user && (
                        <>
                            <div className="border-t border-text-muted/10 my-3"></div>
                            <div className="px-5">
                                <a
                                    href="/auth/logout"
                                    className="block w-full text-left py-3 px-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
                                >
                                    Log Out
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
