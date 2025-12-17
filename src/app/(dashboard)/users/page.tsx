import { getValidatedSessionWithRole } from "@/lib/auth/getValidatedSession";
import { getUsersForRSC } from "@/lib/actions/user";
import { UsersPageClient } from "./UsersPageClient";
import { AccessDenied } from "@/components/common/AccessDenied";

export default async function UsersPage() {
    const { isAdmin } = await getValidatedSessionWithRole();

    if (!isAdmin) {
        return <AccessDenied message="You do not have permission to access this page." />;
    }

    const users = await getUsersForRSC();

    return <UsersPageClient initialUsers={users} />;
}
