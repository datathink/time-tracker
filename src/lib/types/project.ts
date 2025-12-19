import { type Role } from "@/lib/schemas/role";

export interface Project {
    id: string;
    name: string;
    clientId: string;
    description: string | null;
    budgetAmount: number | null;
    status: string;
    color: string;
    client?: {
        name: string;
    } | null;
    _count?: {
        timeEntries: number;
        members?: number;
    };
}

export interface ProjectMemberUser {
    id: string;
    name: string | null;
    email: string;
    emailVerified: boolean;
    image: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProjectMember {
    id: string;
    projectId: string;
    userId: string;
    role: Role;
    payoutRate: number;
    chargeRate: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: ProjectMemberUser;
}

export interface ProjectClient {
    id: string;
    name: string;
    email: string | null;
    company: string | null;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProjectData {
    id: string;
    name: string;
    clientId: string;
    description: string | null;
    budgetAmount: number | null;
    status: string;
    color: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    client: ProjectClient | null;
    members: ProjectMember[];
}
