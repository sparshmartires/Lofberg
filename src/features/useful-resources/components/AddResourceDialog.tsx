"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { useCreateResourceMutation } from "@/store/services/resourcesApi"

interface AddNewResourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddNewResourceDialog({
  open,
  onOpenChange,
}: AddNewResourceDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [resourceType, setResourceType] = useState<"file" | "link">("file")
  const [externalUrl, setExternalUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const [createResource, { isLoading }] = useCreateResourceMutation()

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setResourceType("file")
    setExternalUrl("")
    setFile(null)
    setError("")
  }

  const handleClose = (open: boolean) => {
    if (!open) resetForm()
    onOpenChange(open)
  }

  const handleSubmit = async () => {
    setError("")

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (resourceType === "link" && !externalUrl.trim()) {
      setError("URL is required for link resources")
      return
    }

    if (resourceType === "file" && !file) {
      setError("File is required for document uploads")
      return
    }

    const formData = new FormData()
    formData.append("Title", title.trim())
    if (description.trim()) formData.append("Description", description.trim())
    formData.append("ResourceType", resourceType === "file" ? "1" : "2")
    if (resourceType === "link") formData.append("ExternalUrl", externalUrl.trim())
    if (resourceType === "file" && file) formData.append("File", file)

    try {
      await createResource(formData).unwrap()
      handleClose(false)
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } }
      setError(apiErr?.data?.message || "Failed to create resource")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[720px] rounded-[32px] p-8 bg-white border-none"
      >
        <div className="mb-6">
          <DialogTitle className="text-[20px] text-[#1F1F1F]">Add new resource</DialogTitle>
          <p className="text-[14px] text-[#747474]">Add a file or link to share with the team.</p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm mb-2">Title</p>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. Sustainability data import template"
              className="rounded-full h-[44px]"
            />
          </div>

          <div>
            <p className="text-sm mb-2">Description</p>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the resource"
              className="rounded-xl h-[110px]"
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm">Resource type</p>
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="resourceType"
                  checked={resourceType === "file"}
                  onChange={() => setResourceType("file")}
                  className="accent-[#5B2D91]"
                />
                <span className="text-sm">File</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="resourceType"
                  checked={resourceType === "link"}
                  onChange={() => setResourceType("link")}
                  className="accent-[#5B2D91]"
                />
                <span className="text-sm">Link</span>
              </label>
            </div>
          </div>

          {resourceType === "link" && (
            <div>
              <p className="text-sm mb-2">URL</p>
              <Input
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://example.com/resource"
                className="rounded-full h-[44px]"
              />
            </div>
          )}

          {resourceType === "file" && (
            <div>
              <p className="text-sm mb-3">Upload file</p>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <div
                className="border-2 border-dashed border-[#D8B4F8] rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-[#FDFAFF] transition-colors"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const droppedFile = e.dataTransfer.files?.[0]
                  if (droppedFile) setFile(droppedFile)
                }}
              >
                {file ? (
                  <p className="text-sm text-[#1F1F1F]">{file.name}</p>
                ) : (
                  <>
                    <div className="w-[44px] h-[44px] rounded-xl bg-[#F4ECFB] flex items-center justify-center">
                      <Upload className="text-[#5B2D91]" />
                    </div>
                    <p className="text-sm text-[#4E4E4E]">Upload a file or drag and drop</p>
                    <p className="text-xs text-[#8A8A8A]">
                      Accepted file types: anything except scripts, runnables, binaries
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Button
            variant="outlineBrand"
            className="rounded-full px-6"
            onClick={() => handleClose(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="rounded-full px-6 bg-[#5B2D91] hover:bg-[#4A1E76]"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
