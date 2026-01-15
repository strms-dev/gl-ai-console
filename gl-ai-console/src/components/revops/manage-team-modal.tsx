"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Loader2
} from "lucide-react"
import {
  ManagedRecipient,
  getManagedRecipients,
  addManagedRecipient,
  updateManagedRecipient,
  deleteManagedRecipient,
  toggleRecipientActive,
  recipientEmailExists
} from "@/lib/internal-recipients-store"

interface ManageTeamModalProps {
  isOpen: boolean
  onClose: () => void
  onRecipientsUpdated?: () => void
}

export function ManageTeamModal({
  isOpen,
  onClose,
  onRecipientsUpdated
}: ManageTeamModalProps) {
  const [recipients, setRecipients] = useState<ManagedRecipient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  // New recipient form
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newError, setNewError] = useState("")
  const [isAddingSaving, setIsAddingSaving] = useState(false)

  // Edit form
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editError, setEditError] = useState("")

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Load recipients when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRecipients()
      // Reset states
      setIsAdding(false)
      setEditingId(null)
      setDeletingId(null)
      setNewName("")
      setNewEmail("")
      setNewError("")
    }
  }, [isOpen])

  const loadRecipients = async () => {
    setIsLoading(true)
    const data = await getManagedRecipients()
    setRecipients(data)
    setIsLoading(false)
  }

  const handleAddRecipient = async () => {
    setNewError("")

    if (!newName.trim()) {
      setNewError("Name is required")
      return
    }
    if (!newEmail.trim()) {
      setNewError("Email is required")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setNewError("Please enter a valid email address")
      return
    }

    setIsAddingSaving(true)
    const exists = await recipientEmailExists(newEmail)
    if (exists) {
      setNewError("This email already exists in the team")
      setIsAddingSaving(false)
      return
    }

    const result = await addManagedRecipient(newName.trim(), newEmail.trim().toLowerCase())
    setIsAddingSaving(false)

    if (result) {
      await loadRecipients()
      setNewName("")
      setNewEmail("")
      setIsAdding(false)
      onRecipientsUpdated?.()
    } else {
      setNewError("Failed to add team member. Please try again.")
    }
  }

  const handleStartEdit = (recipient: ManagedRecipient) => {
    setEditingId(recipient.id)
    setEditName(recipient.name)
    setEditEmail(recipient.email)
    setEditError("")
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    setEditError("")

    if (!editName.trim()) {
      setEditError("Name is required")
      return
    }
    if (!editEmail.trim()) {
      setEditError("Email is required")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) {
      setEditError("Please enter a valid email address")
      return
    }

    setSavingId(editingId)
    const exists = await recipientEmailExists(editEmail, editingId)
    if (exists) {
      setEditError("This email already exists in the team")
      setSavingId(null)
      return
    }

    const result = await updateManagedRecipient(editingId, {
      name: editName.trim(),
      email: editEmail.trim().toLowerCase()
    })
    setSavingId(null)

    if (result) {
      await loadRecipients()
      setEditingId(null)
      onRecipientsUpdated?.()
    } else {
      setEditError("Failed to update team member. Please try again.")
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditError("")
  }

  const handleToggleActive = async (id: string) => {
    setSavingId(id)
    await toggleRecipientActive(id)
    await loadRecipients()
    setSavingId(null)
    onRecipientsUpdated?.()
  }

  const handleDelete = async (id: string) => {
    setSavingId(id)
    await deleteManagedRecipient(id)
    await loadRecipients()
    setSavingId(null)
    setDeletingId(null)
    onRecipientsUpdated?.()
  }

  const activeCount = recipients.filter(r => r.isActive).length

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <Users className="w-5 h-5 text-[#407B9D]" />
            Manage Internal Team
          </DialogTitle>
          <DialogDescription>
            Add, edit, or remove team members available for GL Review assignments.
            {activeCount > 0 && (
              <span className="ml-1 text-[#407B9D]">
                ({activeCount} active)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#407B9D]" />
              <span className="ml-2 text-sm text-muted-foreground">Loading team members...</span>
            </div>
          ) : (
            <>
              {/* Existing Recipients */}
              {recipients.map((recipient) => (
                <div key={recipient.id}>
                  {editingId === recipient.id ? (
                    // Edit Mode
                    <div className="p-3 border border-[#407B9D] rounded-lg bg-[#407B9D]/5 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="editName" className="text-xs">Name</Label>
                          <Input
                            id="editName"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 mt-1"
                            autoFocus
                            disabled={savingId === recipient.id}
                          />
                        </div>
                        <div>
                          <Label htmlFor="editEmail" className="text-xs">Email</Label>
                          <Input
                            id="editEmail"
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="h-8 mt-1"
                            disabled={savingId === recipient.id}
                          />
                        </div>
                      </div>
                      {editError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {editError}
                        </p>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="h-7"
                          disabled={savingId === recipient.id}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          className="h-7 bg-[#407B9D] hover:bg-[#366a88] text-white"
                          disabled={savingId === recipient.id}
                        >
                          {savingId === recipient.id ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3 mr-1" />
                          )}
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : deletingId === recipient.id ? (
                    // Delete Confirmation
                    <div className="p-3 border border-red-300 rounded-lg bg-red-50 space-y-2">
                      <p className="text-sm text-red-700">
                        Delete <strong>{recipient.name}</strong>?
                      </p>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingId(null)}
                          className="h-7"
                          disabled={savingId === recipient.id}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDelete(recipient.id)}
                          className="h-7 bg-red-600 hover:bg-red-700 text-white"
                          disabled={savingId === recipient.id}
                        >
                          {savingId === recipient.id ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : null}
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div
                      className={`p-3 border rounded-lg flex items-center justify-between transition-colors ${
                        recipient.isActive
                          ? "border-gray-200 bg-white"
                          : "border-gray-200 bg-gray-50 opacity-60"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${!recipient.isActive && "text-gray-500"}`}>
                          {recipient.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {recipient.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {/* Toggle Active */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(recipient.id)}
                          disabled={savingId === recipient.id}
                          className={`h-7 w-7 p-0 ${
                            recipient.isActive
                              ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          }`}
                          title={recipient.isActive ? "Active - click to deactivate" : "Inactive - click to activate"}
                        >
                          {savingId === recipient.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : recipient.isActive ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </Button>
                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(recipient)}
                          disabled={savingId === recipient.id}
                          className="h-7 w-7 p-0 text-[#407B9D] hover:text-[#366a88] hover:bg-[#407B9D]/10"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingId(recipient.id)}
                          disabled={savingId === recipient.id}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add New Recipient */}
              {isAdding ? (
                <div className="p-3 border-2 border-dashed border-[#407B9D] rounded-lg bg-[#407B9D]/5 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="newName" className="text-xs">Name</Label>
                      <Input
                        id="newName"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="John Doe"
                        className="h-8 mt-1"
                        autoFocus
                        disabled={isAddingSaving}
                      />
                    </div>
                    <div>
                      <Label htmlFor="newEmail" className="text-xs">Email</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="h-8 mt-1"
                        disabled={isAddingSaving}
                      />
                    </div>
                  </div>
                  {newError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {newError}
                    </p>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsAdding(false)
                        setNewName("")
                        setNewEmail("")
                        setNewError("")
                      }}
                      className="h-7"
                      disabled={isAddingSaving}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddRecipient}
                      className="h-7 bg-[#407B9D] hover:bg-[#366a88] text-white"
                      disabled={isAddingSaving}
                    >
                      {isAddingSaving ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3 mr-1" />
                      )}
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsAdding(true)}
                  className="w-full border-dashed border-[#407B9D] text-[#407B9D] hover:bg-[#407B9D]/10"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Team Member
                </Button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
