export const buildVulnerabilityDecorations = (monaco, lineVuls) => {
    return lineVuls.map((vuln) => ({
        range: new monaco.Range(vuln.line, 1, vuln.line, 1),
        options: {
            isWholeLine: true,
            className: "vulnerability-line-highlight",
            glyphMarginClassName: "vulnerability-glyph-margin",
            hoverMessage: { value: vuln.description },
            glyphMarginHoverMessage: { value: vuln.description },
        },
    })
    );
};
export const extractLineVuls = (functions, vulnerabilities = {}) => {
    const functionsBySignature = new Map(functions.map((func) => [func.signature, func]));
    return Object.entries(vulnerabilities).flatMap(([signature, items]) => {
        const funcInfo = functionsBySignature.get(signature);
        if (!funcInfo) return [];

        return items.map((vuln) => (
            {
                line: funcInfo.position.start_line + vuln.line,
                description: vuln.description || "Lỗ hổng bảo mật tiềm tàng",
                cweId: vuln.cweId || null,
                functionName: signature || "Unknown Function",
            }
        ));
    });
};
