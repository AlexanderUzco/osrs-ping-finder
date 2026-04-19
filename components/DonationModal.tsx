"use client";

import { useEffect, useState } from "react";
import { BINANCE_PAY_ID, KOFI_URL } from "@/lib/constants";

interface DonationModalProps {
  open: boolean;
  onClose: () => void;
}

export function DonationModal({ open, onClose }: DonationModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const copyBinanceId = () => {
    navigator.clipboard.writeText(BINANCE_PAY_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="donation-title"
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-border rounded-lg p-6 max-w-md w-full space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 id="donation-title" className="text-lg font-bold text-accent">
            Support this project
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-fg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-fg">
          If this saved you from a laggy raid, a tip keeps the servers &mdash;
          and the coffee &mdash; flowing.
        </p>

        <a
          href={KOFI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full h-12 px-4 rounded bg-white text-[#2d2418] font-semibold hover:bg-[#f0f0f0] cursor-pointer transition shadow-sm"
        >
          <img src="/ko-fi.webp" alt="" className="h-6 w-auto" />
          Support me on Ko-fi
        </a>

        <button
          onClick={copyBinanceId}
          className="flex items-center justify-center gap-3 w-full h-12 px-4 rounded bg-[#0B0E11] text-white font-semibold hover:bg-[#1E2329] cursor-pointer transition shadow-sm border border-[#2a2f38]"
        >
          <img src="/binance.webp" alt="" className="h-6 w-auto" />
          {copied ? "Pay ID copied!" : "Donate with Binance"}
        </button>

        <p className="text-xs text-muted text-center leading-relaxed">
          Binance Pay ID:{" "}
          <code className="font-mono text-accent">{BINANCE_PAY_ID}</code>
          <br />
          Open your Binance app → Pay → Send → paste the ID.
        </p>
      </div>
    </div>
  );
}
