'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { Node, mergeAttributes } from '@tiptap/core'
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Link as LinkIcon, Heading2, Heading3, Quote, Undo, Redo, Film
} from 'lucide-react'
import { useCallback, useEffect } from 'react'

// Custom TipTap node that preserves <iframe> embeds (Vimeo, YouTube, etc.)
const IframeNode = Node.create({
  name: 'iframe',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src:             { default: null },
      width:           { default: '100%' },
      height:          { default: '315' },
      frameborder:     { default: '0' },
      allowfullscreen: { default: 'true' },
      allow:           { default: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' },
      title:           { default: '' },
    }
  },
  parseHTML() {
    return [{ tag: 'iframe' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['iframe', mergeAttributes(HTMLAttributes)]
  },
})

// Brand colors (synced with CourseManagerPage)
const C = {
  dark:  '#0A0804', dark4: '#1E160C', dark5: '#251C0F',
  cream: '#F0EAE0', orange: '#E8621A', gold: '#C9A84C',
  muted: '#B8A89A', muted2: '#D4C4B7',
  border: 'rgba(201,168,76,0.12)',
  border2: 'rgba(201,168,76,0.25)',
}

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  children,
  title 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  children: React.ReactNode
  title: string
}) => (
  <button
    onClick={(e) => {
      e.preventDefault()
      onClick()
    }}
    title={title}
    style={{
      background: isActive ? 'rgba(232,98,26,0.15)' : 'transparent',
      border: `1px solid ${isActive ? C.orange : 'transparent'}`,
      color: isActive ? C.orange : C.muted2,
      padding: '6px',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
      outline: 'none',
    }}
    onMouseEnter={(e) => {
      if (!isActive) e.currentTarget.style.background = 'rgba(240,234,224,0.05)'
    }}
    onMouseLeave={(e) => {
      if (!isActive) e.currentTarget.style.background = 'transparent'
    }}
  >
    {children}
  </button>
)

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          style: `color: ${C.orange}; font-weight: 500; text-decoration: underline;`,
        },
      }),
      IframeNode,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        style: `
          background: ${C.dark4};
          border: 1px solid ${C.border};
          border-top: none;
          color: ${C.cream};
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          padding: 16px;
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
          min-height: 200px;
          max-height: 500px;
          overflow-y: auto;
          outline: none;
          line-height: 1.6;
        `,
      },
    },
  })

  // Sync content when prop changes (e.g. when opening modal with different lesson).
  // Pass false as second arg so setContent doesn't fire onUpdate → onChange → infinite loop.
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) return
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const insertEmbed = useCallback(() => {
    const src = window.prompt('Paste embed URL (YouTube, Vimeo, etc.)')
    if (!src?.trim()) return
    editor?.chain().focus().insertContent({
      type: 'iframe',
      attrs: { src: src.trim() },
    }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        padding: '6px',
        background: C.dark5,
        border: `1px solid ${C.border}`,
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
      }}>
        <MenuButton 
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
        >
          <Bold size={16} />
        </MenuButton>
        <MenuButton 
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
        >
          <Italic size={16} />
        </MenuButton>
        <MenuButton 
          title="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
        >
          <UnderlineIcon size={16} />
        </MenuButton>
        
        <div style={{ width: '1px', background: C.border, margin: '0 4px' }} />

        <MenuButton 
          title="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
        >
          <Heading2 size={16} />
        </MenuButton>
        <MenuButton 
          title="Heading 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
        >
          <Heading3 size={16} />
        </MenuButton>
        
        <div style={{ width: '1px', background: C.border, margin: '0 4px' }} />

        <MenuButton 
          title="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
        >
          <List size={16} />
        </MenuButton>
        <MenuButton 
          title="Ordered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
        >
          <ListOrdered size={16} />
        </MenuButton>
        <MenuButton 
          title="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
        >
          <Quote size={16} />
        </MenuButton>

        <div style={{ width: '1px', background: C.border, margin: '0 4px' }} />

        <MenuButton
          title="Add Link"
          onClick={setLink}
          isActive={editor.isActive('link')}
        >
          <LinkIcon size={16} />
        </MenuButton>
        <MenuButton
          title="Insert Video Embed"
          onClick={insertEmbed}
          isActive={editor.isActive('iframe')}
        >
          <Film size={16} />
        </MenuButton>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          <MenuButton 
            title="Undo"
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo size={16} />
          </MenuButton>
          <MenuButton 
            title="Redo"
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo size={16} />
          </MenuButton>
        </div>
      </div>

      {/* Editor Area */}
      <EditorContent editor={editor} />

      <style dangerouslySetInnerHTML={{ __html: `
        .tiptap h2 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; color: ${C.gold}; font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px; }
        .tiptap h3 { font-size: 1.1rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; color: ${C.cream}; }
        .tiptap p { margin-bottom: 1rem; }
        .tiptap ul, .tiptap ol { margin-left: 1.5rem; margin-bottom: 1rem; }
        .tiptap li { margin-bottom: 0.25rem; }
        .tiptap blockquote { border-left: 3px solid ${C.orange}; padding-left: 1rem; font-style: italic; color: ${C.muted2}; margin-bottom: 1rem; }
        .tiptap a { cursor: pointer; }
      `}} />
    </div>
  )
}
