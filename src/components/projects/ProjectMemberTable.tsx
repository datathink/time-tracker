"use client";

import { useState } from "react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Ban,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import {
    removeProjectMember,
    updateProjectMember,
} from "@/lib/actions/project-members";
import { type Role, ROLE_OPTIONS } from "@/lib/schemas/role";

// Helper to get initials
function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}
interface ProjectMember {
    id: string;
    isActive: boolean;
    chargeRate: number;
    payoutRate: number;
    role: Role;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
}
export function ProjectMemberTable({
    members,
    onUpdate,
}: {
    members: ProjectMember[];
    onUpdate: () => void;
}) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [editingMember, setEditingMember] = useState<ProjectMember | null>(
        null
    );
    const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(
        null
    );

    const [editForm, setEditForm] = useState({
        chargeRate: "",
        payoutRate: "",
        role: "member" as Role,
    });
    const [isSaving, setIsSaving] = useState(false);

    // 1. Handle Remove Member
    const handleRemove = async () => {
        if (!memberToRemove) return;

        setLoadingId(memberToRemove.id);
        try {
            const result = await removeProjectMember(memberToRemove.id);
            if (result.success) {
                onUpdate();
            } else {
                console.error(result.error);
            }
        } catch (error) {
            console.error("Something went wrong during removal.");
        } finally {
            setLoadingId(null);
            setMemberToRemove(null);
        }
    };

    // 2. Handle Deactivate / Activate
    const handleToggleStatus = async (member: ProjectMember) => {
        const newStatus = !member.isActive;

        setLoadingId(member.id);
        try {
            const result = await updateProjectMember(member.id, {
                isActive: newStatus,
            });

            if (result.success) {
                onUpdate();
            } else {
                console.error(result.error);
            }
        } catch (error) {
            console.error("Something went wrong.");
        } finally {
            setLoadingId(null);
        }
    };

    // 3. Open Edit Modal
    const openEditModal = (member: ProjectMember) => {
        setEditingMember(member);
        setEditForm({
            chargeRate: member.chargeRate.toString(),
            payoutRate: member.payoutRate.toString(),
            role: member.role,
        });
    };

    // 4. Save Rates
    const saveChanges = async () => {
        if (!editingMember) return;

        setIsSaving(true);
        try {
            const result = await updateProjectMember(editingMember.id, {
                chargeRate: parseFloat(editForm.chargeRate) || 0,
                payoutRate: parseFloat(editForm.payoutRate) || 0,
                role: editForm.role,
            });

            if (result.success) {
                setEditingMember(null); // Close modal
                onUpdate();
            } else {
                console.error(result.error);
            }
        } catch (error) {
            console.error("Failed to update member.");
        } finally {
            setIsSaving(false);
        }
    };

    if (members.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                No team members found. Add one to get started.
            </div>
        );
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Charge Rate</TableHead>
                        <TableHead>Payout Rate</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((member) => (
                        <TableRow
                            key={member.id}
                            className={
                                !member.isActive ? "opacity-60 bg-gray-50" : ""
                            }
                        >
                            {/* User Info */}
                            <TableCell className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback
                                        className={
                                            member.isActive
                                                ? "bg-primary/10 text-primary"
                                                : ""
                                        }
                                    >
                                        {getInitials(member.user.name || "U")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">
                                        {member.user.name}
                                        {!member.isActive && (
                                            <span className="text-xs text-muted-foreground ml-2">
                                                (Inactive)
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {member.user.email}
                                    </span>
                                </div>
                            </TableCell>

                            {/* Status Badge */}
                            <TableCell>
                                <Badge
                                    variant={
                                        member.isActive
                                            ? "outline"
                                            : "secondary"
                                    }
                                >
                                    {member.isActive ? member.role : "Inactive"}
                                </Badge>
                            </TableCell>

                            {/* Financials */}
                            <TableCell>
                                <span className="font-mono text-sm">
                                    ${member.chargeRate.toFixed(2)}
                                    <span className="text-muted-foreground text-xs ml-1">
                                        /hr
                                    </span>
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className="font-mono text-sm">
                                    ${member.payoutRate.toFixed(2)}
                                    <span className="text-muted-foreground text-xs ml-1">
                                        /hr
                                    </span>
                                </span>
                            </TableCell>

                            {/* Actions Menu */}
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            disabled={loadingId === member.id}
                                        >
                                            <span className="sr-only">
                                                Open menu
                                            </span>
                                            {loadingId === member.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <MoreHorizontal className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() =>
                                                openEditModal(member)
                                            }
                                        >
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit User
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />

                                        {member.isActive ? (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleToggleStatus(member)
                                                }
                                                className="text-orange-600 focus:text-orange-700 focus:bg-orange-50"
                                            >
                                                <Ban className="mr-2 h-4 w-4" />
                                                Deactivate
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleToggleStatus(member)
                                                }
                                                className="text-green-600 focus:text-green-700 focus:bg-green-50"
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Activate
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuItem
                                            onClick={() =>
                                                setMemberToRemove(member)
                                            }
                                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Remove
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Edit Member Modal */}
            <Dialog
                open={!!editingMember}
                onOpenChange={(open) => !open && setEditingMember(null)}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Member</DialogTitle>
                        <DialogDescription>
                            Adjust financial rates and role for{" "}
                            {editingMember?.user.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Role
                        </Label>
                        <Select
                            value={editForm.role}
                            onValueChange={(value) =>
                                setEditForm({
                                    ...editForm,
                                    role: value as Role,
                                })
                            }
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {ROLE_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="charge" className="text-right">
                                Charge ($)
                            </Label>
                            <Input
                                id="charge"
                                type="number"
                                min="0"
                                step="0.01"
                                value={editForm.chargeRate}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        chargeRate: e.target.value,
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="payout" className="text-right">
                                Payout ($)
                            </Label>
                            <Input
                                id="payout"
                                type="number"
                                min="0"
                                step="0.01"
                                value={editForm.payoutRate}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        payoutRate: e.target.value,
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditingMember(null)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>

                        <Button onClick={saveChanges} disabled={isSaving}>
                            {isSaving && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <AlertDialog
                open={!!memberToRemove}
                onOpenChange={(open) => !open && setMemberToRemove(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure you want to remove this member?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove{" "}
                            <span className="font-bold">
                                {memberToRemove?.user.name}
                            </span>{" "}
                            from this project. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            //variant="destructive"
                            onClick={handleRemove}
                        >
                            Remove
                        </AlertDialogAction>{" "}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
