---
title: WRF数值天气预报挑战
---

<Wrf />
<script setup>
import Wrf from '../../components/Wrf.vue'
</script>

# WRF数值天气预报挑战

> 出题人：Jiahua Zhao

> [!IMPORTANT]
> One need only think of the weather, in which case the prediction even for a few days ahead is impossible.
>
>                                                                     ——— Albert Einstein

## 概述

许多行业如航空、旅行、旅游、能源和交通都高度依赖气象预报中心提供的及时且准确的天气预报。这些业务化预报中心使用数值天气预报（NWP）模型，基于当前气象条件预测未来天气。WRF 模型（Weather Research and Forecasting Model）是一种先进的中尺度数值天气预报系统，同时也是最广泛使用的数值天气预报系统之一，它具有两个动力核心、一个数据同化系统，以及支持并行计算和系统可扩展的软件架构，能够服务于从数十米到数千公里尺度的多种气象应用。若要在高性能计算（HPC）集群上为 WRF 模型实现最大性能（及时生成预报结果），就需要将强大的计算资源、高速网络和高吞吐量存储相结合。

更多关于 WRF 的信息可以访问：https://www.mmm.ucar.edu/models/wrf。

## 关于应用构建与安装

要构建和运行WRF模型，我们首先需要下载WRF模型源代码（这里我们选择version 4.4）：

```shell
wget https://github.com/wrf-model/WRF/releases/download/v4.4/v4.4.tar.gz
```

然后解压并进入到解压后的WRF模型路径中：

```shell
tar xfp v4.4.tar.gz
cd WRFV4.4
```

接着我们需要加载构建与安装WRF模型所需的软件环境，主要是依赖库（NetCDF-C、NetCDF-Fortran）和MPI（Message Passing Interface）通信库（Open MPI）：

```shell
module load netcdf-c/4.7.1_gcc-8.5.0
module load netcdf-fortran/4.4.5_gcc-8.5.0
module load openmpi/4.1.1_gcc-8.5.0
```

声明相关环境变量：

```shell
export NETCDF_classic=1
export NETCDF=/share/library/matlib/netcdf-fortran/4.4.5_gcc-8.5.0
export HDF5=/share/library/matlib/hdf5/1.10.5_gcc-8.5.0
```

在正式构建与安装前，我们还需编辑将要使用的系统上的有关编译器和MPI的配置文件（arch/configure.defaults）：

```shell
vi arch/configure.defaults

# 在第774行找到ARCH    Linux x86_64 ppc64le, gfortran compiler with gcc  #serial smpar dmpar dm+sm，然后进行以下修改
DESCRIPTION     =       GNU ($SFC/$SCC)
DMPARALLEL      =       1
OMPCPP          =       -D_OPENMP
OMP             =       -fopenmp
OMPCC           =       -fopenmp
SFC             =       gfortran
SCC             =       gcc
CCOMP           =       gcc
DM_FC           =       mpif90 -f90=$(SFC)
DM_CC           =       mpicc -cc=$(SCC)
FC              =       CONFIGURE_FC
CC              =       CONFIGURE_CC
LD              =       $(FC)
RWORDSIZE       =       CONFIGURE_RWORDSIZE
PROMOTION       =       #-fdefault-real-8
ARCH_LOCAL      =       -DNONSTANDARD_SYSTEM_SUBR  CONFIGURE_D_CTSM
CFLAGS_LOCAL    =       -w -O3 -c  # -DRSL0_ONLY
LDFLAGS_LOCAL   =
CPLUSPLUSLIB    =
ESMF_LDFLAG     =       $(CPLUSPLUSLIB)
FCOPTIM         =       -O2 -ftree-vectorize -funroll-loops
FCREDUCEDOPT    =       $(FCOPTIM)
FCNOOPT         =       -O0
FCDEBUG         =       # -g $(FCNOOPT) # -ggdb -fbacktrace -fcheck=bounds,do,mem,pointer -ffpe-trap=invalid,zero,overflow
FORMAT_FIXED    =       -ffixed-form
FORMAT_FREE     =       -ffree-form -ffree-line-length-none
FCSUFFIX        =
FCCOMPAT        =
BYTESWAPIO      =       -fconvert=big-endian -frecord-marker=4
FCBASEOPTS_NO_G =       -w $(FORMAT_FREE) $(BYTESWAPIO) $(FCCOMPAT)
FCBASEOPTS      =       $(FCBASEOPTS_NO_G) $(FCDEBUG)
MODULE_SRCH_FLAG =
TRADFLAG        =      CONFIGURE_TRADFLAG
CPP             =      /lib/cpp CONFIGURE_CPPFLAGS
AR              =      ar
ARFLAGS         =      ru
M4              =      m4 -G
RANLIB          =      ranlib
RLFLAGS         =
CC_TOOLS        =      $(SCC)
NETCDFPAR_BUILD =      CONFIGURE_NETCDFPAR_BUILD

# 修改后保存退出vim
```

然后我们开始构建WRF模型，在当前路径下执行：

```shell
./configure
```

之后会在终端出现以下信息：

```shell
checking for perl5... no
checking for perl... found /usr/bin/perl (perl)
Will use NETCDF in dir: /share/library/matlib/netcdf-fortran/4.4.5_gcc-8.5.0
Will use HDF5 in dir: /share/library/matlib/hdf5/1.10.5_gcc-8.5.0
PHDF5 not set in environment. Will configure WRF for use without.
Will use 'time' to report timing information
$JASPERLIB or $JASPERINC not found in environment, configuring to build without grib2 I/O...
------------------------------------------------------------------------
Please select from among the following Linux x86_64 options:

  1. (serial)   2. (smpar)   3. (dmpar)   4. (dm+sm)   PGI (pgf90/gcc)
  5. (serial)   6. (smpar)   7. (dmpar)   8. (dm+sm)   PGI (pgf90/pgcc): SGI MPT
  9. (serial)  10. (smpar)  11. (dmpar)  12. (dm+sm)   PGI (pgf90/gcc): PGI accelerator
 13. (serial)  14. (smpar)  15. (dmpar)  16. (dm+sm)   INTEL (ifort/icc)
                                         17. (dm+sm)   INTEL (ifort/icc): Xeon Phi (MIC architecture)
 18. (serial)  19. (smpar)  20. (dmpar)  21. (dm+sm)   INTEL (ifort/icc): Xeon (SNB with AVX mods)
 22. (serial)  23. (smpar)  24. (dmpar)  25. (dm+sm)   INTEL (ifort/icc): SGI MPT
 26. (serial)  27. (smpar)  28. (dmpar)  29. (dm+sm)   INTEL (ifort/icc): IBM POE
 30. (serial)               31. (dmpar)                PATHSCALE (pathf90/pathcc)
 32. (serial)  33. (smpar)  34. (dmpar)  35. (dm+sm)   GNU (gfortran/gcc)
 36. (serial)  37. (smpar)  38. (dmpar)  39. (dm+sm)   IBM (xlf90_r/cc_r)
 40. (serial)  41. (smpar)  42. (dmpar)  43. (dm+sm)   PGI (ftn/gcc): Cray XC CLE
 44. (serial)  45. (smpar)  46. (dmpar)  47. (dm+sm)   CRAY CCE (ftn $(NOOMP)/cc): Cray XE and XC
 48. (serial)  49. (smpar)  50. (dmpar)  51. (dm+sm)   INTEL (ftn/icc): Cray XC
 52. (serial)  53. (smpar)  54. (dmpar)  55. (dm+sm)   PGI (pgf90/pgcc)
 56. (serial)  57. (smpar)  58. (dmpar)  59. (dm+sm)   PGI (pgf90/gcc): -f90=pgf90
 60. (serial)  61. (smpar)  62. (dmpar)  63. (dm+sm)   PGI (pgf90/pgcc): -f90=pgf90
 64. (serial)  65. (smpar)  66. (dmpar)  67. (dm+sm)   INTEL (ifort/icc): HSW/BDW
 68. (serial)  69. (smpar)  70. (dmpar)  71. (dm+sm)   INTEL (ifort/icc): KNL MIC
 72. (serial)  73. (smpar)  74. (dmpar)  75. (dm+sm)   FUJITSU (frtpx/fccpx): FX10/FX100 SPARC64 IXfx/Xlfx

# 这里我们需要根据当前系统配置以及配置文件中对应的设置进行选择，所以根据我们之前的配置，选择35
Enter selection [1-75] : 35
------------------------------------------------------------------------
Compile for nesting? (1=basic, 2=preset moves, 3=vortex following) [default 1]: 
# 以上选择默认选项
Configuration successful!
```

若构建没有出现问题，我们会在当前路径下看到configure.wrf，然后对该文件进行修改：

```shell
vi configure.wrf

# 在第139行找到FC，然后进行以下修改
FC              =       $(DM_FC)

# 修改后保存退出vim
```

修改后执行以下命令完成编译与安装：

```shell
./compile -j 16 em_real 2>&1 | tee -a compile.log

# -j 16表示用16个线程对WRF模型源代码进行编译和安装
```

如果编译安装流程没有出现问题，最后会在终端中出现以下信息：

```shell
==========================================================================
build started:   Sat May 24 20:29:53 CST 2025
build completed: Sat May 24 20:38:52 CST 2025
 
--->                  Executables successfully built                  <---
 
-rwxr-xr-x 1 asc2501 ssc 44218352 May 24 20:38 main/ndown.exe
-rwxr-xr-x 1 asc2501 ssc 44103776 May 24 20:38 main/real.exe
-rwxr-xr-x 1 asc2501 ssc 43546784 May 24 20:38 main/tc.exe
-rwxr-xr-x 1 asc2501 ssc 48492312 May 24 20:38 main/wrf.exe
 
==========================================================================
```

最终在WRF模型文件夹里的main目录下会有4个可执行文件：ndown.exe、real.exe、tc.exe和wrf.exe。

## 关于应用测试

我们可以做个简单测试来检验WRF模型是否安装成功，首先我们需要下载并解压测试算例：

```shell
wget https://tqi-public.s3.us-east-2.amazonaws.com/datasets/v2/conus12km.tar.gz

tar -xvf conus12km.tar.gz && cd conus12km
```

然后将编译好的wrf.exe及其他运行所需文件链接至算例文件路径中：

```shell
ln -s /your_path/WRFV4.4/main/wrf.exe ./wrf.exe
ln -s /your_path/WRFV4.4/run/CAMtr_volume_mixing_ratio .
ln -sf /your_path/WRFV4.4/run/CAMtr_volume_mixing_ratio.* .
ln -sf /your_path/WRFV4.4/run/*_DATA .
ln -sf /your_path/WRFV4.4/run/*TBL .
ln -sf /your_path/WRFV4.4/run/ozone* .
```

然后将参考的namelist.input.test替换原本的namelist.input：

```shell
mv namelist.input namelist.input.backup
cp namelist.input.test /your_path/conus12km/namelist.input
```

提交相应的作业脚本至计算节点：

```shell
bsub -m "b08u37a b08u37b b08u38a b08u38b" < cpu_job.lsf # 以四节点为例
```

等待若干时间，作业完成后会在当前目录下生成`rsl.out.*`输出文件，我们可以通过展示rsl.out.0000内的结果来判断WRF模型计算是否成功：

```shell
tail -n1 ./rsl.out.0000
```

若出现`wrf: SUCCESS COMPLETE WRF`字样则说明测试通过，WRF模型运行成功，我们也会在当前目录下找到如`wrfout_d01_`开头的文件。

## 关于结果评估

我们会对WRF模型在给定的算例上模拟所花费的时间进行评估，即测量WRF在每个时间步上的平均计算时间。当WRF模型运行成功且结束后，我们会在rsl.error.0000中发现以下时间信息：

```shell
Timing for main: time 2019-11-26_12:01:12 on domain   1:  114.10273 elapsed seconds
Timing for main: time 2019-11-26_12:02:24 on domain   1:   95.48775 elapsed seconds
Timing for main: time 2019-11-26_12:03:36 on domain   1:   94.83864 elapsed seconds
Timing for main: time 2019-11-26_12:04:48 on domain   1:   95.13644 elapsed seconds
Timing for main: time 2019-11-26_12:06:00 on domain   1:   95.44253 elapsed seconds
Timing for main: time 2019-11-26_12:07:12 on domain   1:   94.70866 elapsed seconds
Timing for main: time 2019-11-26_12:08:24 on domain   1:   94.73820 elapsed seconds
Timing for main: time 2019-11-26_12:09:36 on domain   1:   95.45659 elapsed seconds
Timing for main: time 2019-11-26_12:10:48 on domain   1:   95.20013 elapsed seconds
......
```

我们可以通过运行给定的计时脚本计算平均时间：

```shell
chmod +x wrf_timing.sh #这个命令只需执行一次

./wrf_timing.sh rsl.out.0000
```

运行成功后我们可以在终端看到以下信息：

```shell
===== WRF Timing Summary =====
MPI ranks used: 8 (X) * 12 (Y) = 96 # 所使用的MPI进程数量，对于二维平面WRF会划分X和Y方向使用的进程数量
Average 'Timing for main': 97.23 seconds
```

这说明WRF模型在每个时间步上模拟平均耗时为97.23秒，我们赛题的最终目标就是将这个用时减少，即评估WRF每时间步的用时，用时越少得分越高。

不过，更重要的是在模拟时间减少的同时，我们也需要确保计算结果是收敛/正确的。如果时间减少了，但模拟结果是错误的，这道题将会得零分。因此我们还需要对计算结果进行验证，即比较实际计算结果与参考计算结果之间的误差。这里我们对WRF模型中三个重要物理量：温度和压力的组合（称为潜在温度”theta“）、水分（混合比”qv“）和水平风的分量（从左到右，而不是从西到东”u“）进行方差分析：

```shell
chmod +x wrf_verify.sh #这个命令只需执行一次

./wrf_verify.sh wrfout_d01_2019-11-26_18\:10\:00.ref wrfout_d01_2019-11-26_18\:10\:00 # 预计用时大约7分钟
```

运行成功后我们可以在终端看到以下信息：

```shell
Processing variable: qv (using QVAPOR)
compiler comparison for qv
Input, F-statistic: 0
Input, df factor: 1
Input, df error: 176399998
p-value probability = 1.0 means 100% reject null hypothesis that means are same
p-value probability = 0.999999998950383

We are pretty darn confident that the vendor vs exemplar comparisons are OK

Processing variable: u (using U)
compiler comparison for u
Input, F-statistic: 0
Input, df factor: 1
Input, df error: 176517598
p-value probability = 1.0 means 100% reject null hypothesis that means are same
p-value probability = 0.999999998950383

We are pretty darn confident that the vendor vs exemplar comparisons are OK

Processing variable: theta (using T)
compiler comparison for theta
Input, F-statistic: 0
Input, df factor: 1
Input, df error: 176399998
p-value probability = 1.0 means 100% reject null hypothesis that means are same
p-value probability = 0.999999998950383

We are pretty darn confident that the vendor vs exemplar comparisons are OK
```

当三个物理量的误差分析都出现“We are pretty darn confident that the vendor vs exemplar comparisons are OK”，则说明WRF模型的模拟结果正确，时间成绩有效。

## 赛题任务要求

### a（20分）

在正式比赛中我们使用conus 2.5 km数据集对 WRF进行基准测试，这里你需要先下载数据集：

```shell
wget https://tqi-public.s3.us-east-2.amazonaws.com/datasets/v2/conus2.5km.tar.gz

tar -xvf conus2.5km.tar.gz && cd conus2.5km
```

然后将编译好的wrf.exe及其他运行所需文件链接至算例文件路径中，和教程里的步骤一致，再将参考的namelist.input.conus2.5替换原本的namelist.input：

```shell
cp namelist.input.conus2.5 /your_path/conus2.5km/namelist.input
```

最后在模拟结果正确的情况下，通过对 rsl.out.0000 输出文件中每个时间步的 WRF 计算时间求平均值来测量结果。注意文件读取/写入期间的时间不包括在平均值中。然后提交以下几个文件作为结果：

- namelist.input
- rsl.out.0000
- wrf_timing.sh 结果截图
- wrf_verify.sh 结果截图

**注意：namelist.input里的参数（除上述&domains 部分几个参数外）不能修改，提交结果时也需要包含namelist.input。**

### b（40分）

接着上述算例，我们可以尝试运行优化：确定WRF运行时MPI进程的数量及其长宽比，即确定MPI与OpenMP进程的最佳组合。在 `namelist.input` 文件的 `&domains` 部分中，相关设置的默认值如下：

```shell
&domains  
  numtiles   = 1  
  nproc_x    = -1  
  nproc_y    = -1  
/  
```

- `numtiles` 控制每个 MPI 进程中使用的 OpenMP 线程数量。

- `nproc_x` 和 `nproc_y` 控制 MPI 排序（以及它们的排列方向）。

对于 MPI 分解，水平分解的任一方向（x 或 y）上的格点数都不能小于 10。MPI 进程的总数等于 `nproc_x * nproc_y`。例如，要使用 96 个总进程，你可以选择 48 个 MPI 进程，每个 MPI 进程运行 2 个 OpenMP 线程。

- 在 48 个 MPI 进程中，你可以在南北方向上进行 48 列分解、西东方向上进行 1 列分解（或 24×2、16x3、12×4、8x6、6×8、4x12、3x16、2×24、1×48 等组合）。
- 对于 OpenMP 线程（由 `numtiles` 控制），你可以选择每个MPI进程中的线程数。例如，对于每个MPI进程有两个线程，你可以设置 `numtiles=2`。

仅就 MPI 与 OpenMP 选项的组合而言，就存在巨大的性能调优空间。因此，你可以尝试修改（也仅可修改）`namelist.input` 文件的 `&domains` 部分，测试不同的MPI与OpenMP组合，来获得更好的运行性能，最终使得WRF模型模拟时间减少。

最终的提交结果为我们能找到的最佳MPI与OpenMP组合的结果：

- namelist.input
- rsl.out.0000
- wrf_timing.sh 结果截图
- wrf_verify.sh 结果截图

**注意：namelist.input里的参数（除上述&domains 部分几个参数外）不能修改，提交结果时也需要包含namelist.input。**

### c（40分）

当我们找到最佳MPI与OpenMP组合后，我们也可以尝试其他优化方法，比如选择更好的编译器（例如Intel）、进行编译优化，或者使用潜在性能更好的MPI库、数学库等等，各位参赛队伍可以自由选择或者尝试更多方法优化WRF模型的模型。

性能表现最好（时间开销最少）的队伍将获得满分，其余队伍成绩根据差距获得相应分数。

最终的提交结果为我们能找到的最佳优化方案的结果：

- namelist.input
- rsl.out.0000
- wrf_timing.sh 结果截图
- wrf_verify.sh 结果截图

**注意：namelist.input里的参数（除上述&domains 部分几个参数外）不能修改，提交结果时也需要包含namelist.input。**

### Bonus（20分）

我们可以尝试在单GPU上运行WRF程序，WRF GPU版本（AceCAST）可以访问：[https://acecast-docs.readthedocs.io/en/latest/index.html](https://acecast-docs.readthedocs.io/en/latest/index.html)

对于算例可以参考：[https://acecast-docs.readthedocs.io/en/latest/Benchmarks.html#ncar-standard-benchmark-test-cases](https://acecast-docs.readthedocs.io/en/latest/Benchmarks.html#ncar-standard-benchmark-test-cases)

如果参赛队伍能成功运行GPU版本的WRF程序并获得结果，便可获得额外的20分奖励。
