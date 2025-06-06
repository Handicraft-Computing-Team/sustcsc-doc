import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "SUSTCSC",
  description: "Documentation for the second SUSTCSC",
  markdown: {
    math: true
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Welcome', link: '/pages/intro/welcome' },
      { text: '基础赛道', link: '/pages/intro/basic' },
      { text: '进阶赛道', link: '/pages/intro/advanced' }
    ],

    sidebar: [
      {
        text: '关于超算，你需要知道',
        items: [
          { text: '欢迎来到SUSTCSC！', link: '/pages/intro/welcome' },
          { text: '集群使用指南', link: '/pages/intro/cluster' }
        ]
      },
      {
        text: '基础赛道',
        items: [
          { text: 'C/CPP编程挑战', link: '/pages/basic/c' },
          { text: 'Rust LWE 编程挑战', link: '/pages/basic/rust' },
          { text: 'CloverLeaf 编译优化挑战', link: '/pages/basic/cloverleaf' }
        ]
      },
      {
        text: '进阶赛道',
        items: [
          { text: 'GEMM编程挑战', link: '/pages/advanced/gemm' },
          { text: 'DiT图像生成挑战', link: '/pages/advanced/dit' },
          { text: 'WRF数值天气预报挑战', link: '/pages/advanced/wrf' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  },
  base: '/sustcsc-doc/'
})
