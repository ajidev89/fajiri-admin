"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { cn } from "@/lib/utils";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Link as LinkIcon,
    Quote,
    AlignLeft,
    AlignCenter,
    AlignRight,
} from "lucide-react";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class:
                    "min-h-[300px] w-full bg-white px-6 py-6 text-sm text-[#475467] leading-relaxed focus:outline-none",
            },
        },
    });

    // Update content when value prop changes (e.g., initial load in Edit page)
    React.useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    const setLink = () => {
        const url = window.prompt("URL");
        if (url) {
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }
    };

    return (
        <div className="border border-[#D0D5DD] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            {/* Toolbar */}
            <div className="bg-[#F9FAFB] border-b border-[#D0D5DD] p-2 flex items-center gap-1 flex-wrap">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                    icon={<Bold className="h-4 w-4" />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                    icon={<Italic className="h-4 w-4" />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive("underline")}
                    icon={<UnderlineIcon className="h-4 w-4" />}
                />
                <div className="w-px h-6 bg-[#D0D5DD] mx-1" />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive("bulletList")}
                    icon={<List className="h-4 w-4" />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive("orderedList")}
                    icon={<ListOrdered className="h-4 w-4" />}
                />
                <div className="w-px h-6 bg-[#D0D5DD] mx-1" />
                <ToolbarButton
                    onClick={setLink}
                    active={editor.isActive("link")}
                    icon={<LinkIcon className="h-4 w-4" />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive("blockquote")}
                    icon={<Quote className="h-4 w-4" />}
                />
            </div>

            {/* Editor Content Area */}
            <EditorContent editor={editor} />
        </div>
    );
}

interface ToolbarButtonProps {
    onClick: () => void;
    active: boolean;
    icon: React.ReactNode;
}

function ToolbarButton({ onClick, active, icon }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "p-2 rounded-lg hover:bg-[#EAECF0] transition-colors text-[#667085]",
                active && "bg-[#EAECF0] text-primary",
            )}
        >
            {icon}
        </button>
    );
}
