import { getValidatedSessionWithRole } from "@/lib/auth/getValidatedSession";
import { getClientsForRSC } from "@/lib/actions/clients";
import { ClientsPageClient } from "./ClientsPageClient";
import { AccessDenied } from "@/components/common/AccessDenied";

export default async function ClientsPage() {
    const { isAdmin } = await getValidatedSessionWithRole();

    if (!isAdmin) {
        return <AccessDenied message="You do not have permission to access this page." />;
    }

    const clients = await getClientsForRSC();

    return <ClientsPageClient initialClients={clients} />;
}
