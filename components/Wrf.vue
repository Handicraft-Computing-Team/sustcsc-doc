<template>
  <div ref="overlayRef" style="position:fixed;inset:0;z-index:9999;pointer-events:auto;background:transparent;opacity:0;transition:opacity 1.2s ease;">
    <div
      style="position:absolute;
      top:40%;
      left:50%;
      transform:translate(-50%,-50%);
      font-family:'Courier New',monospace;
      font-size:24px;
      color:#fff;
      text-shadow: 0 0 8px rgba(255,215,0,0.8),
                   0 0 16px rgba(255,215,0,0.6);
      pointer-events:none;
      z-index:10000;
      white-space: nowrap;"
    >
      2025 SUSTCSC WRF Meteorological Simulation Challenge
    </div>
    <div
      style="position:absolute;
      top:60%;
      left:50%;
      transform:translate(-50%,-50%);
      font-size:24px;
      color: #ADD8E6; /* 淡蓝色 */
      text-shadow: 0 0 6px rgba(173,216,230,0.7);
      pointer-events:none;
      z-index:10000;"
    >
      点击任意处继续
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';

// --- Three.js 核心变量声明 ---
let scene;
let camera;
let renderer;
let animationFrameId; // 动画帧ID
let resizeListener; // 窗口大小调整监听器
let clickListener; // 点击事件监听器
let autoFadeOutTimer; // 自动淡出定时器ID
let dataUpdateIntervalId; // 数据更新定时器ID

// --- DOM 元素引用 ---
const overlayRef = ref(null); // 引用 Three.js 渲染的容器 div

// --- 气象模拟数据相关变量 ---
const currentTimestep = ref(0); // 当前模拟时间步
const totalTimesteps = 100; // 假设总共有100个时间步
const simulationInterval = 400; // 模拟数据更新间隔（毫秒），略快一些
const autoFadeOutDelay = 15000; // 动画自动淡出的延迟（毫秒，15秒）

let groundMesh; // 地表网格（用于温度可视化）
let windParticleSystem; // 风场粒子系统
let windParticleProperties = []; // 存储每个粒子的模拟速度

// --- 模拟 WRF 数据加载函数 ---
// *** 重点：在实际应用中，你需要将此函数替换为从你的后端服务加载真实 WRF 数据的逻辑 ***
// 此函数应根据给定的时间步 (timestep) 返回相应的数据
const loadWRFData = (timestep) => {
  const gridSize = 80; // 地表网格大小
  const temperatureData = [];
  const initialWindParticles = []; // 初始粒子位置和速度

  // 模拟温度数据
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const xNorm = (i / (gridSize - 1)) * 2 - 1;
      const yNorm = (j / (gridSize - 1)) * 2 - 1;
      // 模拟一个动态的温度场，随时间步变化
      const temp = 20 + 10 * Math.sin(xNorm * 5 + timestep * 0.1) * Math.cos(yNorm * 5 + timestep * 0.08);
      temperatureData.push(temp);
    }
  }

  // 模拟风场粒子数据和它们的初始速度
  const numWindParticles = 1500; // 增加粒子数量
  for (let i = 0; i < numWindParticles; i++) {
    initialWindParticles.push({
      x: (Math.random() * 2 - 1) * 50,  // x 范围 -50 到 50
      y: (Math.random() * 2 - 1) * 50,  // y 范围 -50 到 50
      z: Math.random() * 15 + 2,     // z 范围 2 到 17 (表示高度，略高一些)
      vx: (Math.random() - 0.5) * 0.8, // 模拟x方向风速，更快一些
      vy: (Math.random() - 0.5) * 0.8, // 模拟y方向风速，更快一些
      vz: (Math.random() - 0.5) * 0.2  // 模拟z方向（垂直）风速
    });
  }
  return { temperatureData, initialWindParticles, gridSize };
};

// --- Three.js 初始化函数 ---
const initThree = () => {
  if (!overlayRef.value) {
    console.error("Three.js container not found!");
    return;
  }

  // 场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050515); // 更深的背景色

  // 摄像机 (固定视角，展示性)
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, -90, 70); // 调整相机位置，更像俯瞰
  camera.lookAt(0, 0, 0); // 始终看向原点
  camera.up.set(0, 0, 1); // 设置Z轴为“上”方向

  // 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // 启用 alpha 透明度
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  overlayRef.value.appendChild(renderer.domElement); // 将 Three.js canvas 添加到 overlay div 中

  // 光照
  const ambientLight = new THREE.AmbientLight(0x404040, 2.0); // 增加环境光强度
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); // 增加平行光强度
  directionalLight.position.set(50, 50, 100);
  scene.add(directionalLight);

  // 初始数据加载和可视化
  const initialData = loadWRFData(currentTimestep.value);
  windParticleProperties = initialData.initialWindParticles; // 保存初始粒子速度以便后续动画使用
  updateVisualization(initialData);

  // 窗口大小调整事件监听
  resizeListener = window.addEventListener('resize', onWindowResize);

  // 自动淡出定时器
  autoFadeOutTimer = setTimeout(triggerFadeOut, autoFadeOutDelay);
  // 点击事件监听器
  clickListener = window.addEventListener('click', triggerFadeOut, { once: true }); // 只触发一次
};

// --- 更新可视化效果函数 ---
const updateVisualization = (data) => {
  const { temperatureData, initialWindParticles, gridSize } = data;

  // --- 更新地表温度平面 ---
  if (groundMesh) {
    scene.remove(groundMesh);
    groundMesh.geometry.dispose();
    groundMesh.material.dispose();
  }

  const groundGeometry = new THREE.PlaneGeometry(100, 100, gridSize - 1, gridSize - 1);
  const colors = [];
  const minTemp = 10;
  const maxTemp = 30;

  for (let i = 0; i < temperatureData.length; i++) {
    const temp = temperatureData[i];
    const normalizedTemp = (temp - minTemp) / (maxTemp - minTemp);
    const color = new THREE.Color();
    color.setHSL(0.6 - normalizedTemp * 0.6, 1.0, 0.5); // HSL 色相从蓝色(0.6)到红色(0.0)

    // 根据温度微调顶点高度，模拟地形或温度起伏
    groundGeometry.attributes.position.array[i * 3 + 2] = (temp - (minTemp + maxTemp) / 2) * 0.5; // 稍微增加起伏
    colors.push(color.r, color.g, color.b);
  }
  groundGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

  const groundMaterial = new THREE.MeshPhongMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    shininess: 5 // 增加一些光泽
  });
  groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.rotation.x = -Math.PI / 2; // 将平面旋转到XY平面
  scene.add(groundMesh);

  // --- 更新风场粒子系统 ---
  if (windParticleSystem) {
    scene.remove(windParticleSystem);
    windParticleSystem.geometry.dispose();
    windParticleSystem.material.dispose();
  }

  const particleGeometry = new THREE.BufferGeometry();
  // 仅在初始加载时设置位置，动画中根据速度更新
  const positionsArray = new Float32Array(windParticleProperties.length * 3);
  windParticleProperties.forEach((p, i) => {
    positionsArray[i * 3] = p.x;
    positionsArray[i * 3 + 1] = p.y;
    positionsArray[i * 3 + 2] = p.z;
  });
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xADD8E6, // 淡蓝色粒子
    size: 1.2, // 粒子大小略大
    transparent: true,
    opacity: 0.8, // 粒子更明显
    blending: THREE.AdditiveBlending // 叠加混合模式
  });
  windParticleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(windParticleSystem);
};

// --- 动画循环 ---
const animate = () => {
  animationFrameId = requestAnimationFrame(animate);

  // 风场粒子位置更新 (模拟风速和方向)
  if (windParticleSystem && windParticleSystem.geometry && windParticleSystem.geometry.attributes.position) {
    const positions = windParticleSystem.geometry.attributes.position.array;

    for (let i = 0; i < windParticleProperties.length; i++) {
      const p = windParticleProperties[i]; // 使用每个粒子自己的模拟速度

      // 更新粒子位置
      positions[i * 3] += p.vx * 0.3; // 移动速度更快
      positions[i * 3 + 1] += p.vy * 0.3;
      positions[i * 3 + 2] += p.vz * 0.1;

      // 粒子循环（离开边界则从另一侧进入或重新随机生成）
      // 水平范围 -50 到 50
      if (positions[i * 3] > 50) positions[i * 3] = -50;
      if (positions[i * 3] < -50) positions[i * 3] = 50;
      if (positions[i * 3 + 1] > 50) positions[i * 3 + 1] = -50;
      if (positions[i * 3 + 1] < -50) positions[i * 3 + 1] = 50;

      // 垂直范围 2 到 17
      if (positions[i * 3 + 2] > 17) positions[i * 3 + 2] = 2;
      if (positions[i * 3 + 2] < 2) positions[i * 3 + 2] = 17;
    }
    windParticleSystem.geometry.attributes.position.needsUpdate = true; // 通知Three.js位置已更新
  }

  renderer.render(scene, camera);
};

// --- 窗口大小调整处理函数 ---
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

// --- 触发淡出效果并清理 ---
const triggerFadeOut = () => {
  // 防止重复触发
  if (!overlayRef.value || overlayRef.value.style.opacity === '0') return;

  overlayRef.value.style.opacity = 0;
  // 清除所有定时器和监听器，防止在淡出过程中再次触发或运行
  clearTimeout(autoFadeOutTimer);
  if (clickListener) window.removeEventListener('click', triggerFadeOut);
  if (dataUpdateIntervalId) clearInterval(dataUpdateIntervalId);

  // 等待过渡完成再进行最终清理
  setTimeout(finalCleanup, 1200); // 1.2秒是 CSS 过渡时间
};

// --- 最终清理函数 ---
const finalCleanup = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  if (resizeListener) {
    window.removeEventListener('resize', resizeListener);
  }

  if (renderer) {
    renderer.dispose();
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }

  // 递归清理场景中的所有几何体和材质
  if (scene) {
    scene.traverse((object) => {
      if (object.isMesh || object.isPoints || object.isLine) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });
  }

  // 移除 overlay 元素本身
  if (overlayRef.value && overlayRef.value.parentNode) {
    overlayRef.value.parentNode.removeChild(overlayRef.value);
  }
};

// --- Vue 生命周期钩子 ---
onMounted(() => {
  initThree(); // 初始化 Three.js 场景和对象
  animate(); // 启动动画循环

  // 启动时间步进动画
  dataUpdateIntervalId = setInterval(() => {
    currentTimestep.value = (currentTimestep.value + 1) % totalTimesteps;
  }, simulationInterval);

  // 在组件挂载后立即将 overlay 设置为可见
  requestAnimationFrame(() => {
    if (overlayRef.value) {
      overlayRef.value.style.opacity = 1;
    }
  });
});

onBeforeUnmount(() => {
  // 在组件卸载前强制执行清理，以防未触发自动或点击淡出
  finalCleanup();
  // 确保清除所有可能未清除的定时器
  clearTimeout(autoFadeOutTimer);
  if (clickListener) window.removeEventListener('click', triggerFadeOut);
  if (dataUpdateIntervalId) clearInterval(dataUpdateIntervalId);
});

// --- 监听时间步变化，更新可视化 ---
watch(currentTimestep, (newVal) => {
  // 每次时间步变化时，重新加载数据并更新地表可视化
  // 注意：风场粒子位置在 animate 中持续更新，这里不重新初始化
  const data = loadWRFData(newVal);
  // 只更新地表网格，不重新创建粒子系统，以保持粒子动画流畅性
  updateGroundMesh(data.temperatureData, data.gridSize);
});

// 辅助函数：只更新地表网格，避免重复代码
const updateGroundMesh = (temperatureData, gridSize) => {
  if (groundMesh) {
    const colors = [];
    const minTemp = 10;
    const maxTemp = 30;

    for (let i = 0; i < temperatureData.length; i++) {
      const temp = temperatureData[i];
      const normalizedTemp = (temp - minTemp) / (maxTemp - minTemp);
      const color = new THREE.Color();
      color.setHSL(0.6 - normalizedTemp * 0.6, 1.0, 0.5);

      groundMesh.geometry.attributes.position.array[i * 3 + 2] = (temp - (minTemp + maxTemp) / 2) * 0.5;
      colors.push(color.r, color.g, color.b);
    }
    groundMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    groundMesh.geometry.attributes.position.needsUpdate = true; // 告诉 Three.js 几何体位置需要更新
    groundMesh.geometry.attributes.color.needsUpdate = true; // 告诉 Three.js 颜色需要更新
  }
};
</script>

<style scoped>
/* 容器的基本样式 */
div {
  display: block;
  margin: 0;
}
</style>