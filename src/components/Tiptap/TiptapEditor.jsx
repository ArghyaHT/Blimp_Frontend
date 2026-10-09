import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Link } from "@tiptap/extension-link";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import style from "./TiptapEditor.module.css";
import { useState, useRef, useEffect } from "react";
import {
  DownArrow,
  EditorCenterIcon,
  EditorLeftIcon,
  EditorRightIcon,
  UpArrow,
} from "../../icons";
import {
  FaBold,
  FaHeading,
  FaListUl,
  FaQuoteLeft,
  FaLink,
  FaUnlink,
  FaTable,
  FaPalette,
} from "react-icons/fa";
import { LuUndo, LuRedo } from "react-icons/lu";
import { MdHorizontalRule, MdFormatClear } from "react-icons/md";

function Dropdown({ label, icon, isOpen, onToggle, onClose, children }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div className={style.dropdown} data-label={label} ref={dropdownRef}>
      <button
        onClick={onToggle}
        className={`${style.dropdown_trigger} ${isOpen ? style.is_open : ""}`}
      >
        {icon && <span className={style.btn_icon}>{icon}</span>}
        <span>{label}</span>
        {isOpen ? (
          <UpArrow className={style.arrow_icon} />
        ) : (
          <DownArrow className={style.arrow_icon} />
        )}
      </button>

      {isOpen && (
        <div className={style.dropdown_menu} onClick={onClose}>
          {children}
        </div>
      )}
    </div>
  );
}

// Extensions
const extensions = [
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
  StarterKit,
  Underline,
  Link.configure({
    openOnClick: false,
    autolink: true,
    HTMLAttributes: {
      target: "_blank",
      rel: "noopener noreferrer",
    },
  }),
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
  TextAlign.configure({
    types: ["heading", "paragraph"],
    alignments: ["left", "center", "right", "justify"],
  }),
];

function MenuBar({ editor }) {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (label) => {
    setActiveDropdown((prev) => (prev === label ? null : label));
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  // Track editor state
  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive("bold") || false,
      canBold: ctx.editor.can().chain().toggleBold().run() || false,

      isItalic: ctx.editor.isActive("italic") || false,
      canItalic: ctx.editor.can().chain().toggleItalic().run() || false,

      isStrike: ctx.editor.isActive("strike") || false,
      canStrike: ctx.editor.can().chain().toggleStrike().run() || false,

      isUnderline: ctx.editor.isActive("underline") || false,
      canUnderline: ctx.editor.can().chain().toggleUnderline().run() || false,

      isLink: ctx.editor.isActive("link") || false,
      isTable: ctx.editor.isActive("table") || false,

      isParagraph: ctx.editor.isActive("paragraph") || false,
      isHeading1: ctx.editor.isActive("heading", { level: 1 }) || false,
      isHeading2: ctx.editor.isActive("heading", { level: 2 }) || false,
      isHeading3: ctx.editor.isActive("heading", { level: 3 }) || false,
      isHeading4: ctx.editor.isActive("heading", { level: 4 }) || false,
      isHeading5: ctx.editor.isActive("heading", { level: 5 }) || false,
      isHeading6: ctx.editor.isActive("heading", { level: 6 }) || false,

      textAlign:
        ctx.editor.getAttributes("paragraph").textAlign ||
        ctx.editor.getAttributes("heading").textAlign ||
        "left",

      isBulletList: ctx.editor.isActive("bulletList") || false,
      isOrderedList: ctx.editor.isActive("orderedList") || false,
      isBlockquote: ctx.editor.isActive("blockquote") || false,

      canUndo: ctx.editor.can().chain().undo().run() || false,
      canRedo: ctx.editor.can().chain().redo().run() || false,
    }),
  });

  const getAlignIcon = () => {
    if (editorState.textAlign === "center") return <EditorCenterIcon />;
    if (editorState.textAlign === "right") return <EditorRightIcon />;
    return <EditorLeftIcon />;
  };

  const handleLinkPrompt = () => {
    if (editorState.isLink) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL for link:", previousUrl || "https://");
    if (url === null) return;
    if (url === "" || url === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  const colorOptions = [
    { label: "Default Text", value: "#111827" },
    { label: "Cyan Primary", value: "#00c1e8" },
    { label: "Emerald Green", value: "#10b981" },
    { label: "Indigo Blue", value: "#6366f1" },
    { label: "Red Alert", value: "#ef4444" },
    { label: "Orange Accent", value: "#f97316" },
  ];

  const highlightOptions = [
    { label: "Yellow Highlight", value: "#fef08a" },
    { label: "Green Highlight", value: "#bbf7d0" },
    { label: "Cyan Highlight", value: "#a5f3fc" },
    { label: "Pink Highlight", value: "#fbcfe8" },
  ];

  return (
    <div className={style.control_group}>
      <div className={style.button_group}>
        {/* 🎨 Text Style Dropdown */}
        <Dropdown
          label="Text Style"
          icon={<FaBold />}
          isOpen={activeDropdown === "Text Style"}
          onToggle={() => toggleDropdown("Text Style")}
          onClose={closeDropdown}
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editorState.canBold}
            className={editorState.isBold ? style.is_active : ""}
          >
            Bold
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editorState.canItalic}
            className={editorState.isItalic ? style.is_active : ""}
          >
            Italic
          </button>

          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editorState.canUnderline}
            className={editorState.isUnderline ? style.is_active : ""}
          >
            Underline
          </button>

          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editorState.canStrike}
            className={editorState.isStrike ? style.is_active : ""}
          >
            Strike
          </button>
        </Dropdown>

        {/* 🏷 Headings Dropdown */}
        <Dropdown
          label="Headings"
          icon={<FaHeading />}
          isOpen={activeDropdown === "Headings"}
          onToggle={() => toggleDropdown("Headings")}
          onClose={closeDropdown}
        >
          <button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={editorState.isParagraph ? style.is_active : ""}
          >
            Paragraph
          </button>
          {[1, 2, 3, 4, 5, 6].map((lvl) => (
            <button
              key={lvl}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: lvl }).run()
              }
              className={editorState[`isHeading${lvl}`] ? style.is_active : ""}
            >
              H{lvl}
            </button>
          ))}
        </Dropdown>

        {/* 🎨 Colors & Highlight Dropdown */}
        <Dropdown
          label="Color"
          icon={<FaPalette />}
          isOpen={activeDropdown === "Color"}
          onToggle={() => toggleDropdown("Color")}
          onClose={closeDropdown}
        >
          <div className={style.dropdown_section_title}>Text Color</div>
          {colorOptions.map((c) => (
            <button
              key={c.value}
              onClick={() => editor.chain().focus().setColor(c.value).run()}
            >
              <span
                className={style.color_dot}
                style={{ backgroundColor: c.value }}
              />
              {c.label}
            </button>
          ))}
          <div className={style.dropdown_section_title}>Background Highlight</div>
          {highlightOptions.map((h) => (
            <button
              key={h.value}
              onClick={() =>
                editor.chain().focus().toggleHighlight({ color: h.value }).run()
              }
            >
              <span
                className={style.color_dot}
                style={{ backgroundColor: h.value }}
              />
              {h.label}
            </button>
          ))}
          <button onClick={() => editor.chain().focus().unsetHighlight().run()}>
            Remove Highlight
          </button>
        </Dropdown>

        <div className={style.toolbar_divider} />

        {/* ↔️ Alignment Dropdown */}
        <Dropdown
          label="Align"
          icon={getAlignIcon()}
          isOpen={activeDropdown === "Align"}
          onToggle={() => toggleDropdown("Align")}
          onClose={closeDropdown}
        >
          <button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={
              editor.isActive({ textAlign: "left" }) ? style.is_active : ""
            }
          >
            <EditorLeftIcon />
            Left
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={
              editor.isActive({ textAlign: "center" }) ? style.is_active : ""
            }
          >
            <EditorCenterIcon />
            Center
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={
              editor.isActive({ textAlign: "right" }) ? style.is_active : ""
            }
          >
            <EditorRightIcon />
            Right
          </button>
        </Dropdown>

        {/* ✔ Lists Dropdown */}
        <Dropdown
          label="Lists"
          icon={<FaListUl />}
          isOpen={activeDropdown === "Lists"}
          onToggle={() => toggleDropdown("Lists")}
          onClose={closeDropdown}
        >
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? style.is_active : ""}
          >
            Bullet List
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? style.is_active : ""}
          >
            Numbered List
          </button>
        </Dropdown>

        {/* 📊 Table Dropdown */}
        <Dropdown
          label="Table"
          icon={<FaTable />}
          isOpen={activeDropdown === "Table"}
          onToggle={() => toggleDropdown("Table")}
          onClose={closeDropdown}
        >
          {!editorState.isTable ? (
            <button
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
            >
              Insert Budget Table (3x3)
            </button>
          ) : (
            <>
              <button onClick={() => editor.chain().focus().addRowBefore().run()}>
                Add Row Above
              </button>
              <button onClick={() => editor.chain().focus().addRowAfter().run()}>
                Add Row Below
              </button>
              <button onClick={() => editor.chain().focus().addColumnBefore().run()}>
                Add Column Left
              </button>
              <button onClick={() => editor.chain().focus().addColumnAfter().run()}>
                Add Column Right
              </button>
              <button onClick={() => editor.chain().focus().deleteRow().run()}>
                Delete Row
              </button>
              <button onClick={() => editor.chain().focus().deleteColumn().run()}>
                Delete Column
              </button>
              <button onClick={() => editor.chain().focus().deleteTable().run()}>
                Delete Table
              </button>
            </>
          )}
        </Dropdown>

        <div className={style.toolbar_divider} />

        {/* 🔗 Link Button */}
        <button
          onClick={handleLinkPrompt}
          className={`${editorState.isLink ? style.is_active : ""} ${style.icon_btn}`}
          title={editorState.isLink ? "Remove Link" : "Add Link"}
        >
          {editorState.isLink ? <FaUnlink /> : <FaLink />}
          <span className={style.btn_text}>
            {editorState.isLink ? "Unlink" : "Link"}
          </span>
        </button>

        {/* 👉 Single Controls */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${editor.isActive("blockquote") ? style.is_active : ""} ${style.icon_btn}`}
          title="Blockquote"
        >
          <FaQuoteLeft />
          <span className={style.btn_text}>Blockquote</span>
        </button>

        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={style.icon_btn}
          title="Line"
        >
          <MdHorizontalRule />
          <span className={style.btn_text}>Line</span>
        </button>

        {/* 🧹 Clear Formatting */}
        <button
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className={style.icon_btn}
          title="Clear Formatting"
        >
          <MdFormatClear />
          <span className={style.btn_text}>Clear</span>
        </button>

        <div className={style.toolbar_divider} />

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={style.icon_btn}
          title="Undo"
        >
          <LuUndo />
          <span className={style.btn_text}>Undo</span>
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={style.icon_btn}
          title="Redo"
        >
          <LuRedo />
          <span className={style.btn_text}>Redo</span>
        </button>
      </div>
    </div>
  );
}

const TiptapEditor = ({
  selectedCampaingDescription,
  setSelectedCampaignDescription,
}) => {
  const editor = useEditor({
    extensions,
    content: selectedCampaingDescription,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      setSelectedCampaignDescription(html);
    },
  });

  return (
    <div>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
