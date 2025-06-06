---
title: Rust 编译优化挑战
---

<script setup>
import { onMounted, ref } from 'vue'

onMounted(() => {
  /* ---------- 1. 创建覆盖层和提示文字 ---------- */
  const overlay = Object.assign(document.createElement('div'), {
    style: `
      position: fixed;
      inset: 0;
      z-index: 9999;
      pointer-events: auto;
      background: rgba(0, 0, 0, 0.9);
      opacity: 0;
      transition: opacity 1.2s ease;
    `
  })
  document.body.appendChild(overlay)
  requestAnimationFrame(() => { overlay.style.opacity = 1 })

  // Matrix LOGO text
  const logo = Object.assign(document.createElement('div'), {
    innerHTML: '2025 SUSTCSC <span style="color:#0f0;">RUST</span>',
    style: `
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-family: 'Courier New', monospace;
      font-size: 32px;
      color: #fff;
      text-shadow:
        0 0 8px rgba(0,255,0,0.8),
        0 0 16px rgba(0,255,0,0.6),
        0 0 24px rgba(255,255,255,0.4);
      pointer-events: none;
      z-index: 10000;
    `
  })
  overlay.appendChild(logo)

  // Click prompt
  const prompt = Object.assign(document.createElement('div'), {
    innerText: '点击任意处继续',
    style: `
      position: absolute;
      top: 60%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px;
      color: #0f0;
      text-shadow: 0 0 6px rgba(0,255,0,0.7);
      pointer-events: none;
      z-index: 10000;
    `
  })
  overlay.appendChild(prompt)

  // Matrix rain canvas
  const canvas = document.createElement('canvas')
  canvas.style.position = 'absolute'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.pointerEvents = 'none'
  overlay.appendChild(canvas)

  // Setup canvas
  const ctx = canvas.getContext('2d')
  let w = canvas.width = window.innerWidth
  let h = canvas.height = window.innerHeight

  // Characters to use (mix of Katakana, numbers, and Rust-related symbols)
  const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ012345789:・.RUST{}[]&<>=!+-*/';
  const charSize = 16
  const columns = Math.floor(w / charSize)
  const drops = new Array(columns).fill(1)
  let running = true

  // Green matrix color
  ctx.fillStyle = '#0f0'
  ctx.font = charSize + 'px monospace'

  function animate() {
    if (!running) return
    
    // Semi-transparent black to create fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.fillRect(0, 0, w, h)
    
    ctx.fillStyle = '#0F0'
    for (let i = 0; i < drops.length; i++) {
      // Random character
      const char = chars[Math.floor(Math.random() * chars.length)]
      
      // Draw the character
      ctx.fillText(char, i * charSize, drops[i] * charSize)
      
      // Move the drop down
      if (drops[i] * charSize > h && Math.random() > 0.975) {
        drops[i] = 0
      }
      drops[i]++
    }
    requestAnimationFrame(animate)
  }

  // Start animation
  animate()

  // Handle window resize
  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth
    h = canvas.height = window.innerHeight
    drops.length = Math.floor(w / charSize)
    drops.fill(1)
  })

  // Close overlay on click
  const closeOverlay = () => {
    running = false
    overlay.style.opacity = 0
    setTimeout(() => overlay.remove(), 1200)
  }

  overlay.addEventListener('click', closeOverlay)
})
</script>

<ClientOnly />

# Rust LWE 编译挑战

> 作者: [Ben Chen @chanbengz](https://github.com/chanbengz)

[[toc]]

::: danger
🚨 警报! 警报! 这不是演习! 密码系统已被攻破！ 🚨
:::

嘿，未来的密码学大师！👋 量子计算机已经从科幻小说跑进了现实世界！这些硅基超级大脑正虎视眈眈地盯着我们的加密系统，
准备把它们像积木一样轻松拆散。但是...等等！我们有一个秘密武器！

认识一下我们的新英雄：**Learning with Errors (LWE)**！它不是你常见的那种数学问题，它是我们对抗量子霸主的超级盾牌！
想象一下这个场景：你有一个神秘的向量 $\mathbf{s} \in \mathbb{Z}_q^n$（对，就是那个藏得可深了的秘密），然后...

$$
\mathbf{A} \cdot \mathbf{s} + e = b \mod q
$$

看到这个公式了吗？这就是我们的终极迷宫！其中：
- $\mathbf{A}$ 是我们的格基矩阵（想象成一个超级复杂的迷宫地图）
- $e$ 是捣蛋的噪声向量（就像迷宫里随机出现的虚假路径）
- $b$ 是最终的密文（迷宫的出口，但可能是假的！）

即使是顶级量子计算机看到这个问题也得抓狂，因为这是传说中的 **NP 难问题**！（没错，就是那种让计算机科学家都头疼的存在 🤯）

## 你的秘密任务 🕵️‍♂️

亲爱的 Rust 特工，是时候展现你的 coding 绝技了！你将潜入这个数学迷宫，尝试解开这个谜题。但这不是普通的编程挑战，
这是一场与时间赛跑的智慧较量！

### 任务详情 📋

- ⏱️ 你有 $T$ 秒的时间来完成每个 LWE 谜题
- 🚀 解得越快，赢得越多（但别着急，稳准狠才是王道）
- 🎯 完美解？不存在的！但是你的答案离真实向量 $\mathbf{s}$ 越近，评分就越高

准备好接受这个挑战了吗？抓起你的 Rust 工具箱，让我们在量子时代写下属于我们的传奇！ 💫

**让密码学的冒险开始吧！** 🚀✨

## 挑战的幕后小故事 🎭

你知道吗？LWE 难度主要取决于两个"终极 BOSS"：
- 🎯 相对误差大小 $\alpha = \sigma \backslash q$ （就像游戏里的难度系数！）
- 📏 维度 $n \in \mathbb{N}^+$ （想象成迷宫的大小，越大越容易迷路~）

为了让这个挑战更刺激，我们邀请了三位来自不同次元的强者联手布局：
- 🇳🇱 艾因霍温理工大学的数学法师
- 🇺🇸 加州大学圣地亚哥分校的算法大师
- 🇩🇪 达姆施塔特工业大学的密码武士

他们用一个超级炫酷的多方计算协议，共同创造了各种各样的 LWE 谜题。而且——这是最妙的部分——就连这三位高手自己都不知道答案！
（没错，连出题人都不知道答案，这下公平了吧！😏）

我们为你准备了从"新手村"到"地狱难度"的各种挑战，就看你能闯到第几关了！ 💪



## 江湖规矩

本赛题为南方科技大学 2025 年(第二届)超算比赛基础赛道Rust编程挑战赛题。本赛题已在
[Github开源](https://github.com/chanbengz/sustcsc-rs), 遵循MIT License 许可协议。
Repo开放PR和Issue, 欢迎大家参与讨论并修复赛题bug。