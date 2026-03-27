"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useAutoDismiss } from "@/hooks/useAutoDismiss"
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
  maxSizeMB?: number
}

export function FileDropZone({
  accept = ".csv,.xlsx,.xls",
  acceptLabel = "CSV or XLSX",
  file,
  previewUrl,
  fallbackFileName,
  onFileChange,
  className = "",
  maxSizeMB = 10,
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState("")
  useAutoDismiss(error, () => setError(""))

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const validateAndSet = useCallback(
    (selectedFile: File) => {
      if (selectedFile.size > maxSizeBytes) {
        setError(`File exceeds ${maxSizeMB} MB limit (${(selectedFile.size / 1024 / 1024).toFixed(1)} MB)`)
        return
      }
      setError("")
      onFileChange(selectedFile)
    },
    [onFileChange, maxSizeBytes, maxSizeMB]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const droppedFile = e.dataTransfer.files?.[0]
      if (droppedFile) validateAndSet(droppedFile)
    },
    [validateAndSet]
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
      if (selectedFile) validateAndSet(selectedFile)
    },
    [validateAndSet]
  )

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setError("")
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
    return (
      <div>
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
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <div>
      <div
        className={`relative rounded-xl sm:rounded-[28px] border-2 border-dashed transition-colors w-full min-w-0 ${
          error
            ? "border-red-400 bg-red-50"
            : isDragOver
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

        <div className="flex flex-col items-center justify-center text-center px-2 sm:px-6 py-3 h-full">
          <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl bg-[#F3E8FF] mb-3 sm:mb-4">
            <Upload className="h-6 w-6 text-[#6B21A8]" />
          </div>
          <p className="text-xs sm:text-[15px] font-medium text-[#374151]">
            Upload a file or drag and drop
          </p>
          <p className="text-[10px] sm:text-sm text-[#9CA3AF] mt-1">
            {acceptLabel} (max {maxSizeMB} MB)
          </p>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
