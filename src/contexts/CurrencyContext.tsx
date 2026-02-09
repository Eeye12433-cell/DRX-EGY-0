import React, { createContext, useContext } from 'react';

interface CurrencyContextType {
  formatPrice: (price: number) => string;
  currency: string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  formatPrice: (price: number) => `${price.toLocaleString()} LE`,
  currency: 'EGP',
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const formatPrice = (price: number) => `${price.toLocaleString()} LE`;

  return (
    <CurrencyContext.Provider value={{ formatPrice, currency: 'EGP' }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
