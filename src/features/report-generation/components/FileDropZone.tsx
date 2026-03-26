"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface FileDropZoneProps {
  accept?: string
  acceptLabel?: string
  file: File | null
  previewUrl?: string | null
  fallbackFileName?: string | null
  onFileChange: (file: File | null) => void
  className?: string
}

export function FileDropZone({
  accept = ".csv,.xlsx,.xls",
  acceptLabel = "CSV or XLSX up to 100 MB",
  file,
  previewUrl,
  fallbackFileName,
  onFileChange,
  className = "",
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const droppedFile = e.dataTransfer.files?.[0]
      if (droppedFile) {
        onFileChange(droppedFile)
      }
    },
    [onFileChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        onFileChange(selectedFile)
      }
    },
    [onFileChange]
  )

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onFileChange(null)
    },
    [onFileChange]
  )

  const isImage = previewUrl || (file && file.type.startsWith("image/"))
  const localPreview = file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null
  const displayUrl = previewUrl || localPreview

  // Revoke the object URL when the component unmounts or the preview changes
  const prevLocalPreviewRef = useRef<string | null>(null)
  useEffect(() => {
    // Revoke previous local preview URL if it changed
    if (prevLocalPreviewRef.current && prevLocalPreviewRef.current !== localPreview) {
      URL.revokeObjectURL(prevLocalPreviewRef.current)
    }
    prevLocalPreviewRef.current = localPreview

    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview)
      }
    }
  }, [localPreview])

  const hasContent = !!(file || displayUrl || fallbackFileName)

  if (hasContent) {
    // File/preview selected — show preview only, no border
    return (
      <div className="relative inline-block">
        {isImage && displayUrl ? (
          <Image
            src={displayUrl}
            alt="Preview"
            width={160}
            height={80}
            className="h-20 w-auto object-contain rounded-lg"
            unoptimized
          />
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#FAF7FF] rounded-lg border border-[#E5D5F5]">
            <p className="text-[14px] text-[#374151] truncate max-w-[200px]">
              {file?.name ?? fallbackFileName ?? "Uploaded file"}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -top-1.5 -right-1.5 z-20 w-5 h-5 rounded-full bg-[#D1D5DB] flex items-center justify-center hover:bg-[#9CA3AF] transition-colors"
        >
          <X className="h-3 w-3 text-white" />
        </button>
      </div>
    )
  }

  // No file — show dropzone with dashed border
  return (
    <div
      className={`relative rounded-[28px] border-2 border-dashed transition-colors ${
        isDragOver
          ? "border-primary bg-[#F5EDFF]"
          : "border-[#D9C2F3] bg-[#FAF7FF] hover:bg-[#F5EDFF]"
      } ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept={accept}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={handleInputChange}
      />

      <div className="flex flex-col items-center justify-center text-center px-6 py-3 h-full">
        <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#F3E8FF] mb-4">
          <Upload className="h-6 w-6 text-[#6B21A8]" />
        </div>
        <p className="text-[15px] font-medium text-[#374151]">
          Upload a file or drag and drop
        </p>
        <p className="text-sm text-[#9CA3AF] mt-1">{acceptLabel}</p>
      </div>
    </div>
  )
}
