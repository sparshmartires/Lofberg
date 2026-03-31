"use client"

import { useEffect, useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import {
  useUpdateResourceMutation,
  type ResourceDto,
} from "@/store/services/resourcesApi"
import { useAutoDismiss } from "@/hooks/useAutoDismiss"

interface EditResourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resource: ResourceDto | null
}

export default function EditResourceDialog({
  open,
  onOpenChange,
  resource,
}: EditResourceDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [resourceType, setResourceType] = useState<"file" | "link">("file")
  const [externalUrl, setExternalUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  useAutoDismiss(error, () => setError(""))
  const fileRef = useRef<HTMLInputElement>(null)

  const [updateResource, { isLoading }] = useUpdateResourceMutation()

  useEffect(() => {
    if (!resource) return
    setTitle(resource.title)
    setDescription(resource.description || "")
    setResourceType(resource.resourceType === 2 ? "link" : "file")
    setExternalUrl(resource.externalUrl || "")
    setFile(null)
    setError("")
  }, [resource])

  const handleSubmit = async () => {
    if (!resource) return
    setError("")

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (resourceType === "link" && !externalUrl.trim()) {
      setError("URL is required for link resources")
      return
    }

    const formData = new FormData()
    formData.append("Title", title.trim())
    formData.append("Description", description.trim())
    formData.append("ResourceType", resourceType === "file" ? "1" : "2")
    if (resourceType === "link") formData.append("ExternalUrl", externalUrl.trim())
    if (resourceType === "file" && file) formData.append("File", file)

    try {
      await updateResource({ id: resource.id, formData }).unwrap()
      onOpenChange(false)
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } }
      setError(apiErr?.data?.message || "Failed to update resource")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[720px] rounded-[32px] p-8 bg-white border-none"
      >
        <div className="mb-6">
          <DialogTitle className="text-[20px] text-[#1F1F1F]">Edit resource</DialogTitle>
          <p className="text-[14px] text-[#747474]">Update resource details below.</p>
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
                  name="editResourceType"
                  checked={resourceType === "file"}
                  onChange={() => setResourceType("file")}
                  className="accent-[#5B2D91]"
                />
                <span className="text-sm">File</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="editResourceType"
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
              <p className="text-sm mb-3">
                {resource?.fileName ? `Current file: ${resource.fileName}` : "Upload file"}
              </p>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <div
                className="border-2 border-dashed border-[#D8B4F8] rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-[#FDFAFF] transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {file ? (
                  <p className="text-sm text-[#1F1F1F]">{file.name}</p>
                ) : (
                  <>
                    <div className="w-[44px] h-[44px] rounded-xl bg-[#F4ECFB] flex items-center justify-center">
                      <Upload className="text-[#5B2D91]" />
                    </div>
                    <p className="text-sm text-[#4E4E4E]">
                      {resource?.fileName ? "Upload a new file to replace" : "Upload a file or drag and drop"}
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
            onClick={() => onOpenChange(false)}
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
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
