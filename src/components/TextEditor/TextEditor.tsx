import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from '@tiptap/extension-text-align';
import "@mantine/tiptap/styles.css";
import styles from './TextEditor.module.scss';



const textEditorIconStyles = {
    control: { border: "none", borderRadius: "0", backgroundColor: "#f4f6f8" },
};


export default function TextEditor({ content, setContent }: { content: any, setContent: (content: string) => void }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            const editorText = editor?.getText(content);
            setContent(editorText);
        },

        onCreate: ({ editor }) => {
            const initialContent = editor.getText();
            setContent(initialContent);
        },
        immediatelyRender: false,
    });

    return (
        <RichTextEditor
            withTypographyStyles={false}
            withCodeHighlightStyles={false}
            editor={editor}
            className={styles["mantine-RichTextEditor-root"]}
        >
            <RichTextEditor.Toolbar
                className={styles["mantine-RichTextEditor-toolbar"]}
            >
                <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold styles={textEditorIconStyles} />
                    <RichTextEditor.Italic styles={textEditorIconStyles} />
                    <RichTextEditor.Code styles={textEditorIconStyles} />
                </RichTextEditor.ControlsGroup>
                <RichTextEditor.ControlsGroup>
                    <RichTextEditor.BulletList styles={textEditorIconStyles} />
                    <RichTextEditor.OrderedList styles={textEditorIconStyles} />
                </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>
            <RichTextEditor.Content
                className={
                    styles["mantine-RichTextEditor-typographyStylesProvider"]
                }
            />
        </RichTextEditor>
    );
}