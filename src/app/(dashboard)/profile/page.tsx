"use client";

import { ProfileForm } from "@/components/profile/ProfileForm";

export default function ProfilePage() {
    return (
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-10">
                <h2 className="text-3xl font-semibold mb-6 text-center">Profile</h2>
                <ProfileForm />
            </div>
    );
}
