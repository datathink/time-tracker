"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  updateProjectMember,
  removeProjectMember,
} from "@/lib/actions/project-members"
import { UserX, Edit2, Check, X } from "lucide-react"

interface ProjectMember {
  id: string
  role: string
  hourlyRate: any
  isActive: boolean
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface ProjectMemberListProps {
  members: ProjectMember[]
  canManage: boolean
  onUpdate?: () => void
}

export function ProjectMemberList({
  members,
  canManage,
  onUpdate,
}: ProjectMemberListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRate, setEditRate] = useState("")

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return

    const result = await removeProjectMember(memberId)
    if (result.success && onUpdate) {
      onUpdate()
    }
  }

  const handleToggleActive = async (memberId: string, isActive: boolean) => {
    const result = await updateProjectMember(memberId, { isActive: !isActive })
    if (result.success && onUpdate) {
      onUpdate()
    }
  }

  const startEdit = (member: ProjectMember) => {
    setEditingId(member.id)
    setEditRate(member.hourlyRate.toString())
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditRate("")
  }

  const saveEdit = async (memberId: string) => {
    const rate = parseFloat(editRate)
    if (isNaN(rate) || rate <= 0) {
      alert("Please enter a valid rate")
      return
    }

    const result = await updateProjectMember(memberId, { hourlyRate: rate })
    if (result.success) {
      setEditingId(null)
      setEditRate("")
      if (onUpdate) onUpdate()
    }
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No team members added yet
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <Card key={member.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {member.user.name || member.user.email}
                </span>
                <Badge variant={member.isActive ? "default" : "secondary"}>
                  {member.role}
                </Badge>
                {!member.isActive && (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {member.user.email}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {editingId === member.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={editRate}
                    onChange={(e) => setEditRate(e.target.value)}
                    className="w-24"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => saveEdit(member.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    ${parseFloat(member.hourlyRate).toFixed(2)}/hr
                  </span>
                  {canManage && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(member)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {canManage && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(member.id, member.isActive)}
                  >
                    {member.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
