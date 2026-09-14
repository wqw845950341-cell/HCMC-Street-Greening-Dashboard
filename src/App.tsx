import { useEffect, useMemo, useRef, useState } from "react";
import {
  TreeDeciduous,
  Map,
  BookOpen,
  FlaskConical,
  Images,
  Download,
} from "lucide-react";
import InteractiveActionMap from "./components/InteractiveActionMap";
import {
  colors,
  grades,
  gradeNames,
  types,
  typeLabel,
  indicators,
  Lang,
} from "./research";

type View = "map" | "strategies" | "method" | "boards";
export default function App() {
  const diagnosisRef = useRef<HTMLElement>(null);
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return localStorage.getItem("hcmc-lang") === "en" ? "en" : "zh";
    } catch {
      return "zh";
    }
  });
  const zh = lang === "zh";
  const t = (a: string, b: string) => (zh ? a : b);
  const [view, setView] = useState<View>("map");
  const [data, setData] = useState<any>(null),
    [error, setError] = useState(false),
    [attempt, setAttempt] = useState(0);
  const [selectedGrades, setGrades] = useState(grades),
    [subtype, setSubtype] = useState("all"),
    [showExamples, setExamples] = useState(true),
    [selected, setSelected] = useState<any>(null);
  useEffect(() => {
    document.documentElement.lang = zh ? "zh-CN" : "en";
    document.title = t("胡志明市街道绿化研究", "HCMC Street Greening Research");
    try {
      localStorage.setItem("hcmc-lang", lang);
    } catch {}
  }, [lang]);
  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetch(`${import.meta.env.BASE_URL}HCMC_Dashboard_Data.json`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((d) => {
        if (d.type !== "FeatureCollection" || !Array.isArray(d.features))
          throw Error();
        setData(d);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [attempt]);
  const filtered = useMemo(
    () => ({
      type: "FeatureCollection",
      features: (data?.features || []).filter(
        (f: any) =>
          selectedGrades.includes(f.properties.Grade) &&
          (subtype === "all" || f.properties.Type?.startsWith(subtype + " ")),
      ),
    }),
    [data, selectedGrades, subtype],
  );
  const counts = grades.map(
    (g) =>
      filtered.features.filter((f: any) => f.properties.Grade === g).length,
  );
  useEffect(() => {
    diagnosisRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selected]);
  const selectType = types.find((s) =>
    selected?.properties.Type?.startsWith(s.code),
  );
  const tabs: [View, string, any][] = [
    ["map", t("行动地图", "Action map"), Map],
    ["strategies", t("改造策略", "Retrofit toolkit"), BookOpen],
    ["method", t("评价方法", "Methodology"), FlaskConical],
    ["boards", t("研究展板", "Research boards"), Images],
  ];
  function exportData() {
    const heading = zh
      ? "等级,类型,经度,纬度"
      : "Grade,Type,Longitude,Latitude";
    const rows = filtered.features.map((f: any) =>
      [
        f.properties.Grade,
        typeLabel(f.properties.Type, lang),
        ...f.geometry.coordinates,
      ]
        .map((v) => '"' + String(v).replaceAll('"', '""') + '"')
        .join(","),
    );
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + [heading, ...rows].join("\r\n")], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `HCMC-samples-${lang}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function reset() {
    setGrades(grades);
    setSubtype("all");
    setSelected(null);
  }
  return (
    <div className="app">
      <header className="topbar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView("map");
          }}
        >
          <span className="brand-icon">
            <TreeDeciduous />
          </span>
          <div>
            <strong>{t("街道绿化潜力", "Potential for Green")}</strong>
            <small>
              HO CHI MINH CITY · {t("研究仪表盘", "RESEARCH DASHBOARD")}
            </small>
          </div>
        </a>
        <div className="language" aria-label={t("语言", "Language")}>
          <button aria-pressed={zh} onClick={() => setLang("zh")}>
            中文
          </button>
          <button aria-pressed={!zh} onClick={() => setLang("en")}>
            English
          </button>
        </div>
      </header>
      <nav className="tabs" aria-label={t("主导航", "Main navigation")}>
        {tabs.map(([id, label, Icon]) => (
          <button
            key={id}
            aria-current={view === id ? "page" : undefined}
            onClick={() => setView(id)}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
        <span>
          {t(
            "Wang Qianwen · 街景形态与更新研究",
            "Wang Qianwen · Streetscape retrofit research",
          )}
        </span>
      </nav>
      {view === "map" ? (
        <div className="workspace">
          <aside className="filters">
            <div className="section-heading">
              <span className="eyebrow">
                01 / {t("空间诊断", "SPATIAL DIAGNOSIS")}
              </span>
              <h1>{t("寻找灰色空间", "Find the grey voids")}</h1>
              <p>
                {t(
                  "从街道样点识别绿化短板与改造机会。",
                  "Explore greening constraints and retrofit opportunities at street sample points.",
                )}
              </p>
            </div>
            <div className="filter-title">
              <h2>{t("绩效等级", "Performance grades")}</h2>
              <button onClick={reset}>{t("重置", "Reset")}</button>
            </div>
            <div className="grade-list">
              {grades.map((g, i) => (
                <label key={g}>
                  <input
                    type="checkbox"
                    checked={selectedGrades.includes(g)}
                    onChange={() => {
                      setSelected(null);
                      setGrades((prev) =>
                        prev.includes(g)
                          ? prev.filter((x) => x !== g)
                          : [...prev, g],
                      );
                    }}
                  />
                  <i style={{ background: colors[g] }} />
                  <span>
                    {g.slice(-1)} · {gradeNames[lang][i]}
                  </span>
                  <b>{counts[i].toLocaleString()}</b>
                </label>
              ))}
            </div>
            <label className="select-label">
              {t("诊断类型", "Diagnostic typology")}
              <select
                value={subtype}
                onChange={(e) => {
                  setSubtype(e.target.value);
                  setSelected(null);
                }}
              >
                <option value="all">{t("全部类型", "All typologies")}</option>
                {types.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} · {s[lang]}
                  </option>
                ))}
              </select>
            </label>
            <label className="example-toggle">
              <input
                type="checkbox"
                checked={showExamples}
                onChange={(e) => setExamples(e.target.checked)}
              />
              {t("显示 15 个独立方案案例", "Show 15 independent design cases")}
            </label>
            <div className="stats">
              <div>
                <strong>
                  {data ? filtered.features.length.toLocaleString() : "—"}
                </strong>
                <span>{t("筛选样点", "Filtered samples")}</span>
              </div>
              <div>
                <strong>
                  {data
                    ? (filtered.features.length
                        ? (
                            (counts[4] / filtered.features.length) *
                            100
                          ).toFixed(1)
                        : "0") + "%"
                    : "—"}
                </strong>
                <span>{t("危急样点占比", "Critical share")}</span>
              </div>
            </div>
            <button
              className="export"
              disabled={!filtered.features.length}
              onClick={exportData}
            >
              <Download size={16} />
              {t("导出筛选数据 CSV", "Export filtered CSV")}
            </button>
            <p className="source-note">
              {t(
                "静态研究数据，非实时监测。统计单位为样点，不是完整街段。地图保留数据文件已有等级。",
                "Static research data, not live monitoring. Counts represent sample points, not complete street segments. Existing dataset grades are preserved.",
              )}
            </p>
            {selected && (
              <section
                ref={diagnosisRef}
                className="diagnosis"
                aria-live="polite"
              >
                <div className="filter-title">
                  <h2>{t("样点诊断", "Sample diagnosis")}</h2>
                  <button
                    aria-label={t("关闭诊断", "Close diagnosis")}
                    onClick={() => setSelected(null)}
                  >
                    ×
                  </button>
                </div>
                <strong>{typeLabel(selected.properties.Type, lang)}</strong>
                <p>
                  {selectType?.diagnosis?.[zh ? 0 : 1] ||
                    t(
                      "参考高绩效模式，结合现场条件制定维护或提升方案。",
                      "Use high-performing patterns and local conditions to guide maintenance or improvement.",
                    )}
                </p>
                <p>{selectType?.strategy?.[zh ? 0 : 1]}</p>
                <small>
                  {selected.geometry.coordinates
                    .map((n: number) => n.toFixed(5))
                    .join(", ")}
                </small>
                <button onClick={() => setView("strategies")}>
                  {t("查看策略库", "Explore toolkit")} →
                </button>
              </section>
            )}
          </aside>
          <main className="map-region">
            <div className="map-topline">
              <strong>
                {t("综合绿化绩效分布", "Composite greening performance")}
              </strong>
              <span>{t("GIS + 街景分析", "GIS + street-view analysis")}</span>
            </div>
            {error ? (
              <div className="empty" role="alert">
                <h2>{t("地图数据加载失败", "Map data could not load")}</h2>
                <button onClick={() => setAttempt((x) => x + 1)}>
                  {t("重试", "Retry")}
                </button>
              </div>
            ) : !data ? (
              <div className="empty" role="status">
                {t("正在加载研究数据…", "Loading research data…")}
              </div>
            ) : (
              <>
                <InteractiveActionMap
                  data={filtered}
                  lang={lang}
                  filterKey={selectedGrades.join() + subtype}
                  showExamples={showExamples}
                  onSelect={setSelected}
                />
                {filtered.features.length === 0 && (
                  <div className="empty-filter" role="status">
                    {t(
                      "没有匹配样点，请调整筛选。",
                      "No matching samples. Adjust your filters.",
                    )}{" "}
                    <button onClick={reset}>{t("重置", "Reset")}</button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      ) : (
        <main className="content">
          <span className="eyebrow">
            {view === "strategies" ? "02" : view === "method" ? "03" : "04"} /
            REVEALING THE POTENTIAL FOR GREEN
          </span>
          <h1>{tabs.find((x) => x[0] === view)?.[1]}</h1>
          {view === "strategies" && (
            <>
              <p className="intro">
                {t(
                  "根据五类低绩效街景的空间约束，匹配针对性的微更新措施。内容依据 Final5 展板。",
                  "Match targeted retrofit measures to five low-performance streetscape typologies. Based on the Final5 research board.",
                )}
              </p>
              <div className="strategy-grid">
                {types.slice(0, 5).map((s, i) => (
                  <article className="strategy-card" key={s.code}>
                    <span className="strategy-code">{s.code}</span>
                    <h2>{s[lang]}</h2>
                    <p>{s.diagnosis?.[zh ? 0 : 1]}</p>
                    <img
                      loading="lazy"
                      src={`${import.meta.env.BASE_URL}research/strategy-${i + 1}.jpg`}
                      alt={t(s.zh + "改造方案", s.en + " proposed retrofit")}
                    />
                    <h3>{t("改造路径", "Retrofit approach")}</h3>
                    <p>{s.strategy?.[zh ? 0 : 1]}</p>
                  </article>
                ))}
              </div>
              <h2>
                {t("借鉴高绩效街景", "Learn from high-performing streets")}
              </h2>
              <div className="benchmark-list">
                {types.slice(5).map((s) => (
                  <span key={s.code}>
                    {s.code} · {s[lang]}
                  </span>
                ))}
              </div>
              <p className="source-note">
                {t(
                  "这些措施是研究设计建议；实际实施需结合现场空间、排水、结构与维护条件。",
                  "These are research design proposals. Implementation depends on site space, drainage, structure and maintenance conditions.",
                )}
              </p>
            </>
          )}
          {view === "method" && (
            <>
              <p className="intro">
                {t(
                  "将 GIS 宏观生态信息与街景微观感知结合，用综合评价与类型诊断识别更新潜力。",
                  "Combine macro-scale GIS ecology with street-level perception to identify retrofit potential through composite evaluation and typology diagnosis.",
                )}
              </p>
              <div className="method-flow">
                {(zh
                  ? [
                      "数据采集",
                      "七项指标",
                      "综合评价",
                      "类型诊断",
                      "针对性改造",
                    ]
                  : [
                      "Data collection",
                      "Seven indicators",
                      "Composite evaluation",
                      "Typology diagnosis",
                      "Targeted retrofit",
                    ]
                ).map((s, i) => (
                  <div key={s}>
                    <b>0{i + 1}</b>
                    {s}
                  </div>
                ))}
              </div>
              <h2>
                {t("综合评价权重 · Final4", "Composite weights · Final4")}
              </h2>
              <div className="indicator-grid">
                {indicators.map((s) => (
                  <article key={s[0]}>
                    <div>
                      <b>{s[0]}</b>
                      <strong>{s[1]}%</strong>
                    </div>
                    <h3>{s[zh ? 2 : 3]}</h3>
                    <p>{s[zh ? 4 : 5]}</p>
                    <div className="weight-track">
                      <i style={{ width: s[1] * 4 + "%" }} />
                    </div>
                  </article>
                ))}
              </div>
              <p className="formula">
                Score = 100 × [0.25 GVI + 0.05 SVF + 0.20 NDVI + 0.10 FVC + 0.15
                Connectivity + 0.15 Proximity + 0.10 (1 − PVI)]
              </p>
              <p>
                {t(
                  "上述公式输入均为归一化至 0–1 的指标；当前地图文件仅含等级和类型，不能据此重新计算七指标得分。",
                  "Formula inputs are normalized to 0–1. The current map file contains grades and types only; seven-indicator scores cannot be recomputed from it.",
                )}
              </p>
              <div className="method-note">
                <h2>{t("分级与数据说明", "Classification and data notes")}</h2>
                <p>
                  {t(
                    "Final4 的 K-means Run 3 展板分界约为 19.73、24.95、30.84、38.06。展板在边界小数上存在重叠或间隔，且仓库内另一个评分文件使用不同分界。本页面不将这些阈值强行套用到地图，而保留 HCMC_Dashboard_Data.json 中已有的 Grade / Type。",
                    "Final4 K-means Run 3 boundaries are approximately 19.73, 24.95, 30.84 and 38.06. Board rounding introduces boundary overlaps or gaps, and another repository score file uses different boundaries. This map preserves Grade / Type from HCMC_Dashboard_Data.json rather than imposing those thresholds.",
                  )}
                </p>
                <p>
                  {t(
                    "Final2 的宏观权重与 Final3 的微观权重属于独立模型，不与 Final4 的综合权重混用。",
                    "The macro weights in Final2 and micro weights in Final3 belong to separate models and are not mixed with the Final4 composite weights.",
                  )}
                </p>
              </div>
            </>
          )}
          {view === "boards" && (
            <>
              <p className="intro">
                {t(
                  "五张原始研究展板的网页优化版本。点击查看大图，展板中的英文为原始研究内容。",
                  "Web-optimized versions of the five original research boards. Open each image to inspect it; embedded English is original research content.",
                )}
              </p>
              <div className="boards">
                {(zh
                  ? [
                      "研究背景与选址",
                      "分析框架与宏观指标",
                      "街景微观指标",
                      "综合评价与类型诊断",
                      "街道景观改造",
                    ]
                  : [
                      "Context and study areas",
                      "Framework and macro indicators",
                      "Street-view micro indicators",
                      "Evaluation and typologies",
                      "Streetscape retrofit designs",
                    ]
                ).map((s, i) => (
                  <a
                    key={s}
                    href={`${import.meta.env.BASE_URL}research/board-${i + 1}.jpg`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      loading="lazy"
                      src={`${import.meta.env.BASE_URL}research/board-${i + 1}.jpg`}
                      alt={s}
                    />
                    <h2>
                      0{i + 1} · {s}
                    </h2>
                  </a>
                ))}
              </div>
            </>
          )}
        </main>
      )}
    </div>
  );
}
