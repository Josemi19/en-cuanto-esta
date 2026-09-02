"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuotes } from "../quotes-context";

const money = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatRate(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  const paddedDigits = digits.replace(/^0+(?=\d)/, "").padStart(3, "0");
  const integer = paddedDigits.slice(0, -2);
  const decimals = paddedDigits.slice(-2);
  return `${Number(integer).toLocaleString("es-VE")},${decimals}`;
}

function rateNumber(value) {
  return Number(value.replace(/\D/g, "")) / 100;
}

const rateOptions = [
  { value: "USD", label: "Dólar oficial" },
  { value: "EUR", label: "Euro oficial" },
  { value: "USDT", label: "USDT Binance P2P" },
  { value: "custom", label: "Personalizada" },
];

function RateSelector({ index, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = rateOptions.find((option) => option.value === value);

  function selectOption(optionValue) {
    onChange(optionValue);
    setIsOpen(false);
  }

  return (
    <div
      className="rate-selector"
      onBlur={() => window.setTimeout(() => setIsOpen(false), 0)}
    >
      <button
        aria-controls={`rate-options-${index}`}
        aria-expanded={isOpen}
        className="rate-selector-button"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span>{selectedOption.label}</span>
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#0c604d"
          >
            <path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#0c604d"
          >
            <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
          </svg>
        )}
      </button>
      {isOpen && (
        <div
          className="rate-options"
          id={`rate-options-${index}`}
          role="listbox"
          aria-label={`Opciones para tasa ${index + 1}`}
        >
          {rateOptions.map((option) => (
            <button
              aria-selected={option.value === value}
              className={
                option.value === value ? "rate-option active" : "rate-option"
              }
              key={option.value}
              onClick={() => selectOption(option.value)}
              role="option"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PromediosPage() {
  const { quotes, isLoading, error } = useQuotes();
  const [rates, setRates] = useState([
    { type: "USD", customValue: "" },
    { type: "EUR", customValue: "" },
  ]);
  const validRates = rates
    .map((rate) =>
      rate.type === "custom"
        ? rateNumber(rate.customValue)
        : (quotes.find((quote) => quote.moneda === rate.type)?.promedio ?? 0),
    )
    .filter((rate) => rate > 0);
  const average =
    validRates.length >= 2
      ? validRates.reduce((total, rate) => total + rate, 0) / validRates.length
      : 0;

  function updateRate(index, field, value) {
    setRates((current) =>
      current.map((rate, currentIndex) =>
        currentIndex === index
          ? {
              ...rate,
              [field]: field === "customValue" ? formatRate(value) : value,
            }
          : rate,
      ),
    );
  }

  return (
    <main>
      <section className="shell average-page" aria-labelledby="average-title">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              $
            </span>
            <span>En cuanto esta</span>
          </div>
          <Link className="back-link" href="/">
            Tasas
          </Link>
        </header>
        <div className="intro">
          <p className="eyebrow">Herramienta</p>
          <h1 id="average-title">Calcula un promedio</h1>
        </div>
        <section
          className="average-tool"
          aria-label="Calculadora de promedio de tasas"
        >
          <div className="rate-list">
            {rates.map((rate, index) => {
              const quote = quotes.find((item) => item.moneda === rate.type);
              const value =
                rate.type === "custom"
                  ? rateNumber(rate.customValue)
                  : quote?.promedio;

              return (
                <div className="rate-row" key={index}>
                  <label className="field rate-field">
                    <span>Tasa {index + 1}</span>
                    <RateSelector
                      index={index}
                      onChange={(value) => updateRate(index, "type", value)}
                      value={rate.type}
                    />
                  </label>
                  {rate.type === "custom" ? (
                    <label className="field custom-rate-field">
                      <span>Valor</span>
                      <div className="input-wrap">
                        <input
                          aria-label={`Valor personalizado ${index + 1}`}
                          inputMode="numeric"
                          onChange={(event) =>
                            updateRate(index, "customValue", event.target.value)
                          }
                          placeholder="0,00"
                          type="text"
                          value={rate.customValue}
                        />
                        <b>Bs.</b>
                      </div>
                    </label>
                  ) : (
                    <span className="selected-rate">
                      {isLoading
                        ? "Cargando..."
                        : value
                          ? `Bs. ${money.format(value)}`
                          : "No disponible"}
                    </span>
                  )}
                  {rates.length > 2 && (
                    <button
                      className="remove-rate"
                      onClick={() =>
                        setRates((current) =>
                          current.filter(
                            (_, currentIndex) => currentIndex !== index,
                          ),
                        )
                      }
                      type="button"
                      aria-label={`Eliminar tasa ${index + 1}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <button
            className="add-rate"
            onClick={() =>
              setRates((current) => [
                ...current,
                { type: "USD", customValue: "" },
              ])
            }
            type="button"
          >
            + Agregar tasa
          </button>
          <div className="average-result" aria-live="polite">
            <span>
              Promedio de {validRates.length}{" "}
              {validRates.length === 1 ? "tasa" : "tasas"}
            </span>
            <strong>
              {average > 0 ? `Bs. ${money.format(average)}` : "Bs. 0,00"}
            </strong>
            {validRates.length < 2 && (
              <small>
                Ingresa {2 - validRates.length} tasa más para calcular el
                promedio.
              </small>
            )}
          </div>
          {error && <p className="average-error">{error}</p>}
        </section>
      </section>
    </main>
  );
}
