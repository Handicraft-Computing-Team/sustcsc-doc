


<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const overlay = Object.assign(document.createElement('div'), {
    style: `
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.92);
      opacity: 0;
      transition: opacity 1.2s ease;
      font-family: 'Courier New', monospace;
    `,
  })
  document.body.appendChild(overlay)
  requestAnimationFrame(() => {
    overlay.style.opacity = 1
  })

  // 打字特效内容
//   const lines = [
//     'Wake up, operator...',
//     'The matrix is initializing...',
//     'This is the GEMM Benchmark Arena.',
//     'GPU is all you need.',
//     '',
//     'Fastest wins. Optimize. Benchmark. Repeat.',
//   ]

   const lines = [
    'Wake up, Neo.',
    'The Matrix has you...',
    'Follow the FLOPS.',
    '',
    'You\'re in the Matrix.',
    'This one is built on CUDA.',
    '',
    'You take the red kernel — you enter the competition.',
    'You run matmul(A, B) — and I show you how deep the tensor goes.',
    'Wake up, operator...',
    '',
    'Welcome... to GEMMatrix.'
  ]

  const dialogue = Object.assign(document.createElement('div'), {
    style: `
      position: absolute;
      bottom: 20%;
      left: 10%;
      color: #0f0;
      font-size: 20px;
      white-space: pre;
      line-height: 1.5;
      text-shadow: 0 0 4px rgba(0,255,0,0.8);
      z-index: 10001;
    `,
  })
  overlay.appendChild(dialogue)

  let lineIdx = 0
  let charIdx = 0
  function typeLine() {
    if (lineIdx >= lines.length) return
    const currentLine = lines[lineIdx]
    if (charIdx <= currentLine.length) {
      dialogue.innerHTML =
        lines.slice(0, lineIdx).join('\n') +
        '\n' +
        currentLine.slice(0, charIdx) +
        (charIdx % 2 === 0 ? '_' : '')
      charIdx++
      setTimeout(typeLine, 60)
    } else {
      lineIdx++
      charIdx = 0
      setTimeout(typeLine, 500)
    }
  }
  typeLine()

  function closeOverlay() {
    overlay.style.opacity = 0
    setTimeout(() => overlay.remove(), 1200)
  }

  window.addEventListener('keydown', closeOverlay)
  overlay.addEventListener('click', closeOverlay)
})
</script>




<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=536622945&auto=1&height=66"></iframe>

# GPU-HGEMM 加速赛题

**联系人**：赖海斌 12211612@mail.sustech.edu.cn  
**硬件平台**：NVIDIA V100 GPU (32GB显存) \* 1 + Xeon Platinum CPU

## 一、任务说明

### 1.1 赛题背景

本次赛题要求在一张 NVIDIA V100 GPU上加速半精度通用矩阵乘法（HGEMM，Half-Precision General Matrix Multiplication）。HGEMM是矩阵乘法的一种形式，使用16位浮点数（half-precision, FP16）进行计算，适用于目前众多AI推理、高性能计算场景。




GEMM（General Matrix Multiplication）通用矩阵乘法是科学计算与深度学习领域最核心的运算之一，其标准形式为：

```
C = α * A * B + β * C
```

其中：

- A 是维度为 M×K 的输入矩阵

- B 是维度为 K×N 的输入矩阵

- C 是维度为 M×N 的输入/输出矩阵

- α, β 是浮点数标量系数

在本次赛题中，我们取 α=1 , β=0，即只考虑两矩阵相乘的情况, 即最简单的情况：

```
C = A * B
```


### 1.2 赛题要求

本题需要大家完成GEMM的计算，允许大家使用除了cublas以外的任意的外部库，欢迎大家学习参考网上其他开源代码（如有使用，请在相应代码位置及报告中说明，否则视为抄袭）。

大家的程序最终会在启明2.0 V100集群上测试，测试矩阵在1.3说明，评分会在2.1 2.2说明。欢迎大家使用CPU, GPU, CPU-GPU等方式完成GEMM的优化！


大家可以尝试的策略有：
- 使用TensorCore加速
- 实现共享内存、双缓冲等策略

推荐大家完成：
- 支持矩阵尺寸对齐（两矩阵的尺寸需为`mxn,nxk`）
- 支持任意维度输入
- BLAS级别分层


### 1.3 测试案例

我们的程序会在这几个案例上进行，大家可以在编写时用`generation.py`自行测试。考虑到目前HGEMM主流用例仍在AI 模型，我们采用以下10个case进行测试。

| 案例编号   | M      | N      | K      | 案例说明  | 应用                           |
| ------ | ------ | ------ | ------ | ----- | ---------------------------- |
| Case1  | 768    | 768    | 768    | 基准测试  | Transformer 注意力              |
| Case2  | 128    | 1024   | 2048   | 长条矩阵  | Transformer 线性层              |
| Case3  | 128    | 2048   | 8192   | 长条矩阵  | Transformer 线性层              |
| Case4  | 512    | 3072   | 1024   | 基准测试  | 神经网络分类头                      |
| Case5  | 512    | 4096   | 8192   | 长条矩阵  | Transformer 线性层              |
| Case6  | 3136   | 576    | 64     | 非对称矩阵 | ResNet50 3x3 卷积              |
| Case7  | 4,096  | 4,096  | 4,096  | 基准测试  |                              |
| Case8  | 1024   | 16384  | 16384  | 长条矩阵  | LLama3 8B 注意力                |
| Case9  | 4096   | 16384  | 14336  | 长条矩阵  | LLama3 8B FFN（batch size=32） |
| Case10 | 32,768 | 32,768 | 32,768 | 大矩阵测试 | HPL-MxP Benchmark            |

推荐大家代码采用类似BLAS的结构，在main层下，使用driver层，根据不同算子，使用 通用/专用kernel。

BLAS结构示意图
```
main
├── interface # 是否是GEMM
├── driver # 根据计算规模划分，选择不同算子
└── Kernel # 底层核心算子
```


## 二、评分标准
### 2.1 技术报告（50%）

我们评分技术报告的目的是希望大家能够梳理和总结在项目中涉及的知识点、书籍参考以及调试和解决问题的经验。哪怕是在各种尝试中，“这是什么”，“为什么这个跑不动啊”，“为什么这个优化反而更慢了”，“我下载并跑出来的程序性能为什么跟它官方的差这么多”，（这可能会是你写程序的常态，至少哥们我在写自己出的这道题时是这样）。**具备剖析软硬件性能瓶颈、分析问题、定位并解决 bug 的能力，并能清晰阐述问题及其解决方案，是本 HPC 赛题的核心价值所在。**

报告不限形式，欢迎采用 markdown/latex/Poster/PPT/视频/jm漫画 等格式提交。

| 评分项        | 比例  | 要求                                          |
| ---------- | --- | ------------------------------------------- |
| GPU硬件优化策略  | 30% | 需说明采用的优化策略如TensorCore使用、pipeline优化等 及其优化原理  |
| 优化策略代码说明   | 20% | 需在策略后列出对应关键代码片段                             |
| Nsight性能分析 | 20% | 包含SM利用率、显存带宽等指标截图                           |
| 实验分析       | 10% | 需对优化技术进行组合对比（如采用消融实验），展示不同配置下在不同矩阵大小的性能变化规律 |
| 文献引用       | 10% | 正确引用相关技术文献                                  |

**除了以上内容外，欢迎在报告中介绍各种内容，如 cuBLAS源码解读， cutlass 源码解读，Nsight使用教程，7月新番推荐，我在暑假当牛马栏目，最近的学习困惑。我尽量会给出答复。**

### 2.2 程序得分（50%）
<!-- 基准公式：
```
Score = 70*(YourPerf / MaxPerf) + 30*(1 - Error)
```
其中：
- MaxPerf：所有参赛队伍最佳性能
- Error：与cuBLAS结果的相对误差 -->

**程序得分**由10个测试点分数构成。
### 评分标准（ N 个测试点）
$$
\text{BaseScore} = \frac{1}{N} \sum_{i=1}^{N} \left[ 70 \times \left(\frac{\text{Perf}_i}{\text{MaxPerf}_i}\right) + 30 \times \left(1 - \text{RelError}_i\right) \right]
$$




## 关键指标定义
- **性能比** 
$$\frac{\text{Perf}}{\text{MaxPerf}}$$ 
  - 实际性能（如GFLOPS）与理论峰值性能的比值
- **相对误差 RelError**    
  - 基于Frobenius范数的GEMM结果误差（参考值 vs 计算结果）：

$\text{RelError} = \frac{\|\mathbf{A}_{\text{ref}} - \mathbf{A}_{\text{calc}}\|_F}{\|\mathbf{A}_{\text{ref}}\|_F}$

  - **误差容忍**：$\text{RelError} > 0.05$ 时，该测试点得分为0




## 三、技术路线建议
### 3.1 核心优化策略
```cpp
// 示例：双缓冲+异步拷贝核心结构
template <int BLOCK_M, int BLOCK_N, int BLOCK_K>
__global__ void hgemm_async(const half* A, const half* B, float* C, ...) {
    __shared__ __align__(32) half Ashared[2][BLOCK_M][BLOCK_K+4];
    __shared__ __align__(32) half Bshared[2][BLOCK_K][BLOCK_N+4];
    
    nvcuda::wmma::fragment<...> a_frag, b_frag, acc_frag;
    pipeline pipe;
    
    // 流水线执行
    for(int k=0; k<K; k+=BLOCK_K){
        // 阶段1：异步加载下一块
        if(k+BLOCK_K < K) {
            load_tile_async(A_next, Ashared[next_buf], ...);
            load_tile_async(B_next, Bshared[next_buf], ...);
        }
        
        // 阶段2：TensorCore计算
        wmma::mma_sync(acc_frag, a_frag, b_frag, acc_frag);
        
        // 阶段3：缓冲区切换
        __syncthreads();
        swap(current_buf, next_buf);
    }
}
```

### 3.2 性能分析指南
使用Nsight Systems生成性能画像：
```bash
nsys profile --stats=true --trace=cuda,nvtx --cuda-memory-usage=true ./hgemm  3072 3072 3072 data
```
需关注的指标：
- `sm__throughput.avg.pct_of_peak_sustained`: TensorCore利用率
- `dram__throughput.avg.pct_of_peak_sustained`: 显存带宽
- `l1tex__t_sectors_pipe_lsu_mem_global_op_ld.avg.pct_of_peak_sustained`: 全局加载效率

你将看到类似内容：
```txt
Time (%)  Total Time (ns)  Num Calls   Avg (ns)    Med (ns)   Min (ns)  Max (ns)   StdDev (ns)           Name         
 --------  ---------------  ---------  ----------  ----------  --------  ---------  -----------  ----------------------
     65.7        190767219          3  63589073.0     98885.0     91262  190577072  109974833.2  cudaMalloc            
     19.7         57189533          1  57189533.0  57189533.0  57189533   57189533          0.0  cudaEventSynchronize  
     14.0         40756856          3  13585618.7   8174435.0   4059456   28522965   13098721.3  cudaMemcpy            
      0.4          1300395          3    433465.0    522777.0    252472     525146     156749.0  cudaFree              
      0.1           187795          1    187795.0    187795.0    187795     187795          0.0  cudaLaunchKernel      
      0.0            18556          2      9278.0      9278.0      4745      13811       6410.6  cudaEventRecord       
      0.0            15571          2      7785.5      7785.5       441      15130      10386.7  cudaEventCreate       
      0.0              934          1       934.0       934.0       934        934          0.0  cuModuleGetLoadingMode
```

## 四、提交内容

1. **代码包**：
将您的代码打包，其内部文件夹类似如下结构：
   ```
   /你的战队ID
   ├── src/
   │   ├── hgemm.cu           # 主实现
   │   └── hgemm_utils.cuh    # 辅助函数
   ├── Makefile
   ├── README.md  # 如何编译+运行的简单说明
   └── Otherfiles # 其他辅助文件如 setup.py
   ```


2. **技术报告**（若PDF格式）：
   - 优化策略示意图（推荐使用TiKZ或Draw.io绘制）
   - Nsight性能截图（需包含时间轴和指标表格）
   - 不同案例的性能对比图

3. **测试脚本**：
   ```bash
   # 示例测试脚本
   for case in 1 2 3 4 5; do
       ./hgemm -m ${M[$case]} -n ${N[$case]} -k ${K[$case]} \
               -o result_${case}.bin
   done
   ```

将您的以上3份内容打包为 `GEMM_你的战队ID.tar.gz` ，并提交给 12211612`AT`mail.sustech.edu.cn

## 五、编译与验证
### 5.1 编译指令
```bash
# 基础编译
nvcc -arch=sm_70 -Xcompiler -fopenmp -O3 \
     -I./include -L${CUDA_PATH}/lib64 \
     -lcublas -o hgemm hgemm.cu

# 带Nsight调试的版本
nvcc -lineinfo -src-in-ptx -keep -G \
     -arch=sm_70 -o hgemm_debug hgemm.cu
```

### 5.2 正确性验证
```cpp
// 使用cuBLAS作为基准
cublasHgemm(handle, CUBLAS_OP_N, CUBLAS_OP_N,
            M, N, K, &alpha,
            dA, M, dB, K, &beta, dC, M);

// 计算相对误差
float max_err = 0;
for(int i=0; i<M*N; ++i){
    float ref = cublas_result[i];
    float val = your_result[i];
    max_err = fmaxf(max_err, fabsf(val-ref)/fabsf(ref));
}
```

## 六、参考文献
1.  NVIDIA Tensor Core 编程指南 v1.3
2.  CUDA C++ Programming Guide - Asynchronous Copy
3.  Volta架构白皮书 - 第4章 Tensor Core设计
4.  "Dissecting the NVIDIA Volta GPU Architecture via Microbenchmarking" - IEEE Access 2020
5.  上科大HPC教程
6. Azzam Haidar, Stanimire Tomov, Jack Dongarra, and Nicholas J. Higham. 2018. Harnessing GPU tensor cores for fast FP16 arithmetic to speed up mixed-precision iterative refinement solvers. In Proceedings of the International Conference for High Performance Computing, Networking, Storage, and Analysis (SC '18). IEEE Press, Article 47, 1–11.

