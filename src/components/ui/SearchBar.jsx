import React from 'react';
import { Search } from 'lucide-react';
import styles from './SearchBar.module.css';

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search by name, code or phone...',
  className = ''
}) => {
  return (
    <div className={`${styles.searchWrapper} ${className}`}>
      <Search className={styles.searchIcon} size={18} />
      <input
        type="text"
        className={styles.searchInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => onChange('')}
          title="Clear search"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default SearchBar;
