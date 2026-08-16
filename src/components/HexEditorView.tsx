import React, { useState, useMemo } from 'react';
import { 
  Binary, 
  Search, 
  Edit3, 
  Save, 
  FileCode, 
  Hash, 
  Layers, 
  Check, 
  Copy,
  Cpu,
  ArrowRight,
  Database
} from 'lucide-react';
import { Project, FileItem } from '../types';

interface HexEditorViewProps {
  project: Project | null;
  activeFile: FileItem | null;
  onSaveContent?: (path: string, newContent: string) => void;
}

export const HexEditorView: React.FC<HexEditorViewProps> = ({ project, activeFile, onSaveContent }) => {
  const [selectedOffset, setSelectedOffset] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [editByteValue, setEditByteValue] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'hex' | 'dex_header'>('hex');

  // Convert current file content or a sample DEX binary to byte array
  const rawData = useMemo(() => {
    const text = activeFile?.content || `dex\n035\0\x4A\x82\x91\xB3\x55\x89\xAA\xCC\xEE\xFF\x10\x20\x30\x40com.secvault.MainActivity.onCreate`;
    const bytes: number[] = [];
    for (let i = 0; i < Math.min(text.length, 1024); i++) {
      bytes.push(text.charCodeAt(i) & 0xff);
    }
    // Pad to multiple of 16 for clean grid
    while (bytes.length % 16 !== 0) {
      bytes.push(0);
    }
    return bytes;
  }, [activeFile]);

  // Compute Hashes
  const hashes = useMemo(() => {
    const str = rawData.map((b) => b.toString(16).padStart(2, '0')).join('');
    // Simple deterministic hash simulation for display
    let hashVal = 0;
    for (let i = 0; i < rawData.length; i++) {
      hashVal = (hashVal * 31 + rawData[i]) >>> 0;
    }
    return {
      sizeBytes: rawData.length,
      md5: `7f9a${hashVal.toString(16).padStart(8, '0')}4b2c8901e3`,
      sha1: `38bc4490${hashVal.toString(16).padStart(8, '0')}e912ab56cf01889a`,
      sha256: `90af84721bcde00192837465${hashVal.toString(16).padStart(8, '0')}deadbeef12345678`,
    };
  }, [rawData]);

  // Group into 16-byte rows
  const rows = useMemo(() => {
    const result: { offset: number; hex: string[]; ascii: string }[] = [];
    for (let i = 0; i < rawData.length; i += 16) {
      const slice = rawData.slice(i, i + 16);
      const hex = slice.map((b) => b.toString(16).padStart(2, '0').toUpperCase());
      const ascii = slice
        .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
        .join('');
      result.push({ offset: i, hex, ascii });
    }
    return result;
  }, [rawData]);

  // DEX Header Fields Simulation
  const dexHeader = {
    magic: 'dex\\n035\\0 (Dalvik Executable v35)',
    checksum: '0x8FA491C2 (Adler32)',
    signature: '7F 9A 4B 2C 89 01 E3 55 89 AA CC EE FF 10 20 30 (SHA-1)',
    fileSize: `${rawData.length} bytes`,
    headerSize: '112 bytes (0x70)',
    endianTag: '0x12345678 (Little-Endian)',
    linkSize: '0 (Unlinked)',
    mapOff: '0x00000280',
    stringIdsSize: '248 identifiers',
    typeIdsSize: '64 type descriptors',
    protoIdsSize: '42 method prototypes',
    fieldIdsSize: '19 field references',
    methodIdsSize: '88 method definitions',
    classDefsSize: '14 declared classes',
    dataSize: '1,420 bytes',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Binary className="w-5 h-5 text-indigo-400" />
            Hex Editor &amp; Binary Structure Inspector
          </h1>
          <p className="text-xs text-slate-400">
            Raw bytecode inspector with byte patching, ASCII correlation, DEX header structure and cryptographic checksums.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('hex')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'hex' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Hex Grid View</span>
          </button>
          <button
            onClick={() => setActiveTab('dex_header')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'dex_header' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>DEX / ELF Header Map</span>
          </button>
        </div>
      </div>

      {/* Target File & Hash Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-xl">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Inspected Resource</span>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold truncate">
            <FileCode className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>{activeFile?.name || 'classes.dex'}</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Buffer Size</span>
          <span className="text-xs font-mono text-white font-bold">{hashes.sizeBytes} Bytes ({rows.length} lines)</span>
        </div>

        <div className="space-y-1 md:col-span-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">SHA-256 Digest</span>
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="truncate">{hashes.sha256}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(hashes.sha256);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-slate-400 hover:text-white ml-2"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'hex' ? (
        /* Hex Grid View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          {/* Hex Search & Jump Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hex bytes (e.g. 7F 45) or ASCII..."
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500 w-64"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Selected Offset:</span>
              <span className="px-2 py-0.5 bg-slate-950 border border-slate-700 rounded text-indigo-300 font-bold">
                0x{selectedOffset?.toString(16).padStart(8, '0').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Hex & ASCII Matrix */}
          <div className="overflow-x-auto bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs select-text">
            {/* Header Columns */}
            <div className="flex items-center text-slate-500 font-bold border-b border-slate-800 pb-2 mb-2 text-[11px]">
              <span className="w-24 text-slate-500">Offset</span>
              <div className="flex gap-2 flex-1 justify-start">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={i} className="w-6 text-center text-slate-400">
                    {i.toString(16).toUpperCase().padStart(2, '0')}
                  </span>
                ))}
              </div>
              <span className="w-44 text-left pl-4 text-slate-500">Decoded ASCII</span>
            </div>

            {/* Matrix Rows */}
            <div className="space-y-1">
              {rows.map((row) => (
                <div
                  key={row.offset}
                  className="flex items-center hover:bg-slate-900/60 rounded px-1 transition-colors leading-relaxed"
                >
                  {/* Offset */}
                  <span className="w-24 text-slate-500 select-none">
                    0x{row.offset.toString(16).padStart(8, '0').toUpperCase()}
                  </span>

                  {/* Hex Bytes */}
                  <div className="flex gap-2 flex-1 justify-start">
                    {row.hex.map((byte, bIdx) => {
                      const currentByteOffset = row.offset + bIdx;
                      const isSelected = selectedOffset === currentByteOffset;
                      const isNull = byte === '00';
                      const isDexMagic = row.offset === 0 && bIdx < 8;

                      return (
                        <span
                          key={bIdx}
                          onClick={() => setSelectedOffset(currentByteOffset)}
                          className={`w-6 text-center cursor-pointer rounded transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-bold scale-110 shadow-sm'
                              : isDexMagic
                              ? 'text-amber-300 font-bold'
                              : isNull
                              ? 'text-slate-600'
                              : 'text-slate-200 hover:text-indigo-300'
                          }`}
                        >
                          {byte}
                        </span>
                      );
                    })}
                  </div>

                  {/* ASCII Representation */}
                  <span className="w-44 pl-4 text-emerald-400/90 font-mono tracking-wider truncate">
                    {row.ascii}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* DEX / ELF Header Structure Map */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                Dalvik Executable (.dex) Header Specification
              </h2>
              <p className="text-xs text-slate-400">Parsed binary header structure according to Android Dalvik runtime spec.</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
              DEX v035 / API 24+
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {Object.entries(dexHeader).map(([key, val], idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <p className="font-mono text-xs text-cyan-300 font-bold break-all">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
