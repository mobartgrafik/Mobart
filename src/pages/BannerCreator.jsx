import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, RefreshCw, Type, Image as ImageIcon, Palette } from "lucide-react";
import html2canvas from "html2canvas";

const PRESETS = [
  { label: "Baner 6×3m", w: 1200, h: 600 },
  { label: "Baner 3×1m", w: 900, h: 300 },
  { label: "Rollup 85×200cm", w: 510, h: 1200 },
  { label: "Plakat A1", w: 594, h: 841 },
  { label: "Plakat A3", w: 420, h: 594 },
  { label: "Baner FB (1200×628)", w: 1200, h: 628 },
  { label: "Własny", w: null, h: null },
];

const GRADIENTS = [
  { label: "Ciemny", value: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" },
  { label: "Niebieski", value: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" },
  { label: "Czerwony", value: "linear-gradient(135deg, #c0392b 0%, #8e44ad 100%)" },
  { label: "Zielony", value: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)" },
  { label: "Złoty", value: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)" },
  { label: "Różowy", value: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)" },
  { label: "Szary", value: "linear-gradient(135deg, #373b44 0%, #4286f4 100%)" },
  { label: "Białe tło", value: "#ffffff" },
];

const FONTS = ["Arial", "Georgia", "Impact", "Trebuchet MS", "Verdana", "Courier New"];

export default function BannerCreator() {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [customW, setCustomW] = useState(800);
  const [customH, setCustomH] = useState(400);
  const [bg, setBg] = useState(GRADIENTS[0].value);
  const [headline, setHeadline] = useState("TWÓJ TEKST TUTAJ");
  const [subtext, setSubtext] = useState("Podtytuł lub slogan reklamowy");
  const [headlineSize, setHeadlineSize] = useState(72);
  const [subtextSize, setSubtextSize] = useState(32);
  const [headlineColor, setHeadlineColor] = useState("#ffffff");
  const [subtextColor, setSubtextColor] = useState("#dddddd");
  const [font, setFont] = useState("Impact");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoSize, setLogoSize] = useState(120);
  const [exporting, setExporting] = useState(false);
  const [align, setAlign] = useState("center");

  const bannerRef = useRef(null);

  const width = preset.w ?? customW;
  const height = preset.h ?? customH;

  // Scale for preview (max 700px wide)
  const maxPreviewW = 700;
  const scale = Math.min(1, maxPreviewW / width);

  const handleExport = async () => {
    setExporting(true);
    const el = bannerRef.current;
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });
    const link = document.createElement("a");
    link.download = `baner-${width}x${height}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setExporting(false);
  };

  const handleLogoFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Kreator baneru</h1>
        <Button
          onClick={handleExport}
          disabled={exporting}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Pobierz PNG
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Controls */}
        <div className="space-y-5 bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-5">

          {/* Preset */}
          <div>
            <Label className="text-zinc-400 text-xs mb-1.5 block">Format</Label>
            <Select
              value={preset.label}
              onValueChange={v => setPreset(PRESETS.find(p => p.label === v))}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {PRESETS.map(p => (
                  <SelectItem key={p.label} value={p.label} className="text-zinc-100 focus:bg-zinc-700">{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {preset.label === "Własny" && (
              <div className="flex gap-2 mt-2">
                <Input type="number" value={customW} onChange={e => setCustomW(+e.target.value)}
                  placeholder="Szerokość (px)" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                <Input type="number" value={customH} onChange={e => setCustomH(+e.target.value)}
                  placeholder="Wysokość (px)" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
            )}
          </div>

          {/* Background */}
          <div>
            <Label className="text-zinc-400 text-xs mb-1.5 block flex items-center gap-1"><Palette className="w-3 h-3" /> Tło</Label>
            <div className="grid grid-cols-4 gap-2">
              {GRADIENTS.map(g => (
                <button
                  key={g.value}
                  onClick={() => setBg(g.value)}
                  title={g.label}
                  className={`h-9 rounded-lg border-2 transition-all ${bg === g.value ? "border-blue-500 scale-95" : "border-transparent hover:border-zinc-600"}`}
                  style={{ background: g.value }}
                />
              ))}
            </div>
          </div>

          {/* Headline */}
          <div>
            <Label className="text-zinc-400 text-xs mb-1.5 block flex items-center gap-1"><Type className="w-3 h-3" /> Nagłówek</Label>
            <Input value={headline} onChange={e => setHeadline(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 mb-2" placeholder="Tekst główny" />
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 w-8">{headlineSize}px</span>
              <Slider value={[headlineSize]} onValueChange={([v]) => setHeadlineSize(v)} min={20} max={200} step={2} className="flex-1" />
              <input type="color" value={headlineColor} onChange={e => setHeadlineColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
            </div>
          </div>

          {/* Subtext */}
          <div>
            <Label className="text-zinc-400 text-xs mb-1.5 block">Podtytuł</Label>
            <Input value={subtext} onChange={e => setSubtext(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 mb-2" placeholder="Podtytuł / slogan" />
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 w-8">{subtextSize}px</span>
              <Slider value={[subtextSize]} onValueChange={([v]) => setSubtextSize(v)} min={12} max={100} step={2} className="flex-1" />
              <input type="color" value={subtextColor} onChange={e => setSubtextColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
            </div>
          </div>

          {/* Font & align */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">Czcionka</Label>
              <Select value={font} onValueChange={setFont}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {FONTS.map(f => (
                    <SelectItem key={f} value={f} className="text-zinc-100 focus:bg-zinc-700" style={{ fontFamily: f }}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">Wyrównanie</Label>
              <div className="flex gap-1">
                {["left", "center", "right"].map(a => (
                  <button key={a} onClick={() => setAlign(a)}
                    className={`flex-1 py-1.5 rounded text-xs border transition-all ${align === a ? "bg-blue-600 border-blue-500 text-white" : "border-zinc-700 text-zinc-500 hover:border-zinc-500"}`}>
                    {a === "left" ? "L" : a === "center" ? "C" : "R"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Logo */}
          <div>
            <Label className="text-zinc-400 text-xs mb-1.5 block flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Logo / grafika</Label>
            <label className="flex items-center gap-2 cursor-pointer bg-zinc-800 hover:bg-zinc-750 border border-dashed border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-zinc-300">
              <ImageIcon className="w-4 h-4" />
              {logoUrl ? "Zmień logo" : "Dodaj logo (PNG/JPG)"}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
            </label>
            {logoUrl && (
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs text-zinc-500 w-8">{logoSize}px</span>
                <Slider value={[logoSize]} onValueChange={([v]) => setLogoSize(v)} min={40} max={400} step={10} className="flex-1" />
                <button onClick={() => setLogoUrl("")} className="text-xs text-red-400 hover:text-red-300">Usuń</button>
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-3">
          <div className="text-xs text-zinc-600 text-right">{width} × {height} px (podgląd {Math.round(scale * 100)}%)</div>
          <div className="overflow-auto rounded-xl border border-zinc-800">
            <div style={{ width: width * scale, height: height * scale, position: "relative", overflow: "hidden" }}>
              {/* Actual banner (rendered at full size but scaled) */}
              <div
                ref={bannerRef}
                style={{
                  width,
                  height,
                  background: bg,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end",
                  justifyContent: "center",
                  padding: Math.round(width * 0.06),
                  boxSizing: "border-box",
                  transformOrigin: "top left",
                  transform: `scale(${scale})`,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  gap: Math.round(height * 0.04),
                }}
              >
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="logo"
                    style={{
                      width: logoSize,
                      height: "auto",
                      objectFit: "contain",
                      marginBottom: Math.round(height * 0.02),
                    }}
                    crossOrigin="anonymous"
                  />
                )}
                {headline && (
                  <div style={{
                    fontFamily: font,
                    fontSize: headlineSize,
                    color: headlineColor,
                    fontWeight: "bold",
                    textAlign: align,
                    lineHeight: 1.1,
                    wordBreak: "break-word",
                    textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  }}>
                    {headline}
                  </div>
                )}
                {subtext && (
                  <div style={{
                    fontFamily: font,
                    fontSize: subtextSize,
                    color: subtextColor,
                    textAlign: align,
                    lineHeight: 1.3,
                    wordBreak: "break-word",
                    opacity: 0.9,
                  }}>
                    {subtext}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}