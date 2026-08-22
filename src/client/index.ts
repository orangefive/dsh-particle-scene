/**
 * @orangefive/dsh-particle-scene — DeepSeek Harness (DSH) Web UI 美化插件（纯客户端）。
 *
 * 效果：
 *  1. 全屏科幻粒子背景 —— 白色发光粒子汇聚成一段英文文字（默认 "HELLO WORLD"）。
 *  2. 鼠标交互 —— 光标靠近任意字母时，附近的粒子被不规则推开、变亮放大；
 *     光标移开后粒子被弹簧力拉回，重新组合成完整文字。
 *  3. 玻璃拟态按钮 —— 全局按钮毛玻璃化（半透明 + 背景模糊 + 高光边缘），
 *     悬停时上浮、辉光、亮度过渡。
 *  4. 一键还原 —— 侧栏底部按钮随时关闭全部效果，回到 DSH 原生界面。
 *
 * 实现要点（均为 DSH Web 官方提供的扩展面，卸载即净）：
 *  - `shell.overlay` 槽位：全屏浮动层（默认 click-through），经
 *    `div[data-shell-overlay]{z-index:-1}` 垫到应用内容之下作为背景；
 *  - `theme.overrideTokens`：覆盖 --dsw-alias-* 主题令牌（明/暗双值），
 *    把应用基色置为透明、表面/按钮改半透明玻璃色；
 *  - `sidebar.footer.action` 槽位：还原/开启开关按钮。
 *
 * 本文件是唯一需要修改的源码：改 CONFIG 即可调整文字、粒子大小、
 * 排斥半径/强度等参数。
 */
import React from 'react'

// ================= 配置（按需修改） =================
export const CONFIG = {
  /** 粒子组成的文字 —— 换成任何内容（中英文均可，中文需系统含对应字体） */
  text: 'HELLO WORLD',
  /** 粒子核心半径范围（px） */
  particleSizeMin: 0.9,
  particleSizeMax: 1.9,
  /** 鼠标排斥半径（px）：光标进入该范围后粒子开始散开 */
  repelRadius: 110,
  /** 鼠标排斥强度：越大散开越剧烈 */
  repelStrength: 1.6,
  /** 背景漂浮尘埃粒子数量 */
  dustCount: 80,
  /** 侧栏底部开关按钮文案 */
  labels: {
    on: '✨ 还原界面',
    off: '🌌 开启特效',
  },
}

// ================= 最小结构类型（对应 DSH 客户端运行时） =================

type SlotEntryOptions = {
  name: string
  id?: string
  key?: string
  order?: number
  label?: string | (() => string)
}

type SlotsLike = {
  inject(key: string, callback: () => unknown): () => void
  register(options: SlotEntryOptions, component: (props?: unknown) => React.ReactElement | null): () => void
}

type ThemeLike = {
  getTheme(): { active?: { colorScheme?: string } }
  subscribe(fn: () => void): () => void
  overrideTokens(source: string, tokens: Record<string, { light: string; dark: string }>): () => void
}

type ClientContext = {
  slots: SlotsLike
  theme?: ThemeLike
}

export const inject = ['slots', 'theme']

// ================= 玻璃按钮 + 场景 CSS =================
const CSS = [
  ':root{background:radial-gradient(120% 90% at 50% 36%,#edf2ff 0%,#dee7fb 55%,#c9d6f2 100%)}',
  ':root:has(body[data-ds-dark-theme]){background:radial-gradient(120% 90% at 50% 36%,#0d1530 0%,#070b1a 55%,#04060f 100%)}',
  // 把 overlay 层垫到应用内容之下，作为粒子背景层
  'div[data-shell-overlay]{z-index:-1}',
  'button,input[type="button"],input[type="submit"]{',
  '  backdrop-filter:blur(18px) saturate(160%) !important',
  '  -webkit-backdrop-filter:blur(18px) saturate(160%) !important',
  '  border-color:rgba(22,32,60,0.18) !important',
  '  transition:transform .18s ease,filter .28s ease,box-shadow .28s ease,background-color .28s ease,border-color .28s ease,color .28s ease,opacity .28s ease !important',
  '}',
  'body[data-ds-dark-theme] button,body[data-ds-dark-theme] input[type="button"],body[data-ds-dark-theme] input[type="submit"]{border-color:rgba(255,255,255,0.30) !important}',
  'button:hover,input[type="button"]:hover,input[type="submit"]:hover{',
  '  filter:brightness(1.16) drop-shadow(0 0 12px rgba(90,130,220,0.45)) !important',
  '  transform:translateY(-1px) !important',
  '  box-shadow:inset 0 1px 0 rgba(255,255,255,0.4),0 0 0 1px rgba(120,160,240,0.35),0 10px 26px rgba(20,30,70,0.18) !important',
  '}',
  'body[data-ds-dark-theme] button:hover,body[data-ds-dark-theme] input[type="button"]:hover,body[data-ds-dark-theme] input[type="submit"]:hover{',
  '  filter:brightness(1.18) drop-shadow(0 0 12px rgba(140,180,255,0.55)) !important',
  '  box-shadow:inset 0 1px 0 rgba(255,255,255,0.35),0 0 0 1px rgba(160,195,255,0.35),0 10px 26px rgba(0,0,0,0.28) !important',
  '}',
  'button:active,input[type="button"]:active,input[type="submit"]:active{',
  '  transform:translateY(0) scale(0.97) !important',
  '  filter:brightness(1.05) !important',
  '  box-shadow:inset 0 1px 0 rgba(255,255,255,0.25),0 4px 14px rgba(20,30,70,0.12) !important',
  '}',
  'button:focus-visible,input[type="button"]:focus-visible,input[type="submit"]:focus-visible{outline:2px solid rgba(110,150,240,0.65) !important;outline-offset:2px !important}',
  'button:disabled,input[type="button"]:disabled,input[type="submit"]:disabled{filter:saturate(0.45) opacity(0.55) !important;transform:none !important;box-shadow:none !important}',
].join('\n')

// ================= 主题令牌覆盖（明/暗双值，跟随当前主题） =================
const TOKENS: Record<string, { light: string; dark: string }> = {
  '--dsw-alias-bg-base': { light: 'transparent', dark: 'transparent' },
  '--dsw-specific-sidebar-fill': { light: 'rgba(255,255,255,0.6)', dark: 'rgba(9,13,28,0.55)' },
  '--dsw-alias-bg-layer-1': { light: 'rgba(255,255,255,0.78)', dark: 'rgba(20,27,50,0.88)' },
  '--dsw-alias-bg-layer-2': { light: 'rgba(255,255,255,0.7)', dark: 'rgba(26,34,60,0.84)' },
  '--dsw-alias-bg-overlay': { light: 'rgba(255,255,255,0.92)', dark: 'rgba(17,22,42,0.94)' },
  '--dsw-alias-label-primary': { light: '#16203c', dark: '#eaf0fc' },
  '--dsw-alias-label-secondary': { light: 'rgba(22,32,60,0.68)', dark: 'rgba(203,216,244,0.74)' },
  '--dsw-alias-border-l1': { light: 'rgba(22,32,60,0.12)', dark: 'rgba(255,255,255,0.10)' },
  '--dsw-alias-border-l2': { light: 'rgba(22,32,60,0.2)', dark: 'rgba(255,255,255,0.18)' },
  '--dsw-alias-button-primary-fill': { light: 'rgba(86,132,240,0.5)', dark: 'rgba(86,132,240,0.35)' },
  '--dsw-alias-button-primary-hover': { light: 'rgba(108,152,248,0.68)', dark: 'rgba(110,155,250,0.52)' },
  '--dsw-alias-button-primary-dimmed': { light: 'rgba(86,132,240,0.18)', dark: 'rgba(255,255,255,0.08)' },
  '--dsw-alias-button-floating-fill': { light: 'rgba(255,255,255,0.55)', dark: 'rgba(255,255,255,0.09)' },
  '--dsw-alias-button-floating-hover': { light: 'rgba(255,255,255,0.8)', dark: 'rgba(255,255,255,0.2)' },
  '--dsw-alias-button-elevated-fill': { light: 'rgba(255,255,255,0.6)', dark: 'rgba(255,255,255,0.1)' },
  '--dsw-alias-button-contrast-fill': { light: 'rgba(255,255,255,0.55)', dark: 'rgba(255,255,255,0.12)' },
  '--dsw-alias-button-tool-bar-fill': { light: 'rgba(84,90,120,0.14)', dark: 'rgba(255,255,255,0.08)' },
  '--dsw-alias-button-tool-bar-hover': { light: 'rgba(84,90,120,0.28)', dark: 'rgba(255,255,255,0.16)' },
  '--dsw-alias-button-tool-bar-fill-invisible': { light: 'transparent', dark: 'transparent' },
  '--dsw-alias-button-info-fill': { light: 'rgba(86,132,240,0.48)', dark: 'rgba(86,132,240,0.32)' },
  '--dsw-alias-button-info-hover': { light: 'rgba(108,152,248,0.66)', dark: 'rgba(110,155,250,0.48)' },
  '--dsw-alias-button-ghost-active-fill': { light: 'rgba(120,140,200,0.14)', dark: 'rgba(255,255,255,0.09)' },
  '--dsw-alias-button-ghost-active-hover': { light: 'rgba(120,140,200,0.24)', dark: 'rgba(255,255,255,0.17)' },
  '--dsw-alias-button-ghost-active-border': { light: 'rgba(120,150,220,0.4)', dark: 'rgba(255,255,255,0.28)' },
}
const SOURCE = 'dsh-particle-scene'

// ================= 文本粒子采样 =================
/** 把文字渲染到离屏画布并按网格采样像素，得到粒子目标点（设计空间 1400x440）。 */
function sampleText(text: string): { x: number; y: number }[] {
  const W = 1400
  const H = 440
  const off = document.createElement('canvas')
  off.width = W
  off.height = H
  const c = off.getContext('2d')
  if (!c) return []
  const fam = "'Segoe UI','Helvetica Neue','Microsoft YaHei','PingFang SC',sans-serif"
  let fs = 180
  c.font = '700 ' + fs + 'px ' + fam
  const w0 = c.measureText(text).width
  if (w0 > 0) fs = Math.min(400, fs * (W * 0.74 / w0))
  c.font = '700 ' + fs + 'px ' + fam
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillStyle = '#fff'
  c.fillText(text, W / 2, H / 2)
  const img = c.getImageData(0, 0, W, H).data
  let step = 3
  let pts: { x: number; y: number }[] = []
  for (let attempt = 0; attempt < 8; attempt++) {
    pts = []
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        if (img[(y * W + x) * 4 + 3] > 150) {
          pts.push({ x: x + (Math.random() - 0.5) * step * 0.5, y: y + (Math.random() - 0.5) * step * 0.5 })
        }
      }
    }
    if (pts.length > 900) step = Math.ceil(step * 1.3)
    else if (pts.length < 340 && step > 1) step = Math.max(1, Math.floor(step * 0.8))
    else break
  }
  pts.sort((a, b) => a.y - b.y || a.x - b.x)
  return pts
}

// ================= 粒子引擎：鼠标靠近 -> 推开散开；移开 -> 归位重组 =================
function createEngine(canvas: HTMLCanvasElement, g: CanvasRenderingContext2D, theme: ThemeLike | undefined) {
  const W = 1400
  const H = 440

  let scheme = 'dark'
  const readScheme = (): string => {
    try {
      const snap = theme?.getTheme()
      if (snap?.active?.colorScheme) return snap.active.colorScheme
    } catch {
      /* ignore */
    }
    try {
      return document.body.hasAttribute('data-ds-dark-theme') ? 'dark' : 'light'
    } catch {
      return 'dark'
    }
  }
  scheme = readScheme()

  let design: { x: number; y: number }[] = [] // 设计空间采样点
  let screen: { x: number; y: number }[] = [] // 当前屏幕坐标目标点
  let cw = 0
  let ch = 0
  let dpr = 1
  let lastDpr = 0
  let parts: {
    x: number; y: number; vx: number; vy: number
    phase: number; size: number
  }[] = []
  let dust: { x: number; y: number; vx: number; vy: number; r: number; phase: number; a: number }[] = []
  let t = 0
  let running = true
  let rafId = 0
  let disposers: (() => void)[] = []
  let mouse: { x: number; y: number } | null = null

  const onMove = (e: MouseEvent) => { mouse = { x: e.clientX, y: e.clientY } }
  const onLeave = () => { mouse = null }

  // 左侧栏实际宽度（frame 的第一个子元素），用于把文字放在主内容区正中
  function sidebarWidth(): number {
    try {
      const layer = canvas.parentElement
      if (!layer) return 0
      const frame = layer.parentElement
      if (!frame?.children?.length) return 0
      return frame.children[0].getBoundingClientRect().width
    } catch {
      return 0
    }
  }
  function contentCenterX(): number {
    return (cw + sidebarWidth()) / 2
  }

  function ensureText() {
    if (design.length) return
    design = sampleText(CONFIG.text)
  }

  function buildParticles() {
    const n = Math.min(850, Math.max(320, design.length))
    const cx = contentCenterX()
    parts = []
    for (let i = 0; i < n; i++) {
      parts.push({
        x: cx + (Math.random() - 0.5) * 260,
        y: ch / 2 + (Math.random() - 0.5) * 160,
        vx: 0, vy: 0,
        phase: Math.random() * Math.PI * 2,
        size: CONFIG.particleSizeMin + Math.random() * (CONFIG.particleSizeMax - CONFIG.particleSizeMin),
      })
    }
    dust = []
    for (let i = 0; i < CONFIG.dustCount; i++) {
      dust.push({
        x: Math.random() * Math.max(cw, 10),
        y: Math.random() * Math.max(ch, 10),
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 0.4 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        a: 0.1 + Math.random() * 0.18,
      })
    }
  }

  function layout() {
    try {
      dpr = window.devicePixelRatio || 1
    } catch {
      dpr = 1
    }
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (w === cw && h === ch && dpr === lastDpr) return
    cw = w
    ch = h
    lastDpr = dpr
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (!design.length) return
    const s = Math.min(w * 0.8 / W, h * 0.58 / H)
    // 水平中心 = 主内容区（视口去掉左侧栏后）的正中央
    const cx = contentCenterX()
    const ox = cx - W * s / 2
    const oy = (h - H * s) / 2
    screen = design.map((p) => ({ x: ox + p.x * s, y: oy + p.y * s }))
    if (!parts.length) buildParticles()
  }

  function tick() {
    if (!running) return
    layout()
    ensureText()
    if (!cw || !ch || !parts.length || !screen.length) return
    const m = screen.length
    const dark = scheme === 'dark'
    const CORE = dark ? '242,249,255' : '28,50,116'
    const HALO = dark ? '130,180,255' : '88,128,222'
    const R = CONFIG.repelRadius
    const F = CONFIG.repelStrength
    t += 16
    g.clearRect(0, 0, cw, ch)
    g.globalCompositeOperation = 'lighter'
    // 漂浮尘埃
    for (const d of dust) {
      d.x += d.vx
      d.y += d.vy
      if (d.x < -5) d.x = cw + 5; else if (d.x > cw + 5) d.x = -5
      if (d.y < -5) d.y = ch + 5; else if (d.y > ch + 5) d.y = -5
      const tw = 0.6 + 0.4 * Math.sin(t * 0.001 + d.phase)
      g.beginPath()
      g.arc(d.x, d.y, d.r, 0, Math.PI * 2)
      g.fillStyle = 'rgba(' + HALO + ',' + (d.a * tw).toFixed(3) + ')'
      g.fill()
    }
    // 文本粒子：弹簧归位 + 鼠标排斥（带角度抖动，散开更不规则）
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i]
      const tp = screen[i % m]
      let boost = 0
      // 向目标点弹簧
      p.vx += (tp.x - p.x) * 0.05
      p.vy += (tp.y - p.y) * 0.05
      // 鼠标排斥
      if (mouse !== null) {
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const d2 = dx * dx + dy * dy
        if (d2 < R * R && d2 > 0.0001) {
          const d = Math.sqrt(d2)
          const fall = 1 - d / R
          const ang = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.9
          const f = F * fall * fall
          p.vx += Math.cos(ang) * f
          p.vy += Math.sin(ang) * f
          boost = fall
        }
      }
      p.vx *= 0.85
      p.vy *= 0.85
      p.x += p.vx
      p.y += p.vy
      const x = p.x + Math.sin(t * 0.0007 + p.phase) * 1.4
      const y = p.y + Math.cos(t * 0.0006 + p.phase * 1.3) * 1.4
      const tw = 0.82 + 0.18 * Math.sin(t * 0.0016 + p.phase * 2)
      const r = p.size * (1 + boost * 0.25)
      const glow = 0.3 + boost * 0.5
      const coreA = 0.7 + boost * 0.28
      g.beginPath()
      g.arc(x, y, r * 2.8, 0, Math.PI * 2)
      g.fillStyle = 'rgba(' + HALO + ',' + (glow * tw).toFixed(3) + ')'
      g.fill()
      g.beginPath()
      g.arc(x, y, r, 0, Math.PI * 2)
      g.fillStyle = 'rgba(' + CORE + ',' + (coreA * tw).toFixed(3) + ')'
      g.fill()
    }
    g.globalCompositeOperation = 'source-over'
  }

  return {
    start() {
      ensureText()
      window.addEventListener('mousemove', onMove, { passive: true })
      document.addEventListener('mouseleave', onLeave)
      disposers.push(() => {
        window.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseleave', onLeave)
      })
      if (theme !== undefined) {
        disposers.push(theme.subscribe(() => { scheme = readScheme() }))
      }
      let reduced = false
      try {
        reduced = !!window.matchMedia('(prefers-reduced-motion: reduce)').matches
      } catch {
        reduced = false
      }
      if (reduced) {
        layout()
        tick()
      } else {
        const loop = () => {
          tick()
          rafId = requestAnimationFrame(loop)
        }
        rafId = requestAnimationFrame(loop)
        disposers.push(() => cancelAnimationFrame(rafId))
      }
    },
    stop() {
      running = false
      for (const d of disposers) {
        try { d() } catch { /* ignore */ }
      }
      disposers = []
    },
  }
}

// ================= 共享开关状态 =================
type Store = {
  enabled: boolean
  subs: Set<(v: boolean) => void>
  set: (v: boolean) => void
  sub: (f: (v: boolean) => void) => () => void
}
function createStore(): Store {
  const store: Store = {
    enabled: true,
    subs: new Set(),
    set(v) {
      if (this.enabled === v) return
      this.enabled = v
      this.subs.forEach((f) => f(v))
    },
    sub(f) {
      this.subs.add(f)
      return () => { this.subs.delete(f) }
    },
  }
  return store
}

function insertCss(css: string): () => void {
  const style = document.createElement('style')
  style.setAttribute('data-plugin', SOURCE)
  style.textContent = css
  document.head.appendChild(style)
  return () => { style.remove() }
}

// ================= 组件 =================

function ParticleCanvas({ theme }: { theme: ThemeLike | undefined }) {
  const ref = React.useRef<HTMLCanvasElement | null>(null)
  React.useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const g = canvas.getContext('2d')
    if (!g) return
    const engine = createEngine(canvas, g, theme)
    engine.start()
    return () => engine.stop()
  }, [theme])
  return React.createElement('canvas', {
    ref,
    'aria-hidden': true,
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    },
  })
}

function Scene({ store, theme }: { store: Store; theme: ThemeLike | undefined }) {
  const [on, setOn] = React.useState(store.enabled)
  React.useEffect(() => store.sub(setOn), [store])
  React.useEffect(() => {
    if (!on) return
    const d1 = insertCss(CSS)
    let d2: () => void = () => {}
    if (theme !== undefined) {
      try { d2 = theme.overrideTokens(SOURCE, TOKENS) } catch { d2 = () => {} }
    }
    return () => {
      try { d1() } catch { /* ignore */ }
      try { d2() } catch { /* ignore */ }
    }
  }, [on, theme])
  if (!on) return null
  return React.createElement(ParticleCanvas, { theme })
}

function Toggle({ store }: { store: Store }) {
  const [on, setOn] = React.useState(store.enabled)
  React.useEffect(() => store.sub(setOn), [store])
  return React.createElement(
    'button',
    {
      onClick: () => store.set(!store.enabled),
      title: on ? '关闭粒子特效，回到 DSH 原生界面' : '重新开启粒子特效',
      style: { whiteSpace: 'nowrap', minWidth: 96, cursor: 'pointer' },
    },
    on ? CONFIG.labels.on : CONFIG.labels.off,
  )
}

// ================= 插件入口 =================
export function apply(ctx: ClientContext): void {
  const store = createStore()
  const theme = ctx.theme

  ctx.slots.inject('shell.overlay', () =>
    ctx.slots.register(
      { name: 'shell.overlay', id: 'particle-scene' },
      () => React.createElement(Scene, { store, theme }),
    ),
  )

  ctx.slots.inject('sidebar.footer.action', () =>
    ctx.slots.register(
      { name: 'sidebar.footer.action', id: 'particle-scene-toggle' },
      () => React.createElement(Toggle, { store }),
    ),
  )
}
