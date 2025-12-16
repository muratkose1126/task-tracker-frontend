'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useAuth';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { toast } from 'sonner';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  label: string;
  action: () => void;
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: workspaces } = useWorkspaces();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      ctrlKey: true,
      metaKey: true,
      label: 'Search/Command Palette',
      action: () => {
        // TODO: Implement command palette
        toast.info('Command palette yakında gelecek');
      },
    },
    {
      key: 'n',
      ctrlKey: true,
      label: 'New Task',
      action: () => {
        // Dispatch custom event to trigger new task dialog
        window.dispatchEvent(new CustomEvent('keyboard:newTask'));
      },
    },
    {
      key: '/',
      shiftKey: true,
      label: 'Show Help',
      action: () => {
        window.dispatchEvent(new CustomEvent('keyboard:showHelp'));
      },
    },
    {
      key: 'Escape',
      label: 'Close Dialog',
      action: () => {
        window.dispatchEvent(new CustomEvent('keyboard:closeDialog'));
      },
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcut = shortcuts.find(
        (s) =>
          s.key.toLowerCase() === e.key.toLowerCase() &&
          (s.ctrlKey === undefined || s.ctrlKey === e.ctrlKey) &&
          (s.metaKey === undefined || s.metaKey === e.metaKey) &&
          (s.shiftKey === undefined || s.shiftKey === e.shiftKey) &&
          (s.altKey === undefined || s.altKey === e.altKey)
      );

      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return shortcuts;
}

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();
  return <>{children}</>;
}
