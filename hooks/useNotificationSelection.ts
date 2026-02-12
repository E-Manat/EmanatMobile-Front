import {useCallback, useState} from 'react';

export const useNotificationSelection = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const handleLongPress = useCallback((id: string) => {
    setSelectionMode(true);
    setSelectedIds(prev =>
      prev.includes(id) ? prev : [...prev, id],
    );
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setSelectionMode(false);
  }, []);

  const removeIds = useCallback((ids: string[]) => {
    setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
  }, []);

  return {
    selectedIds,
    selectionMode,
    handleLongPress,
    handleSelect,
    clearSelection,
    removeIds,
  };
};
