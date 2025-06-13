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

  // Close overlay function
  const closeOverlay = () => {
    if (!running) return // Prevent multiple closings
    running = false
    overlay.style.opacity = 0
    setTimeout(() => overlay.remove(), 1200)
  }

  // Close on click
  overlay.addEventListener('click', closeOverlay)
  
  // Auto close after 6 seconds
  setTimeout(closeOverlay, 6000)
})
</script>

<ClientOnly />

# Rust LWE 编译挑战

> 作者: [Ben Chen @chanbengz](https://github.com/chanbengz)

[[toc]]

::: danger
🚨 警报! 警报! 这不是演习! 密码系统已被攻破！ 🚨
:::

嘿，未来的密码学大师！👋 量子计算机已经从科幻小说跑进了现实世界！这些硅基超级大脑正虎视眈眈地盯着我们的加密系统，准备把它们像积木一样轻松拆散。但是...等等！我们有一个秘密武器！

认识一下我们的新英雄：**Learning with Errors (LWE)**！它不是你常见的那种数学问题，它是我们对抗量子霸主的超级盾牌！想象一下这个场景：你有一个神秘的向量 $\mathbf{s} \in \mathbb{Z}_q^n$（对，就是那个藏得可深了的秘密），然后...

$$
\mathbf{A} \cdot \mathbf{s} + e = b \mod q
$$

看到这个公式了吗？这就是我们的终极迷宫！其中：
- $\mathbf{A}$ 是我们的格基矩阵（想象成一个超级复杂的迷宫地图）
- $e$ 是捣蛋的噪声向量（就像迷宫里随机出现的虚假路径）
- $b$ 是最终的密文（迷宫的出口，但可能是假的！）

即使是顶级量子计算机看到这个问题也得抓狂，因为这是传说中的 **NP 难问题**！（没错，就是那种让计算机科学家都头疼的存在 🤯）

## 你的秘密任务 🕵️‍♂️

亲爱的 Rust 特工，是时候展现你的 coding 绝技了！你将潜入这个数学迷宫，尝试解开这个谜题。但这不是普通的编程挑战，这是一场与时间赛跑的智慧较量！

### 任务详情 📋

- ⏱️ 你有 $T$ 秒的时间来完成每个 LWE 谜题
- 🚀 解得越快，赢得越多（但别着急，稳准狠才是王道）
- 🎯 完美解 $\mathbf{s}$ 很难

准备好接受这个挑战了吗？抓起你的 Rust 工具箱，让我们在量子时代写下属于我们的传奇！ 💫

**让密码学的冒险开始吧！** 🚀✨

## 挑战的小细节 🎭

你知道吗？LWE 难度主要取决于两个"终极 BOSS"：
- 🎯 相对误差大小 $\alpha = \sigma \backslash q$ （就像游戏里的难度系数！）
- 📏 维度 $n \in \mathbb{N}^+$ （想象成迷宫的大小，越大越容易迷路~）

为了让这个挑战更刺激，我们创造了各种各样的 LWE 谜题。而且——这是最妙的部分——就连出题人都不知道答案！（没错，这下公平了吧！😏）

我们为你准备了从"新手村"到"地狱难度"的各种挑战，就看你能闯到第几关了！ 💪

## 来玩，来，来 🎮

### 作战地图 🗺️
在这个[挑战仓库](https://github.com/chanbengz/sustcsc-rs)里藏着：
- **[启动包](https://github.com/chanbengz/sustcsc-rs/tree/main/challenge)**：内附 LWE 挑战和示例 BKW 破解器
- **[任务手册](https://github.com/chanbengz/sustcsc-rs/tree/main/handout)**：CI/CD 自动用 `mdbook` 构建的秘籍，[点此直达](https://sustcsc25.benx.dev)

### 终极目标 🎯
你的黑客任务：用 Rust 打造一个 LWE 破解器！量子怪兽正在逼近，加密系统的命运就靠你了！

作战指标：
- ⏱️ 必须在 $T$ 时间内破解 LWE 谜题（超时=GG）
- 🎯 必须 100% 精确命中 $\mathbf{s}$（误差=0）
- 🚀 时间就是分数！解得越快分越高

```rust
pub(crate) fn solve_lwe(
    n: usize,   // 维度，迷宫复杂度
    m: usize,   // 方程数，迷宫长度
    q: u64,     // 模数，迷宫边界
    alpha: f64, // 噪声系数，迷宫干扰强度
    a: &Array2<u64>, // 迷宫地图 A
    b: &Array1<u64>, // 出口标记 b
) -> Array1<u64> {
    // 在此写下你的破解密码！
    Array1::zeros(n) // 示例：菜鸟的随机猜测
}
```

你可以选择：
1. 调教现成的 BKW 破解器 🔧
2. 自创全新破解算法 🧠
（双修的大佬直接封神！👑）

---

## 江湖规矩

本赛题为南方科技大学 2025 年(第二届)超算比赛基础赛道Rust编程挑战赛题。本赛题已在
[Github开源](https://github.com/chanbengz/sustcsc-rs), 遵循MIT License 许可协议。
Repo开放PR和Issue, 欢迎大家参与讨论并修复赛题bug。

### 作战基地 💻
[![](https://img.shields.io/badge/Rust-1.87-red?style=flat&logo=rust)](https://www.rust-lang.org)  
⚠️ 重要军情:
- 需要夜间版功能？速联指挥官！ 
- 环境更新会发在作战群
- 自备 `Dockerfile` 可定制基地（否则用默认配置）

[作战手册](https://sustcsc25.benx.dev/setup/00-overview.html)已就位，卡关时呼叫支援！

### 战场纪律 ⚔️
**准改区**：  
- 只动 `src/solver.rs` 文件（核心破解区）  
- 可添加辅助函数/模块  

**禁术列表**：  
- ❌ 输出固定/随机答案  
- ❌ 偷用外部程序（FFI 除外）  
- ⚠️ 汇编代码需兼容 Xeon Platinum  

**作战环境**：  
- 战场：SUSTech HPC 超算平台  
- 装备：Intel Xeon Platinum 2680-v3/6148（纯CPU作战）  
- 限时：$T = 30$ 分钟（超时自爆💣）  

### 军功榜（87分）📊
| 关卡 | 维度 n | 方程 m | 模数 q | 噪声 α | 军功 |
|-------|--------|--------|--------|--------|------|
| 0     | 10     | 100    | 97     | 0.005  | 2    |
| 1     | 20     | 400    | 193    | 0.005  | 3    |
| 2     | 30     | 900    | 389    | 0.005  | 5    |
| 3     | 40     | 1500   | 769    | 0.005  | 7    |
| 4     | 45     | 1700   | 12289  | 0.005  | 9    |
| 5     | 50     | 2500   | 1543   | 0.005  | 11   |
| 6     | 55     | 3600   | 6151   | 0.005  | 13   |
| 7     | 30     | 1000   | 3079   | 0.010  | 17   |
| 8     | 40     | 1500   | 6151   | 0.010  | 19   |
|       |        |        |        | 总分   | 86   |

$$
\text{终极检验} = \sum_{i=0}^{n-1} \left| s_i - \hat{s}_i \right| = 0
$$

（非零？准备接受量子嘲讽吧！😈）

### 战报要求（14分）📝
用 $\LaTeX$/Markdown/Typst 撰写 PDF 战报，需包含：  
- 神操作解析：算法改造/硬件压榨技巧  
- 性能解剖图：profiling/flamegraph 等  
- 必写参考：论文/Wiki/博客等灵感来源

**战报评分**：  
- 💡 创新性（5分）：  
  - 纯搬运 → 0分  
  - 魔改神技 → 1-4分  
  - 自创功法 → 5分（封神！）  
- ✍️ 表达力（5分）：  
  - 语无伦次 → 0分  
  - 干货但难啃 → 1-4分  
  - 清晰炫酷 → 5分  
- 🎨 视觉派（4分）：  
  - 文字地狱 → 0分  
  - 借用图表 → 1-3分  
  - 自制神图 → 4分

### 战利品提交 🚚
压缩包结构：
```
/你的战队ID
├── Cargo.toml       # 装备清单
├── src/solver.rs    # 核心破解器
├── Dockerfile       # 自备作战基地（可选）
├── README.md        # 使用说明书
└── report.pdf       # 战神战报
```

**作战期间**:
- 📅 每周二/五在 HPC 平台评功  
- 📮 投稿至：`chanben04gz [AT] gmail.com`  
- 📧 标题：`[SUSTCSC 25] Submission - 你的战队ID`  

**终极大考**:
- ⏰ 截止前发送最终战报
- 📬 标题：`[SUSTCSC 25] Final Submission - 你的战队ID`
- 🔒 可选附加：文件校验码（SHA256等）

### 军师锦囊 🧠
[战术指南](https://sustcsc25.benx.dev/lwe/01-hints.html) | 
[Rust速成营](https://sustcsc25.benx.dev/rustup/00-first-look.html)

### 参考秘籍 📚
- 《CPU上的Rust数值计算宝典》  
- 达姆施塔特大学《LWE挑战》  
- 《LWE攻防全解》