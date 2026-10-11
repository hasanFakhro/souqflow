"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

type BusinessContextType = {
  businessName: string;
  setBusinessName: (name: string) => void;
  businessLogo: string | null;
  setBusinessLogo: (logo: string | null) => void;
};

const BusinessContext = createContext<
  BusinessContextType | undefined
>(undefined);

export function BusinessProvider({
  children,
  initialBusinessName = "SouqFlow",
  initialBusinessLogo = null,
}: {
  children: React.ReactNode;
  initialBusinessName?: string;
  initialBusinessLogo?: string | null;
}) {
  const [businessName, setBusinessName] =
    useState(initialBusinessName);
  const [businessLogo, setBusinessLogo] = useState(initialBusinessLogo);

  return (
    <BusinessContext.Provider
      value={{
        businessName,
        setBusinessName,
        businessLogo,
        setBusinessLogo,
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
