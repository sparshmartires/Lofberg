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
      <h3 className="font-sans font-normal text-[16px] leading-[24px] tracking-[0]">
        Cover page configuration
      </h3>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="min-w-0">
        <p className="text-sm mb-2">Background image</p>

        <FileDropZone
          accept=".jpg,.jpeg,.png,.svg,.webp"
          acceptLabel="Recommended size: 1920x1080px, Max 2MB, JPG/PNG/SVG"
          file={imageFile}
          previewUrl={parsed.cover_image}
          onFileChange={handleImageChange}
          className="h-[125px]"
        />
        </div>

        <div className="min-w-0">
        <p className="text-sm mb-2">Header text</p>

        <div className="h-[125px] w-full min-w-0 rounded-xl border border-border bg-white overflow-hidden flex flex-col">
          <div className="flex items-center gap-1 border-b border-border px-2 py-1 bg-white">
            <Button
              type="button"
              variant="ghostBrand"
              className={cn(
                "h-7 min-w-0 rounded-md px-2",
                toolbarState?.isBold && "bg-primary/10"
              )}
              aria-label="Bold"
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghostBrand"
              className={cn(
                "h-7 min-w-0 rounded-md px-2",
                toolbarState?.isItalic && "bg-primary/10"
              )}
              aria-label="Italic"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghostBrand"
              className={cn(
                "h-7 min-w-0 rounded-md px-2",
                toolbarState?.isUnderline && "bg-primary/10"
              )}
              aria-label="Underline"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>

            <span className="mx-1 h-5 w-px bg-border" />

            <Button
              type="button"
              variant="ghostBrand"
              className={cn(
                "h-7 min-w-0 rounded-md px-2",
                toolbarState?.isAlignLeft && "bg-primary/10"
              )}
              aria-label="Align left"
              onClick={() => editor?.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghostBrand"
              className={cn(
                "h-7 min-w-0 rounded-md px-2",
                toolbarState?.isAlignCenter && "bg-primary/10"
              )}
              aria-label="Align center"
              onClick={() => editor?.chain().focus().setTextAlign("center").run()}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghostBrand"
              className={cn(
                "h-7 min-w-0 rounded-md px-2",
                toolbarState?.isAlignRight && "bg-primary/10"
              )}
              aria-label="Align right"
              onClick={() => editor?.chain().focus().setTextAlign("right").run()}
            >
              <AlignRight className="h-4 w-4" />
            </Button>

            <span className="mx-1 h-5 w-px bg-border" />

            <Button
              type="button"
              variant="ghostBrand"
              className={cn(
                "h-7 min-w-0 rounded-md px-2",
                toolbarState?.isBulletList && "bg-primary/10"
              )}
              aria-label="Bulleted list"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghostBrand"
              className={cn(
                "h-7 min-w-0 rounded-md px-2",
                toolbarState?.isOrderedList && "bg-primary/10"
              )}
              aria-label="Numbered list"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

          </div>

          <EditorContent
            editor={editor}
            className="flex-1 overflow-y-auto bg-white p-3 text-sm leading-6 [&_.ProseMirror]:h-full [&_.ProseMirror]:outline-none [&_.ProseMirror]:whitespace-pre-wrap [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_li]:my-0.5 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
          />
        </div>
        </div>
      </div>
    </div>
  )
}
