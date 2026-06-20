# webgl_materials_physical_transmission_alpha.html｜Transmission Alpha：带透明贴图的透射材质

> 本地官方案例：[`webgl_materials_physical_transmission_alpha.html`](../../cases/webgl_materials_physical_transmission_alpha.html)  
> 本篇目标：学习透明/透射材质如何结合 alpha 贴图，让材质局部透明或局部透射。

## 先从现实问题说起

有些透明材质不是整块都透明，比如带图案的玻璃、镂空塑料、透明贴花、树叶边缘。

只用 transmission 会让整块材质都透射；只用 alphaMap 又只是局部显示/隐藏，缺少玻璃感。

这个案例讲的是 `alphaMap` 和 `transmission` 怎么配合。

## 先把基础概念说清楚

- `alphaMap` 用黑白灰控制哪里透明、哪里可见。
- `transmission` 控制可见区域有没有物理透射感。
- `transparent: true` 让材质进入透明渲染流程，排序和边缘问题也要注意。

## 这个技术解决什么

它适合贴花玻璃、镂空亚克力、透明 UI 板、塑料包装这类“局部透明”的材质。

如果你只是整块玻璃，先看 transmission；如果透明形状还要受贴图控制，再看这一篇。

## 打开案例后看什么

- 切换 alpha 贴图，看透明图案形状怎么变。
- 调 transmission，看可见区域的玻璃感怎么变化。
- 改 side 或 transparent，看透明材质背面和混合效果。

## 官网核心代码

```js
const params = {
  transmission: 1,
  opacity: 1,
  roughness: 0,
  thickness: 0.01,
  envMapIntensity: 1,
};

material.transmission = params.transmission;
material.transparent = transparent;
```

## 这段代码到底在做什么

- alphaMap 决定哪些区域可见、哪些区域透明。
- transmission 决定可见区域的光是否能穿过材质。
- transparent: true 让材质进入透明渲染流程。
- DoubleSide 适合薄片透明材质，否则背面可能不可见。
- 透明排序和深度写入可能带来边缘问题，需要按项目调试。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `params = { transmission: 1, opacity: 1, roughness: 0, thickness: 0.01, envMapIntensity: 1, }` | `transmission` | 透射强度，用于玻璃等透明材质。 |
| `params = { transmission: 1, opacity: 1, roughness: 0, thickness: 0.01, envMapIntensity: 1, }` | `opacity` | 整体透明度。 |
| `params = { transmission: 1, opacity: 1, roughness: 0, thickness: 0.01, envMapIntensity: 1, }` | `roughness` | 粗糙度，越高反射越散。 |
| `params = { transmission: 1, opacity: 1, roughness: 0, thickness: 0.01, envMapIntensity: 1, }` | `thickness` | 透明/透射材质厚度。 |
| `params = { transmission: 1, opacity: 1, roughness: 0, thickness: 0.01, envMapIntensity: 1, }` | `envMapIntensity` | 环境反射强度。 |
| `material.transmission = params.transmission` | `transmission` | 透射强度，用于玻璃等透明材质。 |
| `material.transparent = transparent` | `transparent` | 是否启用透明渲染流程。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 切换 alpha 贴图 | 局部透明形状变化 |
| 调 transmission | 可见区域透射变化 |
| 改 side | 观察背面是否可见 |
| 关闭 transparent | 透明混合失效 |

## 学完能拿来做什么

- 镂空玻璃贴花
- 透明 UI 板
- 塑料包装
- 树叶/网格透明材质
- 带图案的亚克力

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
