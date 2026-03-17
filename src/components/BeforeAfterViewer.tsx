import React, { useState, useRef } from 'react';

// 定义组件接收的参数：原始图、改造图、标题、关闭函数
interface ViewerProps {
  beforeImg: string;
  afterImg: string;
  title: string;
  onClose: () => void;
}

export default function BeforeAfterViewer({ beforeImg, afterImg, title, onClose }: ViewerProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理鼠标或手指滑动
  const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // 兼容鼠标和触摸屏
    const clientX = 'touches' in event ? event.touches[0].clientX : (event as React.MouseEvent).clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPos(percent);
  };

  return (
    // 黑色半透明遮罩层
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' }}>
      
      {/* 弹窗主体 */}
      <div style={{ backgroundColor: '#1e293b', width: '90%', maxWidth: '1200px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        
        {/* 头部：标题与关闭按钮 */}
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
          <h3 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
            {title} <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 'normal', marginLeft: '10px' }}>Slide to compare</span>
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '28px', cursor: 'pointer', lineHeight: '1' }}>
            &times;
          </button>
        </div>

        {/* 核心：滑动对比区域 */}
        <div 
          ref={containerRef}
          onMouseMove={handleMove}
          onTouchMove={handleMove}
          style={{ position: 'relative', width: '100%', aspectRatio: '21/9', cursor: 'ew-resize', overflow: 'hidden', backgroundColor: '#000' }}
        >
          {/* 底部图像 (改造后 After) */}
          <img src={afterImg} alt="After Intervention" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          
          {/* 顶部图像 (原始图 Before) - 使用 clipPath 实现裁剪揭露效果 */}
          <img 
            src={beforeImg} 
            alt="Original Street View" 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }} 
          />

          {/* 中间的那条白线和把手 */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sliderPos}%`, width: '4px', backgroundColor: 'white', transform: 'translateX(-50%)', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
              <span style={{ color: '#333', fontWeight: 'bold', fontSize: '12px' }}>&lt;&gt;</span>
            </div>
          </div>
          
          {/* 左上角/右上角标签 */}
          <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', pointerEvents: 'none' }}>Before (Current)</div>
          <div style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'rgba(56,189,248,0.9)', color: 'black', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', pointerEvents: 'none' }}>After (Proposed)</div>
        </div>

        {/* 底部：技术透明度声明 */}
        <div style={{ padding: '15px 20px', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>🤖</span>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '13px', lineHeight: '1.5' }}>
            <strong>Technical Disclosure:</strong> The "After" visualization of this image is based on spatial data analysis and generated using AI tools such as <strong>Stable Diffusion</strong> to assist in design generation, intended for strategic visualization purposes only.
          </p>
        </div>

      </div>
    </div>
  );
}
