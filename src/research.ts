export type Lang = "zh" | "en";
export const grades = ["Class A", "Class B", "Class C", "Class D", "Class E"];
export const colors: Record<string, string> = {
  "Class A": "#16864b",
  "Class B": "#82b857",
  "Class C": "#e6cc57",
  "Class D": "#ee934b",
  "Class E": "#d53f43",
};
export const gradeNames = {
  zh: ["优秀", "良好", "中等", "较差", "危急"],
  en: ["Elite", "Good", "Moderate", "Poor", "Critical"],
};
export const types = [
  {
    code: "E-1",
    en: "Exposed Desert",
    zh: "暴露荒漠",
    diagnosis: [
      "高硬质铺装占比、开敞天空，缺少树荫。",
      "High pavement exposure and open sky, with little shade.",
    ],
    strategy: [
      "重建乔木树冠，结合攀援绿墙、雨水花园和生物滞留沟，改善遮阴与雨水管理。",
      "Rebuild tree canopy with climber walls, rain gardens and bioswales for shade and stormwater management.",
    ],
  },
  {
    code: "E-2",
    en: "Deep Canyon",
    zh: "深邃街谷",
    diagnosis: [
      "天空可见度低，建筑紧邻街道，地面种植空间受限。",
      "Low sky visibility and buildings close to the street constrain ground planting.",
    ],
    strategy: [
      "利用阳台、窄墙柱和建筑挑檐设置轻量种植槽与垂直绿化，保持通行及商业空间。",
      "Use lightweight balcony planters and vertical planting on narrow walls and overhangs while retaining circulation and commerce.",
    ],
  },
  {
    code: "E-3",
    en: "Gray Fabric",
    zh: "灰色肌理",
    diagnosis: [
      "中等铺装占比，绿视率极低，常见于老旧街区。",
      "Medium pavement exposure and very low visible greenery, often in older neighborhoods.",
    ],
    strategy: [
      "以免开挖模块花箱、攀援网架和座椅改造闲置硬质地面，形成微型线性绿地。",
      "Use no-dig modular planters, trellises and seating to turn redundant hardscape into small linear green spaces.",
    ],
  },
  {
    code: "E-4",
    en: "Cosmetic Green",
    zh: "表层绿化",
    diagnosis: [
      "有少量可见绿植，但 NDVI 极低，生态基础薄弱。",
      "Some visible plants but very low NDVI indicate a weak ecological foundation.",
    ],
    strategy: [
      "以攀援支架、植物雨链和微湿地连接立面与雨水系统，提升绿化的生态功能。",
      "Connect planted façades and stormwater systems with climber scaffolds, botanical rain chains and micro-wetlands.",
    ],
  },
  {
    code: "E-5",
    en: "Abandoned Space",
    zh: "闲置空间",
    diagnosis: [
      "建筑退距较大，但树冠连接性低，空间利用不足。",
      "Large building setbacks but low canopy connectivity and underused space.",
    ],
    strategy: [
      "利用桥下及退界空间布置耐阴雨水花园、透水步道和模块化社区设施。",
      "Activate under-bridge and setback spaces with shade-tolerant rain gardens, permeable paths and modular community facilities.",
    ],
  },
  { code: "AB-1", en: "Heritage Canopy", zh: "历史树冠" },
  { code: "AB-2", en: "Vertical Oasis", zh: "垂直绿洲" },
  { code: "AB-3", en: "Ecological Stitching", zh: "生态缝合" },
  { code: "AB-4", en: "Open Edge", zh: "开敞边缘" },
  { code: "AB-5", en: "Shaded Setback", zh: "林荫退界" },
];
export function typeLabel(value: string, lang: Lang) {
  const item = types.find((t) => value?.startsWith(t.code));
  return item ? `${item.code} · ${item[lang]}` : value;
}
export const indicators = [
  [
    "GVI",
    25,
    "绿视率",
    "Green View Index",
    "街景中可见绿色植被像素占比。",
    "Share of visible vegetation pixels in street imagery.",
  ],
  [
    "SVF",
    5,
    "天空可视因子",
    "Sky View Factor",
    "可见天空比例，反映街谷开敞程度。",
    "Visible sky fraction, describing street-canyon openness.",
  ],
  [
    "NDVI",
    20,
    "归一化植被指数",
    "Normalized Difference Vegetation Index",
    "利用近红外与红光反射描述植被状态。",
    "Vegetation condition derived from near-infrared and red reflectance.",
  ],
  [
    "FVC",
    10,
    "植被覆盖度",
    "Fractional Vegetation Cover",
    "基于 NDVI 估算植被覆盖比例。",
    "Vegetation cover fraction estimated from NDVI.",
  ],
  [
    "Connectivity",
    15,
    "树冠连通性",
    "Canopy Connectivity",
    "反映树冠斑块的生态连接程度。",
    "Ecological connections between canopy patches.",
  ],
  [
    "Proximity",
    15,
    "树木—建筑间距",
    "Tree-to-Building Distance",
    "描述树木与建筑间的空间约束；综合评价采用正向指标。",
    "Spatial constraints between trees and buildings; positive in the composite model.",
  ],
  [
    "PVI",
    10,
    "铺装可视指数",
    "Pavement View Index",
    "可见不透水铺装比例，为负向指标。",
    "Visible impervious pavement fraction; a negative indicator.",
  ],
] as const;
