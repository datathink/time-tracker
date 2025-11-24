"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { type ProfileFormData } from "@/lib/schemas/profile";
import { type UsernameUpdateData } from "@/lib/schemas/user";
import {
  createProfile,
  updateProfile,
  getUserProfile,
} from "@/lib/actions/profile";
import { updateUserName } from "@/lib/actions/user";
import { useSession } from "@/lib/auth/client";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";

const profileFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().min(8, "Phone number should be 8 characters or more"),
  address: z.string().min(10, "Address is required"),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
});

type FormData = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingProfile, setExistingProfile] = useState<{
    id: string;
    userId: string;
  } | null>(null);

  const methods = useForm<FormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      address: "",
      birthDate: "",
    },
  });

  const { handleSubmit, reset } = methods;
  const { data: session, refetch } = useSession();

  // Load existing profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      const result = await getUserProfile();
      if (result.success && result.data) {
        setExistingProfile(result.data);
        // Pre-populate form fields
        reset({
          fullName: session?.user?.name || "",
          phoneNumber: result.data.phone || "",
          address: result.data.address || "",
          birthDate: result.data.birthDate
            ? format(new Date(result.data.birthDate), "yyyy-MM-dd")
            : "",
        });
      }
    };
    loadProfile();
  }, [reset, session?.user?.name]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Transform the form data to match ProfileFormData type
    const profileData: ProfileFormData = {
      phoneNumber: data.phoneNumber,
      address: data.address,
      birthDate: data.birthDate,
    };

    // Prepare the full name from form data to match UsernameUpdateData type
    const userNameData: UsernameUpdateData = { fullName: data.fullName };

    // Decide whether to create or update
    const result = existingProfile
      ? await updateProfile(existingProfile.id, profileData)
      : await createProfile(profileData);

    // Update user name regardless of profile creation or update
    const nameResult = session?.user?.id
      ? await updateUserName(session.user.id, userNameData)
      : { success: true };

    if (result.success && !nameResult.success) {
      setSuccess("Profile saved, but name update failed. Please try again.");
    }

    if (result.success && nameResult.success) {
      setSuccess("Profile saved successfully!");
      refetch();
      // If we just created a profile, update the existingProfile state
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
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={loading}
                      >
                        <span>
                          {field.value
                            ? format(new Date(field.value), " MMMM do, yyyy")
                            : "Pick a date"}
                        </span>
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
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
            {loading ? "Saving..." : existingProfile ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
