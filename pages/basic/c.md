---
title: 量子计算模拟编程挑战
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
</script>

<ClientOnly />

# 量子计算模拟编程挑战

