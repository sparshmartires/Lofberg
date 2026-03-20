"use client"

import { useCallback, useState } from "react"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface FileDropZoneProps {
  accept?: string
  acceptLabel?: string
  file: File | null
  previewUrl?: string | null
  onFileChange: (file: File | null) => void
  className?: string
}

export function FileDropZone({
  accept = ".csv,.xlsx,.xls",
  acceptLabel = "CSV or XLSX up to 100 MB",
  file,
  previewUrl,
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
        {file || displayUrl ? (
          <div className="relative">
            {isImage && displayUrl ? (
              <Image
                src={displayUrl}
                alt="Preview"
                width={160}
                height={80}
                className="h-20 w-auto object-contain mb-2"
                unoptimized
              />
            ) : (
              <p className="text-[15px] font-medium text-[#374151]">
                {file?.name ?? "Uploaded file"}
              </p>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 z-20 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
            >
              <X className="h-3 w-3 text-gray-600" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#F3E8FF] mb-4">
              <Upload className="h-6 w-6 text-[#6B21A8]" />
            </div>
            <p className="text-[15px] font-medium text-[#374151]">
              Upload a file or drag and drop
            </p>
            <p className="text-sm text-[#9CA3AF] mt-1">{acceptLabel}</p>
          </>
        )}
      </div>
    </div>
  )
}
