---
title: SUSTCSC
---

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 创建覆盖层
  const overlay = Object.assign(document.createElement('div'), {
    style: `
      position: fixed;
      inset: 0;
      z-index: 9999;
      pointer-events: auto;
      background: linear-gradient(180deg, #000000 0%, #0a0a2a 100%);
      opacity: 0;
      transition: opacity 1.2s ease;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    `
  })
  document.body.appendChild(overlay)
  requestAnimationFrame(() => { overlay.style.opacity = 1 })
  
  // 创建星空背景画布
  const bgCanvas = document.createElement('canvas')
  bgCanvas.style.position = 'absolute'
  bgCanvas.style.top = '0'
  bgCanvas.style.left = '0'
  bgCanvas.style.width = '100%'
  bgCanvas.style.height = '100%'
  bgCanvas.style.pointerEvents = 'none'
  overlay.appendChild(bgCanvas)
  
  // 设置画布
  const ctx = bgCanvas.getContext('2d')
  let w = bgCanvas.width = window.innerWidth
  let h = bgCanvas.height = window.innerHeight
  
  // 创建星星数组 - 包括移动星星和固定闪烁星星
  const stars = []
  const starCount = 50
  const fixedStarCount = 500 // 固定闪烁星星数量
  
  // 添加移动的星星
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.8 + 0.2,
      alpha: Math.random() * 0.7 + 0.3,
      direction: Math.random() > 0.5 ? 1 : -1,
      isFixed: false,
      pulseSpeed: 0
    })
  }
  
  // 添加固定的闪烁星星
  for (let i = 0; i < fixedStarCount; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 1.5 + 0.5, // 固定星星稍大一点
      speed: 0, // 固定星星不移动
      alpha: Math.random() + 0.3,
      direction: 0,
      isFixed: true,
      pulseSpeed: Math.random() * 0.02 + 0.01, // 闪烁速度
      pulseDirection: Math.random() > 0.5 ? 1 : -1
    })
  }
  
  // 创建彗星数组
  const comets = []
  const cometCount = 3
  for (let i = 0; i < cometCount; i++) {
    comets.push({
      x: Math.random() * w,
      y: Math.random() * h,
      angle: Math.random() * Math.PI * 2,
      speed: 1 + Math.random() * 2,
      length: 50 + Math.random() * 100,
      life: 100
    })
  }
  
  // 创建发光文字 - SUSTCSC
//   const logo = Object.assign(document.createElement('div'), {
//     innerText: 'SUSTCSC',
//     style: `
//       position: relative;
//       font-size: 40px;
//       font-weight: 900;
//       color: transparent;
//       -webkit-text-stroke: 1px rgba(255, 255, 255, 0.8);
//       text-shadow: 
//         0 0 10px rgba(255, 255, 255, 0.5),
//         0 0 20px rgba(255, 255, 255, 0.3),
//         0 0 30px rgba(255, 255, 255, 0.1);
//       letter-spacing: 3px;
//       z-index: 10000;
//       pointer-events: none;
//       animation: glow 3s infinite alternate;
//     `
//   })
//   overlay.appendChild(logo)

  const logo = Object.assign(document.createElement('div'), {
    innerText: 'SUSTCSC',
    style: `
      position: relative;
      font-size: 40px;
      font-weight: 900;
      font-family: 'Dancing Script', cursive;
      color: transparent;
      -webkit-text-stroke: 1px rgba(255, 255, 255, 0.8);
      text-shadow: 
        0 0 10px rgba(255, 255, 255, 0.5),
        0 0 20px rgba(255, 255, 255, 0.3),
        0 0 30px rgba(255, 255, 255, 0.1);
      letter-spacing: 8px;
      z-index: 10000;
      pointer-events: none;
      animation: glow 3s infinite alternate;
    `
  })
  overlay.appendChild(logo)
  
  // 创建点击提示
  const prompt = Object.assign(document.createElement('div'), {
    innerText: '点击任意处继续',
    style: `
      position: absolute;
      top: 75%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 16px;
      color: #fff;
      font-family: 'Arial', sans-serif;
      letter-spacing: 2px;
      opacity: 0.8;
      pointer-events: none;
      z-index: 10000;
      animation: pulse 2s infinite;
    `
  })
  overlay.appendChild(prompt)
  
  // 添加动画样式
  const style = document.createElement('style')
  style.innerHTML = `
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
    
    @keyframes glow {
      0% {
        text-shadow: 
          0 0 5px rgba(255, 255, 255, 0.5),
          0 0 15px rgba(255, 255, 255, 0.3),
          0 0 25px rgba(255, 255, 255, 0.1);
      }
      100% {
        text-shadow: 
          0 0 10px rgba(255, 255, 255, 0.8),
          0 0 30px rgba(255, 255, 255, 0.5),
          0 0 50px rgba(255, 255, 255, 0.3);
      }
    }
  `
  document.head.appendChild(style)
  
  // 动画循环
  let running = true
  let frameCount = 0

  function animate() {
    if (!running) return
    
    // 清除画布
    ctx.fillStyle = 'rgba(0, 0, 10, 0.1)'
    ctx.fillRect(0, 0, w, h)
    
    // 绘制星星
    ctx.fillStyle = 'white'
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i]
      
      // 更新闪烁星星的透明度
      if (star.isFixed) {
        star.alpha += star.pulseSpeed * star.pulseDirection
        
        // 反转闪烁方向
        if (star.alpha > 0.8 || star.alpha < 0.2) {
          star.pulseDirection *= -1
        }
      }
      
      ctx.globalAlpha = star.alpha
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fill()
      
      // 移动非固定星星
      if (!star.isFixed) {
        star.x += star.speed * star.direction * 0.5
        star.y += star.speed
        
        // 边界重置
        if (star.x > w) star.x = 0
        if (star.x < 0) star.x = w
        if (star.y > h) star.y = 0
      }
    }
    
    // 绘制彗星
    for (let i = 0; i < comets.length; i++) {
      const comet = comets[i]
      ctx.save()
      ctx.translate(comet.x, comet.y)
      ctx.rotate(comet.angle)
      
      // 创建彗星渐变
      const gradient = ctx.createLinearGradient(0, 0, comet.length, 0)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, -1, comet.length, 2)
      ctx.restore()
      
      // 移动彗星
      comet.x += Math.cos(comet.angle) * comet.speed
      comet.y += Math.sin(comet.angle) * comet.speed
      
      comet.life--
      
      // 重置彗星
      if (comet.life <= 0 || 
          comet.x < -100 || comet.x > w + 100 || 
          comet.y < -100 || comet.y > h + 100) {
        // 从边缘开始
        const side = Math.floor(Math.random() * 4)
        if (side === 0) { // top
          comet.x = Math.random() * w
          comet.y = -20
        } else if (side === 1) { // right
          comet.x = w + 20
          comet.y = Math.random() * h
        } else if (side === 2) { // bottom
          comet.x = Math.random() * w
          comet.y = h + 20
        } else { // left
          comet.x = -20
          comet.y = Math.random() * h
        }
        
        comet.angle = Math.atan2(
          h/2 - comet.y + Math.random() * 100 - 50,
          w/2 - comet.x + Math.random() * 100 - 50
        )
        comet.speed = 1 + Math.random() * 2
        comet.length = 50 + Math.random() * 100
        comet.life = 200 + Math.random() * 300
      }
    }
    
    frameCount++
    requestAnimationFrame(animate)
  }
  
  // 开始动画
  animate()
  
  // 处理窗口大小变化
  window.addEventListener('resize', () => {
    w = bgCanvas.width = window.innerWidth
    h = bgCanvas.height = window.innerHeight
    
    // 重置星星位置
    stars.forEach(star => {
      if (!star.isFixed) {
        star.x = Math.random() * w
        star.y = Math.random() * h
      }
    })
    
    // 重置彗星位置
    comets.forEach(comet => {
      comet.x = Math.random() * w
      comet.y = Math.random() * h
    })
  })
  
  // 关闭覆盖层
  const closeOverlay = () => {
    if (!running) return
    running = false
    overlay.style.opacity = 0
    setTimeout(() => overlay.remove(), 1200)
  }
  
  // 点击关闭
  overlay.addEventListener('click', closeOverlay)
  
  // 6秒后自动关闭
  setTimeout(closeOverlay, 6000)
})

// 图片轮播部分保持不变
import ASCImageCarousel from '../../components/ASCImageCarousel.vue'

const ascImages = [
  '/sustcsc-doc/welcome/ASC/ASC24大合照.jpg',
  '/sustcsc-doc/welcome/ASC/ASC24队员赖海斌在压功耗.jpg',
  '/sustcsc-doc/welcome/ASC/ASC24比赛中.jpg',
  '/sustcsc-doc/welcome/ASC/ASC24队员与图灵奖得主Dongarra合照.jpg',
  '/sustcsc-doc/welcome/ASC/ASC24队员邱俊杰与德国友人合照.jpg',
  '/sustcsc-doc/welcome/ASC/ASC24集群搭建.jpg',
  '/sustcsc-doc/welcome/ASC/ASC24颁奖.jpg',
  '/sustcsc-doc/welcome/ASC/ASC十周年蛋糕.jpg',
  '/sustcsc-doc/welcome/ASC/ASC22-23晚宴.jpg',
  '/sustcsc-doc/welcome/ASC/ASC22-23颁奖.jpg',
]

const ascCaptions = [
  'ASC24大合照',
  'ASC24队员赖海斌在压功耗',
  'ASC24比赛中',
  'ASC24队员与图灵奖得主Dongarra合照',
  'ASC24队员邱俊杰与德国友人合照',
  'ASC24集群搭建',
  'ASC24颁奖',
  'ASC十周年蛋糕',
  'ASC22-23晚宴',
  'ASC22-23颁奖'
]

const otherImages = [
    '/sustcsc-doc/welcome/others/2023_华为鲲鹏应用创新大赛.jpg',
    '/sustcsc-doc/welcome/others/2024_SC24_IndySCC_美国-亚特兰大.jpg',
    '/sustcsc-doc/welcome/others/2024_SCA2024_澳大利亚-悉尼.jpg',
    '/sustcsc-doc/welcome/others/2025_SCA2025_新加坡.JPG',
]

const otherCaptions = [
    '2023华为鲲鹏应用创新大赛',
    '2024 SC24 IndySCC24（美国-亚特兰大）',
    '2024 SCA2024（澳大利亚-悉尼）',
    '2025 SCA2025（新加坡）'
]
</script>

<ClientOnly />

# 超算比赛介绍手册

## 一、💻 什么是超算比赛？  

超算比赛是以高性能计算（HPC）为核心的大学生竞赛，参赛队伍需要在 **限定的功耗约束下**，**搭建并优化一个小型超级计算集群**，完成一系列具有挑战性的计算任务。这类比赛结合了硬件架构、系统部署、软件调优、并行计算、人工智能、可视化、科研复现等多方面技能，目标是**考验学生的综合能力**。  

### 1.1 核心内容有什么？
- **系统搭建与优化**：服务器配置、网络架构、功耗控制、容错机制  
- **软件调优与编译**：科学应用适配、高效并行、数学库优化、容器化部署  
- **科研复现能力**：论文级任务运行、实验可重复性、数据一致性  
- **软技能要求**：团队协作、技术报告撰写、答辩演讲、现场问题应对  


### 1.2 比赛都要干什么？

比赛通常分为如下几个阶段，每一环都需要细致准备与实战应对：

| 阶段 | 工作内容 | 重点技能 |
| ----- | ------ | -------- |
| 系统设计 | 服务器选型、GPU/加速卡搭配、功耗预算配置 | 架构理解、预算控制 |
| 应用准备 | 编译与适配竞赛指定程序，如HPL、HPCG、AI模型等 | 并行计算、调库能力 |
| 性能调优 | CPU亲和性设置、GPU通信优化、并行参数调整 | 性能分析、热数据路径优化 |
| 功耗控制 | BIOS调节、能效比优化、动态调频调速 | 电源管理、风扇/频率控制 |
| 现场展示 | 技术答辩、英文汇报、应用结果展示 | 技术沟通、表达力 |

### 📘 阅读推荐：  
[超算竞赛入门导引（PDF）](/welcome/超算竞赛导引.pdf)

---

## 二、 🏆 我们的参赛历程

南科大超算队自参加了各类国际学生超算赛事，积累了丰富的比赛经验和一系列奖项。以下是部分代表性成果：

### 2.1 ASC Student Supercomputer Challenge

ASC（亚洲学生超级计算机竞赛）是世界规模最大的学生超算赛事之一。其特点是规模大、题目新、挑战性强，常见应用涵盖气象模拟、生物信息学、人工智能等前沿领域。

#### 2.1.1 我们的战绩
| 年份 | 成绩 | 特别奖项 |
| ---- | ---- | -------- |
| ASC-19 | 一等奖（第7名） | 最具人气团队、应用创新奖（ShengBTE） |
| ASC-21 | 一等奖（第5名） | -- |
| ASC-22 23 | 一等奖 | Super Team 奖 |
| ASC-24 | 一等奖 | Super Team 奖 |

#### 2.1.2 ASC 比赛深度剖析

**ASC 的几大亮点：**
1. **任务复杂**：从量子化学到生物信息，题目具有高科研门槛。
2. **算力自由**：使用自带服务器，允许高度个性化的硬件设计。
3. **国际氛围**：来自全球 300+ 所高校的报名，入围难度大。
4. **Super Team 合作**：鼓励跨队跨国协作完成"极限"题目。

**往届典型题目示例**：
- 量子力学模拟：Quantum ESPRESSO / VASP
- AI大模型：Transformer推理优化 / Tensor Parallel / deepseek
- 气象模拟：WRF（天气研究与预报）
- 高性能基准：HPL、HPCG


#### 2.1.3 ASC 精彩瞬间


<ASCImageCarousel 
  :images="ascImages" 
  :captions="ascCaptions"
  :autoplay="true" 
  :interval="3500" 
/>




### 2.2 其他赛事经历

| 年度/届次 | 赛事名称 | 奖项/荣誉 | 备注 |
|-----------|----------|-----------|------|
| 2020-2024 | APAC HPC-AI | 冠军 1次、亚军 2次、季军 2次、AI特别奖 1次 | 高性能计算与AI国际赛事 |
| 2021 | SC21 国际超算竞赛 | 季军、最高性能奖 | 世界最老牌超算竞赛 |
| 2022 | IndySCC 国际超算竞赛 | 亚军、HPL挑战赛亚军 | 美国独立赛，主打远程实操 |
| 2022 | ISC22 国际超算竞赛 | 季军 | 德国国际超级计算大会 |
| 2023 | 先导杯计算应用大奖赛 | 华南赛区一等奖 | 计算应用创新赛事 |
| 2023 | 鲲鹏应用创新大赛 | 广东省金奖 | 华为主办高性能竞赛 |
| 2024 | 全国大学生计算机系统能力大赛（先导杯） | 全国三等奖 | 智能计算创新设计赛 |
| 2024 | 昇思MindSpore模型开发挑战赛 | 第一阶段金奖、第二阶段铜奖 | AI模型开发赛事 |
| 2024 | 鲲鹏应用创新大赛 | 广东省铜奖、最具潜力奖 | 华为主办高性能竞赛 |
| 2025 | 第九届华为ICT大赛挑战赛 | 全国三等奖 | 华为ICT创新赛事 |

<ASCImageCarousel 
  :images="otherImages" 
  :captions="otherCaptions"
  :autoplay="true" 
  :interval="3500" 
/>
 

---

## 三、📢 加入我们！

欢迎对以下方向有兴趣的同学加入：

- 对操作系统、Linux、容器、并行程序感兴趣  
- 熟悉 GPU、FPGA、AI 框架的软硬件结合者  
- 喜欢调试、性能分析和解决技术难题  
- 愿意团队协作并能适应高压赛场环境  


 
📱 技术交流QQ群：**897073438**




> **We build. We compute. We optimize. We win.**

**作者：[wojiao-yc](https://wojiao-yc.github.io/)**