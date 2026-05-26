import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Kept for backwards compat — no longer used internally
export interface NeuroFilter {
  estado: string;
}

interface NeuropsicologosSearchProps {
  onSearch: (searchTerm: string) => void;
  /** @deprecated filters removed — kept so parent doesn't need to change */
  onFilterChange?: (filters: NeuroFilter) => void;
  placeholder?: string;
  className?: string;
}

export const NeuropsicologosSearch: React.FC<NeuropsicologosSearchProps> = ({
  onSearch,
  placeholder = 'Buscar por nombre o usuario...',
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const onSearchRef = useRef(onSearch);
  useEffect(() => { onSearchRef.current = onSearch; });

  useEffect(() => {
    const id = setTimeout(() => onSearchRef.current(searchTerm), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  return (
    <div className={`relative max-w-sm ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8"
      />
      {searchTerm && (
        <button
          onClick={() => { setSearchTerm(''); onSearchRef.current(''); }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
