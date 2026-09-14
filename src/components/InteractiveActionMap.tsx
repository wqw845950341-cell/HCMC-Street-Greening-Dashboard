import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Tooltip,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import { colors, typeLabel, type Lang } from "../research";
import { locations } from "../locations";
import BeforeAfterViewer from "./BeforeAfterViewer";
const pin = L.divIcon({
  html: '<span class="map-pin">↔</span>',
  className: "comparison-pin",
  iconSize: [28, 28],
});
const url = (id: string, after: boolean) =>
  "https://raw.githubusercontent.com/wqw845950341-cell/street/main/" +
  encodeURIComponent(
    after ? (/^E[23]-/.test(id) ? "修改后" : "改造后") : "改造前",
  ) +
  id +
  ".jpg";
export default function InteractiveActionMap({
  data,
  lang,
  filterKey,
  showExamples,
  onSelect,
}: {
  data: any;
  lang: Lang;
  filterKey: string;
  showExamples: boolean;
  onSelect: (p: any) => void;
}) {
  const [active, setActive] = useState<any>(null);
  const zh = lang === "zh";
  return (
    <div className="map-shell">
      <MapContainer
        bounds={L.latLngBounds(
          data.features.length
            ? data.features.map((f: any) => [
                f.geometry.coordinates[1],
                f.geometry.coordinates[0],
              ])
            : locations.map((p) => [p.lat, p.lng]),
        )}
        boundsOptions={{ padding: [24, 24] }}
        zoomControl={false}
        preferCanvas
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <ZoomControl
          zoomInTitle={zh ? "放大" : "Zoom in"}
          zoomOutTitle={zh ? "缩小" : "Zoom out"}
        />
        <GeoJSON
          key={filterKey + lang}
          data={data}
          pointToLayer={(f, latlng) =>
            L.circleMarker(latlng, {
              radius: 3.5,
              weight: 0.4,
              color: "#fff",
              fillColor: colors[f.properties.Grade] || "#777",
              fillOpacity: 0.88,
            })
          }
          onEachFeature={(f, layer) => {
            const el = document.createElement("div");
            el.textContent = `${f.properties.Grade} · ${typeLabel(f.properties.Type, lang)}`;
            layer.bindTooltip(el, { sticky: true });
            layer.on("click", () => onSelect(f));
          }}
        />
        {showExamples &&
          locations.map((p) => (
            <Marker
              key={p.id}
              alt={p.id + (zh ? " 方案对比" : " Design comparison")}
              title={p.id}
              position={[p.lat, p.lng]}
              icon={pin}
              eventHandlers={{ click: () => setActive(p) }}
            >
              <Tooltip>
                {p.id} · {typeLabel(p.type, lang)} ·{" "}
                {zh ? "方案对比" : "Design comparison"}
              </Tooltip>
            </Marker>
          ))}
      </MapContainer>
      <div className="map-note">
        {zh
          ? "点击彩色样点查看诊断；↔ 为独立方案案例"
          : "Select a colored sample for diagnosis; ↔ marks separate design cases"}
      </div>
      {active && (
        <BeforeAfterViewer
          title={`${active.id} · ${typeLabel(active.type, lang)}`}
          beforeImg={url(active.id, false)}
          afterImg={url(active.id, true)}
          lang={lang}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}
