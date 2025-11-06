"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns"
import { type ProfileFormData } from "@/lib/schemas/profile";
import { createProfile, updateProfile } from "@/lib/actions/profile";
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


const profileFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phoneNumber: z.string().min(8, "Phone number should be 8 characters or more"),
    address: z.string().min(10, "Address is required"),
    birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date",
    }),
})

type FormData = z.infer<typeof profileFormSchema>;


interface ProfileFormProps {
    profile?: {
        id: string;
        userId: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string | null;
        address: string | null;
        birthDate: Date | null;
    };
}
export function ProfileForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const methods = useForm<FormData>({
        resolver: zodResolver(profileFormSchema),
    })


    const { handleSubmit, reset } = methods;

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError(null);

        // Transform the form data to match ProfileFormData type
        const profileData: ProfileFormData = {
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            address: data.address,
            birthDate: data.birthDate,
        };

        const result =  await createProfile(profileData);

        if (result.success) {
            reset();
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

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First name</FormLabel>
                                <FormControl>
                                    <Input id="firstName" type="text" {...field} disabled={loading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last name</FormLabel>
                                <FormControl>
                                    <Input id="lastName" type="text" {...field} disabled={loading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                    <Input id="phoneNumber" type="tel" {...field} disabled={loading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="birthDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Birth date</FormLabel>
                                <FormControl>
                                    <Input id="birthDate" type="date" {...field} disabled={loading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="address"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Textarea id="address" rows={3} {...field} disabled={loading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Create"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}