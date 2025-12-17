"use client";

import { UserList } from "@/components/users/UserList";
import { Prisma } from "@/generated/prisma/client";

type User = Prisma.UserGetPayload<{}>;

interface UsersPageClientProps {
    initialUsers: User[];
}

export function UsersPageClient({ initialUsers }: UsersPageClientProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Users</h1>
                    <p className="text-gray-600">Manage your users</p>
                </div>
            </div>

            <UserList users={initialUsers} />
        </div>
    );
}
