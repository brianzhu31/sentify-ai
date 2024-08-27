// context/SearchHistoryContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { SearchHistoryData } from '@/types'; // Adjust the import based on your directory structure

interface SearchHistoryContextType {
  searchHistory: SearchHistoryData;
  setSearchHistory: (searchHistory: SearchHistoryData) => void;
  pageNumber: number;
  setPageNumber: (pageNumber: number) => void;
}

const SearchHistoryContext = createContext<SearchHistoryContextType | undefined>(undefined);

export const useSearchHistory = (): SearchHistoryContextType => {
  const context = useContext(SearchHistoryContext);
  if (!context) {
    throw new Error('useSearchHistory must be used within a SearchHistoryProvider');
  }
  return context;
};

interface SearchHistoryProviderProps {
  children: ReactNode;
}

export const SearchHistoryProvider: React.FC<SearchHistoryProviderProps> = ({ children }) => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryData>({
    label: '',
    searches: [],
    has_more: true
  });
  const [pageNumber, setPageNumber] = useState<number>(1);

  return (
    <SearchHistoryContext.Provider value={{ searchHistory, setSearchHistory, pageNumber, setPageNumber }}>
      {children}
    </SearchHistoryContext.Provider>
  );
};
