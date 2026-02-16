"use client";
import { useRouter } from "next/navigation";

export default function MyProfile() {
    const router = useRouter();
    return (
        router.push("/my-profile/user-information")
    )
}