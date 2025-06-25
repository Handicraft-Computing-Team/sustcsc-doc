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

> 作者：[dtcxzyw](https://github.com/dtcxzyw)

## 快速入门 C/CPP

> By [赖海斌](https://space.bilibili.com/358070321) 12211612@mail.sustech.edu.cn 

::: info ✅ 温馨提醒
本视频为南方科技大学CS205 C/CPP课程复习课，大家可以作为C/CPP语言的入门视频
:::

<div style="position: relative; width: 100%; max-width: 800px; margin: 40px auto; box-shadow: 0 4px 24px #0002; border-radius: 16px; overflow: hidden; background: #181c2f;">
  <iframe 
    src="https://player.bilibili.com/player.html?bvid=BV1PFf6YGEyW&page=1&as_wide=1&high_quality=1&danmaku=0"
    allowfullscreen="allowfullscreen" 
    width="100%" 
    height="450" 
    scrolling="no" 
    frameborder="0" 
    style="display: block; border: none;"
    sandbox="allow-top-navigation allow-same-origin allow-forms allow-scripts">
  </iframe>
</div>

## 背景介绍
~~本人的量子计算知识已经还给老师了，如有错误请指出，不影响做题~~

在经典计算中我们使用比特来表示信息，在量子计算中也有对应的概念，称为量子比特（qubit）。我们使用布洛赫球（Bloch sphere）来可视化单个qubit的状态和相关的计算。单个qubit可以表示为一个单位球面上的点，如下图所示:

<img src="/quantum/bloch.png" alt="bloch" style="display: block; margin: auto; width: 50%;" />

其中$\ket{0}$和$\ket{1}$是常见的一组基，也就是说我们可以将单个qubit表示为它们的线性组合
$\ket{\psi} = \alpha \ket{0} + \beta \ket{1}$，其中$\alpha$和$\beta$是复数，满足归一化条件$|\alpha|^2 + |\beta|^2 = 1$。

在介绍完qubit后，我们开始定义量子门（quantum gate）。量子门是对qubit进行操作的基本单元。在理想条件下，我们将作用在单比特上的量子门表示为一个2x2的酉矩阵。常见的量子门包括Hadamard门、Pauli-X门、Pauli-Y门、Pauli-Z门等。XYZ门可以视为在Bloch球上绕X、Y、Z轴逆时针旋转。下面给出各操作对应的矩阵表示：

| 门类型 | 矩阵表示 |
| --- | --- |
| Hadamard门 | $H = \frac{1}{\sqrt{2}} \begin{bmatrix} 1 & 1 \\ 1 & -1 \end{bmatrix}$ |
| Pauli-X门 | $X = \begin{bmatrix} 0 & 1 \\ 1 & 0 \end{bmatrix}$ |
| Pauli-Y门 | $Y = \begin{bmatrix} 0 & -i \\ i & 0 \end{bmatrix}$ |
| Pauli-Z门 | $Z = \begin{bmatrix} 1 & 0 \\ 0 & -1 \end{bmatrix}$ |
| Phase门 | $S = \begin{bmatrix} 1 & 0 \\ 0 & i \end{bmatrix}$ |

例如，在对$\ket{0}$应用Hadamard门后，我们得到
$H\ket{0} = \frac{1}{\sqrt{2}}(\ket{0} + \ket{1})$。

然后我们可以将多个量子门组合起来进行更复杂的操作。最后，我们需要对其量子态进行测量以获取最终结果（qubit->经典bit）。在量子计算机上我们会多次运行量子线路以采样获得测量结果的分布。这一操作可以视为对量子态的投影，我们可以以在$\ket{0}$和$\ket{1}$为基，将其转换为$\ket{\psi} = \alpha \ket{0} + \beta \ket{1}$后，观测结果为0的概率为$|\alpha|^2$。注意这里的$\alpha$和$\beta$都是复数，也就是说相位信息被擦除了，感兴趣的同学可以自行了解量子傅立叶变换及其经典应用量子相位估计。

## 题目描述
本题给出一个单qubit上的量子线路，给定初态$\ket{0}$，模拟整个量子线路，计算最终测量前的量子态并以$\ket{0}$和$\ket{1}$的线性组合表示（~~这里不求测量0的概率以防有人混水摸鱼~~）。

你需要实现一个C++函数，对应签名如下：
```cpp
/// \param N 量子门的数量，保证整除于8xCPU逻辑核心数
/// \param Gates 量子门的字符串表示，长度为N，8字节对齐。每个字符表示一个量子门，只可能为'H', 'X', 'Y', 'Z', 'S'中的一个，分别表示Hadamard门、Pauli-X门、Pauli-Y门、Pauli-Z门和Phase门。
/// \param Alpha 输出参数，表示最终量子态的系数$\alpha$
/// \param Beta 输出参数，表示最终量子态的系数$\beta$
void simulate(size_t N, const char *Gates, std::complex<double> &Alpha, std::complex<double> &Beta) {
  ...
}
```

将该文件命名为`simulate.cpp`，评测时会将其与`driver.o`中的入口函数`main`进行编译链接：
```bash
icpx -std=c++17 -xHost -qopenmp -O3 simulate.cpp driver.o -o simulate
```
`main`函数会负责读取输入并调用`simulate`函数，然后输出结果与运行时间。你只需要实现`simulate`函数。请不要尝试hack `driver.o`，最终评测使用的`driver.o`与提供的预构建二进制文件不同。

该题还提供了生成测试用例的程序`gen.cpp`，你可以使用以下命令生成测试用例：
```bash
g++ -O3 gen.cpp -o gen
./gen N input.bin
```
然后运行`simulate`程序来测试你的实现：
```bash
./simulate input.bin
```

参考代码请从[这里](https://github.com/user-attachments/files/20900592/problem.zip)下载。

## 样例输入

以N=3，Gates="XHY"为例：

应用Pauli-X门：$\ket{\psi_1} = X\ket{0} = \begin{bmatrix} 0 & 1 \\ 1 & 0 \end{bmatrix} \begin{bmatrix} 1 \\ 0 \end{bmatrix} = \begin{bmatrix} 0 \\ 1 \end{bmatrix}$

应用Hadamard门：$\ket{\psi_2} = H\ket{\psi_1} = \frac{1}{\sqrt{2}} \begin{bmatrix} 1 & 1 \\ 1 & -1 \end{bmatrix} \begin{bmatrix} 0 \\ 1 \end{bmatrix} = \begin{bmatrix} \frac{1}{\sqrt{2}} \\ -\frac{1}{\sqrt{2}} \end{bmatrix}$

应用Pauli-Y门：$\ket{\psi_3} = Y\ket{\psi_2} = \begin{bmatrix} 0 & -i \\ i & 0 \end{bmatrix} \begin{bmatrix} \frac{1}{\sqrt{2}} \\ -\frac{1}{\sqrt{2}} \end{bmatrix} = \begin{bmatrix} \frac{i}{\sqrt{2}} \\ \frac{i}{\sqrt{2}} \end{bmatrix}$

故最终结果为$\ket{\psi_3} = \begin{bmatrix} \frac{i}{\sqrt{2}} \\ \frac{i}{\sqrt{2}} \end{bmatrix}$。可以观察到执行参考例程后输出
```
Final state: alpha = 0.000000000000 + 0.707106781187i, beta = 0.000000000000 + 0.707106781187i
```

## 评分标准
由于最终答案只有几种可能，为了防止大家猜答案，程序会在多组输入下进行正确性验证，若任一输入对应的结果不正确，该题不得分。
如果你的程序通过了正确性检验，评测器将执行10个 $N=2*10^9$ 的测试用例并根据几何平均执行时间赋分。
该题设置4个检查点，对应不同的考查内容，得分标准如下：

| 分数 | 目标执行时间 | 目标加速比 |
| --- | ---   | --- |
| 0   | 17s   | 1.0 |
| 60  | 1.7s  | 10  |
| 80  | 1.2s  | 14  |
| 90  | 0.9s  | 18  |
| 100 | 0.17s | 100 |

如果程序执行时间`T`落在`[L, R)`区间内，对应的分数区间为`[Lo, Hi)`, 则得分的计算公式为`Lo + (Hi - Lo) * (1/T - 1/R) / (1/L - 1/R)`。（时限数据仅供参考，在新集群测试后将会更新。）

## 备注
1. 参考书籍：Quantum Computation and Quantum Information, Michael A. Nielsen, Isaac L. Chuang
2. 这些量子门的组合有一些特殊的性质，比如HH=I，HXH=Z等。本题允许利用更多量子计算的知识进行加速，但这些不是本题的考察点，即保证不利用这些性质也能拿到满分。
3. 希望大家思考一下如何利用CPU的并行计算能力，想到这一步就有基础分数了。
4. 结果保留到小数点后12位，忽略+0和-0的差异。中间过程避免使用浮点数进行计算，否则可能会因为精度问题导致错误的结果（这里并不是指不能用浮点数）。该题的例程已提供了一个基于符号的计算框架。
