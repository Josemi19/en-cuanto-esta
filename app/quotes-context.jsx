"use client";

import { createContext, useContext, useEffect, useState } from "react";

const QuotesContext = createContext(null);

export function QuotesProvider({ children }) {
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  async function loadQuotes() {
    setIsLoading(true);
    setError("");

    try {
      const responses = await Promise.all([
        fetch("/api/cotizaciones?moneda=USD"),
        fetch("/api/cotizaciones?moneda=EUR"),
        fetch("/api/cotizaciones?moneda=USDT"),
      ]);
      if (responses.some((response) => !response.ok))
        throw new Error("Request failed");

      setQuotes(
        await Promise.all(responses.map((response) => response.json())),
      );
      setLastUpdated(new Date());
    } catch {
      setError("No pudimos cargar las cotizaciones. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadQuotes();
  }, []);

  return (
    <QuotesContext.Provider
      value={{ quotes, isLoading, error, lastUpdated, loadQuotes }}
    >
      {children}
    </QuotesContext.Provider>
  );
}

export function useQuotes() {
  const context = useContext(QuotesContext);
  if (!context)
    throw new Error("useQuotes debe usarse dentro de QuotesProvider.");
  return context;
}
