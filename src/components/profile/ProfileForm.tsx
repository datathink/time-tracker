"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns"
import { type ProfileFormData } from "@/lib/schemas/profile";


const profileFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email"),
    phoneNumber: z.string().min(8, "Phone number is required"),
    address: z.string().min(10, "Address is required"),
    birthDate: z.string().min(1, "Date is required"),
})

type FormData = z.infer<typeof profileFormSchema>;


interface ProfileFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profile?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        address: string;
        birthDate: Date;
    };
    onSuccess?: () => void;
}

export function ProfileForm({
    open,
    onOpenChange,
    profile,
    onSuccess,
}: ProfileFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: profile?.firstName || "",
            lastName: profile?.lastName || "",
            email: profile?.email || "",
            phoneNumber: profile?.phoneNumber || "",
            address: profile?.address || "",
            birthDate: profile?.birthDate
                ? format(new Date(profile.birthDate), "yyyy-MM-dd")
                : format(new Date(), "yyyy-MM-dd"),
        },
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError(null);

        // Transform the form data to match ProfileFormData type
        const profileData: ProfileFormData = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            address: data.address,
            birthDate: data.birthDate,
        };

        const result = profile
            ? await updateProfile(profile.id, profileData)
            : await createProfile(profileData);

        if (result.success) {
            reset();
            onOpenChange(false);
            if (onSuccess) {
                onSuccess();
            }
        } else {
            setError(result.error || "An unexpected error occurred");
        }

        setLoading(false);
    };

    return (


            }