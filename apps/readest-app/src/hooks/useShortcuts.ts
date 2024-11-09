import { useEffect, useState } from 'react';
import { loadShortcuts, ShortcutConfig } from '../helpers/shortcuts';

export type KeyActionHandlers = {
  [K in keyof ShortcutConfig]?: () => void;
};

const useShortcuts = (actions: KeyActionHandlers, dependencies: React.DependencyList = []) => {
  const [shortcuts, setShortcuts] = useState<ShortcutConfig>(loadShortcuts);

  useEffect(() => {
    const handleShortcutUpdate = () => {
      setShortcuts(loadShortcuts());
    };

    window.addEventListener('shortcutUpdate', handleShortcutUpdate);
    return () => window.removeEventListener('shortcutUpdate', handleShortcutUpdate);
  }, []);

  const parseShortcut = (shortcut: string) => {
    const keys = shortcut.toLowerCase().split('+');
    return {
      ctrlKey: keys.includes('ctrl'),
      altKey: keys.includes('alt') || keys.includes('opt'),
      metaKey: keys.includes('meta'),
      shiftKey: keys.includes('shift'),
      key: keys.find((k) => !['ctrl', 'alt', 'opt', 'meta', 'shift'].includes(k)),
    };
  };

  const isShortcutMatch = (
    shortcut: string,
    key: string,
    ctrlKey: boolean,
    altKey: boolean,
    metaKey: boolean,
    shiftKey: boolean,
  ) => {
    const parsedShortcut = parseShortcut(shortcut);
    return (
      parsedShortcut.key === key.toLowerCase() &&
      parsedShortcut.ctrlKey === ctrlKey &&
      parsedShortcut.altKey === altKey &&
      parsedShortcut.metaKey === metaKey &&
      parsedShortcut.shiftKey === shiftKey
    );
  };

  const processKeyEvent = (
    key: string,
    ctrlKey: boolean,
    altKey: boolean,
    metaKey: boolean,
    shiftKey: boolean,
  ) => {
    // FIXME: This is a temporary fix to disable Back button navigation
    if (key === 'backspace') return true;
    for (const [actionName, actionHandler] of Object.entries(actions)) {
      const shortcutKey = actionName as keyof ShortcutConfig;
      const handler = actionHandler as (() => void) | undefined;
      const shortcutList = shortcuts[shortcutKey as keyof ShortcutConfig];
      if (
        handler &&
        shortcutList?.some((shortcut) =>
          isShortcutMatch(shortcut, key, ctrlKey, altKey, metaKey, shiftKey),
        )
      ) {
        handler();
        return true;
      }
    }
    return false;
  };

  const unifiedHandleKeyDown = (event: KeyboardEvent | MessageEvent) => {
    if (event instanceof KeyboardEvent) {
      const { key, ctrlKey, altKey, metaKey, shiftKey } = event;
      const handled = processKeyEvent(key.toLowerCase(), ctrlKey, altKey, metaKey, shiftKey);
      if (handled) event.preventDefault();
    } else if (
      event instanceof MessageEvent &&
      event.data &&
      event.data.type === 'iframe-keydown'
    ) {
      const { key, ctrlKey, altKey, metaKey, shiftKey } = event.data;
      processKeyEvent(key.toLowerCase(), ctrlKey, altKey, metaKey, shiftKey);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', unifiedHandleKeyDown);
    window.addEventListener('message', unifiedHandleKeyDown);

    return () => {
      window.removeEventListener('keydown', unifiedHandleKeyDown);
      window.removeEventListener('message', unifiedHandleKeyDown);
    };
  }, [shortcuts, ...dependencies]);
};

export default useShortcuts;
