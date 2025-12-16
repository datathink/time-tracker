import { getValidatedSession } from "@/lib/auth/getValidatedSession";
import { EntriesPageClient } from "./EntriesPageClient";

export default async function EntriesPage() {
    // Validate session - redirects to /login if invalid
    await getValidatedSession();

    return <EntriesPageClient />;
}
