"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

type BusinessContextType = {
  businessName: string;
  setBusinessName: (name: string) => void;
};

const BusinessContext = createContext<
  BusinessContextType | undefined
>(undefined);

export function BusinessProvider({
  children,
  initialBusinessName = "SouqFlow",
}: {
  children: React.ReactNode;
  initialBusinessName?: string;
}) {
  const [businessName, setBusinessName] =
    useState(initialBusinessName);

  return (
    <BusinessContext.Provider
      value={{
        businessName,
        setBusinessName,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);

  if (!context) {
    throw new Error(
      "useBusiness must be used inside BusinessProvider",
    );
  }

  return context;
}