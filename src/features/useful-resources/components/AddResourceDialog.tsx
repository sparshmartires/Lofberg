"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface AddNewResourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddNewResourceDialog({
  open,
  onOpenChange,
}: AddNewResourceDialogProps) {

  const [resourceType, setResourceType] = useState<"upload" | "link" | null>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent
        showCloseButton={false}
        className="max-w-[720px] rounded-[32px] p-8 bg-white border-none"
      >

        {/* TITLE */}
        <div className="mb-6">
          <h2 className="text-[20px] text-[#1F1F1F]">
            Add new resource
          </h2>

          <p className="text-[14px] text-[#747474]">
            Enter the user details below.
          </p>
        </div>

        <div className="space-y-6">

          {/* RESOURCE TITLE */}
          <div>
            <p className="text-sm mb-2">
              Resource title*
            </p>

            <Input
              placeholder="E.g. Sustainability data import template"
              className="rounded-full h-[44px]"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <p className="text-sm mb-2">
              Description
            </p>

            <Textarea
              placeholder="Brief description of the resource"
              className="rounded-xl h-[110px]"
            />
          </div>

          {/* RESOURCE TYPE */}
          <div className="space-y-3">

            <p className="text-sm">
              Resource type
            </p>

            <div className="flex items-center gap-8">

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={resourceType === "upload"}
                  onCheckedChange={() => setResourceType("upload")}
                />
                <span className="text-sm">Document upload</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={resourceType === "link"}
                  onCheckedChange={() => setResourceType("link")}
                />
                <span className="text-sm">External link</span>
              </label>

            </div>

          </div>

          {/* FILE UPLOAD */}
           
            <div>

              <p className="text-sm mb-3">
                Upload file*
              </p>

              <div className="border-2 border-dashed border-[#D8B4F8] rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3">

                <div className="w-[44px] h-[44px] rounded-xl bg-[#F4ECFB] flex items-center justify-center">
                  <Upload className="text-[#5B2D91]" />
                </div>

                <p className="text-sm text-[#4E4E4E]">
                  Upload a file or drag and drop
                </p>

                <p className="text-xs text-[#8A8A8A]">
                  Supported: PDF, DOCX, XLSX, JPG, PNG (Max 10 MB)
                </p>

              </div>

            </div>
          

        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4 mt-8">

          <Button
           variant="outlineBrand"
            className="rounded-full px-6"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button className="rounded-full px-6 bg-[#5B2D91] hover:bg-[#4A1E76] flex items-center gap-2">
            + Add resources
          </Button>

        </div>

      </DialogContent>

    </Dialog>
  )
}