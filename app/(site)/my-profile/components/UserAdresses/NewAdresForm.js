"use client";
import { Button, InputAdornment, FormControl, OutlinedInput, FormLabel, FormHelperText, Autocomplete, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import { useEffect, useState } from "react";
import "./form.css";
import CheckIcon from '@mui/icons-material/Check';
import { apiFetch } from "@/lib/apiFetch/fetch";
import { useSnackbar } from "notistack";


export default function NewAdresForm({ mode, initialData, onSuccess, onCancel }) {
    const { enqueueSnackbar } = useSnackbar();
    const maxInputCharacter = 200;
    const maxInputErrorMessage = "Max 200 characters";
    const phoneRegex = /^\d*$/;
    const phoneErrorMessage = "Only numbers are allowed"
    const phoneMaxLength = 11;

    const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm({
        defaultValues: {
            address_title: "",
            address_line: "",
            recipient_first_name: "",
            recipient_last_name: "",
            recipient_phone: "",
            city_id: null,
            district_id: null,
            neighborhood_id: null,
        },
    });
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);

    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

    const selectedCityId = watch("city_id");
    const selectedDistrictId = watch("district_id");

    useEffect(() => {
        const fetchCities = async () => {
            try {
                setLoadingCities(true);
                const data = await apiFetch("/api/locations/cities");
                setCities(Array.isArray(data) ? data : []);
            } catch (e) {
                console.log(e);
                enqueueSnackbar("Failed to load city list.", { variant: "error" });
            } finally {
                setLoadingCities(false);
            }
        };

        fetchCities();
    }, [enqueueSnackbar]);

    useEffect(() => {
        const fetchDistricts = async () => {
            if (!selectedCityId) {
                setDistricts([]);
                setNeighborhoods([]);
                return;
            }

            try {
                setLoadingDistricts(true);
                const data = await apiFetch(`/api/locations/districts?cityId=${selectedCityId}`);
                setDistricts(Array.isArray(data) ? data : []);
            } catch (e) {
                console.log(e);
                enqueueSnackbar("Failed to load district list.", { variant: "error" });
            } finally {
                setLoadingDistricts(false);
            }
        };
        setNeighborhoods([]);

        fetchDistricts();
    }, [selectedCityId, enqueueSnackbar]);

    useEffect(() => {
        const fetchNeighborhoods = async () => {
            if (!selectedDistrictId) {
                setNeighborhoods([]);
                return;
            }

            try {
                setLoadingNeighborhoods(true);
                const data = await apiFetch(`/api/locations/neighborhoods?districtId=${selectedDistrictId}`);
                setNeighborhoods(Array.isArray(data) ? data : []);
            } catch (e) {
                console.log(e);
                enqueueSnackbar("Failed to load neighborhood list.", { variant: "error" });
            } finally {
                setLoadingNeighborhoods(false);
            }
        };

        fetchNeighborhoods();
    }, [selectedDistrictId, enqueueSnackbar]);

    useEffect(() => {
        if (mode === "edit" && initialData) {
            reset({
                address_title: initialData.address_title ?? "",
                address_line: initialData.address_line ?? "",
                recipient_first_name: initialData.recipient_first_name ?? "",
                recipient_last_name: initialData.recipient_last_name ?? "",
                recipient_phone: initialData.recipient_phone ?? "",
                city_id: initialData.city_id ?? null,
                district_id: initialData.district_id ?? null,
                neighborhood_id: initialData.neighborhood_id ?? null,
            })
        }
        else {
            reset();
        }
    }, [mode, initialData, reset])

    const onSubmit = async (data) => {
        try {
            if (mode == "create") {
                const res = await apiFetch("/api/my-profile/my-addresses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });
                if (res?.message !== "Successfully") {
                    throw new Error(res?.message || "Failed to create address.");
                }
                enqueueSnackbar("Address created successfully.", { variant: "success" });
            }
            else {
                const res = await apiFetch(`/api/my-profile/my-addresses/${initialData.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });
                if (res?.message !== "Successfull") {
                    throw new Error(res?.message || "Failed to update address.");
                }
                enqueueSnackbar("Address updated successfully.", { variant: "success" });
            }
            onSuccess?.()
        }
        catch (error) {
            console.log(error);
            enqueueSnackbar("An error occurred while saving the address.", { variant: "error" });
        }

    };
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full pr-4 md:pr-10">
            <FormControl fullWidth error={!!errors.address_title}>
                <FormLabel className="!mb-2 !mt-4">ADDRESS TITLE</FormLabel>
                <OutlinedInput
                    {...register("address_title", {
                        required: "Address title is required",
                        maxLength: {
                            value: maxInputCharacter,
                            message: maxInputErrorMessage,
                        },
                    })}
                    size="small"
                    className="w-full !rounded-xl border-gray-200 focus:!border-primary p-1"
                />
                <FormHelperText>{errors.address_title?.message}</FormHelperText>
            </FormControl>

            <div className="flex flex-col md:flex-row justify-between gap-6">
                <FormControl fullWidth error={!!errors.recipient_first_name}>
                    <FormLabel className="!mb-2 !mt-4">NAME</FormLabel>
                    <OutlinedInput
                        {...register("recipient_first_name", {
                            required: "Recipient name is required",
                            maxLength: {
                                value: maxInputCharacter,
                                message: maxInputErrorMessage,
                            },
                        })}
                        size="small"
                        className=" w-full !rounded-xl border-gray-200 focus:!border-primary p-1"
                    />
                    <FormHelperText>{errors.recipient_first_name?.message}</FormHelperText>
                </FormControl>
                <FormControl fullWidth error={!!errors.recipient_last_name}>
                    <FormLabel className="!mb-2 !mt-4">SURNAME</FormLabel>
                    <OutlinedInput
                        {...register("recipient_last_name", {
                            required: "Recipient surname is required",
                            maxLength: {
                                value: maxInputCharacter,
                                message: maxInputErrorMessage,
                            },
                        })}
                        size="small"
                        className=" w-full !rounded-xl border-gray-200 focus:!border-primary p-1"
                    />
                    <FormHelperText>{errors.recipient_last_name?.message}</FormHelperText>
                </FormControl>
            </div>
            <div className="flex flex-col md:flex-row justify-between gap-6 items-center">
                <FormControl fullWidth error={!!errors.recipient_phone}>
                    <FormLabel className="!mb-2 !mt-4">PHONE</FormLabel>
                    <OutlinedInput
                        {...register("recipient_phone", {
                            pattern: {
                                value: phoneRegex,
                                message: phoneErrorMessage,
                            },
                        })}
                        type="text"
                        inputProps={{
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                            maxLength: phoneMaxLength
                        }}
                        onInput={(e) => {
                            e.target.value = e.target.value.replace(/[^0-9]/g, "");
                        }}
                        startAdornment={
                            <InputAdornment position="start">
                                <PhoneIphoneIcon className="text-[#9CA3AF]" />
                            </InputAdornment>
                        }
                        size="small"
                        className="w-full !rounded-xl border-gray-200 focus:!border-primary p-1"
                    />
                    <FormHelperText>{errors.recipient_phone?.message}</FormHelperText>
                </FormControl>
                <FormControl fullWidth error={!!errors.city_id}>
                    <FormLabel className="!mb-2 !mt-4">City</FormLabel>
                    <Controller
                        name="city_id"
                        control={control}
                        rules={{ required: "City is required" }}
                        render={({ field }) => (
                            <Autocomplete
                                options={cities}
                                loading={loadingCities}
                                value={cities.find((c) => c.id === field.value) || null}
                                onChange={(_, option) => field.onChange(option ? option.id : null)}
                                getOptionLabel={(opt) => opt?.name ?? ""}
                                isOptionEqualToValue={(opt, value) => opt.id === value?.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Select city"
                                        error={!!errors.city_id?.message}
                                    />
                                )}
                            />
                        )}
                    />
                </FormControl>
            </div>
            <div className="flex flex-col md:flex-row justify-between gap-6 items-center">
                <FormControl fullWidth error={!!errors.district_id}>
                    <FormLabel className="!mb-2 !mt-4">DISTRICT</FormLabel>
                    <Controller
                        name="district_id"
                        control={control}
                        rules={{ required: "District is required" }}
                        disabled={!selectedCityId}
                        render={({ field }) => (
                            <Autocomplete
                                options={districts}
                                loading={loadingDistricts}
                                value={districts.find((d) => d.id === field.value) || null}
                                onChange={(_, option) => field.onChange(option ? option.id : null)}
                                getOptionLabel={(opt) => opt.name ?? null}
                                isOptionEqualToValue={(opt, value) => opt.id === value.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder={selectedCityId ? "Select district" : "Select city first"}
                                        error={!!errors.district_id?.message}
                                        size="small"
                                    />
                                )}
                            />
                        )}
                    />
                </FormControl>
                <FormControl fullWidth error={!!errors.neighborhood_id}>
                    <FormLabel className="!mb-2 !mt-4">NEIGHBORHOOD</FormLabel>
                    <Controller
                        name="neighborhood_id"
                        control={control}
                        disabled={!selectedDistrictId}
                        render={({ field }) => (
                            <Autocomplete
                                options={neighborhoods}
                                loading={loadingNeighborhoods}
                                value={neighborhoods.find((n) => n.id === field.value) || null}
                                onChange={(_, option) => field.onChange(option ? option.id : null)}
                                getOptionLabel={(opt) => opt.name ?? null}
                                isOptionEqualToValue={(opt, value) => opt.id === value.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder={selectedDistrictId ? "Select neighborhood" : "Select district first"}
                                        error={!!errors.neighborhood_id?.message}
                                        size="small"
                                    />
                                )}
                            />
                        )}
                    />
                </FormControl>
            </div>
            <FormControl fullWidth error={!!errors.address_line}>
                <FormLabel className="!mb-2 !mt-4">ADDRESS</FormLabel>
                <OutlinedInput
                    {...register("address_line", {
                        required: "Address is required",
                        maxLength: {
                            value: maxInputCharacter,
                            message: maxInputErrorMessage,
                        },
                    })}
                    className="w-full !rounded-xl border-gray-200 focus:!border-primary p-1"
                    placeholder="Street, building number, apartment number and other address details..."
                />
                <FormHelperText>{errors.address_line?.message}</FormHelperText>
            </FormControl>
            <div className="mt-4 flex items-center justify-end gap-3">
                {onCancel && (
                    <Button
                        type="button"
                        onClick={onCancel}
                        className="cursor-pointer !px-8 !h-10 !rounded-lg !border !border-gray-300 !text-text-main hover:!bg-gray-50"
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    startIcon={<CheckIcon />}
                    type="submit"
                    className="cursor-pointer !px-8 !h-10 !rounded-lg !bg-primary !text-white hover:!bg-primary-dark"
                >
                    Save
                </Button>
            </div>
        </form>
    );
}
