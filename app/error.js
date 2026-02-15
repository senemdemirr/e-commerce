"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F6F7F7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-2xl font-semibold text-red-600">
          !
        </div>
        <h1 className="text-2xl font-semibold text-text-dark">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          An unexpected error occurred. Please try again or return to the home page.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-md border border-gray-300 px-4 py-2 font-medium text-text-dark transition-colors hover:bg-gray-50"
          >
            Home page
          </Link>
        </div>
      </div>
    </div>
  );
}
