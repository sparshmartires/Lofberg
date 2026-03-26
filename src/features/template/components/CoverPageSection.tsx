"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
} from "lucide-react"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import StarterKit from "@tiptap/starter-kit"
import { EditorContent, useEditor, useEditorState } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { parseContentJson, type CoverPageContent } from "../types"
import { FileDropZone } from "@/features/report-generation/components/FileDropZone"
import { useUploadTemplateImageMutation } from "@/store/services/templatesApi"

const DEFAULT_CONTENT: CoverPageContent = {
  headerText: "<p>Sustainability report</p>",
}

const defaultToolbarState = {
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isBulletList: false,
  isOrderedList: false,
  isAlignLeft: false,
  isAlignCenter: false,
  isAlignRight: false,
}

interface CoverPageSectionProps {
  contentJson?: string | null
  onChange?: (json: string) => void
}

export default function CoverPageSection({ contentJson, onChange }: CoverPageSectionProps) {
  const [localContent, setLocalContent] = useState(DEFAULT_CONTENT)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadImage] = useUploadTemplateImageMutation()

  const parsed = useMemo(
    () => contentJson ? parseContentJson<CoverPageContent>(contentJson, DEFAULT_CONTENT) : localContent,
    [contentJson, localContent]
  )
  const isExternalUpdate = useRef(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const parsedRef = useRef(parsed)
  parsedRef.current = parsed

  const emitChange = useCallback((data: CoverPageContent) => {
    if (onChangeRef.current) {
      onChangeRef.current(JSON.stringify(data))
    } else {
      setLocalContent(data)
    }
  }, [])

  const handleImageChange = useCallback(
    async (file: File | null) => {
      setImageFile(file)
      if (!file) {
        // Remove image
        emitChange({ ...parsedRef.current, cover_image: undefined })
        return
      }
      try {
        const result = await uploadImage({ file }).unwrap()
        emitChange({ ...parsedRef.current, cover_image: result.url })
      } catch {
        // Upload failed — reset file state
        setImageFile(null)
      }
    },
    [uploadImage, emitChange]
  )

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Sustainability report",
      }),
    ],
    content: parsed.headerText,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      if (isExternalUpdate.current) return
      emitChange({ ...parsedRef.current, headerText: currentEditor.getHTML() })
    },
  })

  // Sync editor content when contentJson changes externally
  useEffect(() => {
    if (editor && parsed.headerText !== editor.getHTML()) {
      isExternalUpdate.current = true
      editor.commands.setContent(parsed.headerText)
      isExternalUpdate.current = false
    }
  }, [parsed.headerText, editor])

  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) {
        return defaultToolbarState
      }

      return {
        isBold: currentEditor.isActive("bold"),
        isItalic: currentEditor.isActive("italic"),
        isUnderline: currentEditor.isActive("underline"),
        isBulletList: currentEditor.isActive("bulletList"),
        isOrderedList: currentEditor.isActive("orderedList"),
        isAlignLeft: currentEditor.isActive({ textAlign: "left" }),
        isAlignCenter: currentEditor.isActive({ textAlign: "center" }),
        isAlignRight: currentEditor.isActive({ textAlign: "right" }),
      }
    },
  })

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="min-w-0">
        <p className="text-sm mb-2">Background image</p>

        <FileDropZone
          accept=".jpg,.jpeg,.png,.svg,.webp"
          acceptLabel="Recommended size: 1920x1080px, JPG/PNG/SVG"          file={imageFile}
          previewUrl={parsed.cover_image}
          onFileChange={handleImageChange}
          className="h-[125px]"
        />
        </div>

        <div className="min-w-0">
        <p className="text-sm mb-2">Header text</p>

        <input
          type="text"
          value={parsed.headerText || ""}
          onChange={(e) => emitChange({ ...parsedRef.current, headerText: e.target.value })}
          placeholder="Enter header text"
          className="w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-sm"
        />
        </div>
      </div>

    </div>
  )
}
