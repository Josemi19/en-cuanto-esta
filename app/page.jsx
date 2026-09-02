"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuotes } from "./quotes-context";

const valueFormatter = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatValue(value) {
  return value === null
    ? "No disponible"
    : `Bs. ${valueFormatter.format(value)}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatCentAmount(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  const normalizedDigits = digits.replace(/^0+(?=\d)/, "");
  const paddedDigits = normalizedDigits.padStart(3, "0");
  const wholeAmount = paddedDigits.slice(0, -2);
  const decimalAmount = paddedDigits.slice(-2);
  const formattedWholeAmount = Number(wholeAmount).toLocaleString("es-VE");

  return `${formattedWholeAmount},${decimalAmount}`;
}

function parseCentAmount(value) {
  return Number(value.replace(/\D/g, "")) / 100;
}

function formatForeignValue(value, currency) {
  const prefix =
    currency === "USD" || currency === "Personalizado"
      ? "USD "
      : `${currency} `;
  return `${prefix}${valueFormatter.format(value)}`;
}

export default function Home() {
  const { quotes, isLoading, error, loadQuotes } = useQuotes();
  const [refreshClicks, setRefreshClicks] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [calculatorMode, setCalculatorMode] = useState("USD");
  const [conversionDirection, setConversionDirection] = useState("toBs");
  const [amount, setAmount] = useState("0,00");
  const [customRate, setCustomRate] = useState("");
  const calculatorRef = useRef(null);

  const isRefreshLocked = lockedUntil !== null;
  const selectedQuote = quotes.find((quote) => quote.moneda === calculatorMode);
  const exchangeRate =
    calculatorMode === "custom"
      ? parseCentAmount(customRate)
      : (selectedQuote?.promedio ?? 0);
  const amountValue = parseCentAmount(amount);
  const convertedAmount =
    Number.isFinite(amountValue) && amountValue > 0 && exchangeRate > 0
      ? conversionDirection === "toBs"
        ? amountValue * exchangeRate
        : amountValue / exchangeRate
      : 0;
  const currencyLabel =
    calculatorMode === "custom" ? "Personalizado" : calculatorMode;
  const inputCurrencyLabel =
    conversionDirection === "toBs" ? currencyLabel : "bolivares";
  const resultValue =
    convertedAmount > 0
      ? conversionDirection === "toBs"
        ? formatValue(convertedAmount)
        : formatForeignValue(convertedAmount, currencyLabel)
      : conversionDirection === "toBs"
        ? "Bs. 0,00"
        : formatForeignValue(0, currencyLabel);

  useEffect(() => {
    if (lockedUntil === null) return;
    const lockExpiresAt = lockedUntil;

    function updateLock() {
      const remaining = Math.max(
        0,
        Math.ceil((lockExpiresAt - Date.now()) / 1000),
      );
      setSecondsRemaining(remaining);

      if (remaining === 0) {
        setLockedUntil(null);
        setRefreshClicks(0);
      }
    }

    updateLock();
    const intervalId = window.setInterval(updateLock, 1000);
    return () => window.clearInterval(intervalId);
  }, [lockedUntil]);

  function handleRefresh() {
    if (isLoading || isRefreshLocked) return;

    const nextClickCount = refreshClicks + 1;
    setRefreshClicks(nextClickCount);

    if (nextClickCount === 2) {
      setLockedUntil(Date.now() + 60_000);
    }

    void loadQuotes();
  }

  return (
    <main>
      <section className="shell" aria-labelledby="page-title">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              $
            </span>
            <span>En cuanto esta</span>
          </div>
          <div className="header-actions">
            <Link className="average-link" href="/promedios">
              Promedios
            </Link>
            <button
              className="refresh"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshLocked}
              aria-label={
                isRefreshLocked
                  ? `Actualizaciones bloqueadas durante ${secondsRemaining} segundos`
                  : "Actualizar cotizaciones"
              }
            >
              <span aria-hidden="true">&#8635;</span>
              {isRefreshLocked
                ? `Disponible en ${secondsRemaining}s`
                : "Actualizar"}
            </button>
          </div>
        </header>

        <div className="intro">
          <p className="eyebrow">Venezuela</p>
          <h1 id="page-title">Tasas del dia</h1>
        </div>

        <section
          className="calculator"
          aria-labelledby="calculator-title"
          ref={calculatorRef}
        >
          <div className="calculator-heading">
            <div>
              <p className="eyebrow">Conversor</p>
            </div>
            {calculatorMode !== "custom" && (
              <span className="calculator-rate">
                1 {currencyLabel} ={" "}
                {exchangeRate > 0 ? formatValue(exchangeRate) : "--"}
              </span>
            )}
          </div>

          <div className="mode-picker" role="group" aria-label="Tipo de tasa">
            {["USD", "EUR", "USDT", "custom"].map((mode) => (
              <button
                className={calculatorMode === mode ? "mode active" : "mode"}
                key={mode}
                onClick={() => setCalculatorMode(mode)}
                type="button"
              >
                {mode === "custom" ? "Personalizado" : mode}
              </button>
            ))}
          </div>

          <button
            className="conversion-direction"
            onClick={() =>
              setConversionDirection((direction) =>
                direction === "toBs" ? "fromBs" : "toBs",
              )
            }
            type="button"
          >
            <span>
              {conversionDirection === "toBs" ? currencyLabel : "Bs."}
            </span>
            <span className="swap-icon" aria-hidden="true">
              &#8646;
            </span>
            <span>
              {conversionDirection === "toBs" ? "Bs." : currencyLabel}
            </span>
          </button>

          <div className="calculator-fields">
            <label className="field">
              <span>
                {calculatorMode === "custom"
                  ? `Monto`
                  : `Monto en ${inputCurrencyLabel}`}
              </span>
              <div className="input-wrap">
                <input
                  inputMode="numeric"
                  onChange={(event) =>
                    setAmount(formatCentAmount(event.target.value))
                  }
                  placeholder="0,00"
                  type="text"
                  value={amount}
                />
                <b>
                  {conversionDirection === "toBs"
                    ? calculatorMode === "custom"
                      ? "$"
                      : calculatorMode
                    : "Bs."}
                </b>
              </div>
            </label>

            {calculatorMode === "custom" && (
              <label className="field">
                <span>Tasa</span>
                <div className="input-wrap">
                  <input
                    inputMode="numeric"
                    onChange={(event) =>
                      setCustomRate(formatCentAmount(event.target.value))
                    }
                    placeholder="0,00"
                    type="text"
                    value={customRate}
                  />
                  <b>Bs.</b>
                </div>
              </label>
            )}

            <div className="conversion-result" aria-live="polite">
              <span>Equivale a</span>
              <strong>{resultValue}</strong>
            </div>
          </div>
        </section>

        {error ? (
          <div className="notice" role="alert">
            <strong>Sin datos por ahora.</strong>
            <span>{error}</span>
            <button onClick={() => void loadQuotes()}>Reintentar</button>
          </div>
        ) : (
          <div className="quotes" aria-live="polite">
            {isLoading && quotes.length === 0
              ? Array.from({ length: 2 }).map((_, index) => (
                  <div className="quote skeleton" key={index} />
                ))
              : quotes.map((quote) => (
                  <article
                    className="quote"
                    key={`${quote.moneda}-${quote.fuente}`}
                  >
                    <div className="quote-head">
                      <div>
                        <p className="currency">{quote.moneda}</p>
                        <h2>{quote.nombre}</h2>
                      </div>
                      <span className="source">
                        {quote.fuente === "oficial"
                          ? "Oficial (BCV)"
                          : quote.fuente}
                      </span>
                    </div>
                    <p className="average-label"></p>
                    <p className="average">{formatValue(quote.promedio)}</p>
                    <time dateTime={quote.fechaActualizacion}>
                      Actualizado: {formatDate(quote.fechaActualizacion)}
                    </time>
                  </article>
                ))}
          </div>
        )}
      </section>
    </main>
  );
}
