"use client";
import { usePathname, useRouter } from "next/navigation";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

export default function Tabs() {
  const pathname = usePathname();
  const router = useRouter();

  const tabIndex = pathname === "/signup" ? 1 : 0;

  function handleTabChange(index) {
    if (index === 0) router.push("/signin");
    else router.push("/signup");
  }

  return (
    <div className="tabs-container pt-2 w-100 mx-auto border-gray-200 border">
      <div className="tabs-header flex w-full justify-between">
        <button
          onClick={() => handleTabChange(0)}
          className={`tab w-50 px-4 py-2 cursor-pointer ${tabIndex === 0 ? "font-bold border-b-2 border-orange-500" : ""}`}
        >
          Sign In
        </button>
        <button
          onClick={() => handleTabChange(1)}
          className={`tab w-50 px-4 py-2 cursor-pointer ${tabIndex === 1 ? "font-bold border-b-2 border-orange-500" : ""}`}
        >
          Sign Up
        </button>
      </div>
      <div className="tab-content mt-4">
        {tabIndex === 0 ? <SignInForm /> : <SignUpForm />}
      </div>
    </div>
  );
}
