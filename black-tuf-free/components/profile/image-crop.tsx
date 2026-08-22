"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CropBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * A self-contained image crop dialog. The source image is displayed inside a
 * fixed viewport and the user drags/resizes a crop selection that matches the
 * requested aspect ratio. The crop is rendered to a canvas at natural resolution
 * and returned as a Blob (already trimmed to the target ratio).
 */
export function ImageCropDialog({
  open,
  file,
  aspect = 16 / 9,
  minWidth = 320,
  title = "Crop image",
  onCancel,
  onCrop,
}: {
  open: boolean;
  file: File | null;
  aspect?: number;
  minWidth?: number;
  title?: string;
  onCancel: () => void;
  onCrop: (blob: Blob) => void | Promise<void>;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [box, setBox] = useState<CropBox>({ x: 0, y: 0, w: 100, h: 100 });
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{
    mode: "move" | "resize";
    startX: number;
    startY: number;
    box: CropBox;
  } | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSrc(url);
    const img = new Image();
    img.onload = () => {
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      setBox({ x: 0, y: 0, w: 100, h: 100 });
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const displayed = () => {
    const el = imgRef.current;
    if (!el) return { w: 1, h: 1 };
    return { w: el.clientWidth, h: el.clientHeight };
  };

  const toCrop = (x: number, y: number) => {
    const { w, h } = displayed();
    return { x: (x / w) * 100, y: (y / h) * 100 };
  };

  const clampBox = (next: CropBox): CropBox => {
    const nx = Math.min(100, Math.max(0, next.x));
    const ny = Math.min(100, Math.max(0, next.y));
    const nx2 = Math.min(100, Math.max(next.x + next.w, next.x));
    const ny2 = Math.min(100, Math.max(next.y + next.h, next.y));
    return { x: nx, y: ny, w: nx2 - nx, h: ny2 - ny };
  };

  const onPointerDown = (e: React.PointerEvent, mode: "move" | "resize") => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY, box: { ...box } };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    const el = imgRef.current;
    if (!drag || !el) return;
    const rect = el.getBoundingClientRect();
    const dxPx = e.clientX - drag.startX;
    const dyPx = e.clientY - drag.startY;
    const { w, h } = displayed();
    const dx = (dxPx / w) * 100;
    const dy = (dyPx / h) * 100;

    if (drag.mode === "move") {
      setBox(clampBox({ x: drag.box.x + dx, y: drag.box.y + dy, w: drag.box.w, h: drag.box.h }));
      return;
    }

    const min = 8;
    const isPortrait = aspect < 1;
    const base = isPortrait ? drag.box.h : drag.box.w;
    const newW = Math.max(min, drag.box.w + dx);
    const newH = isPortrait ? (newW * 1) / (1 / aspect) : newW / aspect;
    const keepRatio = Math.min(newW / Math.max(drag.box.w, 1), newH / Math.max(drag.box.h, 1));
    let w2 = drag.box.w * keepRatio;
    let h2 = drag.box.h * keepRatio;
    if (w2 < min || h2 < min) {
      const scale = min / Math.min(w2, h2);
      w2 *= scale;
      h2 *= scale;
    }
    const x2 = drag.box.x + drag.box.w - w2;
    const y2 = drag.box.y + drag.box.h - h2;
    setBox(clampBox({ x: x2, y: y2, w: w2, h: h2 }));
    void base;
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const doCrop = async () => {
    const el = imgRef.current;
    if (!el || !file) return;
    setSaving(true);
    try {
      const disp = displayed();
      const sx = (box.x / 100) * natural.w;
      const sy = (box.y / 100) * natural.h;
      const sw = (box.w / 100) * natural.w;
      const sh = (box.h / 100) * natural.h;
      const outW = Math.max(minWidth, Math.round(sw));
      const outH = Math.round(outW / aspect);
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(el, sx, sy, sw, sh, 0, 0, outW, outH);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Crop failed"))), "image/jpeg", 0.92)
      );
      await onCrop(blob);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative overflow-hidden rounded-xl border border-border bg-black/40">
          {src ? (
            <div ref={containerRef} className="relative max-h-[55vh] overflow-hidden">
              <img
                ref={imgRef}
                src={src}
                alt="Crop preview"
                draggable={false}
                className="pointer-events-none block w-full select-none"
                style={{ maxHeight: "55vh", objectFit: "contain", objectPosition: "center" }}
                onLoad={() => {
                  const imgEl = imgRef.current;
                  if (!imgEl) return;
                  const { w, h } = displayed();
                  const dispRatio = w / h;
                  const targetRatio = aspect;
                  let bw = 100;
                  let bh = 100;
                  if (dispRatio > targetRatio) {
                    bh = (100 * targetRatio) / dispRatio;
                  } else {
                    bw = (100 * dispRatio) / targetRatio;
                  }
                  setBox({ x: (100 - bw) / 2, y: (100 - bh) / 2, w: bw, h: bh });
                }}
              />
              {/* Crop overlay */}
              <div
                className="absolute cursor-move touch-none"
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.w}%`,
                  height: `${box.h}%`,
                }}
                onPointerDown={(e) => onPointerDown(e, "move")}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              >
                <div className="absolute inset-0 border-2 border-primary" />
                {/* dim outside */}
                {[
                  { top: `${-box.y}%`, left: 0, width: "100%", height: `${box.y}%` },
                  { top: `${box.y}%`, left: 0, width: `${box.x}%`, height: `${box.h}%` },
                  { top: `${box.y}%`, right: 0, left: `${box.x + box.w}%`, width: `${100 - box.x - box.w}%`, height: `${box.h}%` },
                  { top: `${box.y + box.h}%`, left: 0, width: "100%", height: `${100 - box.y - box.h}%` },
                ].map((s, i) => (
                  <div key={i} className="absolute bg-black/50" style={s as React.CSSProperties} />
                ))}
                {/* resize handle */}
                <div
                  className="absolute -bottom-1 -right-1 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border-2 border-primary bg-background"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onPointerDown(e, "resize");
                  }}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Loading image…
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Drag to position. Use the handle to resize. The selection keeps a fixed aspect ratio.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button variant="gradient" onClick={doCrop} disabled={saving || !src}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
