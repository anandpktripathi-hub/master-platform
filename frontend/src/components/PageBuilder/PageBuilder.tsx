import React, { useState, useEffect, useRef, Suspense } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { aiApi } from '../../lib/api';
import { useApiErrorToast } from '../../providers/QueryProvider';
import api from '../../api/client';
import { useTenantContext } from '../../contexts/TenantContext';

import { SECTION_LIBRARY, SectionLibraryItemType } from './SectionsLibrary';
import HeroSection from './sections/HeroSection';
import FeatureSection from './sections/FeatureSection';
import FooterSection from './sections/FooterSection';
import DesignControls from './DesignControls';
import LayersPanel from './LayersPanel';
import Canvas from './Canvas';
const FileImportModal = React.lazy(() => import('./FileImportModal'));
const MonacoEditorWrapper = React.lazy(() => import('./MonacoEditorWrapper'));
const WysiwygEditor = React.lazy(() => import('./WysiwygEditor'));
import ImageEditor from './ImageEditor';
import MenuBuilder from './MenuBuilder';

interface DroppedSection {
  id: string;
  type: string;
  column: number;
  zIndex: number;
  design?: {
    padding?: number;
    margin?: number;
    shadow?: string;
    border?: string;
  };
}
const SECTION_COMPONENTS: Record<string, React.FC> = {
  hero: HeroSection,
  feature: FeatureSection,
  footer: FooterSection,
  // Add more mappings for demo/sample sections as needed
};

// Canvas is now imported from Canvas.tsx

const SectionsLibraryPanel: React.FC<{ onDragStart: (type: string) => void }> = ({ onDragStart }) => {
  return (
    <div className="w-72 bg-white rounded-lg shadow p-4 flex flex-col gap-2 overflow-y-auto max-h-[80vh]">
      <h3 className="font-bold text-lg mb-2">Section Library</h3>
      <div className="flex flex-col gap-2">
        {SECTION_LIBRARY.map((section) => (
          <SectionLibraryItem key={section.type} section={section} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  );
};

const SectionLibraryItem: React.FC<{ section: SectionLibraryItemType; onDragStart: (type: string) => void }> = ({ section, onDragStart }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'SECTION',
    item: { type: section.type },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));
  return (
    <div
      ref={drag}
      className={`cursor-move p-2 rounded border flex items-center gap-2 ${isDragging ? 'bg-blue-100' : 'bg-gray-50'} hover:bg-blue-50`}
      onMouseDown={() => onDragStart(section.type)}
    >
      <div className="w-16 h-10 flex items-center justify-center">{section.preview}</div>
      <div className="flex-1">
        <div className="font-semibold text-sm">{section.label}</div>
        <div className="text-xs text-gray-400">{section.category}</div>
      </div>
    </div>
  );
};



const DEFAULT_DESIGN = {
  padding: 16,
  margin: 8,
  shadow: 'shadow',
  border: 'border',
  fontFamily: 'Inter',
  fontSize: 18,
  fontWeight: 400,
  lineHeight: 1.5,
  rotate: 0,
  scale: 1,
  skew: 0,
};


const PageBuilder: React.FC = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [formData, setFormData] = useState({ title: '', slug: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  // ...existing state...
  const [sections, setSections] = useState<DroppedSection[]>([]);
  const [columns, setColumns] = useState<number>(2);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>('my-page');
  const [saving, setSaving] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showWysiwyg, setShowWysiwyg] = useState(false);
  const [showMenuBuilder, setShowMenuBuilder] = useState(false);
  const [wysiwygValue, setWysiwygValue] = useState('');
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const { tenantId } = useTenantContext();
  const [zOrder, setZOrder] = useState<string[]>([]);
  const [aiTopic, setAiTopic] = useState('');
  const [aiPageType, setAiPageType] = useState('landing page');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiIdeas, setAiIdeas] = useState<string[]>([]);
  const { showErrorToast, showSuccessToast } = useApiErrorToast();

  const requireTenantContext = (): boolean => {
    if (!tenantId) {
      showErrorToast(new Error('Workspace/tenant context missing'));
      return false;
    }
    return true;
  };

  const handleDrop = (type: string, column: number) => {
    const id = `${type}-${Date.now()}`;
    setSections((prev) => [
      ...prev,
      { id, type, column, zIndex: prev.length, design: { ...DEFAULT_DESIGN } },
    ]);
    setZOrder((prev) => [...prev, id]);
  };

  const handleSelect = (id: string) => setSelectedId(id);

  const handleDesignChange = (controls: any) => {
    if (!selectedId) return;
    setSections(prev => prev.map(s =>
      s.id === selectedId ? { ...s, design: { ...s.design, ...controls } } : s
    ));
  };

  // Handle import result
  const handleImport = (designJson: any) => {
    setSections(designJson.sections || []);
    setColumns(designJson.columns?.length || 2);
    setZOrder(designJson.layers || []);
    // Optionally set framework, cleaned, etc.
  };

  // Layers for panel (ordered by zOrder)
  const layers = zOrder.map(id => {
    const s = sections.find(sec => sec.id === id);
    return s ? { id: s.id, label: s.type } : null;
  }).filter(Boolean) as { id: string; label: string }[];

  // Drag reorder handler for layers panel
  const handleReorder = (from: number, to: number) => {
    setZOrder((prev) => {
      const arr = [...prev];
      const [removed] = arr.splice(from, 1);
      arr.splice(to, 0, removed);

      setSections((prevSections) =>
        prevSections.map((s) => ({ ...s, zIndex: arr.indexOf(s.id) })),
      );

      return arr;
    });
  };

  // Z-Index controls
  const bringToFront = (id: string) => {
    setZOrder(prev => {
      const arr = prev.filter(zid => zid !== id);
      arr.push(id);
      return arr;
    });
  };
  const sendToBack = (id: string) => {
    setZOrder(prev => {
      const arr = prev.filter(zid => zid !== id);
      arr.unshift(id);
      return arr;
    });
  };

  // Save designJson to backend
  const savePage = async () => {
    if (!requireTenantContext()) return;
    if (!slug?.trim()) {
      showErrorToast(new Error('Slug is required'));
      return;
    }
    setSaving(true);
    try {
      const designJson = {
        sections,
        columns: Array.from({ length: columns }, (_, i) => ({ id: `col-${i+1}`, width: `${100/columns}%` })),
        layers: zOrder,
      };
      await api.post(`/cms/pages`, { slug, designJson });
      showSuccessToast('Page saved');
    } catch (error: any) {
      showErrorToast(error);
    } finally {
      setSaving(false);
    }
  };

  // Load page from backend
  const loadPage = async () => {
    if (!requireTenantContext()) return;
    if (!slug?.trim()) {
      showErrorToast(new Error('Slug is required'));
      return;
    }
    try {
      const res = (await api.get(`/cms/pages/${slug}`)) as any;
      const designJson = res?.designJson;
      if (!designJson || typeof designJson !== 'object') {
        showErrorToast(new Error('No design data found for this page'));
        return;
      }
      setSections(designJson.sections || []);
      setColumns(designJson.columns?.length || 2);
      setZOrder(designJson.layers || []);
      showSuccessToast('Page loaded');
    } catch (error: any) {
      showErrorToast(error);
    }
  };

  const deletePage = async (_pageId: string) => {
    showErrorToast(new Error('Delete page is not implemented in PageBuilder'));
  };

  // Auto-save every 30s
  useEffect(() => {
    if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);

    // Avoid spamming toasts when tenant context is missing.
    if (!tenantId || !slug?.trim()) {
      return;
    }

    autoSaveTimer.current = setInterval(() => {
      if (!saving) void savePage();
    }, 30000);
    return () => autoSaveTimer.current && clearInterval(autoSaveTimer.current);
    // eslint-disable-next-line
  }, [sections, columns, zOrder, slug, tenantId, saving]);

  // Version history UI (fetch on mount)
  useEffect(() => {
    if (!tenantId) return;
    api
      .get(`/cms/pages/${slug}/versions`)
      .then((res: any) => setVersions(res || []))
      .catch(showErrorToast);
  }, [slug, tenantId, showErrorToast]);

  const handleGenerateAiIdeas = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    try {
      const suggestions = await aiApi.generateSuggestions(
        aiTopic.trim(),
        `${aiPageType} hero + sections`,
      );
      setAiIdeas(suggestions || []);
      if (suggestions && suggestions.length > 0) {
        setWysiwygValue(suggestions[0]);
        setShowWysiwyg(true);
      }
      showSuccessToast('AI generated content ideas for this page.');
    } catch (error: any) {
      showErrorToast(error);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="page-builder">
      <div className="cms-toolbar">
        {/* Pages List */}
        <div className="pages-list">
          <h4>📄 Pages ({pages.length})</h4>
          {pages.map((page: any) => (
            <div key={page._id} className="page-item">
              <span>{page.title} ({page.slug})</span>
              <button onClick={() => deletePage(page._id)}>Delete</button>
            </div>
          ))}
        </div>
        {/* Save Page */}
        <div className="save-section">
          <input
            placeholder="Page Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            disabled={saving}
          />
          <input
            placeholder="Slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setFormData({ ...formData, slug: e.target.value });
            }}
            disabled={saving}
          />
          <button
            onClick={() => void savePage()}
            className="btn-save"
            disabled={saving || !slug.trim() || !tenantId}
          >
            💾 Save Page
          </button>
        </div>
        {/* File Import */}
        <div className="import-section">
          <button onClick={() => fileInputRef.current?.click()}> 📁 Import ZIP </button>
          <input ref={fileInputRef} type="file" accept=".zip" style={{display: 'none'}} onChange={handleFileImport} />
        </div>
      </div>

      <div className="mt-3 mb-4 flex flex-col gap-3 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-end md:gap-4 gap-2">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Page topic or goal</label>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="e.g. SaaS billing dashboard for agencies"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Page type</label>
            <select
              value={aiPageType}
              onChange={(e) => setAiPageType(e.target.value)}
              className="border rounded px-2 py-1 text-sm min-w-[160px]"
            >
              <option value="landing page">Landing page</option>
              <option value="pricing page">Pricing page</option>
              <option value="feature page">Feature page</option>
              <option value="blog post">Blog post</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => void handleGenerateAiIdeas()}
            disabled={aiLoading || !aiTopic.trim()}
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-60"
          >
            {aiLoading ? 'Thinking…' : 'Ask AI for ideas'}
          </button>
        </div>
        {aiIdeas.length > 0 && (
          <div className="text-xs text-gray-600">
            <div className="font-semibold mb-1">AI suggestions</div>
            <ul className="list-disc list-inside space-y-1">
              {aiIdeas.map((idea, idx) => (
                <li key={idx} className="whitespace-pre-wrap break-words">
                  {idea}
                </li>
              ))}
            </ul>
            <div className="mt-1 text-[11px] text-gray-500">
              The first suggestion is loaded into the rich text editor below. You can tweak it and copy into any section.
            </div>
          </div>
        )}
      </div>

      {showWysiwyg && (
        <div className="mb-4">
          <Suspense fallback={<div className="text-sm text-gray-500">Loading editor…</div>}>
            <WysiwygEditor value={wysiwygValue} onChange={setWysiwygValue} />
          </Suspense>
          <div className="mt-1 flex justify-between items-center text-[11px] text-gray-500">
            <span>Copy this content into your hero, feature, or blog sections as needed.</span>
            <button
              type="button"
              onClick={() => setShowWysiwyg(false)}
              className="px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 text-[11px]"
            >
              Close editor
            </button>
          </div>
        </div>
      )}
      {/* ...existing builder UI... */}
      { /* Main builder area, conditional rendering if needed */ }
      {true && (
        <div className="flex gap-4 flex-1">
          <LayersPanel
            layers={layers}
            selectedId={selectedId}
            onSelect={handleSelect}
            onReorder={handleReorder}
            bringToFront={bringToFront}
            sendToBack={sendToBack}
          />
          <SectionsLibraryPanel onDragStart={() => {}} />
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-4 mb-2">
              <label className="font-semibold text-sm">Columns:</label>
              <select
                value={columns}
                onChange={e => setColumns(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                {[1,2,3,4,6,8,12].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <Canvas
              sections={sections}
              columns={columns}
              onDrop={handleDrop}
              onSelect={handleSelect}
              selectedId={selectedId}
            />
          </div>
        </div>
      )}
      <DesignControls
        padding={selectedId ? (sections.find(s => s.id === selectedId)?.design?.padding ?? 16) : 16}
        margin={selectedId ? (sections.find(s => s.id === selectedId)?.design?.margin ?? 8) : 8}
        shadow={selectedId ? (sections.find(s => s.id === selectedId)?.design?.shadow ?? 'shadow') : 'shadow'}
        border={selectedId ? (sections.find(s => s.id === selectedId)?.design?.border ?? 'border') : 'border'}
        fontFamily={selectedId ? (sections.find(s => s.id === selectedId)?.design?.fontFamily ?? 'Inter') : 'Inter'}
        fontSize={selectedId ? (sections.find(s => s.id === selectedId)?.design?.fontSize ?? 18) : 18}
        fontWeight={selectedId ? (sections.find(s => s.id === selectedId)?.design?.fontWeight ?? 400) : 400}
        lineHeight={selectedId ? (sections.find(s => s.id === selectedId)?.design?.lineHeight ?? 1.5) : 1.5}
        rotate={selectedId ? (sections.find(s => s.id === selectedId)?.design?.rotate ?? 0) : 0}
        scale={selectedId ? (sections.find(s => s.id === selectedId)?.design?.scale ?? 1) : 1}
        skew={selectedId ? (sections.find(s => s.id === selectedId)?.design?.skew ?? 0) : 0}
        onChange={handleDesignChange}
      />
    </div>
  );
}

export default PageBuilder;
