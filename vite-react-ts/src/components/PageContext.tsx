import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface PageContextType {
  freeze: boolean;
}

const PageContext = createContext<PageContextType>({ freeze: false });

export const usePageContext = () => useContext(PageContext);

export const PageProvider = ({ freeze, children }: { freeze: boolean; children: ReactNode }) => {
  return <PageContext.Provider value={{ freeze }}>{children}</PageContext.Provider>;
};
