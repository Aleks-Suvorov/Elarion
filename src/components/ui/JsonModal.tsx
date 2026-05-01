'use client';

import { useState } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { useUIStore } from '../../state/uiStore';
import { useGameStore } from '../../state/gameStore';
import { importStateJSON } from '../../lib/db';
import { validateSaveState } from '../../schemas/saveState';

export function JsonModal() {
  const { jsonModalOpen, jsonModalContent, jsonModalMode, closeJsonModal, openExportModal } =
    useUIStore();
  const { buildSaveState, loadFromSaveState } = useGameStore();

  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonModalContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleImport = () => {
    setImportError(null);
    try {
      const parsed = importStateJSON(importText);
      const validation = validateSaveState(parsed);
      if (!validation.success) {
        setImportError(
          `Validation errors:\n${(validation as { success: false; errors: string[] }).errors.join('\n')}`
        );
        return;
      }
      loadFromSaveState(parsed);
      closeJsonModal();
    } catch (err) {
      setImportError(`Parse error: ${(err as Error).message}`);
    }
  };

  const handleOpenExport = () => {
    const state = buildSaveState();
    if (!state) return;
    openExportModal(JSON.stringify(state, null, 2));
  };

  return (
    <Dialog
      open={jsonModalOpen}
      onOpenChange={closeJsonModal}
      title={jsonModalMode === 'export' ? 'Export Save State' : 'Import Save State'}
      description={
        jsonModalMode === 'export'
          ? 'Copy this JSON to backup or transfer your session.'
          : 'Paste a previously exported USRE save JSON to restore a session.'
      }
      maxWidth="max-w-3xl"
    >
      {jsonModalMode === 'export' ? (
        <div className="flex flex-col gap-3">
          <textarea
            readOnly
            value={jsonModalContent}
            className="w-full h-64 bg-surface-0 border border-faint rounded p-3 text-xs font-mono text-gray-300 resize-none focus:outline-none"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </Button>
            <Button variant="ghost" size="sm" onClick={closeJsonModal}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <textarea
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value);
              setImportError(null);
            }}
            placeholder='Paste your USRE save JSON here...'
            className="w-full h-64 bg-surface-0 border border-faint rounded p-3 text-xs font-mono text-gray-300 resize-none focus:outline-none focus:border-accent-gold-dim"
          />
          {importError && (
            <pre className="text-xs text-accent-red whitespace-pre-wrap bg-accent-red/5 border border-accent-red/30 rounded p-2">
              {importError}
            </pre>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={closeJsonModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleImport}
              disabled={!importText.trim()}
            >
              Load Save
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
