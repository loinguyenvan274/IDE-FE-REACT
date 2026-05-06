import {
  VscFile,
  VscMarkdown,
  VscJson,
  VscTable,
  VscFileCode,
  VscInfo,
} from "react-icons/vsc";
import {
  SiCplusplus,
  SiC,
  SiPython,
  SiPhp,
  SiSwift,
  SiGo,
  SiRust,
} from "react-icons/si";

const iconMap = {
  md: { Icon: VscMarkdown, color: "text-blue-400" },
  json: { Icon: VscJson, color: "text-yellow-500" },
  csv: { Icon: VscTable, color: "text-emerald-500" },
  cpp: { Icon: SiCplusplus, color: "text-blue-500" },
  cc: { Icon: SiCplusplus, color: "text-blue-500" },
  hpp: { Icon: SiCplusplus, color: "text-blue-500" },
  h: { Icon: SiC, color: "text-blue-500" },
  c: { Icon: SiC, color: "text-blue-500" },
  java: { Icon: VscFileCode, color: "text-red-500" },
  py: { Icon: SiPython, color: "text-sky-400" },
  js: { Icon: VscFileCode, color: "text-yellow-400" },
  jsx: { Icon: VscFileCode, color: "text-yellow-400" },
  ts: { Icon: VscFileCode, color: "text-sky-500" },
  tsx: { Icon: VscFileCode, color: "text-sky-500" },
  php: { Icon: SiPhp, color: "text-violet-500" },
  swift: { Icon: SiSwift, color: "text-orange-400" },
  go: { Icon: SiGo, color: "text-sky-600" },
  rs: { Icon: SiRust, color: "text-orange-600" },
  kt: { Icon: VscFileCode, color: "text-indigo-500" },
  kts: { Icon: VscFileCode, color: "text-indigo-500" },
  rb: { Icon: VscFileCode, color: "text-red-600" },
  sql: { Icon: VscFileCode, color: "text-orange-500" },
  config: { Icon: VscInfo, color: "text-slate-400" },
};

const TabIcon = ({ fileName, active = false, size = 14 }) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const baseClass = active ? "" : "opacity-70";
  const fileIcon = iconMap[extension];
  const Icon = fileIcon?.Icon || VscFile;
  const color = `${baseClass} ${fileIcon?.color || "text-slate-400"}`;
  const sizeStr = `${size}px`;

  return (
    <Icon
      size={size}
      style={{ width: sizeStr, height: sizeStr, minWidth: sizeStr }}
      className={`${color} shrink-0`}
    />
  );
};

export default TabIcon;
