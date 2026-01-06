"use client";
import { Button, InputAdornment, FormControl, OutlinedInput, FormLabel, FormHelperText, Autocomplete, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import "./form.css";
import CheckIcon from '@mui/icons-material/Check';


export default function NewAdresForm() {
    const user = useUser();

    const maxInputCharacter = 200;
    const maxInputErrorMessage = "Max 200 characters";
    const phoneRegex = /^\d*$/;
    const phoneErrorMessage = "Only numbers are allowed"
    const phoneMaxLength = 11;

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
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
                const res = await fetch("/api/locations/cities");
                const json = await res.json();
                if (!res.ok) throw new Error(json?.message || "Cities fetch failed");
                setCities(json);
            } catch (e) {
                console.log(e);
            } finally {
                setLoadingCities(false);
            }
        };

        fetchCities();
    }, []);

    useEffect(() => {
        const fetchDistricts = async () => {
            if (!selectedCityId) {
                setDistricts([]);
                setNeighborhoods([]);
                return;
            }

            try {
                setLoadingDistricts(true);
                const res = await fetch(`/api/locations/districts?cityId=${selectedCityId}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json?.message || "Districts fetch failed");
                setDistricts(json);
            } catch (e) {
                console.log(e);
            } finally {
                setLoadingDistricts(false);
            }
        };

        setValue("district_id", null);
        setValue("neighborhood_id", null);
        setNeighborhoods([]);

        fetchDistricts();
    }, [selectedCityId, setValue]);

    useEffect(() => {
        const fetchNeighborhoods = async () => {
            if (!selectedDistrictId) {
                setNeighborhoods([]);
                return;
            }

            try {
                setLoadingNeighborhoods(true);
                const res = await fetch(`/api/locations/neighborhoods?districtId=${selectedDistrictId}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json?.message || "Neighborhoods fetch failed");
                setNeighborhoods(json);
            } catch (e) {
                console.log(e);
            } finally {
                setLoadingNeighborhoods(false);
            }
        };

        setValue("neighborhood_id", null);

        fetchNeighborhoods();
    }, [selectedDistrictId, setValue]);

    const onSubmit = async (data) => {
        const res = await fetch("/api/my-profile/my-addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                address_title: data.address_title,
                recipient_first_name: data.recipient_first_name,
                recipient_last_name: data.recipient_last_name,
                recipient_phone: data.recipient_phone,
                city_id: data.city_id,
                district_id: data.district_id,
                neighborhood_id: data.neighborhood_id,
                address_line: data.address_line
            })
        });
        const dataJson = await res?.json();
        if (!res.ok) {
            console.log("Error", dataJson);
            return;
        }
        console.log("Updated user", dataJson);
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full pr-10">
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
                    className="w-full !rounded-xl border-gray-200 focus:!border-[#8DC8A1] p-1"
                />
                <FormHelperText>{errors.address_title?.message}</FormHelperText>
            </FormControl>

            <div className="flex flex-row justify-between gap-6">
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
                        className=" w-full !rounded-xl border-gray-200 focus:!border-[#8DC8A1] p-1"
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
                        className=" w-full !rounded-xl border-gray-200 focus:!border-[#8DC8A1] p-1"
                    />
                    <FormHelperText>{errors.recipient_last_name?.message}</FormHelperText>
                </FormControl>
            </div>
            <div className="flex flex-row justify-between gap-6 items-center">
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
                        className="w-full !rounded-xl border-gray-200 focus:!border-[#8DC8A1] p-1"
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
                                getOptionLabel={(opt) => opt.name ?? null}
                                isOptionEqualToValue={(opt, value) => opt.id === value.id}
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
            <div className="flex flex-row justify-between gap-6 items-center">
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
                        disabled={selectedDistrictId}
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
            <FormControl fullWidth error={!!errors.address_title}>
                <FormLabel className="!mb-2 !mt-4">ADDRESS</FormLabel>
                <OutlinedInput
                    {...register("address_title", {
                        required: "Address title is required",
                        maxLength: {
                            value: maxInputCharacter,
                            message: maxInputErrorMessage,
                        },
                    })}
                    rows={3}
                    className="w-full !rounded-xl border-gray-200 focus:!border-[#8DC8A1] p-1"
                    placeholder="Street, building number, apartment number and other address details..."
                />
                <FormHelperText>{errors.address_title?.message}</FormHelperText>
            </FormControl>
            <Button
                startIcon={<CheckIcon />}
                type="submit"
                className="float-right cursor-pointer !mt-4 w-auto px-8 h-10 rounded-lg !bg-[#8DC8A1] !text-white hover:!bg-[#7AB38D]">
                Save
            </Button>
        </form>
    );
}