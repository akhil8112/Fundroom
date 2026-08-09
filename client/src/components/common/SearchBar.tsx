import React, { useState, useEffect } from 'react';
import { HiMagnifyingGlass } from 'react-icons/hi2';

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  delay?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = 'Search...', delay = 300 }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay, onSearch]);

  return (
    <div className="search-wrapper" style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
      <HiMagnifyingGlass style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
      <input
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ paddingLeft: '36px' }}
      />
    </div>
  );
};
