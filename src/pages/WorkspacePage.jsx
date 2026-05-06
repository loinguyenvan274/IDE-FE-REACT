import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import debounce from "lodash/debounce";
import { diffLines } from "diff";
import ActivityBar from "../components/Sidebar";
import FileExplorer from "../components/FileExplorer";
import MonacoEditor from "../components/Editor";
import TerminalIDE from "../components/TerminalIDE";
import Problems from "../components/Problems";
import ConfirmationModal from "../components/ConfirmationModal";
import { explorerService } from "../services/explorerService";
import { vulnerabilityService } from "../services/vulnerabilityService";

const ResizeHandle = () => (
  <PanelResizeHandle className="w-2 hover:bg-blue-500/30 active:bg-blue-500 transition-colors duration-150 relative z-50 cursor-col-resize">
    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/5 group-hover:bg-blue-500/50" />
  </PanelResizeHandle>
);

const getLineChanges = (oldText, newText) => {
  // Normalize both strings to use only \n, removing any \r characters
  const normalizedOld = (oldText || "").replace(/\r/g, "");
  const normalizedNew = (newText || "").replace(/\r/g, "");

  const diff = diffLines(normalizedOld, normalizedNew);

  let lineIndex = 0; // index theo file mới
  const result = [];

  diff.forEach((part) => {
    const lines = part.value.split("\n");

    // bỏ dòng rỗng cuối (do split)
    if (lines[lines.length - 1] === "") {
      lines.pop();
    }

    if (part.added) {
      lines.forEach((line) => {
        result.push({
          index: lineIndex,
          type: "added",
          value: line,
        });
        lineIndex++;
      });
    } else if (part.removed) {
      lines.forEach((line) => {
        result.push({
          index: lineIndex,
          type: "removed",
          value: line,
        });
        // ⚠ removed không tăng index vì nó không tồn tại trong file mới
      });
    } else {
      // unchanged
      lineIndex += lines.length;
    }
  });

  return result;
};

const WorkspacePage = () => {
  const { projectName } = useParams();
  const [activePanels, setActivePanels] = useState({
    explorer: true,
    problems: false,
    terminal: true,
  });

  const [fileTree, setFileTree] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });
  const [vulnerabilities, setVulnerabilities] = useState({}); // { filePath: [vuls] }
  const [lineVuls, setLineVuls] = useState({}); // { filePath: [ { line, description, cweId, functionName } ] }
  const [editorSelection, setEditorSelection] = useState(null); // { path: string, line: number }
  const [loadedFileVersion, setLoadedFileVersion] = useState(0);
  const lastSentContent = useRef({});

  const debouncedUpdate = useCallback(
    debounce((path, newContent) => {
      const oldText = lastSentContent.current[path];
      if (oldText === newContent) return;

      const operations = getLineChanges(oldText, newContent);
      console.log("status-file: ", operations);
      if (operations.length > 0) {
        explorerService.updateFile(path, operations);
        lastSentContent.current[path] = newContent;
      }
    }, 1000),
    [],
  );

  useEffect(() => {
    // Initial connection to Explorer Service
    if (projectName) {
      explorerService.connect(projectName, () => {
        console.log("Explorer Service Connected");
        explorerService.listProjectTree();
      });
    }

    explorerService.onResponse = (data) => {
      if (data.action === "list" && data.status === "ok") {
        // Fix 1: Find the project root in the tree if it's nested
        let root = data.tree;

        // Helper to find project folder in the tree
        const findProjectNode = (node, name) => {
          if (node.name === name) return node;
          if (node.children) {
            for (const child of node.children) {
              const found = findProjectNode(child, name);
              if (found) return found;
            }
          }
          return null;
        };

        const projectNode = findProjectNode(data.tree, projectName);
        setFileTree(projectNode || data.tree);
      } else if (data.action === "read" && data.status === "ok") {
        lastSentContent.current[data.path] = data.content;
        // Update the content of the opened file
        setOpenFiles((prev) =>
          prev.map((f) => {
            // Remove leading slash comparison if needed for consistency
            const match =
              f.path === data.path ||
              f.path === "/" + data.path ||
              "/" + f.path === data.path;

            if (match) {
              return { ...f, content: data.content, path: data.path }; // Sync path format
            }
            return f;
          }),
        );

        // Ensure the active ID also matches the synced path
        setActiveFileId(data.path);

        // Increment loadedFileVersion để Editor biết content được load từ server
        setLoadedFileVersion((prev) => prev + 1);
      }
    };

    explorerService.onFileEvent = (event) => {
      // Simple refresh on any file event for now
      explorerService.listProjectTree();
    };

    // Đăng ký nhận kết quả từ backend
    const unsubscribeVuls = vulnerabilityService.subscribeResults((results) => {
      console.log("Vulnerability scan results received in Workspace:", results.results, "for path:", results.filePath);
      const scanResults = results.results;
      const vulsArray = scanResults.filter((item) => item.isVul);
      const nonVulsArray = scanResults.filter((item) => !item.isVul);
      setVulnerabilities((prev) => {
        const updated = { ...prev };
          updated[results.filePath] = updated[results.filePath] || {};
          vulsArray.forEach(vul => {
           updated[results.filePath][vul.signature]=vul.vulnerabilities;
          });    
          nonVulsArray.forEach(nonVul => {
            if(updated[results.filePath][nonVul.signature]){
              delete updated[results.filePath][nonVul.signature];
            }
          });
        return updated;
      });
    });

    return () => {
      unsubscribeVuls();
    };
  }, [activeFileId]);

  const handleFileClick = (file) => {
    if (file.directory) return;

    const filePath = file.path;

    // Add file to openFiles if not already present
    setOpenFiles((prev) => {
      const exists = prev.find((f) => f.path === filePath);
      if (exists) return prev;

      // Request file content if opening for the first time
      explorerService.readFile(filePath);

      return [...prev, { ...file }]; // content will be updated when read response comes back
    });

    setActiveFileId(filePath);
  };

  const handleCloseFile = (filePath) => {
    setOpenFiles((prev) => {
      const newFiles = prev.filter((f) => f.path !== filePath);
      // If we closed the active file, set a new one
      if (activeFileId === filePath && newFiles.length > 0) {
        setActiveFileId(newFiles[newFiles.length - 1].path);
      } else if (newFiles.length === 0) {
        setActiveFileId(null);
      }
      return newFiles;
    });
  };

  const handleFileChange = (path, newContent) => {
    setOpenFiles((prev) =>
      prev.map((f) => (f.path === path ? { ...f, content: newContent } : f)),
    );
    debouncedUpdate(path, newContent);
  };

  const handleProblemClick = (filePath, line) => {
    // Open file if not open
    const file = openFiles.find((f) => f.path === filePath);
    if (!file) {
      // If not in openFiles, we might need to find it in the tree and request content
      // For simplicity, we assume we want to navigate to something already opened or we open it
      // In a more robust system, we would trigger handleFileClick
    }

    setActiveFileId(filePath);
    // Set selection logic
    setEditorSelection({ path: filePath, line, timestamp: Date.now() });
  };

  const togglePanel = (id) => {
    setActivePanels((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCreateItem = (type, parentPath, nameFromUI) => {
    const name = nameFromUI || window.prompt(`Enter ${type} name:`);
    if (!name) return;

    // Construct path: if parentPath is empty, it's root.
    // Join with slash, but avoid double slashes.
    const cleanParent = parentPath.endsWith("/")
      ? parentPath
      : parentPath + "/";
    const path = parentPath ? `${cleanParent}${name}` : name;

    explorerService.createItem(path, type === "folder");
  };

  const handleDeleteItem = (item) => {
    setDeleteModal({ isOpen: true, item });
  };

  const confirmDelete = () => {
    if (deleteModal.item) {
      explorerService.deleteItem(deleteModal.item.path);
      // Close tab if open
      handleCloseFile(deleteModal.item.path);
      setDeleteModal({ isOpen: false, item: null });
    }
  };

  const handleRenameItem = (item, newNameFromUI) => {
    const newName =
      newNameFromUI || window.prompt(`Rename ${item.name} to:`, item.name);
    if (!newName || newName === item.name) return;

    const parts = item.path.split("/");
    parts[parts.length - 1] = newName;
    const newPath = parts.join("/");

    explorerService.moveItem(item.path, newPath);
  };

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] flex flex-col p-2 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-4 py-1 text-xs text-gray-400 mb-1 border-b border-white/5">
        <span className="font-medium mr-2">Workspace:</span>
        <span className="text-white bg-white/5 px-2 py-0.5 rounded">
          {projectName}
        </span>
      </div>

      <div className="flex-1 flex space-x-1 overflow-hidden">
        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, item: null })}
          onConfirm={confirmDelete}
          title={deleteModal.item?.directory ? "Delete folder" : "Delete file"}
          message={`Are you sure you want to delete "${deleteModal.item?.name}"?`}
          confirmText="Delete"
        />

        {/* Left Side: Activity Bar */}
        <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-xl border border-white/5 flex shrink-0">
          <ActivityBar
            activePanels={activePanels}
            onTogglePanel={togglePanel}
          />
        </div>

        {/* Resizable Panels Container */}
        <div className="flex-1 h-full overflow-hidden">
          <PanelGroup direction="horizontal">
            {/* 1. File Explorer */}
            {activePanels.explorer && (
              <>
                <Panel
                  id="explorer"
                  order={1}
                  defaultSize="20%"
                  minSize="10%"
                  maxSize="40%"
                  className="min-w-0"
                >
                  <div className="h-full bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-xl border border-white/5">
                    <FileExplorer
                      tree={fileTree}
                      onFileClick={handleFileClick}
                      onClose={() => togglePanel("explorer")}
                      onCreateFile={(parent, name) =>
                        handleCreateItem("file", parent, name)
                      }
                      onCreateFolder={(parent, name) =>
                        handleCreateItem("folder", parent, name)
                      }
                      onDelete={handleDeleteItem}
                      onRename={handleRenameItem}
                    />
                  </div>
                </Panel>
                <ResizeHandle />
              </>
            )}

            {/* 2. Main Editor Panel (Always Shown) */}
            <Panel
              id="editor"
              order={2}
              className="min-w-0"
              minSize="30%"
              defaultSize="40%"
            >
              <div className="h-full bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-xl border border-white/5">
                <MonacoEditor
                  openFiles={openFiles}
                  activeFileId={activeFileId}
                  onTabClick={(id) => setActiveFileId(id)}
                  onTabClose={handleCloseFile}
                  onChange={handleFileChange}
                  vulnerabilities={vulnerabilities}
                  selection={editorSelection}
                  loadedFileVersion={loadedFileVersion}
                  setLineVuls={setLineVuls}
                />
              </div>
            </Panel>

            {/* 3. Problems Panel */}
            {activePanels.problems && (
              <>
                <ResizeHandle />
                <Panel
                  id="problems"
                  order={3}
                  defaultSize="20%"
                  minSize="10%"
                  maxSize="35%"
                  className="min-w-0"
                >
                  <div className="h-full bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-xl border border-white/5">
                    <Problems
                      onClose={() => togglePanel("problems")}
                      vulnerabilities={vulnerabilities}
                      onProblemClick={handleProblemClick}
                      lineVuls={lineVuls}
                    />
                  </div>
                </Panel>
              </>
            )}

            {/* 4. Terminal Panel */}
            {activePanels.terminal && (
              <>
                <ResizeHandle />
                <Panel
                  id="terminal"
                  order={4}
                  defaultSize="25%"
                  minSize="15%"
                  maxSize="45%"
                  className="min-w-0"
                >
                  <div className="h-full bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-xl border border-white/5">
                    <TerminalIDE
                      onClose={() => togglePanel("terminal")}
                      workDir={projectName}
                    />
                  </div>
                </Panel>
              </>
            )}
          </PanelGroup>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;
