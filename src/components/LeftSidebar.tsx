import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ListTree,
  X,
} from 'lucide-react';
import { DocumentItem, OutlineHeading } from '../types/editor';

interface LeftSidebarProps {
  documents: DocumentItem[];
  activeDocId: string;
  outline: OutlineHeading[];
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onSelectDocument: (id: string) => void;
  onCreateDocument: () => void;
  onDeleteDocument: (id: string) => void;
  onJumpToHeading: (index: number) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  documents,
  activeDocId,
  outline,
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onSelectDocument,
  onCreateDocument,
  onDeleteDocument,
  onJumpToHeading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'files' | 'outline'>('files');

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const formatRelativeTime = (ts: number) => {
    const diffMin = Math.floor((Date.now() - ts) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const sidebarContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full bg-[#FAFAFA] border-r border-[#E4E4E7] select-none">
      {/* Rail Header */}
      <div className="h-[42px] px-3 flex items-center justify-between border-b border-[#E4E4E7] shrink-0">
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-1 bg-[#F4F4F5] p-0.5 rounded-[4px] border border-[#E4E4E7]">
            <button
              type="button"
              onClick={() => setActiveTab('files')}
              className={`px-2 py-1 text-[11px] font-medium rounded-[3px] transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'files'
                  ? 'bg-white text-[#09090B] shadow-xs'
                  : 'text-[#71717A] hover:text-[#09090B]'
              }`}
            >
              Documents
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('outline')}
              className={`px-2 py-1 text-[11px] font-medium rounded-[3px] transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'outline'
                  ? 'bg-white text-[#09090B] shadow-xs'
                  : 'text-[#71717A] hover:text-[#09090B]'
              }`}
            >
              Outline
            </button>
          </div>
        )}

        {isMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            title="Close sidebar"
            className="w-7 h-7 flex items-center justify-center rounded-[4px] text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand navigator' : 'Collapse navigator'}
            className={`w-7 h-7 flex items-center justify-center rounded-[4px] text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors ${
              collapsed ? 'mx-auto' : ''
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4 stroke-[1.5]" />
            ) : (
              <PanelLeftClose className="w-4 h-4 stroke-[1.5]" />
            )}
          </button>
        )}
      </div>

      {/* Collapsed Icon-Only Desktop Rail */}
      {collapsed && !isMobile ? (
        <div className="flex flex-col items-center py-2 gap-1.5 flex-1 overflow-y-auto">
          <button
            type="button"
            onClick={onCreateDocument}
            title="New document"
            className="w-8 h-8 flex items-center justify-center rounded-[4px] bg-[#09090B] text-white hover:bg-[#18181B] transition-colors mb-1"
          >
            <Plus className="w-4 h-4 stroke-[1.75]" />
          </button>
          {documents.map((doc) => {
            const isActive = doc.id === activeDocId;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelectDocument(doc.id)}
                title={doc.title || 'Untitled Document'}
                className={`w-8 h-8 flex items-center justify-center rounded-[4px] transition-colors ${
                  isActive
                    ? 'bg-[#E4E4E7] text-[#09090B]'
                    : 'text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#09090B]'
                }`}
              >
                <FileText className="w-4 h-4 stroke-[1.5]" />
              </button>
            );
          })}
        </div>
      ) : activeTab === 'files' ? (
        /* Expanded Documents View */
        <div className="flex flex-col flex-1 min-h-0">
          <div className="p-2.5 border-b border-[#E4E4E7] space-y-2">
            <button
              type="button"
              onClick={onCreateDocument}
              className="w-full h-8 px-3 flex items-center justify-center gap-1.5 rounded-[4px] bg-[#09090B] text-white text-[12px] font-medium hover:bg-[#18181B] active:bg-[#27272A] transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2]" />
              <span>New Document</span>
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter documents..."
                className="w-full h-7 pl-7 pr-2.5 text-[12px] bg-white border border-[#E4E4E7] rounded-[4px] text-[#09090B] placeholder:text-[#71717A] focus:outline-none focus:border-[#09090B]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
            {filteredDocs.length === 0 ? (
              <p className="px-2.5 py-6 text-center text-[12px] text-[#71717A]">
                No matching documents.
              </p>
            ) : (
              filteredDocs.map((doc) => {
                const isActive = doc.id === activeDocId;
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      onSelectDocument(doc.id);
                      if (isMobile) onCloseMobile();
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectDocument(doc.id);
                        if (isMobile) onCloseMobile();
                      }
                    }}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-[4px] cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[#F4F4F5] text-[#09090B] border border-[#E4E4E7]'
                        : 'text-[#47464A] hover:bg-[#F4F4F5]/70 hover:text-[#09090B] border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <FileText
                        className={`w-3.5 h-3.5 mt-0.5 shrink-0 stroke-[1.5] ${
                          isActive ? 'text-[#09090B]' : 'text-[#71717A]'
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-medium truncate leading-tight">
                          {doc.title || 'Untitled Document'}
                        </div>
                        <div className="text-[11px] text-[#71717A] font-mono tabular-nums mt-0.5">
                          {formatRelativeTime(doc.updatedAt)}
                        </div>
                      </div>
                    </div>

                    {documents.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDocument(doc.id);
                        }}
                        title="Delete document"
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-[3px] text-[#71717A] hover:text-[#09090B] hover:bg-[#E4E4E7] transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Expanded Outline View */
        <div className="flex flex-col flex-1 min-h-0">
          <div className="px-3 py-2 border-b border-[#E4E4E7] flex items-center gap-1.5 text-[11px] font-medium text-[#71717A]">
            <ListTree className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Document Headings</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {outline.length === 0 ? (
              <p className="px-2 py-6 text-center text-[12px] text-[#71717A]">
                Add Heading 1–3 blocks to populate the outline.
              </p>
            ) : (
              outline.map((heading) => (
                <button
                  key={heading.id}
                  type="button"
                  onClick={() => {
                    onJumpToHeading(heading.index);
                    if (isMobile) onCloseMobile();
                  }}
                  style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
                  className="w-full text-left py-1.5 pr-2 rounded-[4px] text-[12px] text-[#47464A] hover:text-[#09090B] hover:bg-[#F4F4F5] truncate transition-colors"
                >
                  <span className="font-mono text-[10px] text-[#71717A] mr-1.5">
                    H{heading.level}
                  </span>
                  {heading.text}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Footer note: zero-signup local storage indicator */}
      {(!collapsed || isMobile) && (
        <div className="px-3 py-2 border-t border-[#E4E4E7] text-[11px] text-[#71717A] flex items-center justify-between">
          <span>Saved locally</span>
          <span className="font-mono tabular-nums">{documents.length} files</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Rail */}
      <aside
        className={`hidden lg:block shrink-0 h-full transition-[width] duration-150 ${
          collapsed ? 'w-[48px]' : 'w-[260px]'
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* Mobile / Tablet Off-Canvas Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#09090B]/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-[272px] max-w-[85vw] h-full bg-[#FAFAFA] shadow-xl">
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
