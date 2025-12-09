"use client";
import { useSnackbar } from "notistack";
import CloseIcon from '@mui/icons-material/Close';
import { forwardRef } from "react";

function VerifyEmailAlert({ id, message },ref) {
    const { closeSnackbar } = useSnackbar();

    return (
        <div ref={ref} className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-md shadow-md flex items-center justify-between gap-4"
            style={{ minWidth: "350px" }}
        >
            <span className="font-medium">{message}</span>

            <button
                onClick={() => closeSnackbar(id)}
                className="text-yellow-700 hover:text-yellow-900 cursor-pointer"
            >
                <CloseIcon fontSize="small" />
            </button>
        </div>
    );
}

const verifyEmailAlertF = forwardRef(VerifyEmailAlert);
export default verifyEmailAlertF;