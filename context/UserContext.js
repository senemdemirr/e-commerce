"use client";
import { createContext, useContext, useEffect, useState } from "react"

const UserContext = createContext(null);

export function UserProvider({ user, children }) {
    const [currentUser, setCurrentUser] = useState(user ?? null);

    useEffect(() => {
        setCurrentUser(user ?? null);
    }, [user]);

    return (
        <UserContext.Provider value={{ user: currentUser, setUser: setCurrentUser }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser(){
    return useContext(UserContext)?.user ?? null;
}

export function useSetUser() {
    return useContext(UserContext)?.setUser ?? null;
}
