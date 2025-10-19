import { auth } from "@/lib/auth/auth"
import { toNextJsHandler } from "better-auth/next-js"

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs'

export const { GET, POST } = toNextJsHandler(auth)
