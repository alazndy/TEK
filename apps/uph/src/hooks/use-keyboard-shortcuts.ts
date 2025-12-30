/**
 * useKeyboardShortcuts - Global keyboard shortcut hook for UPH
 */

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export type ShortcutAction = 
  | 'new-project'
  | 'global-search'
  | 'save'
  | 'dashboard'
  | 'projects'
  | 'kanban'
  | 'settings'
  | 'help'
  | 'esc';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: ShortcutAction;
  description: string;
}

const SHORTCUTS: ShortcutConfig[] = [
  { key: 'n', ctrl: true, action: 'new-project', description: 'Yeni Proje' },
  { key: 'k', ctrl: true, action: 'global-search', description: 'Global Arama' },
  { key: 's', ctrl: true, action: 'save', description: 'Kaydet' },
  { key: 'd', ctrl: true, shift: true, action: 'dashboard', description: 'Dashboard' },
  { key: 'p', ctrl: true, shift: true, action: 'projects', description: 'Projeler' },
  { key: 'b', ctrl: true, shift: true, action: 'kanban', description: 'Kanban' },
  { key: ',', ctrl: true, action: 'settings', description: 'Ayarlar' },
  { key: '?', ctrl: false, shift: true, action: 'help', description: 'Yardım' },
  { key: 'Escape', action: 'esc', description: 'Kapat/İptal' },
];

interface UseKeyboardShortcutsOptions {
  onAction?: (action: ShortcutAction) => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { onAction, enabled = true } = options;
  const router = useRouter();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if typing in input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      if (event.key !== 'Escape') return;
    }

    // Find matching shortcut
    const shortcut = SHORTCUTS.find(s => {
      const keyMatch = s.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = !!s.ctrl === (event.ctrlKey || event.metaKey);
      const shiftMatch = !!s.shift === event.shiftKey;
      const altMatch = !!s.alt === event.altKey;
      return keyMatch && ctrlMatch && shiftMatch && altMatch;
    });

    if (!shortcut) return;

    event.preventDefault();

    // Handle action
    if (onAction) {
      onAction(shortcut.action);
    } else {
      // Default actions
      switch (shortcut.action) {
        case 'new-project':
          router.push('/projects/new');
          break;
        case 'global-search':
          // Open search modal (emit event)
          document.dispatchEvent(new CustomEvent('openSearch'));
          break;
        case 'save':
          document.dispatchEvent(new CustomEvent('saveDocument'));
          break;
        case 'dashboard':
          router.push('/dashboard');
          break;
        case 'projects':
          router.push('/projects');
          break;
        case 'kanban':
          router.push('/kanban');
          break;
        case 'settings':
          router.push('/settings');
          break;
        case 'help':
          document.dispatchEvent(new CustomEvent('openHelp'));
          break;
        case 'esc':
          document.dispatchEvent(new CustomEvent('closeModal'));
          break;
      }
    }
  }, [onAction, router]);

  useEffect(() => {
    if (!enabled) return;
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {
    shortcuts: SHORTCUTS,
  };
}

// Shortcut display component moved to @/components/ui/shortcut-key.tsx

// Format shortcut for display
export function formatShortcut(shortcut: ShortcutConfig): string[] {
  const keys: string[] = [];
  if (shortcut.ctrl) keys.push('Ctrl');
  if (shortcut.shift) keys.push('Shift');
  if (shortcut.alt) keys.push('Alt');
  keys.push(shortcut.key.toUpperCase());
  return keys;
}
