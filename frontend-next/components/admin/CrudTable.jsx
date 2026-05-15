"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Copy, Check } from 'lucide-react';

const MAX_VISIBLE_COLUMNS = 5;

export default function CrudTable({ columns, data, onEdit, onDelete, onAdd, formatCellValue, onCopy, extraActions, renderCell }) {
  const visibleColumns = columns.slice(0, MAX_VISIBLE_COLUMNS);
  const hasOverflow = columns.length > MAX_VISIBLE_COLUMNS;
  const format = formatCellValue || ((v) => {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    if (Array.isArray(v)) return `${v.length} item(s)`;
    if (typeof v === 'object') return JSON.stringify(v).substring(0, 50);
    return String(v);
  });

  const [copiedRowId, setCopiedRowId] = useState(null);

  const handleCopy = (record) => {
    if (onCopy) {
      onCopy(record);
      setCopiedRowId(record.id);
      setTimeout(() => setCopiedRowId(null), 1500);
    }
  };

  const actionButtons = (record) => (
    <>
      {onCopy && (
        <button
          onClick={(e) => { e.stopPropagation(); handleCopy(record); }}
          className="p-2 rounded-md text-[#5C5854] hover:bg-[#5C5854]/10 transition-colors"
          title="Copier les infos"
        >
          {copiedRowId === record.id ? <Check size={16} /> : <Copy size={16} />}
        </button>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(record); }}
        className="p-2 rounded-md text-[#B8941E] hover:bg-[#B8941E]/10 transition-colors"
        title="Modifier"
      >
        <Pencil size={16} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(record.id); }}
        className="p-2 rounded-md text-[#C8102E] hover:bg-[#C8102E]/10 transition-colors"
        title="Supprimer"
      >
        <Trash2 size={16} />
      </button>
      {extraActions && extraActions(record)}
    </>
  );

  return (
    <div className="bg-white rounded-xl border border-[#1A1515]/10 shadow-soft overflow-hidden">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-[#1A1515]/8">
        <p className="text-sm text-[#5C5854]">{data.length} record{data.length !== 1 ? 's' : ''}</p>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-[#B8941E] text-white text-xs md:text-sm font-semibold hover:bg-[#B8941E]/90 transition-colors"
        >
          <Plus size={14} />
          <span>Ajouter</span>
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-[#5C5854] text-sm">Aucun enregistrement trouvé</p>
          <button
            onClick={onAdd}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#B8941E] text-white text-sm font-semibold hover:bg-[#B8941E]/90 transition-colors"
          >
            <Plus size={16} />
            Ajouter votre premier enregistrement
          </button>
        </div>
      ) : (
        <div className="md:overflow-x-auto overflow-hidden">
          <div className="md:hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1A1515]/8 sticky top-0 z-10">
                  {visibleColumns.map((col) => (
                    <th
                      key={col.key}
                      className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#5C5854] bg-[#F7F5F2]"
                    >
                      {col.label}
                    </th>
                  ))}
                  {hasOverflow && (
                    <th className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#5C5854] bg-[#F7F5F2]">
                      ...
                    </th>
                  )}
                  <th className="text-right px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#5C5854] bg-[#F7F5F2]">
                    Act.
                  </th>
                </tr>
              </thead>
            </table>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <table className="w-full">
                <tbody>
                  <AnimatePresence>
                    {data.map((record) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="border-b border-[#1A1515]/5 hover:bg-[#B8941E]/3 transition-colors"
                      >
                        {visibleColumns.map((col) => (
                          <td
                            key={col.key}
                            className="px-3 py-2 text-xs text-[#1A1515] max-w-[100px] truncate"
                            title={String(record[col.key] ?? '')}
                          >
                            {renderCell?.(record[col.key], col.key, record) ?? format(record[col.key])}
                          </td>
                        ))}
                        {hasOverflow && (
                          <td className="px-3 py-2 text-xs text-[#5C5854]">...</td>
                        )}
                        <td className="px-3 py-2 text-right">
                          <div className="inline-flex items-center gap-0.5">
                            {actionButtons(record)}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>

          <table className="hidden md:table w-full">
            <thead>
              <tr className="border-b border-[#1A1515]/8">
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#5C5854] bg-[#F7F5F2]"
                  >
                    {col.label}
                  </th>
                ))}
                {hasOverflow && (
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#5C5854] bg-[#F7F5F2]">
                    ...
                  </th>
                )}
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#5C5854] bg-[#F7F5F2]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {data.map((record) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-[#1A1515]/5 hover:bg-[#B8941E]/3 transition-colors"
                  >
                    {visibleColumns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-3 text-sm text-[#1A1515] max-w-[200px] truncate"
                        title={String(record[col.key] ?? '')}
                      >
                        {renderCell?.(record[col.key], col.key, record) ?? format(record[col.key])}
                      </td>
                    ))}
                    {hasOverflow && (
                      <td className="px-4 py-3 text-sm text-[#5C5854]">...</td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1 justify-end">
                        {actionButtons(record)}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
