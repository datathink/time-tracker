"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { type ProfileFormData } from "@/lib/schemas/profile";
import { type UsernameUpdateData } from "@/lib/schemas/user";
import { createProfile, updateProfile } from "@/lib/actions/profile";
import { updateUserName } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

const profileFormSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    phoneNumber: z
        .string()
        .min(8, "Phone number should be 8 characters or more"),
    address: z.string().min(10, "Address is required"),
    birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date",
    }),
});

type FormData = z.infer<typeof profileFormSchema>;

interface ProfilePageClientProps {
    initialUser: {
        id: string;
        name: string;
    };
    initialProfile: {
        id: string;
        userId: string;
        phone: string | null;
        address: string | null;
        birthDate: Date | null;
    } | null;
}

export function ProfilePageClient({
    initialUser,
    initialProfile,
}: ProfilePageClientProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [existingProfile, setExistingProfile] = useState<{
        id: string;
        userId: string;
    } | null>(initialProfile);

    const methods = useForm<FormData>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            fullName: initialUser.name || "",
            phoneNumber: initialProfile?.phone || "",
            address: initialProfile?.address || "",
            birthDate: initialProfile?.birthDate
                ? format(new Date(initialProfile.birthDate), "yyyy-MM-dd")
                : "",
        },
    });

    const { handleSubmit } = methods;

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const profileData: ProfileFormData = {
            phoneNumber: data.phoneNumber,
            address: data.address,
            birthDate: data.birthDate,
        };

        const userNameData: UsernameUpdateData = { fullName: data.fullName };

        const result = existingProfile
            ? await updateProfile(existingProfile.id, profileData)
            : await createProfile(profileData);

        const nameResult = await updateUserName(initialUser.id, userNameData);

        if (result.success && !nameResult.success) {
            setSuccess(
                "Profile saved, but name update failed. Please try again."
            );
        }

        if (result.success && nameResult.success) {
            setSuccess("Profile saved successfully!");
            if (!existingProfile && result.data) {
                setExistingProfile(result.data);
            }
        } else {
            setError(result.error || "An unexpected error occurred");
        }

        setLoading(false);
    };

    return (
        <Form {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                        {success}
                    </div>
                )}

                <div className="space-y-6">
                    <FormField
                        name="fullName"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input
                                        id="fullName"
                                        type="text"
                                        {...field}
                                        disabled={loading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input
                                        id="phoneNumber"
                                        type="tel"
                                        {...field}
                                        disabled={loading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="birthDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Birth date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-between text-left font-normal",
                                                    !field.value &&
                                                        "text-muted-foreground"
                                                )}
                                                disabled={loading}
                                            >
                                                <span>
                                                    {field.value
                                                        ? format(
                                                              new Date(
                                                                  field.value + "T00:00:00"
                                                              ),
                                                              " MMMM do, yyyy"
                                                          )
                                                        : "Pick a date"}
                                                </span>
                                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={
                                                field.value
                                                    ? new Date(field.value + "T00:00:00")
                                                    : undefined
                                            }
                                            onSelect={(date) =>
                                                field.onChange(
                                                    date
                                                        ? format(
                                                              date,
                                                              "yyyy-MM-dd"
                                                          )
                                                        : ""
                                                )
                                            }
                                            disabled={(date) =>
                                                date > new Date() ||
                                                date < new Date("1900-01-01")
                                            }
                                            captionLayout="dropdown"
                                            className="rounded-md border"
                                            autoFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="address"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Textarea
                                        id="address"
                                        rows={5}
                                        {...field}
                                        disabled={loading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={loading}>
                        {loading
                            ? "Saving..."
                            : existingProfile
                              ? "Update"
                              : "Create"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
