"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProjectMemberList } from "./ProjectMemberList"
import { ProjectMemberForm } from "./ProjectMemberForm"
import { getProjectMembers } from "@/lib/actions/project-members"
import { Plus } from "lucide-react"

interface Project {
  id: string
  name: string
}

interface ProjectTeamDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ProjectTeamDialog({
  project,
  open,
  onOpenChange,
  onSuccess,
}: ProjectTeamDialogProps) {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)

  useEffect(() => {
    if (open) {
      loadMembers()
    }
  }, [open, project.id])

  const loadMembers = async () => {
    setLoading(true)
    const result = await getProjectMembers(project.id)
    if (result.success) {
      setMembers(result.data)
    }
    setLoading(false)
  }

  const handleMemberUpdate = () => {
    loadMembers()
    if (onSuccess) onSuccess()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Manage Team - {project.name}</DialogTitle>
            <DialogDescription>
              Add or remove team members and set their hourly rates
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setIsAddMemberOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-6 text-gray-500">
                Loading team members...
              </div>
            ) : (
              <ProjectMemberList
                members={members}
                canManage={true}
                onUpdate={handleMemberUpdate}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ProjectMemberForm
        projectId={project.id}
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        onSuccess={handleMemberUpdate}
        existingMemberIds={members.map((m) => m.userId)}
      />
    </>
  )
}
