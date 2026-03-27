"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  MoreHorizontal,
  Underline as UnderlineIcon,
} from "lucide-react"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import StarterKit from "@tiptap/starter-kit"
import { EditorContent, useEditor, useEditorState } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  className,
}: RichTextEditorProps) {
  const isExternalUpdate = useRef(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({ placeholder: "" }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      if (isExternalUpdate.current) return
      onChangeRef.current(currentEditor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      isExternalUpdate.current = true
      editor.commands.setContent(value)
      isExternalUpdate.current = false
    }
  }, [value, editor])

  // Close mobile menu on click outside
  useEffect(() => {
    if (!mobileMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [mobileMenuOpen])

  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) return defaultToolbarState
      return {
        isBold: e.isActive("bold"),
        isItalic: e.isActive("italic"),
        isUnderline: e.isActive("underline"),
        isBulletList: e.isActive("bulletList"),
        isOrderedList: e.isActive("orderedList"),
        isAlignLeft: e.isActive({ textAlign: "left" }),
        isAlignCenter: e.isActive({ textAlign: "center" }),
        isAlignRight: e.isActive({ textAlign: "right" }),
      }
    },
  })

  const ToolbarButton = useCallback(
    ({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: React.ReactNode }) => (
      <Button
        type="button"
        variant="ghostBrand"
        className={cn("h-7 min-w-0 rounded-md px-2", active && "bg-primary/10")}
        aria-label={label}
        onClick={onClick}
      >
        {children}
      </Button>
    ),
    []
  )

  const toolbarButtons = (
    <>
      <ToolbarButton active={toolbarState?.isBold ?? false} label="Bold" onClick={() => editor?.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton active={toolbarState?.isItalic ?? false} label="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton active={toolbarState?.isUnderline ?? false} label="Underline" onClick={() => editor?.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-[#EDEDED]" />

      <ToolbarButton active={toolbarState?.isAlignLeft ?? false} label="Align left" onClick={() => editor?.chain().focus().setTextAlign("left").run()}>
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton active={toolbarState?.isAlignCenter ?? false} label="Align center" onClick={() => editor?.chain().focus().setTextAlign("center").run()}>
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton active={toolbarState?.isAlignRight ?? false} label="Align right" onClick={() => editor?.chain().focus().setTextAlign("right").run()}>
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-[#EDEDED]" />

      <ToolbarButton active={toolbarState?.isBulletList ?? false} label="Bulleted list" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton active={toolbarState?.isOrderedList ?? false} label="Numbered list" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
    </>
  )

  return (
    <div className={cn("w-full min-w-0 rounded-xl border border-[#EDEDED] bg-white overflow-hidden flex flex-col", className)}>
      {/* Desktop toolbar — inline icons */}
      <div className="hidden sm:flex items-center gap-1 border-b border-[#EDEDED] px-2 py-1 bg-white">
        {toolbarButtons}
      </div>

      {/* Mobile toolbar — 3-dot menu */}
      <div className="relative flex sm:hidden items-center border-b border-[#EDEDED] px-2 py-1 bg-white" ref={menuRef}>
        <Button
          type="button"
          variant="ghostBrand"
          className="h-7 min-w-0 rounded-md px-2"
          aria-label="Formatting options"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>

        {mobileMenuOpen && (
          <div className="absolute top-full left-0 z-50 flex items-center gap-1 rounded-lg border border-[#EDEDED] bg-white px-2 py-1.5 shadow-lg">
            {toolbarButtons}
          </div>
        )}
      </div>

      <EditorContent
        editor={editor}
        className="flex-1 overflow-y-auto bg-white p-3 text-sm leading-6 [&_.ProseMirror]:min-h-[4.5rem] [&_.ProseMirror]:h-full [&_.ProseMirror]:outline-none [&_.ProseMirror]:whitespace-pre-wrap [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_li]:my-0.5 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
      />
    </div>
  )
}
