import { getValidatedSession } from "@/lib/auth/getValidatedSession";
import { getUserProfileForRSC } from "@/lib/actions/profile";
import { ProfilePageClient } from "./ProfilePageClient";

export default async function ProfilePage() {
    const session = await getValidatedSession();
    const profile = await getUserProfileForRSC(session.user.id);

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-10">
            <h2 className="text-3xl font-semibold mb-6 text-center">Profile</h2>
            <ProfilePageClient
                initialUser={{
                    id: session.user.id,
                    name: session.user.name,
                }}
                initialProfile={profile}
            />
        </div>
    );
}
