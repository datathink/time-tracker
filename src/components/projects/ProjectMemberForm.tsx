"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Prisma } from "@prisma/client";
import { addProjectMember, getAllUsers } from "@/lib/actions/project-members";

const formSchema = z.object({
  userId: z.string().min(1, "Please select a user"),
  contractorRate: z
    .string()
    .refine((val) => parseFloat(val) > 0, "Enter a valid contractor rate"),
  chargeRate: z
    .string()
    .refine((val) => parseFloat(val) > 0, "Enter a valid client charge rate"),
  role: z.enum(["owner", "manager", "member"]),
});

type FormData = z.infer<typeof formSchema>;

type UserSelectData = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
  };
}>;

interface ProjectMemberFormProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  existingMemberIds?: string[];
}

export function ProjectMemberForm({
  projectId,
  open,
  onOpenChange,
  onSuccess,
  existingMemberIds = [],
}: ProjectMemberFormProps) {
  const [users, setUsers] = useState<UserSelectData[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      contractorRate: "",
      chargeRate: "",
      role: "member",
    },
  });

  // ✅ Load available users
  useEffect(() => {
    const loadUsers = async () => {
      const result = await getAllUsers();
      if (result.success) {
        const availableUsers = result.data.filter(
          (user) => !existingMemberIds.includes(user.id)
        );
        setUsers(availableUsers);
      }
    };

    if (open) {
      loadUsers();
    }
  }, [open, existingMemberIds]);

  // ✅ Submit handler
  const onSubmit = async (data: FormData) => {
    setLoading(true);

    const result = await addProjectMember({
      projectId,
      userId: data.userId,
      contractorRate: parseFloat(data.contractorRate),
      chargeRate: parseFloat(data.chargeRate),
      role: data.role,
    });

    setLoading(false);

    if (result.success) {
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } else {
      form.setError("root", {
        message: result.error || "Failed to add member",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add a user to this project and set their hourly rate
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {form.formState.errors.root && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {form.formState.errors.root.message}
            </div>
          )}

          {/* User Field */}
          <div className="space-y-2">
            <Label>User</Label>
            <Select
              onValueChange={(value) => form.setValue("userId", value)}
              value={form.watch("userId")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.userId && (
              <p className="text-sm text-red-500">
                {form.formState.errors.userId.message}
              </p>
            )}
          </div>

          {/* Contractor Rate */}
          <div className="space-y-2">
            <Label htmlFor="contractorRate">Contractor Rate ($)</Label>
            <Input
              id="contractorRate"
              type="number"
              step="0.01"
              min="0"
              {...form.register("contractorRate")}
              placeholder="75.00"
            />
            {form.formState.errors.contractorRate && (
              <p className="text-sm text-red-500">
                {form.formState.errors.contractorRate.message}
              </p>
            )}
          </div>

          {/* Charge Rate */}
          <div className="space-y-2">
            <Label htmlFor="chargeRate">Charge Rate ($)</Label>
            <Input
              id="chargeRate"
              type="number"
              step="0.01"
              min="0"
              {...form.register("chargeRate")}
              placeholder="150.00"
            />
            {form.formState.errors.chargeRate && (
              <p className="text-sm text-red-500">
                {form.formState.errors.chargeRate.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              onValueChange={(value: "owner" | "manager" | "member") =>
                form.setValue("role", value)
              }
              value={form.watch("role")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
