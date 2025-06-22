<template>
  <div ref="overlayRef" style="position:fixed;inset:0;z-index:9999;pointer-events:auto;background:#000;opacity:0;transition:opacity 1.2s ease;">
    <div
      style="position:absolute;
      top:40%;
      left:50%;
      transform:translate(-50%,-50%);
      font-family:'Courier New',monospace;
      font-size:24px;
      color:#fff;
      text-shadow: 0 0 8px rgba(255,140,0,0.8),
                   0 0 16px rgba(255,140,0,0.6);
      pointer-events:none;
      z-index:10000;
      white-space: nowrap;"
    >
      2025 SUSTCSC <span style="color:#ff4444;">Rust</span>
    </div>
    <div
      style="position:absolute;
      top:60%;
      left:50%;
      transform:translate(-50%,-50%);
      font-size:24px;
      color: #FF8C00;
      text-shadow: 0 0 6px rgba(255,140,0,0.7);
      pointer-events:none;
      z-index:10000;"
    >
      点击任意处继续
    </div>
    <iframe
      ref="iframeRef"
      src="https://aaronerhardt.gitlab.io/crab-tag/#fast"
      style="position:absolute;
      top:0;
      left:0;
      width:100vw;
      height:100vh;
      border:none;
      pointer-events:none;
      z-index:9998;
      transform:scale(1.2);
      transform-origin:center center;
      overflow:hidden;"
      frameborder="0"
      allowfullscreen
      scrolling="no"
    ></iframe>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// --- DOM 元素引用 ---
const overlayRef = ref(null);
const iframeRef = ref(null);

// --- 事件处理器引用 ---
let clickListener;
let autoFadeOutTimer;
let cleanup;

// --- 生命周期钩子 ---
onMounted(() => {
  if (!overlayRef.value) return;

  // 计算缩放比例以适应屏幕
  const scaleToFit = () => {
    if (!iframeRef.value) return;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 使用更激进的缩放策略
    // 基于视口尺寸计算最小需要的缩放比例
    const baseScale = Math.max(
      viewportWidth / 800,   // 宽度比例
      viewportHeight / 600,  // 高度比例
      2.0                    // 最小2倍缩放
    );
    
    // 额外增加缩放确保完全覆盖，特别是在不同屏幕比例下
    const finalScale = baseScale * 1.8;
    
    iframeRef.value.style.transform = `scale(${finalScale})`;
  };

  // 显示覆盖层
  setTimeout(() => {
    if (overlayRef.value) {
      overlayRef.value.style.opacity = '1';
    }
    scaleToFit();
  }, 100);

  // 窗口大小改变时重新计算缩放
  const handleResize = () => {
    scaleToFit();
  };
  window.addEventListener('resize', handleResize);

  // 添加点击事件监听器
  clickListener = () => {
    fadeOut();
  };
  
  document.addEventListener('click', clickListener);

  // 30秒后自动淡出
  autoFadeOutTimer = setTimeout(() => {
    fadeOut();
  }, 30000);

  // 清理resize监听器
  cleanup = () => {
    window.removeEventListener('resize', handleResize);
    // 清理事件监听器
    if (clickListener) {
      document.removeEventListener('click', clickListener);
      clickListener = null;
    }
    
    // 清理定时器
    if (autoFadeOutTimer) {
      clearTimeout(autoFadeOutTimer);
      autoFadeOutTimer = null;
    }
  };
});

onBeforeUnmount(() => {
  if (cleanup) cleanup();
});

// --- 功能函数 ---
function fadeOut() {
  if (!overlayRef.value) return;
  
  overlayRef.value.style.opacity = '0';
  
  setTimeout(() => {
    if (overlayRef.value) {
      overlayRef.value.style.display = 'none';
    }
  }, 1200);
  
  if (cleanup) cleanup();
}
</script>

<style scoped>
/* 所有样式都内联在模板中以确保正确应用 */
</style>
