import React, { useRef, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { X } from "lucide-react";
import { vulnerabilityService } from "../services/vulnerabilityService";
import TabIcon from "./TabIcon";
import {
  buildTreeInWasm,
  freeTree,
  getAllFunctions,
  getCurrentFunction,
  isCppFile,
} from "../utils/wasmParser";
import { getLanguage } from "../utils/fileUtils";
import { buildVulnerabilityDecorations, extractLineVuls } from "../utils/highlightUtils";
import { VscFile } from "react-icons/vsc";

const MonacoEditor = ({
  openFiles = [],
  activeFileId,
  onTabClick,
  onTabClose,
  theme = "vs-dark",
  onChange,
  vulnerabilities = {},
  selection = null,
  loadedFileVersion = 0,
  setLineVuls,
}) => {
  const scrollContainerRef = useRef(null);
  const activeFileRef = useRef(null);
  const editorRef = useRef(null);
  const wasmRef = useRef(null);
  const treeRef = useRef(null);
  const timerRef = useRef(null);
  const decorationsRef = useRef([]);
  // biến lưu decorations hiện tại để xóa khi cập nhật mới
  const [decorationsBatch, setDecorationsBatch] = useState([]);

  const activeFile = openFiles.find((f) => f.path === activeFileId);
  activeFileRef.current = activeFile;

  // 1. Khởi tạo WASM Module
  useEffect(() => {
    if (window.createParserModule) {
      window.createParserModule().then((Module) => {
        console.log("WASM Tree-sitter loaded in Editor!");
        wasmRef.current = Module;
      });
    }
    return () => {
      if (wasmRef.current && treeRef.current) {
        wasmRef.current._free_tree(treeRef.current);
      }
    };
  }, []);

  // Cập nhật highlights khi vulnerabilities thay đổi hoặc active file thay đổi
  useEffect(() => {
    if (editorRef.current && activeFile) {
      const funcVuls = vulnerabilities[activeFile.path] || [];
      const lineVuls = extractLineVuls(
        getAllFunctions(wasmRef.current, treeRef.current, activeFile.content),
        funcVuls
      );
      applyHighlights(lineVuls);
      setLineVuls((prev) => ({
        ...prev,
        [activeFile.path]: lineVuls,
      }));
    }
  }, [vulnerabilities]);
  // Cập nhật highlights khi active file thay đổi
  useEffect(() => {
    if (editorRef.current && activeFile) {
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        decorationsBatch[activeFile.path] || [],
      );
    }
  }, [activeFileId]);

  // Xử lý navigate khi selection thay đổi
  useEffect(() => {
    if (
      editorRef.current &&
      selection &&
      activeFile &&
      selection.path === activeFile.path
    ) {
      const monaco = window.monaco;
      if (monaco) {
        editorRef.current.revealLineInCenter(selection.line);
        editorRef.current.setSelection(
          new monaco.Range(selection.line, 1, selection.line, 1),
        );
        editorRef.current.focus();
      }
    }
  }, [selection, activeFileId]);

  const analyzeAllFunctions = (code) => {
    if (!wasmRef.current || !treeRef.current) return;
    const parsedData = getAllFunctions(wasmRef.current, treeRef.current, code);
    vulnerabilityService.scanVulnerabilities(activeFileId, parsedData);
  };

  const applyHighlights = (lineVuls) => {
    const monaco = window.monaco;
    if (!monaco) return;

    const decorations = buildVulnerabilityDecorations(
      monaco,
      lineVuls
    );

    setDecorationsBatch((prev) => ({
      ...prev,
      [activeFile.path]: decorations,
    }));
    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      decorations,
    );
  };

  const handleWheel = (e) => {
    if (scrollContainerRef.current) {
      e.preventDefault();
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    // Đăng ký sự kiện thay đổi nội dung
    editor.onDidChangeModelContent(() => {
      const currentCode = editor.getValue();

      if (onChange && activeFileRef.current) {
        onChange(activeFileRef.current.path, currentCode);
      }

      // Xử lý quét lỗi bảo mật (Scenario 2)
      const extension = activeFileRef.current?.name
        .split(".")
        .pop()
        ?.toLowerCase();
      if (isCppFile(extension)) {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (!wasmRef.current) return;
          if (treeRef.current) freeTree(wasmRef.current, treeRef.current);
          treeRef.current = buildTreeInWasm(wasmRef.current, currentCode);

          const pos = editor.getPosition();
          const currentFunction = pos
            ? getCurrentFunction(
                wasmRef.current,
                treeRef.current,
                currentCode,
                pos.lineNumber,
                pos.column,
              )
            : null;

          if (currentFunction?.found) {
            vulnerabilityService.scanVulnerabilities(
              activeFileRef.current.path,
              [currentFunction],
            );
          }
        }, 500);
      }
    });

    // Xử lý khi focus vào editor hoặc tab thay đổi (Scenario 1)
    // Thực tế việc quét Toàn bộ file nên được gọi khi tab thay đổi
  };

  // Khi content được load từ server (loadedFileVersion thay đổi), scan all
  useEffect(() => {
    if (
      !activeFile ||
      !wasmRef.current ||
      !activeFile.content ||
      loadedFileVersion <= 0
    )
      return;
    if (!isCppFile(activeFile.name)) return;

    try {
      if (treeRef.current) freeTree(wasmRef.current, treeRef.current);
      treeRef.current = buildTreeInWasm(wasmRef.current, activeFile.content);
      analyzeAllFunctions(activeFile.content);
    } catch (error) {
      console.error("Lỗi khi scan all after load:", error);
    }
  }, [loadedFileVersion]);

  if (openFiles.length === 0) {
    return (
      <div className="flex flex-col h-full w-full bg-[#1e1e1e] items-center justify-center text-[#858585] space-y-4">
        <div className="p-8 rounded-full bg-white/5">
          <VscFile size={48} strokeWidth={0.5} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-[#cccccc]">No file open</p>
          <p className="text-xs mt-1 opacity-60">
            Select a file from the explorer to start coding
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] overflow-hidden">
      {/* Editor Header / Tabs */}
      <div className="flex items-center justify-between bg-[#1e1e1e] border-b border-black/10 select-none">
        <div
          ref={scrollContainerRef}
          onWheel={handleWheel}
          className="flex items-center h-9 overflow-x-hidden scroll-smooth flex-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {openFiles.map((file) => (
            <div
              key={file.path}
              onClick={() => onTabClick?.(file.path)}
              className={`flex items-center px-3 h-full text-[11px] cursor-pointer transition-all relative border-r border-black/5 group shrink-0 ${
                activeFileId === file.path
                  ? "bg-[#1e1e1e] text-white"
                  : "bg-[#252526] text-[#969696] hover:bg-[#2a2d2e] hover:text-[#cccccc]"
              }`}
            >
              <div className="flex items-center flex-1 mr-2 flex-nowrap whitespace-nowrap">
                <TabIcon
                  fileName={file.name}
                  active={activeFileId === file.path}
                />
                <span className="ml-2 whitespace-nowrap overflow-hidden">
                  {file.name}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose?.(file.path);
                }}
                className={`p-0.5 rounded-md hover:bg-white/10 transition-colors shrink-0 ${
                  activeFileId === file.path
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <X size={12} strokeWidth={2.5} className="shrink-0" />
              </button>

              {activeFileId === file.path && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.5)]" />
              )}
            </div>
          ))}
          {/*  <button className="p-2 text-[#858585] hover:text-[#cccccc] transition-colors shrink-0">
            <Plus size={14} className="shrink-0" />
          </button> */}
        </div>

        {/*<div className="flex items-center space-x-0.5 pr-2 shrink-0 bg-[#1e1e1e] z-10 shadow-[-8px_0_8px_-4px_rgba(0,0,0,0.5)]">
          <button
            className="p-1.5 hover:bg-white/5 rounded-md text-[#858585] hover:text-[#cccccc] transition-colors shrink-0"
            title="Code Review"
          >
            <Settings size={14} className="shrink-0" />
          </button>
          <button
            className="p-1.5 hover:bg-white/5 rounded-md text-green-500/80 hover:text-green-400 transition-colors shrink-0"
            title="Run Code"
          >
            <Play size={14} fill="currentColor" className="shrink-0" />
          </button>
        </div>*/}
      </div>

      <div className="flex-1 relative">
        {activeFile && (
          <Editor
            height="100%"
            language={getLanguage(activeFile.name)}
            value={activeFile.content}
            theme={theme}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 12 },
              lineNumbers: "on",
              glyphMargin: false,
              scrollbar: {
                vertical: "hidden",
                horizontal: "hidden",
                verticalScrollbarSize: 0,
                horizontalScrollbarSize: 0,
              },
              renderLineHighlight: "all",
              cursorBlink: "smooth",
              cursorSmoothCaretAnimation: "on",
              smoothScrolling: true,
              contextmenu: true,
              fontLigatures: true,
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: false },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MonacoEditor;
