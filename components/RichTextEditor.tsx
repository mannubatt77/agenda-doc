import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Strikethrough, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    editable?: boolean;
}

export default function RichTextEditor({ content, onChange, placeholder, editable = true }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: content || (placeholder ? `<p style="color: gray;">${placeholder}</p>` : ''),
        editable: editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <div style={{
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-input)'
        }}>
            {editable && (
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    padding: '0.5rem',
                    gap: '0.5rem',
                    borderBottom: '1px solid var(--glass-border)',
                    backgroundColor: 'rgba(255,255,255,0.02)'
                }}>
                    <button
                        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
                        disabled={!editor.can().chain().focus().toggleBold().run()}
                        style={{ padding: '0.25rem', borderRadius: '4px', background: editor.isActive('bold') ? 'rgba(255,255,255,0.1)' : 'transparent', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}
                        title="Negrita"
                    >
                        <Bold size={18} />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
                        disabled={!editor.can().chain().focus().toggleItalic().run()}
                        style={{ padding: '0.25rem', borderRadius: '4px', background: editor.isActive('italic') ? 'rgba(255,255,255,0.1)' : 'transparent', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}
                        title="Cursiva"
                    >
                        <Italic size={18} />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run() }}
                        disabled={!editor.can().chain().focus().toggleStrike().run()}
                        style={{ padding: '0.25rem', borderRadius: '4px', background: editor.isActive('strike') ? 'rgba(255,255,255,0.1)' : 'transparent', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}
                        title="Tachado"
                    >
                        <Strikethrough size={18} />
                    </button>
                    <div style={{ width: '1px', backgroundColor: 'var(--glass-border)', margin: '0 0.25rem' }} />
                    <button
                        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run() }}
                        style={{ padding: '0.25rem', borderRadius: '4px', background: editor.isActive('heading', { level: 2 }) ? 'rgba(255,255,255,0.1)' : 'transparent', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}
                        title="Título"
                    >
                        <Heading2 size={18} />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run() }}
                        style={{ padding: '0.25rem', borderRadius: '4px', background: editor.isActive('bulletList') ? 'rgba(255,255,255,0.1)' : 'transparent', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}
                        title="Lista"
                    >
                        <List size={18} />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run() }}
                        style={{ padding: '0.25rem', borderRadius: '4px', background: editor.isActive('orderedList') ? 'rgba(255,255,255,0.1)' : 'transparent', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}
                        title="Lista Numerada"
                    >
                        <ListOrdered size={18} />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run() }}
                        style={{ padding: '0.25rem', borderRadius: '4px', background: editor.isActive('blockquote') ? 'rgba(255,255,255,0.1)' : 'transparent', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}
                        title="Cita"
                    >
                        <Quote size={18} />
                    </button>
                    <div style={{ width: '1px', backgroundColor: 'var(--glass-border)', margin: '0 0.25rem' }} />
                    <button
                        onClick={(e) => { e.preventDefault(); editor.chain().focus().undo().run() }}
                        disabled={!editor.can().chain().focus().undo().run()}
                        style={{ padding: '0.25rem', borderRadius: '4px', background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
                        title="Deshacer"
                    >
                        <Undo size={18} />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); editor.chain().focus().redo().run() }}
                        disabled={!editor.can().chain().focus().redo().run()}
                        style={{ padding: '0.25rem', borderRadius: '4px', background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
                        title="Rehacer"
                    >
                        <Redo size={18} />
                    </button>
                </div>
            )}

            <div style={{ padding: '1rem', color: 'var(--text-primary)', minHeight: '150px' }}>
                <EditorContent editor={editor} className="tiptap-editor-content" />
            </div>

            <style jsx global>{`
                .tiptap-editor-content .ProseMirror {
                    outline: none;
                }
                .tiptap-editor-content .ProseMirror p.is-editor-empty:first-child::before {
                    color: var(--text-muted);
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                .tiptap-editor-content .ProseMirror ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin-bottom: 0.5rem;
                }
                .tiptap-editor-content .ProseMirror ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                    margin-bottom: 0.5rem;
                }
                .tiptap-editor-content .ProseMirror h2 {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin-top: 1rem;
                    margin-bottom: 0.5rem;
                }
                .tiptap-editor-content .ProseMirror blockquote {
                    border-left: 3px solid var(--accent-primary);
                    padding-left: 1rem;
                    margin-left: 0;
                    margin-right: 0;
                    color: var(--text-secondary);
                    font-style: italic;
                }
            `}</style>
        </div>
    );
}
