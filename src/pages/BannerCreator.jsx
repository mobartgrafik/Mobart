import React, { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Image as ImageIcon,
  LayoutTemplate,
  Layers3,
  Phone,
  Palette,
  RefreshCw,
  Sparkles,
} from "lucide-react";

const PRESETS = [
  { label: "Baner 100 × 200 cm", w: 1200, h: 600, category: "Druk" },
  { label: "Baner 300 × 100 cm", w: 1500, h: 500, category: "Druk" },
  { label: "Baner 600 × 300 cm", w: 1600, h: 800, category: "Druk" },
  { label: "Rollup 85 × 200 cm", w: 850, h: 2000, category: "Druk" },
  { label: "Plakat A1", w: 701, h: 993, category: "Druk" },
  { label: "Plakat A3", w: 496, h: 701, category: "Druk" },
  { label: "Facebook Ads", w: 1200, h: 628, category: "Digital" },
  { label: "Instagram Post", w: 1080, h: 1080, category: "Digital" },
  { label: "Instagram Story", w: 1080, h: 1920, category: "Digital" },
  { label: "Własny format", w: null, h: null, category: "Custom" },
];

const BACKGROUNDS = [
  { label: "Grafit + błękit", value: "linear-gradient(135deg, #0f172a 0%, #132238 42%, #1d4ed8 100%)" },
  { label: "Nocny granat", value: "linear-gradient(145deg, #111827 0%, #1f2937 50%, #111827 100%)" },
  { label: "Energetyczny pomarańcz", value: "linear-gradient(135deg, #f97316 0%, #fb7185 100%)" },
  { label: "Luksusowe złoto", value: "linear-gradient(135deg, #f59e0b 0%, #fde68a 100%)" },
  { label: "Szmaragd", value: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)" },
  { label: "Nowoczesny fiolet", value: "linear-gradient(135deg, #312e81 0%, #7c3aed 100%)" },
  { label: "Jasne studio", value: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)" },
  { label: "Czysta biel", value: "#ffffff" },
];

const FONTS = [
  "Impact",
  "Arial Black",
  "Arial",
  "Trebuchet MS",
  "Verdana",
  "Georgia",
  "Montserrat",
  "Poppins",
  "Tahoma",
];

const TEMPLATES = [
  {
    name: "Klasyczny sprzedam",
    description: "Startowy układ tablicowy: żółte tło, wielki nagłówek i mocny numer telefonu.",
    previewBg: "#ffe100",
    config: {
      presetLabel: "Baner 100 × 200 cm",
      background: "#ffe100",
      panelStyle: "none",
      layoutVariant: "classicSale",
      overlayOpacity: 0,
      align: "left",
      eyebrow: "",
      headline: "SPRZEDAM",
      subtext: "",
      cta: "",
      phoneNumber: "600 265 203",
      showPhone: true,
      showCta: false,
      showEyebrow: false,
      headlineColor: "#111111",
      subtextColor: "#111111",
      accentColor: "#111111",
      font: "Poppins",
      headlineSize: 132,
      subtextSize: 28,
      contentWidth: 100,
      padding: 0,
      logoSize: 120,
      phoneStyle: "classicSale",
      phoneTextSize: 66,
      phoneIconSize: 108,
    },
  },
  {
    name: "Nieruchomość",
    description: "Mocny komunikat sprzedażowy z numerem telefonu i jasnym CTA.",
    previewBg: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
    config: {
      presetLabel: "Baner 100 × 200 cm",
      background: "#ffffff",
      panelStyle: "solid",
      overlayOpacity: 0,
      align: "center",
      eyebrow: "OFERTA PREMIUM",
      headline: "SPRZEDAM DOM",
      subtext: "Dobra lokalizacja, szybki dojazd, atrakcyjna cena.",
      cta: "Zadzwoń i umów prezentację",
      phoneNumber: "123 456 789",
      showPhone: true,
      showCta: true,
      showEyebrow: true,
      headlineColor: "#111111",
      subtextColor: "#334155",
      accentColor: "#2563eb",
      font: "Impact",
      headlineSize: 112,
      subtextSize: 34,
      contentWidth: 70,
      padding: 7,
      logoSize: 120,
      phoneStyle: "pill",
      phoneTextSize: 34,
      phoneIconSize: 42,
    },
  },
  {
    name: "Promocja sklepu",
    description: "Silny kontrast, sprzedażowy ton i wyeksponowana oferta.",
    previewBg: "linear-gradient(135deg, #f97316 0%, #fb7185 100%)",
    config: {
      presetLabel: "Baner 300 × 100 cm",
      background: "linear-gradient(135deg, #f97316 0%, #fb7185 100%)",
      panelStyle: "glass",
      overlayOpacity: 20,
      align: "left",
      eyebrow: "TYLKO TERAZ",
      headline: "PROMOCJA -40%",
      subtext: "Nowa kolekcja, szybka realizacja i zamówienia bez minimum.",
      cta: "Sprawdź ofertę",
      phoneNumber: "123 456 789",
      showPhone: false,
      showCta: true,
      showEyebrow: true,
      headlineColor: "#ffffff",
      subtextColor: "#fff7ed",
      accentColor: "#fde047",
      font: "Impact",
      headlineSize: 118,
      subtextSize: 28,
      contentWidth: 62,
      padding: 7,
      logoSize: 120,
      phoneStyle: "pill",
      phoneTextSize: 34,
      phoneIconSize: 42,
    },
  },
  {
    name: "Otwarcie lokalu",
    description: "Układ eventowy pod otwarcia, targi i akcje wizerunkowe.",
    previewBg: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
    config: {
      presetLabel: "Facebook Ads",
      background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
      panelStyle: "soft",
      overlayOpacity: 18,
      align: "left",
      eyebrow: "WIELKIE OTWARCIE",
      headline: "STARTUJEMY W SOBOTĘ",
      subtext: "Wpadnij na premierę, rabaty i świeżą kolekcję od rana.",
      cta: "Dołącz do wydarzenia",
      phoneNumber: "123 456 789",
      showPhone: false,
      showCta: true,
      showEyebrow: true,
      headlineColor: "#ffffff",
      subtextColor: "#dbeafe",
      accentColor: "#38bdf8",
      font: "Trebuchet MS",
      headlineSize: 90,
      subtextSize: 28,
      contentWidth: 60,
      padding: 8,
      logoSize: 110,
      phoneStyle: "pill",
      phoneTextSize: 34,
      phoneIconSize: 42,
    },
  },
  {
    name: "Minimal premium",
    description: "Czysty, elegancki układ do usług premium i marek osobistych.",
    previewBg: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    config: {
      presetLabel: "Instagram Post",
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      panelStyle: "none",
      overlayOpacity: 0,
      align: "left",
      eyebrow: "NOWA OFERTA",
      headline: "DESIGN, KTÓRY SPRZEDAJE",
      subtext: "Banery, tablice i materiały reklamowe dopracowane od pierwszego spojrzenia.",
      cta: "Napisz po wycenę",
      phoneNumber: "123 456 789",
      showPhone: true,
      showCta: true,
      showEyebrow: true,
      headlineColor: "#0f172a",
      subtextColor: "#334155",
      accentColor: "#0f172a",
      font: "Georgia",
      headlineSize: 82,
      subtextSize: 26,
      contentWidth: 66,
      padding: 9,
      logoSize: 96,
      phoneStyle: "pill",
      phoneTextSize: 32,
      phoneIconSize: 40,
    },
  },
];

const DEFAULT_TEMPLATE = {
  ...TEMPLATES[0].config,
};

const MAX_PREVIEW_WIDTH = 760;
const MAX_PREVIEW_HEIGHT = 620;
const MAX_EXPORT_SIDE = 8192;
const MAX_EXPORT_PIXELS = 32_000_000;
const STANDARD_LAYOUT = "standard";
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normalizeLayoutVariant = (value) => (value === "classicSale" ? "classicSale" : STANDARD_LAYOUT);

const getPresetByLabel = (label) => PRESETS.find((item) => item.label === label) || PRESETS[0];

const getLongestLineLength = (text = "") =>
  String(text)
    .split("\n")
    .reduce((longest, line) => Math.max(longest, line.trim().length), 1);

const getLineCount = (text = "", fontSize, maxWidth, charWidth = 0.56) => {
  const charsPerLine = Math.max(1, Math.floor(maxWidth / Math.max(1, fontSize * charWidth)));
  return String(text)
    .split("\n")
    .reduce((count, line) => count + Math.max(1, Math.ceil(Math.max(1, line.trim().length) / charsPerLine)), 0);
};

const fitTextBlock = ({ text, requestedSize, maxWidth, maxHeight, minSize, maxSize, lineHeight = 1, charWidth = 0.56 }) => {
  const safeMaxSize = Math.max(minSize, maxSize);
  let size = clamp(Number(requestedSize) || minSize, minSize, safeMaxSize);

  for (let index = 0; index < 8; index += 1) {
    const lineCount = getLineCount(text, size, maxWidth, charWidth);
    const blockHeight = lineCount * size * lineHeight;
    const longestLineWidth = getLongestLineLength(text) * size * charWidth;
    const heightRatio = maxHeight / Math.max(1, blockHeight);
    const widthRatio = maxWidth / Math.max(1, longestLineWidth);
    const ratio = Math.min(heightRatio, widthRatio, 1);

    if (ratio >= 0.98) break;
    size = Math.max(minSize, Math.floor(size * ratio));
  }

  return size;
};

const getExportScale = (width, height) => {
  const sideScale = MAX_EXPORT_SIDE / Math.max(width, height);
  const pixelScale = Math.sqrt(MAX_EXPORT_PIXELS / Math.max(1, width * height));
  return Math.max(1, Math.min(2, sideScale, pixelScale));
};

function SalePhoneIcon({ size = 34, color = "#ffe100" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.4 3.2c.5-.5 1.3-.5 1.8 0l2 2c.5.5.5 1.2.1 1.8l-1.2 1.4c-.2.2-.2.5-.1.7.8 1.6 2 2.9 3.7 3.7.2.1.5.1.7-.1l1.4-1.2c.6-.4 1.3-.4 1.8.1l2 2c.5.5.5 1.3 0 1.8l-1.4 1.4c-.8.8-2 .9-3 .4-2.7-1.3-5-3.1-6.9-5-1.9-1.9-3.7-4.2-5-6.9-.5-1-.3-2.2.4-3l1.4-1.4Z"
        fill={color}
      />
    </svg>
  );
}

function PresetTile({ active, title, meta, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-3 text-left transition-all duration-200 ${
        active
          ? "border-sky-400/60 bg-sky-500/10 text-white shadow-[0_18px_40px_-28px_rgba(56,189,248,0.5)]"
          : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs opacity-70">{meta}</p>
    </button>
  );
}

function TemplateCard({ template, onApply }) {
  const templatePreset = getPresetByLabel(template.config.presetLabel);
  const previewScale = Math.min(1, 420 / templatePreset.w, 132 / templatePreset.h);
  const previewWidth = Math.round(templatePreset.w * previewScale);
  const previewHeight = Math.round(templatePreset.h * previewScale);

  return (
    <button
      type="button"
      onClick={() => onApply(template.name)}
      className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] text-left transition-all duration-200 hover:border-sky-400/30 hover:bg-white/[0.05]"
    >
      <div className="flex h-36 items-center justify-center overflow-hidden bg-slate-950/80 p-3">
        <div
          style={{
            width: previewWidth,
            height: previewHeight,
            overflow: "hidden",
            boxShadow: "0 16px 40px -26px rgba(15,23,42,0.95)",
          }}
        >
          <div
            style={{
              width: templatePreset.w,
              height: templatePreset.h,
              transform: `scale(${previewScale})`,
              transformOrigin: "top left",
            }}
          >
            <BannerArtwork
              config={{ ...template.config, layoutVariant: normalizeLayoutVariant(template.config.layoutVariant) }}
              width={templatePreset.w}
              height={templatePreset.h}
              logoUrl=""
            />
          </div>
        </div>
      </div>
      <div className="space-y-1 px-4 py-4">
        <p className="text-sm font-semibold text-white">{template.name}</p>
        <p className="text-xs leading-5 text-slate-400">{template.description}</p>
      </div>
    </button>
  );
}

function StatTile({ label, value, tone = "default" }) {
  const tones = {
    default: "border-white/10 bg-white/[0.04] text-slate-100",
    accent: "border-sky-400/20 bg-sky-500/10 text-sky-100",
    warm: "border-amber-400/20 bg-amber-500/10 text-amber-100",
  };

  return (
    <div className={`rounded-lg border px-4 py-4 ${tones[tone]}`}>
      <p className="text-[11px] uppercase tracking-[0.24em] text-inherit/60">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function BannerArtwork({ config, width, height, logoUrl }) {
  const isClassicSale = normalizeLayoutVariant(config.layoutVariant) === "classicSale";
  const horizontalAlign = config.align === "center" ? "center" : config.align === "right" ? "flex-end" : "flex-start";
  const textAlign = config.align;
  const shortestSide = Math.max(1, Math.min(width, height));
  const safePaddingPercent = clamp(Number(config.padding) || 0, 0, 18);
  const padding = Math.round(shortestSide * (safePaddingPercent / 100));
  const availableWidth = Math.max(80, width - padding * 2);
  const availableHeight = Math.max(80, height - padding * 2);
  const contentWidth = Math.min(availableWidth, Math.round(width * (clamp(Number(config.contentWidth) || 70, 35, 100) / 100)));
  const panelPadding = config.panelStyle === "none" ? 0 : clamp(Math.round(shortestSide * 0.055), 16, 58);
  const innerWidth = Math.max(60, contentWidth - panelPadding * 2);
  const innerHeight = Math.max(60, availableHeight - panelPadding * 2);
  const hasEyebrow = Boolean(config.showEyebrow && String(config.eyebrow || "").trim());
  const hasSubtext = Boolean(String(config.subtext || "").trim());
  const hasCta = Boolean(config.showCta && String(config.cta || "").trim());
  const hasPhone = Boolean(config.showPhone && String(config.phoneNumber || "").trim());
  const hasActions = hasCta || hasPhone;
  const gap = clamp(Math.round(shortestSide * 0.026), 10, 30);
  const logoHeight = logoUrl ? Math.min(Number(config.logoSize) || 96, innerHeight * 0.22) : 0;
  const eyebrowSize = hasEyebrow
    ? fitTextBlock({
        text: config.eyebrow,
        requestedSize: Math.max(12, Math.round(width * 0.012)),
        maxWidth: innerWidth,
        maxHeight: innerHeight * 0.11,
        minSize: 10,
        maxSize: Math.min(28, shortestSide * 0.055),
        lineHeight: 1.15,
        charWidth: 0.62,
      })
    : 0;
  const actionTextSize = hasActions
    ? fitTextBlock({
        text: `${hasCta ? config.cta : ""} ${hasPhone ? config.phoneNumber : ""}`.trim(),
        requestedSize: config.phoneTextSize || Math.max(20, Math.round((config.headlineSize || 72) * 0.28)),
        maxWidth: innerWidth,
        maxHeight: innerHeight * 0.18,
        minSize: 12,
        maxSize: Math.min(48, shortestSide * 0.09),
        lineHeight: 1.1,
        charWidth: 0.56,
      })
    : 0;
  const subtextMaxHeight = hasSubtext ? innerHeight * 0.24 : 0;
  const reservedVerticalSpace =
    logoHeight +
    (hasEyebrow ? eyebrowSize * 1.45 : 0) +
    (hasActions ? actionTextSize * 1.85 : 0) +
    (hasSubtext ? Math.max(18, gap) : 0) +
    gap * [logoUrl, hasEyebrow, hasSubtext, hasActions].filter(Boolean).length;
  const headlineMaxHeight = Math.max(innerHeight * 0.2, innerHeight - reservedVerticalSpace - subtextMaxHeight);
  const safeHeadlineSize = fitTextBlock({
    text: config.headline || "",
    requestedSize: config.headlineSize,
    maxWidth: innerWidth,
    maxHeight: headlineMaxHeight,
    minSize: 18,
    maxSize: Math.min(Number(config.headlineSize) || 86, width * 0.14, shortestSide * 0.28),
    lineHeight: 0.98,
    charWidth: 0.56,
  });
  const safeSubtextSize = hasSubtext
    ? fitTextBlock({
        text: config.subtext,
        requestedSize: config.subtextSize,
        maxWidth: innerWidth,
        maxHeight: subtextMaxHeight,
        minSize: 12,
        maxSize: Math.min(Number(config.subtextSize) || 26, shortestSide * 0.09, 54),
        lineHeight: 1.24,
        charWidth: 0.5,
      })
    : 0;

  const panelBackground =
    config.panelStyle === "glass"
      ? "rgba(15, 23, 42, 0.28)"
      : config.panelStyle === "solid"
        ? "rgba(255,255,255,0.92)"
        : config.panelStyle === "soft"
          ? "rgba(255,255,255,0.14)"
          : "transparent";

  const panelBorder =
    config.panelStyle === "none"
      ? "1px solid transparent"
      : config.panelStyle === "solid"
        ? "1px solid rgba(255,255,255,0.75)"
        : "1px solid rgba(255,255,255,0.16)";

  const panelShadow =
    config.panelStyle === "none" ? "none" : "0 30px 80px -45px rgba(15, 23, 42, 0.75)";
  const classicPhoneStyle = config.phoneStyle === "badge" || config.phoneStyle === "classicSale";

  if (isClassicSale) {
    const edge = Math.round(width * 0.07);
    const headlineTop = Math.round(height * 0.14);
    const phoneTop = Math.round(height * 0.61);
    const maxClassicWidth = width - edge * 2;
    const requestedHeadlineSize = Number(config.headlineSize) || 132;
    const headlineSize = fitTextBlock({
      text: config.headline || "SPRZEDAM",
      requestedSize: requestedHeadlineSize,
      maxWidth: maxClassicWidth,
      maxHeight: height * 0.34,
      minSize: 24,
      maxSize: Math.min(requestedHeadlineSize, height * 0.28, width * 0.16),
      lineHeight: 0.92,
      charWidth: 0.55,
    });
    const requestedIconSize = Number(config.phoneIconSize) || Math.max(84, Math.round(width * 0.075));
    const iconSize = clamp(Math.round(requestedIconSize), 36, Math.min(height * 0.18, width * 0.12));
    const phoneGap = Math.max(16, Math.round(width * 0.018));
    const maxPhoneTextWidth = maxClassicWidth - iconSize - phoneGap;
    const requestedPhoneSize = Number(config.phoneTextSize) || Math.max(50, Math.round(width * 0.054));
    const phoneFontSize = fitTextBlock({
      text: config.phoneNumber || "",
      requestedSize: requestedPhoneSize,
      maxWidth: maxPhoneTextWidth,
      maxHeight: height * 0.16,
      minSize: 20,
      maxSize: Math.min(requestedPhoneSize, height * 0.14, width * 0.08),
      lineHeight: 1,
      charWidth: 0.52,
    });

    return (
      <div
        style={{
          width,
          height,
          position: "relative",
          overflow: "hidden",
          background: config.background || "#ffe100",
          color: "#111111",
          fontFamily: `"${config.font}", sans-serif`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg, rgba(17,17,17,0.05) 0%, rgba(17,17,17,0) 38%), linear-gradient(250deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 36%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: edge,
            top: headlineTop,
            right: edge,
            fontSize: headlineSize,
            lineHeight: 0.86,
            letterSpacing: 0,
            fontWeight: 900,
            color: "#111111",
            textTransform: "uppercase",
            textShadow: "0 9px 16px rgba(17,17,17,0.12)",
            transform: "scaleY(1.06)",
            transformOrigin: "left top",
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
          }}
        >
          {config.headline}
        </div>

        {config.showPhone && config.phoneNumber ? (
          <div
            style={{
              position: "absolute",
              left: edge,
              top: phoneTop,
              right: edge,
              display: "flex",
              alignItems: "center",
              gap: phoneGap,
              color: "#111111",
              minWidth: 0,
            }}
          >
            <span
              style={{
                width: iconSize,
                height: iconSize,
                minWidth: iconSize,
                borderRadius: "999px",
                background: "#111111",
                color: "#ffe100",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 18px rgba(17,17,17,0.1)",
              }}
            >
              <SalePhoneIcon size={Math.max(32, Math.round(iconSize * 0.38))} color="#ffe100" />
            </span>
            <span
              style={{
                fontSize: phoneFontSize,
                lineHeight: 1,
                letterSpacing: 0,
                fontWeight: 900,
                color: "#111111",
                textShadow: "0 8px 14px rgba(17,17,17,0.08)",
                minWidth: 0,
                overflowWrap: "anywhere",
              }}
            >
              {config.phoneNumber}
            </span>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        background: config.background,
        color: config.headlineColor,
        fontFamily: config.font,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, rgba(15,23,42,${config.overlayOpacity / 100}) 0%, rgba(15,23,42,${
            config.overlayOpacity / 180
          }) 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(115deg, ${config.accentColor}24 0%, rgba(255,255,255,0) 34%), linear-gradient(245deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 38%)`,
          opacity: config.panelStyle === "solid" ? 0.35 : 0.7,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: `${Math.max(48, Math.round(width * 0.08))}px ${Math.max(48, Math.round(width * 0.08))}px`,
          opacity: 0.22,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: padding,
          display: "flex",
          alignItems: "stretch",
          justifyContent: horizontalAlign,
          minWidth: 0,
          minHeight: 0,
        }}
      >
        <div
          style={{
            width: contentWidth,
            maxWidth: "100%",
            minHeight: 0,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: config.align === "center" ? "center" : config.align === "right" ? "flex-end" : "flex-start",
            textAlign,
            gap,
            padding: panelPadding,
            borderRadius: clamp(Math.round(shortestSide * 0.018), 8, 26),
            background: panelBackground,
            border: panelBorder,
            boxShadow: panelShadow,
            backdropFilter: config.panelStyle === "none" ? "none" : "blur(12px)",
            overflow: "hidden",
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              crossOrigin="anonymous"
              style={{
                width: Math.min(Number(config.logoSize) || 96, innerWidth * 0.42),
                maxWidth: "42%",
                height: "auto",
                maxHeight: innerHeight * 0.22,
                objectFit: "contain",
                flex: "0 0 auto",
              }}
            />
          ) : null}

          {config.showEyebrow && config.eyebrow ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: `${Math.max(10, Math.round(height * 0.012))}px ${Math.max(14, Math.round(width * 0.018))}px`,
                borderRadius: 999,
                background: `${config.accentColor}22`,
                color: config.panelStyle === "solid" ? "#0f172a" : "#ffffff",
                border: `1px solid ${config.accentColor}55`,
                letterSpacing: "0.18em",
                fontSize: eyebrowSize,
                fontWeight: 700,
                textTransform: "uppercase",
                maxWidth: "100%",
                boxSizing: "border-box",
                overflowWrap: "anywhere",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "999px",
                  background: config.accentColor,
                  display: "inline-block",
                }}
              />
              {config.eyebrow}
            </div>
          ) : null}

          <div
            style={{
              fontSize: safeHeadlineSize,
              lineHeight: 0.95,
              fontWeight: 900,
              letterSpacing: 0,
              maxWidth: "100%",
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              color: config.headlineColor,
              textShadow: config.panelStyle === "solid" ? "none" : "0 18px 40px rgba(15,23,42,0.28)",
            }}
          >
            {config.headline}
          </div>

          <div
            style={{
              fontSize: safeSubtextSize || Math.max(12, Math.round(safeHeadlineSize * 0.32)),
              lineHeight: 1.3,
              maxWidth: "100%",
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              color: config.subtextColor,
              opacity: 0.95,
            }}
          >
            {config.subtext}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: config.align === "center" ? "center" : config.align === "right" ? "flex-end" : "flex-start",
              gap: Math.max(12, Math.round(width * 0.015)),
              width: "100%",
              marginTop: 8,
              minWidth: 0,
            }}
          >
            {config.showCta && config.cta ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: `${Math.max(12, Math.round(height * 0.012))}px ${Math.max(18, Math.round(width * 0.022))}px`,
                  borderRadius: 999,
                  background: config.accentColor,
                  color: "#ffffff",
                  fontSize: Math.max(12, Math.round(actionTextSize * 0.82)),
                  fontWeight: 800,
                  boxShadow: `0 20px 40px -28px ${config.accentColor}`,
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  overflowWrap: "anywhere",
                }}
              >
                <Sparkles size={Math.max(14, Math.round(actionTextSize * 0.85))} />
                <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{config.cta}</span>
              </div>
            ) : null}

            {config.showPhone && config.phoneNumber ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  padding: classicPhoneStyle ? "0" : `${Math.max(12, Math.round(height * 0.012))}px ${Math.max(16, Math.round(width * 0.018))}px`,
                  borderRadius: classicPhoneStyle ? "0" : 999,
                  background: classicPhoneStyle
                    ? "transparent"
                    : config.panelStyle === "solid"
                      ? "rgba(15,23,42,0.06)"
                      : "rgba(255,255,255,0.12)",
                  border: classicPhoneStyle
                    ? "0"
                    : config.panelStyle === "solid"
                      ? "1px solid rgba(15,23,42,0.12)"
                      : "1px solid rgba(255,255,255,0.12)",
                  color: config.headlineColor,
                  fontSize: actionTextSize,
                  fontWeight: 800,
                  maxWidth: "100%",
                  minWidth: 0,
                  boxSizing: "border-box",
                }}
              >
                <span
                  style={{
                    width: classicPhoneStyle ? Math.min(config.phoneIconSize || Math.max(60, Math.round(width * 0.07)), shortestSide * 0.16) : "auto",
                    height: classicPhoneStyle ? Math.min(config.phoneIconSize || Math.max(60, Math.round(width * 0.07)), shortestSide * 0.16) : "auto",
                    minWidth: classicPhoneStyle ? Math.min(config.phoneIconSize || Math.max(60, Math.round(width * 0.07)), shortestSide * 0.16) : "auto",
                    borderRadius: classicPhoneStyle ? "999px" : "0",
                    background: classicPhoneStyle ? "#111111" : "transparent",
                    color: classicPhoneStyle ? "#ffe100" : config.headlineColor,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Phone size={Math.max(16, Math.min(config.phoneIconSize || Math.round(actionTextSize * 1.2), actionTextSize * 1.45))} />
                </span>
                <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{config.phoneNumber}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BannerCreator() {
  const [activeEditorTab, setActiveEditorTab] = useState("format");
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [activeTemplateName, setActiveTemplateName] = useState(TEMPLATES[0].name);
  const [presetLabel, setPresetLabel] = useState(DEFAULT_TEMPLATE.presetLabel);
  const [customW, setCustomW] = useState(1200);
  const [customH, setCustomH] = useState(600);
  const [background, setBackground] = useState(DEFAULT_TEMPLATE.background);
  const [layoutVariant, setLayoutVariant] = useState(normalizeLayoutVariant(DEFAULT_TEMPLATE.layoutVariant));
  const [panelStyle, setPanelStyle] = useState(DEFAULT_TEMPLATE.panelStyle);
  const [overlayOpacity, setOverlayOpacity] = useState(DEFAULT_TEMPLATE.overlayOpacity);
  const [headline, setHeadline] = useState(DEFAULT_TEMPLATE.headline);
  const [subtext, setSubtext] = useState(DEFAULT_TEMPLATE.subtext);
  const [eyebrow, setEyebrow] = useState(DEFAULT_TEMPLATE.eyebrow);
  const [cta, setCta] = useState(DEFAULT_TEMPLATE.cta);
  const [phoneNumber, setPhoneNumber] = useState(DEFAULT_TEMPLATE.phoneNumber);
  const [showPhone, setShowPhone] = useState(DEFAULT_TEMPLATE.showPhone);
  const [showCta, setShowCta] = useState(DEFAULT_TEMPLATE.showCta);
  const [showEyebrow, setShowEyebrow] = useState(DEFAULT_TEMPLATE.showEyebrow);
  const [headlineSize, setHeadlineSize] = useState(DEFAULT_TEMPLATE.headlineSize);
  const [subtextSize, setSubtextSize] = useState(DEFAULT_TEMPLATE.subtextSize);
  const [headlineColor, setHeadlineColor] = useState(DEFAULT_TEMPLATE.headlineColor);
  const [subtextColor, setSubtextColor] = useState(DEFAULT_TEMPLATE.subtextColor);
  const [accentColor, setAccentColor] = useState(DEFAULT_TEMPLATE.accentColor);
  const [font, setFont] = useState(DEFAULT_TEMPLATE.font);
  const [align, setAlign] = useState(DEFAULT_TEMPLATE.align);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoSize, setLogoSize] = useState(DEFAULT_TEMPLATE.logoSize);
  const [phoneStyle, setPhoneStyle] = useState(DEFAULT_TEMPLATE.phoneStyle || "pill");
  const [phoneTextSize, setPhoneTextSize] = useState(DEFAULT_TEMPLATE.phoneTextSize || 34);
  const [phoneIconSize, setPhoneIconSize] = useState(DEFAULT_TEMPLATE.phoneIconSize || 42);
  const [contentWidth, setContentWidth] = useState(DEFAULT_TEMPLATE.contentWidth);
  const [padding, setPadding] = useState(DEFAULT_TEMPLATE.padding);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [previewBounds, setPreviewBounds] = useState({ width: MAX_PREVIEW_WIDTH });

  const exportRef = useRef(null);
  const previewStageRef = useRef(null);
  const customPreset = PRESETS.find((item) => item.label === "Własny format");
  const preset = getPresetByLabel(presetLabel);
  const width = preset.w ?? customW;
  const height = preset.h ?? customH;
  const scale = useMemo(() => {
    const availableWidth = Math.max(220, (previewBounds.width || MAX_PREVIEW_WIDTH) - 32);
    return Math.min(1, availableWidth / width, MAX_PREVIEW_HEIGHT / height);
  }, [height, previewBounds.width, width]);

  const bannerConfig = {
    layoutVariant,
    background,
    panelStyle,
    overlayOpacity,
    align,
    eyebrow,
    headline,
    subtext,
    cta,
    phoneNumber,
    showPhone,
    showCta,
    showEyebrow,
    headlineColor,
    subtextColor,
    accentColor,
    font,
    headlineSize,
    subtextSize,
    contentWidth,
    padding,
    logoSize,
    phoneStyle,
    phoneTextSize,
    phoneIconSize,
  };

  useEffect(() => {
    const node = previewStageRef.current;
    if (!node) return undefined;

    const updateBounds = () => {
      setPreviewBounds({ width: node.clientWidth || MAX_PREVIEW_WIDTH });
    };

    updateBounds();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateBounds);
      return () => window.removeEventListener("resize", updateBounds);
    }

    const observer = new ResizeObserver(updateBounds);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const presetSummary = `${width} × ${height}px`;
  const visualDensity = headline.length > 42 ? "bardziej tekstowy" : showPhone || showCta ? "sprzedażowy" : "minimalny";
  const activeTemplate = TEMPLATES.find((item) => item.name === activeTemplateName);

  const applyTemplate = (templateName) => {
    const template = TEMPLATES.find((item) => item.name === templateName);
    if (!template) return;
    setActiveTemplateName(template.name);
    setTemplatePickerOpen(false);

    const nextPreset = PRESETS.find((item) => item.label === template.config.presetLabel) || PRESETS[0];
    setPresetLabel(nextPreset.label);
    if (nextPreset.w && nextPreset.h) {
      setCustomW(nextPreset.w);
      setCustomH(nextPreset.h);
    }

    setBackground(template.config.background);
    setLayoutVariant(normalizeLayoutVariant(template.config.layoutVariant));
    setPanelStyle(template.config.panelStyle);
    setOverlayOpacity(template.config.overlayOpacity);
    setAlign(template.config.align);
    setEyebrow(template.config.eyebrow);
    setHeadline(template.config.headline);
    setSubtext(template.config.subtext);
    setCta(template.config.cta);
    setPhoneNumber(template.config.phoneNumber);
    setShowPhone(template.config.showPhone);
    setShowCta(template.config.showCta);
    setShowEyebrow(template.config.showEyebrow);
    setHeadlineColor(template.config.headlineColor);
    setSubtextColor(template.config.subtextColor);
    setAccentColor(template.config.accentColor);
    setFont(template.config.font);
    setHeadlineSize(template.config.headlineSize);
    setSubtextSize(template.config.subtextSize);
    setContentWidth(template.config.contentWidth);
    setPadding(template.config.padding);
    setLogoSize(template.config.logoSize);
    setPhoneStyle(template.config.phoneStyle || "pill");
    setPhoneTextSize(template.config.phoneTextSize || 34);
    setPhoneIconSize(template.config.phoneIconSize || 42);
  };

  const resetCreator = () => {
    setActiveTemplateName(TEMPLATES[0].name);
    setTemplatePickerOpen(false);
    setPresetLabel(DEFAULT_TEMPLATE.presetLabel);
    setCustomW(1200);
    setCustomH(600);
    setBackground(DEFAULT_TEMPLATE.background);
    setLayoutVariant(normalizeLayoutVariant(DEFAULT_TEMPLATE.layoutVariant));
    setPanelStyle(DEFAULT_TEMPLATE.panelStyle);
    setOverlayOpacity(DEFAULT_TEMPLATE.overlayOpacity);
    setAlign(DEFAULT_TEMPLATE.align);
    setEyebrow(DEFAULT_TEMPLATE.eyebrow);
    setHeadline(DEFAULT_TEMPLATE.headline);
    setSubtext(DEFAULT_TEMPLATE.subtext);
    setCta(DEFAULT_TEMPLATE.cta);
    setPhoneNumber(DEFAULT_TEMPLATE.phoneNumber);
    setShowPhone(DEFAULT_TEMPLATE.showPhone);
    setShowCta(DEFAULT_TEMPLATE.showCta);
    setShowEyebrow(DEFAULT_TEMPLATE.showEyebrow);
    setHeadlineColor(DEFAULT_TEMPLATE.headlineColor);
    setSubtextColor(DEFAULT_TEMPLATE.subtextColor);
    setAccentColor(DEFAULT_TEMPLATE.accentColor);
    setFont(DEFAULT_TEMPLATE.font);
    setHeadlineSize(DEFAULT_TEMPLATE.headlineSize);
    setSubtextSize(DEFAULT_TEMPLATE.subtextSize);
    setContentWidth(DEFAULT_TEMPLATE.contentWidth);
    setPadding(DEFAULT_TEMPLATE.padding);
    setLogoSize(DEFAULT_TEMPLATE.logoSize);
    setPhoneStyle(DEFAULT_TEMPLATE.phoneStyle || "pill");
    setPhoneTextSize(DEFAULT_TEMPLATE.phoneTextSize || 34);
    setPhoneIconSize(DEFAULT_TEMPLATE.phoneIconSize || 42);
    setLogoUrl("");
  };

  const handlePresetChange = (label) => {
    const nextPreset = PRESETS.find((item) => item.label === label);
    if (!nextPreset) return;
    setPresetLabel(nextPreset.label);
    if (nextPreset.w && nextPreset.h) {
      setCustomW(nextPreset.w);
      setCustomH(nextPreset.h);
    }
  };

  const handleLogoFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        setLogoUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExport = async () => {
    setExporting(true);
    setExportError("");
    try {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      if (!exportRef.current) throw new Error("Warstwa eksportu nie została przygotowana.");
      await document.fonts?.ready;
      const exportScale = getExportScale(width, height);
      const canvas = await html2canvas(exportRef.current, {
        scale: exportScale,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        windowWidth: width,
        windowHeight: height,
      });

      const link = document.createElement("a");
      link.download = `baner-${width}x${height}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Nie udało się wygenerować banera:", error);
      setExportError("Nie udało się wygenerować PNG. Spróbuj mniejszego formatu albo usuń zewnętrzną grafikę.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-[0_30px_120px_-55px_rgba(14,165,233,0.35)] md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-sky-100">
              <Sparkles className="h-3.5 w-3.5" />
              Studio banerów
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold text-white md:text-5xl">
              Kreator banerów gotowy do stabilnego podglądu i eksportu.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Edytor pilnuje proporcji, bezpiecznych marginesów i rozmiarów tekstu, żeby grafika nie rozjeżdżała się przy zmianie formatu.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile label="Format" value={presetSummary} tone="accent" />
            <StatTile label="Układ" value={visualDensity} />
            <StatTile label="Eksport" value="PNG HD" tone="warm" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="space-y-5 rounded-lg border border-white/10 bg-white/[0.03] p-5 shadow-[0_24px_80px_-50px_rgba(15,23,42,0.9)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Sterowanie</p>
              <p className="mt-1 text-xs text-slate-400">Buduj układ, kolory i komunikat w jednym miejscu.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={resetCreator}
              className="border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
            >
              Reset
            </Button>
          </div>

          <div className="rounded-lg border border-white/10 bg-slate-950/35 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Label className="text-xs uppercase tracking-[0.22em] text-slate-500">System szablonów</Label>
                <p className="mt-2 text-sm font-semibold text-white">
                  {activeTemplate ? activeTemplate.name : "Własny układ"}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {activeTemplate
                    ? activeTemplate.description
                    : "Tworzysz banner od zera z pełnym sterowaniem układem, CTA i brandingiem."}
                </p>
              </div>
              <div className="rounded-lg border border-sky-400/20 bg-sky-500/10 p-2 text-sky-200">
                <Layers3 className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Dialog open={templatePickerOpen} onOpenChange={setTemplatePickerOpen}>
                <DialogTrigger asChild>
                  <Button type="button" className="gap-2 bg-sky-600 text-white hover:bg-sky-700">
                    <LayoutTemplate className="h-4 w-4" />
                    Wybierz szablon
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl border-white/10 bg-slate-950 text-slate-100">
                  <DialogHeader>
                    <DialogTitle>Szablony banerów</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Wybierz punkt startowy i dopracuj go dalej w edytorze po lewej stronie.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 pt-2 sm:grid-cols-2">
                    {TEMPLATES.map((template) => (
                      <TemplateCard key={template.name} template={template} onApply={applyTemplate} />
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              {activeTemplate ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setActiveTemplateName("Własny układ");
                    setLayoutVariant(STANDARD_LAYOUT);
                    setPhoneStyle((current) => (current === "classicSale" ? "badge" : current));
                  }}
                  className="border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"
                >
                  Przejdź na własny układ
                </Button>
              ) : null}
            </div>
          </div>

          <Tabs value={activeEditorTab} onValueChange={setActiveEditorTab} className="rounded-lg border border-white/10 bg-slate-950/35 p-4">
            <TabsList className="grid h-auto w-full grid-cols-3 rounded-lg bg-white/[0.04] p-1">
              <TabsTrigger value="format" className="rounded-md py-2 text-xs data-[state=active]:bg-sky-500/15 data-[state=active]:text-sky-100">
                Format
              </TabsTrigger>
              <TabsTrigger value="content" className="rounded-md py-2 text-xs data-[state=active]:bg-sky-500/15 data-[state=active]:text-sky-100">
                Treść
              </TabsTrigger>
              <TabsTrigger value="style" className="rounded-md py-2 text-xs data-[state=active]:bg-sky-500/15 data-[state=active]:text-sky-100">
                Styl
              </TabsTrigger>
            </TabsList>

            <TabsContent value="format" className="space-y-4 pt-4">
              <div>
                <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Format</Label>
                <Select value={presetLabel} onValueChange={handlePresetChange}>
                  <SelectTrigger className="border-white/10 bg-white/[0.04] text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                    {PRESETS.map((item) => (
                      <SelectItem key={item.label} value={item.label} className="focus:bg-white/10">
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={customW}
                    onChange={(event) => {
                      setCustomW(clamp(Number(event.target.value) || 100, 100, 4000));
                      setPresetLabel(customPreset.label);
                    }}
                    className="border-white/10 bg-white/[0.04] text-slate-100"
                    placeholder="Szerokość"
                  />
                  <Input
                    type="number"
                    value={customH}
                    onChange={(event) => {
                      setCustomH(clamp(Number(event.target.value) || 100, 100, 4000));
                      setPresetLabel(customPreset.label);
                    }}
                    className="border-white/10 bg-white/[0.04] text-slate-100"
                    placeholder="Wysokość"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Tło</Label>
                <div className="grid grid-cols-4 gap-2">
                  {BACKGROUNDS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      title={item.label}
                      onClick={() => setBackground(item.value)}
                      className={`h-11 rounded-lg border-2 transition-all ${
                        background === item.value ? "border-sky-400 scale-[0.96]" : "border-transparent hover:border-white/20"
                      }`}
                      style={{ background: item.value }}
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Label className="text-xs text-slate-500">Przyciemnienie tła</Label>
                  <Slider value={[overlayOpacity]} onValueChange={([value]) => setOverlayOpacity(value)} min={0} max={40} step={1} className="flex-1" />
                  <span className="w-10 text-right text-xs text-slate-400">{overlayOpacity}%</span>
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Typ panelu</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "none", label: "Bez" },
                    { value: "soft", label: "Soft" },
                    { value: "glass", label: "Glass" },
                    { value: "solid", label: "Solid" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setPanelStyle(item.value)}
                      className={`rounded-lg border px-3 py-2 text-xs transition-all ${
                        panelStyle === item.value
                          ? "border-sky-400/60 bg-sky-500/10 text-sky-100"
                          : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 pt-4">
              <div>
                <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Eyebrow</Label>
                <div className="flex gap-2">
                  <Input value={eyebrow} onChange={(event) => setEyebrow(event.target.value)} className="border-white/10 bg-white/[0.04] text-slate-100" />
                  <Button
                    type="button"
                    variant={showEyebrow ? "default" : "outline"}
                    onClick={() => setShowEyebrow((current) => !current)}
                    className={showEyebrow ? "bg-sky-600 text-white hover:bg-sky-700" : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"}
                  >
                    {showEyebrow ? "ON" : "OFF"}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Nagłówek</Label>
                <Textarea value={headline} onChange={(event) => setHeadline(event.target.value)} className="min-h-[110px] border-white/10 bg-white/[0.04] text-slate-100" />
                <div className="mt-3 flex items-center gap-3">
                  <Slider value={[headlineSize]} onValueChange={([value]) => setHeadlineSize(value)} min={34} max={180} step={2} className="flex-1" />
                  <span className="w-12 text-right text-xs text-slate-400">{headlineSize}px</span>
                  <input type="color" value={headlineColor} onChange={(event) => setHeadlineColor(event.target.value)} className="h-10 w-10 rounded-lg border-0 bg-transparent" />
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Podtytuł</Label>
                <Textarea value={subtext} onChange={(event) => setSubtext(event.target.value)} className="min-h-[110px] border-white/10 bg-white/[0.04] text-slate-100" />
                <div className="mt-3 flex items-center gap-3">
                  <Slider value={[subtextSize]} onValueChange={([value]) => setSubtextSize(value)} min={16} max={72} step={1} className="flex-1" />
                  <span className="w-12 text-right text-xs text-slate-400">{subtextSize}px</span>
                  <input type="color" value={subtextColor} onChange={(event) => setSubtextColor(event.target.value)} className="h-10 w-10 rounded-lg border-0 bg-transparent" />
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Telefon</Label>
                <div className="flex gap-2">
                  <Input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} className="border-white/10 bg-white/[0.04] text-slate-100" />
                  <Button
                    type="button"
                    variant={showPhone ? "default" : "outline"}
                    onClick={() => setShowPhone((current) => !current)}
                    className={showPhone ? "bg-sky-600 text-white hover:bg-sky-700" : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"}
                  >
                    {showPhone ? "ON" : "OFF"}
                  </Button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Label className="text-xs text-slate-500">Rozmiar numeru</Label>
                    <Slider value={[phoneTextSize]} onValueChange={([value]) => setPhoneTextSize(value)} min={22} max={90} step={1} className="flex-1" />
                    <span className="w-10 text-right text-xs text-slate-400">{phoneTextSize}px</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="text-xs text-slate-500">Rozmiar ikony</Label>
                    <Slider value={[phoneIconSize]} onValueChange={([value]) => setPhoneIconSize(value)} min={24} max={140} step={1} className="flex-1" />
                    <span className="w-10 text-right text-xs text-slate-400">{phoneIconSize}px</span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { value: "pill", label: "Pigułka" },
                    { value: "badge", label: "Ikona" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setPhoneStyle(item.value)}
                      className={`rounded-lg border px-3 py-2 text-xs transition-all ${
                        phoneStyle === item.value || (phoneStyle === "classicSale" && item.value === "badge")
                          ? "border-sky-400/60 bg-sky-500/10 text-sky-100"
                          : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">CTA</Label>
                <div className="flex gap-2">
                  <Input value={cta} onChange={(event) => setCta(event.target.value)} className="border-white/10 bg-white/[0.04] text-slate-100" />
                  <Button
                    type="button"
                    variant={showCta ? "default" : "outline"}
                    onClick={() => setShowCta((current) => !current)}
                    className={showCta ? "bg-sky-600 text-white hover:bg-sky-700" : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"}
                  >
                    {showCta ? "ON" : "OFF"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Czcionka</Label>
                  <Select value={font} onValueChange={setFont}>
                    <SelectTrigger className="border-white/10 bg-white/[0.04] text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                      {FONTS.map((item) => (
                        <SelectItem key={item} value={item} className="focus:bg-white/10" style={{ fontFamily: item }}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Wyrównanie</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "left", label: "Lewa" },
                      { value: "center", label: "Środek" },
                      { value: "right", label: "Prawa" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setAlign(item.value)}
                        className={`rounded-lg border px-3 py-2 text-xs transition-all ${
                          align === item.value
                            ? "border-sky-400/60 bg-sky-500/10 text-sky-100"
                            : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Logo / grafika</Label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-white/[0.05]">
                  <ImageIcon className="h-4 w-4 text-sky-300" />
                  {logoUrl ? "Podmień logo" : "Dodaj logo PNG / JPG"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
                </label>
                {logoUrl ? (
                  <div className="mt-3 flex items-center gap-3">
                    <Slider value={[logoSize]} onValueChange={([value]) => setLogoSize(value)} min={50} max={260} step={2} className="flex-1" />
                    <span className="w-12 text-right text-xs text-slate-400">{logoSize}px</span>
                    <Button type="button" variant="ghost" onClick={() => setLogoUrl("")} className="text-rose-300 hover:bg-rose-500/10 hover:text-rose-200">
                      Usuń
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Kolor akcentu</Label>
                  <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                    <Palette className="h-4 w-4 text-sky-300" />
                    <input type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} className="h-10 w-full rounded-lg border-0 bg-transparent" />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Szerokość treści</Label>
                  <div className="flex items-center gap-3">
                    <Slider value={[contentWidth]} onValueChange={([value]) => setContentWidth(value)} min={40} max={100} step={1} className="flex-1" />
                    <span className="w-12 text-right text-xs text-slate-400">{contentWidth}%</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Margines wewnętrzny</Label>
                <div className="flex items-center gap-3">
                  <Slider value={[padding]} onValueChange={([value]) => setPadding(value)} min={0} max={14} step={1} className="flex-1" />
                  <span className="w-12 text-right text-xs text-slate-400">{padding}%</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-white">Podgląd live</p>
              <p className="mt-1 text-xs text-slate-400">
                {width} × {height}px, skala podglądu {Math.round(scale * 100)}%
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleExport} disabled={exporting} className="gap-2 bg-sky-600 text-white hover:bg-sky-700">
                {exporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Pobierz PNG
              </Button>
            </div>
          </div>
          {exportError ? (
            <div className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {exportError}
            </div>
          ) : null}

          <div
            ref={previewStageRef}
            className="overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.85),rgba(2,6,23,0.98))] p-4 shadow-[0_30px_100px_-60px_rgba(15,23,42,1)]"
          >
            <div
              style={{
                width: width * scale,
                height: height * scale,
                position: "relative",
                overflow: "hidden",
                borderRadius: 8,
                boxShadow: "0 40px 100px -50px rgba(15,23,42,0.95)",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  width,
                  height,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                <BannerArtwork config={bannerConfig} width={width} height={height} logoUrl={logoUrl} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <PresetTile
              active={showEyebrow}
              title="Mocny start"
              meta="Eyebrow pomaga ustawić kategorię oferty już na pierwszym spojrzeniu."
              onClick={() => setShowEyebrow((current) => !current)}
            />
            <PresetTile
              active={showCta}
              title="Widoczne CTA"
              meta="Przycisk tekstowy wzmacnia sprzedażowy charakter i kieruje uwagę."
              onClick={() => setShowCta((current) => !current)}
            />
            <PresetTile
              active={showPhone}
              title="Kontakt na froncie"
              meta="Numer na banerze działa dobrze w drukach lokalnych i szybkich akcjach."
              onClick={() => setShowPhone((current) => !current)}
            />
          </div>
        </div>
      </div>

      {exporting ? (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width,
            height,
            pointerEvents: "none",
            opacity: 1,
            transform: `translate3d(-${width + 64}px, 0, 0)`,
            zIndex: -1,
          }}
          aria-hidden="true"
        >
          <div ref={exportRef}>
            <BannerArtwork config={bannerConfig} width={width} height={height} logoUrl={logoUrl} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
