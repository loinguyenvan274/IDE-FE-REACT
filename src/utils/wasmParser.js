const knownCppExtensions = new Set(["cpp", "c", "cc", "h", "hpp"]);

export const isCppFile = (fileName = "") =>
    knownCppExtensions.has(fileName.split(".").pop()?.toLowerCase());

export const withWasmString = (Module, code, callback) => {
    if (!Module) return null;
    const encoder = new TextEncoder();
    const bytes = encoder.encode(code);
    const ptr = Module._malloc(bytes.length + 1);
    Module.HEAPU8.set(bytes, ptr);
    Module.HEAPU8[ptr + bytes.length] = 0;

    try {
        return callback(ptr);
    } finally {
        Module._free(ptr);
    }
};

export const buildTreeInWasm = (Module, code) =>
    withWasmString(Module, code, (codePtr) =>
        Module.ccall("build_tree", "number", ["number"], [codePtr]),
    );

const parseWasmJson = (Module, tree, fnName, code, extraArgs = []) => {
    if (!Module || !tree) return null;
    try {
        return withWasmString(Module, code, (codePtr) => {
            const args = [tree, codePtr, ...extraArgs];
            const types = ["number", "number", ...extraArgs.map(() => "number")];
            const ptr = Module.ccall(fnName, "number", types, args);
            const result = Module.UTF8ToString(ptr);
            Module._free(ptr);
            return JSON.parse(result);
        });
    } catch (error) {
        console.error(`WASM ${fnName} error:`, error);
        return null;
    }
};

export const getAllFunctions = (Module, tree, code) =>
    parseWasmJson(Module, tree, "get_all_func", code) || [];

export const getCurrentFunction = (Module, tree, code, row, col) =>
    parseWasmJson(Module, tree, "get_current_func_editing", code, [row, col]);

export const freeTree = (Module, tree) => {
    if (Module && tree) {
        Module._free_tree(tree);
    }
};
