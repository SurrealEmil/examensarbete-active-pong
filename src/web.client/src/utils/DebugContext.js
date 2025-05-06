import { createContext, useContext, useState } from 'react';
import { createElement } from 'react';

const DebugContext = createContext();

export function DebugProvider({ children }) {
  const [debug, setDebug] = useState(false);

  return createElement(
    DebugContext.Provider,
    { value: { debug, setDebug } },
    children
  );
}

export function useDebug() {
  return useContext(DebugContext);
}
