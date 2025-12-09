"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { User, UserProfile } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { deactivateUser, reactivateUser } from "@/lib/actions/user";
import { useTransition } from "react";

interface UserWithProfile extends User {
  profile: UserProfile | null;
}

interface UserListProps {
  users: UserWithProfile[];
}

export function UserList({ users }: UserListProps) {
  const [isPending, startTransition] = useTransition();

  const onDeactivate = (userId: string) => {
    startTransition(() => {
      deactivateUser(userId);
    });
  };

  const onReactivate = (userId: string) => {
    startTransition(() => {
      reactivateUser(userId);
    });
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="font-bold">Role</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.status === "active" ? (
                        <DropdownMenuItem
                          onClick={() => onDeactivate(user.id)}
                          disabled={isPending}
                        >
                          Deactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => onReactivate(user.id)}
                          disabled={isPending}
                        >
                          Reactivate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
