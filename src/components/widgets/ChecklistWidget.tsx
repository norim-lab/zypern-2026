// =============================================================================
// ChecklistWidget.tsx — Wiederverwendbare, abhakbare UND editierbare Checkliste (v0.7).
//
// Abhak-Zustand persistent in localStorage (Key = zyp2026:checklist:<id>),
// Items + Gruppen editierbar über useChecklists (Key zyp2026:checklists).
// Pro Eintrag: Checkbox + Label (Stift zum Umbenennen, 🗑️ zum Löschen).
// Plus-Button unten für neue Einträge. Gruppen mit eigener Überschrift.
// Reset nur, wenn die Liste zurücksetzbar ist (z. B. Strandtasche).
// =============================================================================
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Checklist } from '@/data/types'

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700'

const miniBtn =
  'ml-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'

export interface ChecklistWidgetProps {
  checklist: Checklist
  /** Kompakte Darstellung (für Dashboard-Vorschau auf die ersten 5 Einträge) */
  preview?: boolean
  /** Abhak-Status (Record<itemId, boolean>) — vom Parent verwaltet (useChecklists). */
  done: Record<string, boolean>
  /** Callbacks aus useChecklists. */
  onToggle: (itemId: string) => void
  onAddItem: (label: string, groupId?: string) => void
  onUpdateItem: (itemId: string, label: string) => void
  onRemoveItem: (itemId: string) => void
  onAddGroup?: (title: string) => void
  onUpdateGroup?: (groupId: string, title: string) => void
  onRemoveGroup?: (groupId: string) => void
  /** Optional: Reset-Button anzeigen (z. B. Strandtasche). */
  onReset?: () => void
}

export function ChecklistWidget({
  checklist,
  preview = false,
  done,
  onToggle,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onAddGroup,
  onUpdateGroup,
  onRemoveGroup,
  onReset,
}: ChecklistWidgetProps) {
  const [newItem, setNewItem] = useState('')
  const [newGroup, setNewGroup] = useState('')
  const [addingGroup, setAddingGroup] = useState(false)
  // Welcher Eintrag wird gerade umbenannt? (itemId oder null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  // Welche Gruppe wird gerade umbenannt?
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupText, setEditingGroupText] = useState('')

  const groups = checklist.groups ?? []
  const items = preview ? checklist.items.slice(0, 5) : checklist.items
  const total = checklist.items.length
  const checkedCount = checklist.items.filter((i) => done[i.id]).length
  const progress = total > 0 ? Math.round((checkedCount / total) * 100) : 0

  // Items ohne Gruppe (entweder keine Gruppen definiert, oder item.groupId fehlt).
  const ungrouped = items.filter((i) => !i.groupId || !groups.some((g) => g.id === i.groupId))

  function commitAddItem(groupId?: string) {
    if (newItem.trim()) {
      onAddItem(newItem, groupId)
      setNewItem('')
    }
  }

  function commitAddGroup() {
    if (newGroup.trim() && onAddGroup) {
      onAddGroup(newGroup)
      setNewGroup('')
      setAddingGroup(false)
    }
  }

  function commitRenameItem() {
    if (editingId && editingText.trim()) {
      onUpdateItem(editingId, editingText)
    }
    setEditingId(null)
    setEditingText('')
  }

  function commitRenameGroup() {
    if (editingGroupId && editingGroupText.trim() && onUpdateGroup) {
      onUpdateGroup(editingGroupId, editingGroupText)
    }
    setEditingGroupId(null)
    setEditingGroupText('')
  }

  /** Rendert einen einzelnen Eintrag (Checkbox + Label + Aktionen). */
  function renderItem(itemId: string, label: string, hint?: string) {
    const isDone = !!done[itemId]
    if (editingId === itemId) {
      return (
        <li key={itemId} className="px-2 py-2">
          <div className="flex items-center gap-2">
            <input
              autoFocus
              className={inputCls}
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              onBlur={commitRenameItem}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRenameItem()
                if (e.key === 'Escape') {
                  setEditingId(null)
                  setEditingText('')
                }
              }}
            />
          </div>
        </li>
      )
    }
    return (
      <li key={itemId}>
        <label className="group flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/40">
          <input
            type="checkbox"
            checked={isDone}
            onChange={() => onToggle(itemId)}
            className="mt-0.5 h-5 w-5 accent-ok"
          />
          <span className="flex-1 text-sm">
            <span
              className={
                isDone
                  ? 'text-slate-400 line-through dark:text-slate-500'
                  : 'text-slate-700 dark:text-slate-200'
              }
            >
              {label}
            </span>
            {hint && <span className="ml-1 text-xs text-slate-400">({hint})</span>}
          </span>
          {/* Editier-Aktionen (nur außerhalb Preview). */}
          {!preview && (
            <span className="flex shrink-0 items-center opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                className={miniBtn}
                aria-label="Eintrag umbenennen"
                onClick={(e) => {
                  e.preventDefault()
                  setEditingId(itemId)
                  setEditingText(label)
                }}
              >
                ✏️
              </button>
              <button
                type="button"
                className={`${miniBtn} hover:text-danger dark:hover:text-red-400`}
                aria-label="Eintrag löschen"
                onClick={(e) => {
                  e.preventDefault()
                  onRemoveItem(itemId)
                }}
              >
                🗑️
              </button>
            </span>
          )}
        </label>
      </li>
    )
  }

  /** Rendert eine Gruppen-Überschrift (umbenennbar/löschbar). */
  function renderGroup(g: { id: string; title: string }) {
    if (editingGroupId === g.id) {
      return (
        <div key={g.id} className="mb-1 mt-3 flex items-center gap-2 px-2">
          <input
            autoFocus
            className={inputCls}
            value={editingGroupText}
            onChange={(e) => setEditingGroupText(e.target.value)}
            onBlur={commitRenameGroup}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRenameGroup()
              if (e.key === 'Escape') {
                setEditingGroupId(null)
                setEditingGroupText('')
              }
            }}
          />
        </div>
      )
    }
    return (
      <div
        key={g.id}
        className="group mb-1 mt-3 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-zypern-blue dark:text-sky-300"
      >
        <span>{g.title}</span>
        {!preview && (
          <span className="flex items-center opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              className={miniBtn}
              aria-label="Gruppe umbenennen"
              onClick={() => {
                setEditingGroupId(g.id)
                setEditingGroupText(g.title)
              }}
            >
              ✏️
            </button>
            <button
              type="button"
              className={`${miniBtn} hover:text-danger dark:hover:text-red-400`}
              aria-label="Gruppe löschen (Einträge bleiben)"
              onClick={() => onRemoveGroup?.(g.id)}
            >
              🗑️
            </button>
          </span>
        )}
      </div>
    )
  }

  return (
    <Card title={`${checklist.icon} ${checklist.title}`}>
      {/* Optionaler Hinweistext unter dem Titel. */}
      {checklist.note && <p className="mb-2 px-2 text-xs text-slate-400">{checklist.note}</p>}

      {/* Fortschrittsbalken */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            {checkedCount} / {total} erledigt
          </span>
          <span>
            {progress}%{onReset && <span className="ml-2">·</span>}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="ml-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ↺ Reset
              </button>
            )}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-ok transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Gruppierte Einträge */}
      {groups.map((g) => (
        <div key={g.id}>
          {renderGroup(g)}
          <ul className="space-y-1">
            {items
              .filter((i) => i.groupId === g.id)
              .map((i) => renderItem(i.id, i.label, i.hint))}
          </ul>
        </div>
      ))}

      {/* Einträge ohne Gruppe (oder wenn es keine Gruppen gibt) */}
      {ungrouped.length > 0 && (
        <div>
          {groups.length > 0 && (
            <div className="mb-1 mt-3 px-2 text-xs font-semibold uppercase tracking-wide text-zypern-blue dark:text-sky-300">
              Sonstiges
            </div>
          )}
          <ul className="space-y-1">{ungrouped.map((i) => renderItem(i.id, i.label, i.hint))}</ul>
        </div>
      )}

      {/* Preview-Hinweis: weitere Einträge */}
      {preview && total > items.length && (
        <p className="mt-2 text-xs text-slate-400">+{total - items.length} weitere …</p>
      )}

      {/* Editor: neuer Eintrag + neue Gruppe (nur außerhalb Preview). */}
      {!preview && (
        <div className="mt-3 space-y-2">
          {/* Gruppe hinzufügen (nur wenn die Liste Gruppen unterstützt). */}
          {groups.length > 0 || addingGroup ? (
            addingGroup ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  className={inputCls}
                  placeholder="Neue Gruppe (z. B. Medikamente)"
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitAddGroup()
                    if (e.key === 'Escape') {
                      setAddingGroup(false)
                      setNewGroup('')
                    }
                  }}
                />
                <Button variant="secondary" onClick={commitAddGroup} className="!min-h-0 shrink-0">
                  OK
                </Button>
              </div>
            ) : (
              <button
                type="button"
                className={miniBtn}
                onClick={() => setAddingGroup(true)}
              >
                + Gruppe hinzufügen
              </button>
            )
          ) : null}

          {/* Neuer Eintrag. */}
          <div className="flex gap-2">
            <input
              className={inputCls}
              placeholder="Neuen Eintrag hinzufügen …"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitAddItem()
              }}
            />
            <Button
              variant="secondary"
              icon="➕"
              onClick={() => commitAddItem()}
              className="!min-h-0 shrink-0"
            >
              <span className="sr-only">Hinzufügen</span>
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
