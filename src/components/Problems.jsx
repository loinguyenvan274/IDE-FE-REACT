import React from 'react';
import { AlertCircle, XCircle, Info, MoreHorizontal, X } from 'lucide-react';

const Problems = ({ onClose, lineVuls = {}, onProblemClick }) => {
  // Convert vulnerabilities map to a flat list
  const problemsRes = Object.entries(lineVuls).flatMap(([path, vuls]) => {
    if (!Array.isArray(vuls)) return [];
    return vuls.map((vul, idx) => ({
      id: `${path}-${idx}`,
      type: 'error', // or infer from v.cweId if available
      file: path.split('/').pop(),
      filePath: path,
      line: vul.line,
      col: 1, // backend might not provide column
      message: `${vul.cweId || 'Vulnerability'}: ${vul.description || 'Potential security issue'}`,
      raw: vul
    }));
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] text-[#cccccc] font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-10 bg-[#1e1e1e] border-b border-black/10 select-none">
        <div className="flex items-center space-x-4 h-full">
          <button className="flex items-center h-full text-[11px] font-bold tracking-tight text-white relative">
            <span>PROBLEMS</span>
            <span className="ml-2 flex items-center justify-center w-4 h-4 bg-[#333333] rounded text-[9px]">{problemsRes.length}</span>
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/40" />
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[#333333] rounded text-[#858585] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Problems List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        {problemsRes.length > 0 ? (
          <div className="flex flex-col">
            {problemsRes.map((p) => (
              <div 
                key={p.id} 
                onClick={() => onProblemClick?.(p.filePath, p.line)}
                className="flex items-start px-4 py-2 hover:bg-[#2a2d2e] cursor-pointer group border-b border-black/5"
              >
                <div className="mr-3 mt-0.5">
                  {p.type === 'error' && <XCircle size={14} className="text-red-500" />}
                  {p.type === 'warning' && <AlertCircle size={14} className="text-yellow-500" />}
                  {p.type === 'info' && <Info size={14} className="text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between space-x-4">
                    <p className="text-xs text-[#cccccc] truncate">{p.message}</p>
                    <span className="text-[10px] text-[#858585] whitespace-nowrap">{p.file} [{p.line}, {p.col}]</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[#858585] space-y-2 opacity-40">
            <AlertCircle size={32} />
            <p className="text-xs">No problems have been detected in the workspace.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 h-6 bg-[#2d2d2d] border-t border-black/10 text-[10px] text-[#858585] select-none">
        <div className="flex items-center space-x-3">
          <span>{problemsRes.filter(p => p.type === 'error').length} Vulnerabilities</span>
        </div>
      </div>
    </div>
  );
};

export default Problems;
