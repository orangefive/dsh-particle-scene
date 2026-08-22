# dsh-particle-scene

> DeepSeek Harness (DSH) Web UI 美化插件 —— 科幻粒子文字背景 + 玻璃拟态按钮，一键还原。

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 简介

一个纯客户端的 DSH Web 插件：全屏白色发光粒子汇聚成一段英文文字（默认 `HELLO WORLD`），鼠标掠过时字母粒子被不规则地"吹散"，移开后自动重组；同时把全局按钮升级为毛玻璃质感。所有效果可随时一键关闭，回到 DSH 原生界面。

## 特性

- ✨ **粒子文字背景** —— 数百颗白色发光粒子经弹簧运动汇聚成文字，带缓慢漂移、闪烁与光晕
- 🖱️ **鼠标交互** —— 光标靠近任意字母（默认半径 110px），该字母的粒子被推开散开、变亮放大；移开即归位重组，每个字母独立响应
- 🪟 **玻璃拟态按钮** —— `backdrop-filter` 毛玻璃 + 高光边缘；悬停时上浮、辉光、亮度过渡动画；点击下沉、聚焦光环、禁用降饱和
- 🔁 **一键还原** —— 侧栏底部开关按钮随时关闭全部效果（画布、样式、主题令牌覆盖全部移除）
- 🌓 **明/暗主题自适应** —— 深色主题下白色粒子；浅色主题下自动切换深蓝配色，两种主题均保持可读
- 📐 **自适应居中** —— 文字始终位于主内容区（视口去掉左侧栏后）的正中央，侧栏展开/折叠/拖拽改宽均正确
- ⚙️ **可配置** —— 文字内容、粒子大小、排斥半径/强度等集中在 `CONFIG` 常量中，改一处即生效

## 安装

> 依赖：DSH（DeepSeek Harness）Web 端，Node.js ≥ 18，npm。

### 方式 A：构建为插件包（通用）

```bash
git clone https://github.com/orangefive/dsh-particle-scene.git
cd dsh-particle-scene
npm install
npm run build          # 产物：lib/client.js
npm pack               # 产物：*.tgz
```

得到插件包后，在 DSH profile 的 `package.json` 中以 `link:` 依赖 + `bundles` 数组装配（与官方 `@deepseek-ai/dsh-client-ui-*` 插件一致），或发布到 npm 后直接依赖安装。

### 方式 B：super-injector 热注入（DSH 注入器环境）

若环境装有 [dsh-super-injector](https://github.com/orangefive)（`dev_*` 工具族），克隆后直接运行时注入，无需重启：

```text
dev_build_plugin   目录 = <本仓库路径>
dev_inject_plugin  目录 = <本仓库路径>
```

### 方式 C：动态插件（无需构建）

本仓库 `src/client/index.ts` 是标准 DSH 客户端插件源码，也可将其中逻辑以动态 Cordis 插件方式直接运行（`cordis_define` / `cordis_run`）。

## 使用

1. 插件加载后，粒子背景立即生效，侧栏底部出现 **"✨ 还原界面"** 玻璃按钮
2. 把鼠标移到文字上扫过：粒子散开重组，交互反馈明显
3. 点击 **"✨ 还原界面"**：全部效果关闭，回到 DSH 原生界面；再点 **"🌌 开启特效"** 恢复
4. 彻底移除：在插件管理中停用/卸载该插件（所有副作用均为 Fiber 所有，卸载即净）

## 配置

所有参数集中在 [`src/client/index.ts`](src/client/index.ts) 顶部的 `CONFIG` 导出：

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `text` | `'HELLO WORLD'` | 粒子组成的文字（中英文均可） |
| `particleSizeMin` / `particleSizeMax` | `0.9` / `1.9` | 粒子核心半径范围（px） |
| `repelRadius` | `110` | 鼠标排斥半径（px） |
| `repelStrength` | `1.6` | 排斥强度，越大散开越剧烈 |
| `dustCount` | `80` | 背景漂浮尘埃粒子数 |
| `labels.on` / `labels.off` | `'✨ 还原界面'` / `'🌌 开启特效'` | 开关按钮文案 |

修改后重新 `npm run build` 即可。

## 工作原理

插件只使用 DSH Web 官方提供的扩展面，所有副作用随插件卸载自动清理：

| 扩展面 | 用途 |
| --- | --- |
| `shell.overlay` 槽位 | 全屏浮动层（默认 click-through），经 `div[data-shell-overlay]{z-index:-1}` 垫到应用内容之下作为背景层 |
| `theme.overrideTokens` | 覆盖 `--dsw-alias-*` 主题令牌（明/暗双值），把应用基色置为透明、表面与按钮改为半透明玻璃色 |
| `sidebar.footer.action` 槽位 | 还原/开启开关按钮 |
| 粒子引擎 | 离屏画布采样文字像素 → 粒子弹簧力学 + 鼠标斥力（带角度抖动），`requestAnimationFrame` 驱动，`lighter` 混合发光 |

## 兼容性

- DSH Web 客户端（三栏布局：sidebar / conversation / details）
- 明、暗、跟随系统三种主题
- 现代浏览器（Chrome / Edge / Firefox / Safari；`backdrop-filter` 与 `:has()` 需要较新版本）
- 尊重 `prefers-reduced-motion`（系统开启减弱动态时粒子静止显示）

## 许可证

[MIT](LICENSE)
