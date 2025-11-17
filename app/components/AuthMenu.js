"use client"
import { useState, useRef } from "react";
import { Button, Menu, MenuItem } from '@mui/material';
import Link from "next/link";
import PersonIcon from '@mui/icons-material/Person2Outlined';

export default function AuthMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);

    function handleMouseEnter() {
        setIsOpen(true);
    }
    function handleMouseLeave() {
        setIsOpen(false);
    }
    return (
        <>
            < div onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}>
                <Button
                    id="auth-button"
                    ref={buttonRef}
                    className="!text-gray-600 px-4 py-2 rounded mr-2 border-none !cursor-pointer relative"
                    startIcon={<PersonIcon className="text-gray-600" />}
                    aria-controls={isOpen ? 'auth-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={isOpen ? 'true' : undefined}
                >
                    Sign In
                </Button>
                <Menu
                    id="auth-menu"
                    anchorEl={buttonRef.current}
                    open={isOpen}
                    aria-labelledby="auth-button"
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    aria-hidden="false"
                    slotProps={{
                        paper: {
                            onMouseEnter: handleMouseEnter,
                            onMouseLeave: handleMouseLeave,
                        },
                    }}
                >
                    <MenuItem>
                        <Link href="/signin" className="w-full block">Sign in</Link>
                    </MenuItem>
                    <MenuItem>
                        <Link href="/signup" className="w-full block">Sign up</Link>
                    </MenuItem>
                </Menu>
            </div></>
    )
} 