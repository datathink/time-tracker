"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns"
import { type ProfileFormData } from "@/lib/schemas/profile";
import { createProfile, updateProfile } from "@/lib/actions/profile";
import


const profileFormSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email"),
    phoneNumber: z.string().min(8, "Phone number shoulg be 8 characters or more").optional(),
    address: z.string().optional(),
    birthDate: z.string().optional(),
})

type FormData = z.infer<typeof profileFormSchema>;


interface ProfileFormProps {
    profile?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phoneNumber: string | null;
        address: string | null;
        birthDate: Date | null;
    };
}

export function ProfileForm({
    profile,
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
        } else {
            setError(result.error || "An unexpected error occurred");
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
    );


            }