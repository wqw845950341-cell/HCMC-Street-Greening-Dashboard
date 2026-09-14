import { useEffect, useRef, useState } from "react";
import { Lang } from "../research";
export default function BeforeAfterViewer({
  beforeImg,
  afterImg,
  title,
  lang,
  onClose,
}: {
  beforeImg: string;
  afterImg: string;
  title: string;
  lang: Lang;
  onClose: () => void;
}) {
  const [position, setPosition] = useState(50);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const zh = lang === "zh";
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="comparison-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <header>
        <h2>{title}</h2>
        <button autoFocus onClick={onClose} aria-label={zh ? "关闭" : "Close"}>
          ×
        </button>
      </header>
      {failed ? (
        <p role="alert">
          {zh
            ? "此案例图片暂时无法加载，请稍后重试。"
            : "Case imagery is unavailable. Please try again later."}
        </p>
      ) : (
        <div className="comparison-images">
          <img
            src={afterImg}
            alt={zh ? "改造方案" : "Proposed design"}
            onError={() => setFailed(true)}
          />
          <img
            src={beforeImg}
            alt={zh ? "现状街景" : "Existing street"}
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            onError={() => setFailed(true)}
          />
          <span className="before-label">{zh ? "现状" : "Before"}</span>
          <span className="after-label">{zh ? "改造方案" : "Proposed"}</span>
          <i style={{ left: position + "%" }} />
        </div>
      )}
      <label className="comparison-control">
        {zh ? "拖动滑块对比" : "Slide to compare"}
        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(e) => setPosition(+e.target.value)}
        />
      </label>
      <p>
        {zh
          ? "方案为概念性设计可视化，不代表已实施效果。图片来自原项目关联的 street 仓库，需要联网加载。"
          : "Conceptual design visualization, not an observed post-construction outcome. Images load online from the original project’s linked street repository."}
      </p>
    </dialog>
  );
}
