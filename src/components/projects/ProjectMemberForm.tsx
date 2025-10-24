"use client";

import { useState, useEffect } from "react";
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
import { addProjectMember, getAllUsers } from "@/lib/actions/project-members";
import { Loader2 } from "lucide-react";
import { Prisma } from "@prisma/client";

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
    const [selectedUserId, setSelectedUserId] = useState("");
    const [contractorRate, setContractorRate] = useState("");
    const [chargeRate, setChargeRate] = useState("");
    const [role, setRole] = useState<"owner" | "manager" | "member">("member");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadUsers = async () => {
            const result = await getAllUsers();
            if (result.success) {
                // Filter out users who are already members
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedUserId) {
            setError("Please select a user");
            return;
        }

        if (!contractorRate || parseFloat(contractorRate) <= 0) {
            setError("Please enter a valid hourly rate");
            return;
        }

        setLoading(true);

        const result = await addProjectMember({
            projectId,
            userId: selectedUserId,
            contractorRate: parseFloat(contractorRate),
            chargeRate: parseFloat(chargeRate),
            role,
        });

        setLoading(false);

        if (result.success) {
            onOpenChange(false);
            setSelectedUserId("");
            setContractorRate("");
            setChargeRate("");
            setRole("member");
            if (onSuccess) onSuccess();
        } else {
            setError(result.error || "Failed to add member");
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="user">User</Label>
                        <Select
                            value={selectedUserId}
                            onValueChange={setSelectedUserId}
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
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contractorRate">Contractor Rate ($)</Label>
                        <Input
                            id="contractorRate"
                            type="number"
                            step="0.01"
                            min="0"
                            value={contractorRate}
                            onChange={(e) => setContractorRate(e.target.value)}
                            placeholder="75.00"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="chargeRate">Charge Rate ($)</Label>
                        <Input
                            id="chargeRate"
                            type="number"
                            step="0.01"
                            min="0"
                            value={chargeRate}
                            onChange={(e) => setChargeRate(e.target.value)}
                            placeholder="150.00"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={role}
                            onValueChange={(value) =>
                                setRole(value as "owner" | "manager" | "member")
                            }
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

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Add Member
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
