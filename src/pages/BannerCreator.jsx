import React, { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BadgePlus,
  Download,
  Image as ImageIcon,
  LayoutTemplate,
  Phone,
  Palette,
  RefreshCw,
  Sparkles,
  Type,
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
    },
  },
];

const DEFAULT_TEMPLATE = {
  presetLabel: PRESETS[0].label,
  background: BACKGROUNDS[0].value,
  panelStyle: "glass",
  overlayOpacity: 14,
  align: "left",
  eyebrow: "MOCNY PRZEKAZ REKLAMOWY",
  headline: "TWÓJ TEKST GŁÓWNY",
  subtext: "Podtytuł, slogan lub kilka zdań, które dopowiadają ofertę i kierują uwagę klienta.",
  cta: "Skontaktuj się teraz",
  phoneNumber: "123 456 789",
  showPhone: true,
  showCta: true,
  showEyebrow: true,
  headlineColor: "#ffffff",
  subtextColor: "#e2e8f0",
  accentColor: "#38bdf8",
  font: "Impact",
  headlineSize: 92,
  subtextSize: 28,
  contentWidth: 62,
  padding: 8,
  logoSize: 110,
};

const MAX_PREVIEW_WIDTH = 760;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function PresetTile({ active, title, meta, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[22px] border px-4 py-3 text-left transition-all duration-200 ${
        active
          ? "border-sky-400/60 bg-sky-500/10 text-white shadow-[0_18px_40px_-28px_rgba(56,189,248,0.5)]"
          : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-inherit/70">{meta}</p>
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
    <div className={`rounded-[24px] border px-4 py-4 ${tones[tone]}`}>
      <p className="text-[11px] uppercase tracking-[0.24em] text-inherit/60">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function BannerArtwork({ config, width, height, logoUrl }) {
  const horizontalAlign = config.align === "center" ? "center" : config.align === "right" ? "flex-end" : "flex-start";
  const textAlign = config.align;
  const padding = Math.round(width * (config.padding / 100));
  const contentWidth = Math.round(width * (config.contentWidth / 100));
  const panelRadius = Math.max(28, Math.round(width * 0.028));
  const panelPadding = Math.max(24, Math.round(width * 0.045));

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
          width: width * 0.52,
          height: width * 0.52,
          borderRadius: "999px",
          right: -width * 0.16,
          top: -width * 0.16,
          background: `radial-gradient(circle, ${config.accentColor}66 0%, transparent 70%)`,
          filter: "blur(18px)",
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: width * 0.38,
          height: width * 0.38,
          borderRadius: "999px",
          left: -width * 0.12,
          bottom: -width * 0.18,
          background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 72%)",
          filter: "blur(12px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: padding,
          display: "flex",
          alignItems: "stretch",
          justifyContent: horizontalAlign,
        }}
      >
        <div
          style={{
            width: contentWidth,
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: config.align === "center" ? "center" : config.align === "right" ? "flex-end" : "flex-start",
            textAlign,
            gap: Math.max(14, Math.round(height * 0.026)),
            padding: panelPadding,
            borderRadius: panelRadius,
            background: panelBackground,
            border: panelBorder,
            boxShadow: panelShadow,
            backdropFilter: config.panelStyle === "none" ? "none" : "blur(12px)",
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              crossOrigin="anonymous"
              style={{
                width: config.logoSize,
                maxWidth: "42%",
                height: "auto",
                objectFit: "contain",
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
                fontSize: Math.max(14, Math.round(width * 0.012)),
                fontWeight: 700,
                textTransform: "uppercase",
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
              fontSize: config.headlineSize,
              lineHeight: 0.95,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              maxWidth: "100%",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              color: config.headlineColor,
              textShadow: config.panelStyle === "solid" ? "none" : "0 18px 40px rgba(15,23,42,0.28)",
            }}
          >
            {config.headline}
          </div>

          <div
            style={{
              fontSize: config.subtextSize,
              lineHeight: 1.3,
              maxWidth: "100%",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
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
                  fontSize: Math.max(18, Math.round(config.subtextSize * 0.8)),
                  fontWeight: 800,
                  boxShadow: `0 20px 40px -28px ${config.accentColor}`,
                }}
              >
                <Sparkles size={Math.max(16, Math.round(width * 0.016))} />
                <span>{config.cta}</span>
              </div>
            ) : null}

            {config.showPhone && config.phoneNumber ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  padding: `${Math.max(12, Math.round(height * 0.012))}px ${Math.max(16, Math.round(width * 0.018))}px`,
                  borderRadius: 999,
                  background: config.panelStyle === "solid" ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.12)",
                  border: config.panelStyle === "solid" ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.12)",
                  color: config.headlineColor,
                  fontSize: Math.max(20, Math.round(config.headlineSize * 0.28)),
                  fontWeight: 800,
                }}
              >
                <Phone size={Math.max(20, Math.round(width * 0.02))} />
                <span>{config.phoneNumber}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BannerCreator() {
  const [presetLabel, setPresetLabel] = useState(DEFAULT_TEMPLATE.presetLabel);
  const [customW, setCustomW] = useState(1200);
  const [customH, setCustomH] = useState(600);
  const [background, setBackground] = useState(DEFAULT_TEMPLATE.background);
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
  const [contentWidth, setContentWidth] = useState(DEFAULT_TEMPLATE.contentWidth);
  const [padding, setPadding] = useState(DEFAULT_TEMPLATE.padding);
  const [exporting, setExporting] = useState(false);

  const exportRef = useRef(null);
  const customPreset = PRESETS.find((item) => item.label === "Własny format");
  const preset = PRESETS.find((item) => item.label === presetLabel) || PRESETS[0];
  const width = preset.w ?? customW;
  const height = preset.h ?? customH;
  const scale = useMemo(() => Math.min(1, MAX_PREVIEW_WIDTH / width), [width]);

  const bannerConfig = {
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
  };

  const presetSummary = `${width} × ${height}px`;
  const visualDensity = headline.length > 42 ? "bardziej tekstowy" : showPhone || showCta ? "sprzedażowy" : "minimalny";

  const applyTemplate = (templateName) => {
    const template = TEMPLATES.find((item) => item.name === templateName);
    if (!template) return;

    const nextPreset = PRESETS.find((item) => item.label === template.config.presetLabel) || PRESETS[0];
    setPresetLabel(nextPreset.label);
    if (nextPreset.w && nextPreset.h) {
      setCustomW(nextPreset.w);
      setCustomH(nextPreset.h);
    }

    setBackground(template.config.background);
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
  };

  const resetCreator = () => {
    setPresetLabel(DEFAULT_TEMPLATE.presetLabel);
    setCustomW(1200);
    setCustomH(600);
    setBackground(DEFAULT_TEMPLATE.background);
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
    reader.onload = (e) => setLogoUrl(e.target?.result);
    reader.readAsDataURL(file);
  };

  const handleExport = async () => {
    if (!exportRef.current) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      const link = document.createElement("a");
      link.download = `baner-${width}x${height}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-6 shadow-[0_30px_120px_-55px_rgba(14,165,233,0.45)] md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-sky-100">
              <Sparkles className="h-3.5 w-3.5" />
              Studio banerów
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Rozbudowany kreator banerów z lepszym layoutem, szablonami i eksportem bez utraty jakości.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Zamiast surowego generatora masz teraz pełniejszy system: szybkie starty od gotowych templatek, panel treści,
              CTA, telefon, branding i preview bliższy finalnej kompozycji.
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
        <div className="space-y-5 rounded-[30px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_24px_80px_-50px_rgba(15,23,42,0.9)]">
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

          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-[0.22em] text-slate-500">Szybki start</Label>
            <div className="grid gap-3">
              {TEMPLATES.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => applyTemplate(template.name)}
                  className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] text-left transition-all duration-200 hover:border-sky-400/30 hover:bg-white/[0.05]"
                >
                  <div className="h-24" style={{ background: template.previewBg }} />
                  <div className="space-y-1 px-4 py-3">
                    <p className="text-sm font-semibold text-white">{template.name}</p>
                    <p className="text-xs leading-5 text-slate-400">{template.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-[26px] border border-white/10 bg-slate-950/35 p-4">
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
                    className={`h-11 rounded-xl border-2 transition-all ${
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

            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "none", label: "Bez panelu" },
                { value: "soft", label: "Soft" },
                { value: "glass", label: "Glass" },
                { value: "solid", label: "Solid" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setPanelStyle(item.value)}
                  className={`rounded-2xl border px-3 py-2 text-xs transition-all ${
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

          <div className="space-y-4 rounded-[26px] border border-white/10 bg-slate-950/35 p-4">
            <div className="flex items-center gap-2 text-white">
              <Type className="h-4 w-4 text-sky-300" />
              <p className="text-sm font-semibold">Treść i hierarchia</p>
            </div>

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
              <Textarea
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                className="min-h-[110px] border-white/10 bg-white/[0.04] text-slate-100"
              />
              <div className="mt-3 flex items-center gap-3">
                <Slider value={[headlineSize]} onValueChange={([value]) => setHeadlineSize(value)} min={34} max={180} step={2} className="flex-1" />
                <span className="w-12 text-right text-xs text-slate-400">{headlineSize}px</span>
                <input type="color" value={headlineColor} onChange={(event) => setHeadlineColor(event.target.value)} className="h-10 w-10 rounded-xl border-0 bg-transparent" />
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Podtytuł</Label>
              <Textarea
                value={subtext}
                onChange={(event) => setSubtext(event.target.value)}
                className="min-h-[110px] border-white/10 bg-white/[0.04] text-slate-100"
              />
              <div className="mt-3 flex items-center gap-3">
                <Slider value={[subtextSize]} onValueChange={([value]) => setSubtextSize(value)} min={16} max={72} step={1} className="flex-1" />
                <span className="w-12 text-right text-xs text-slate-400">{subtextSize}px</span>
                <input type="color" value={subtextColor} onChange={(event) => setSubtextColor(event.target.value)} className="h-10 w-10 rounded-xl border-0 bg-transparent" />
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-[26px] border border-white/10 bg-slate-950/35 p-4">
            <div className="flex items-center gap-2 text-white">
              <LayoutTemplate className="h-4 w-4 text-sky-300" />
              <p className="text-sm font-semibold">CTA, branding i układ</p>
            </div>

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
                      className={`rounded-2xl border px-3 py-2 text-xs transition-all ${
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
            </div>

            <div>
              <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Logo / grafika</Label>
              <label className="flex cursor-pointer items-center gap-2 rounded-[18px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-white/[0.05]">
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
                <div className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-2">
                  <Palette className="h-4 w-4 text-sky-300" />
                  <input type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} className="h-10 w-full rounded-xl border-0 bg-transparent" />
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Szerokość treści</Label>
                <div className="flex items-center gap-3">
                  <Slider value={[contentWidth]} onValueChange={([value]) => setContentWidth(value)} min={40} max={90} step={1} className="flex-1" />
                  <span className="w-12 text-right text-xs text-slate-400">{contentWidth}%</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Margines wewnętrzny</Label>
              <div className="flex items-center gap-3">
                <Slider value={[padding]} onValueChange={([value]) => setPadding(value)} min={4} max={14} step={1} className="flex-1" />
                <span className="w-12 text-right text-xs text-slate-400">{padding}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-4">
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

          <div className="overflow-auto rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.85),rgba(2,6,23,0.98))] p-4 shadow-[0_30px_100px_-60px_rgba(15,23,42,1)]">
            <div
              style={{
                width: width * scale,
                height: height * scale,
                position: "relative",
                overflow: "hidden",
                borderRadius: 26,
                boxShadow: "0 40px 100px -50px rgba(15,23,42,0.95)",
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

      <div
        style={{
          position: "fixed",
          left: -10000,
          top: 0,
          width,
          height,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        <div ref={exportRef}>
          <BannerArtwork config={bannerConfig} width={width} height={height} logoUrl={logoUrl} />
        </div>
      </div>
    </div>
  );
}
