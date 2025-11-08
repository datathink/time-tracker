"use client";

import { ProfileForm } from "@/components/profile/ProfileForm";
import { Prisma } from "@prisma/client";
import { useState, useEffect } from "react";
import { getUserProfile } from "@/lib/actions/profile";

export default function ProfilePage() {
    return <ProfileForm />;
}
