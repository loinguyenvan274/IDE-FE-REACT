export const getFileExtension = (fileName = "") =>
    fileName.split(".").pop()?.toLowerCase();

export const getLanguage = (fileName = "") => {
    const ext = getFileExtension(fileName);
    if (["cpp", "h", "cc", "hpp"].includes(ext)) return "cpp";
    if (["js", "jsx"].includes(ext)) return "javascript";
    if (["ts", "tsx"].includes(ext)) return "typescript";
    if (ext === "md") return "markdown";
    if (ext === "json") return "json";
    return "plaintext";
};
