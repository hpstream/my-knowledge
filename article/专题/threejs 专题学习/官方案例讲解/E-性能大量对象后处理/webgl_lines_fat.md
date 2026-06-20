# webgl_lines_fat.html｜Fat Lines：普通 Line 为什么控制不了稳定宽度

> 本地官方案例：[`webgl_lines_fat.html`](../../cases/webgl_lines_fat.html)  
> 本篇目标：学习 Line2/LineMaterial 如何实现屏幕空间粗线，并理解 resolution 对线宽计算的影响。

## 先从现实问题说起

WebGL 原生 Line 在很多平台上不能稳定控制粗细，经常你设置线宽也没用。

地图路线、轨迹线、测量线、选区边框却经常需要清晰可控的粗线。

`Line2` / `LineMaterial` 用几何方式模拟屏幕空间粗线。

## 先把基础概念说清楚

- 普通 Line 更依赖底层平台能力，线宽支持有限。
- Fat Lines 不是简单设置 gl lineWidth，而是用额外几何生成有宽度的线。
- `resolution` 必须跟随窗口更新，否则线宽计算会不准。

## 这个技术解决什么

这个案例适合路线、轨迹、可视化连线、测量工具和编辑器边框。

它解决的是“线在屏幕上看起来稳定有宽度”。

## 打开案例后看什么

- 调 linewidth，看屏幕空间线宽变化。
- resize 窗口时，注意为什么要更新 material.resolution。
- 理解它适合视觉线条，不是物理管道模型。

## 官网核心代码

```js
const geometry = new LineGeometry();
geometry.setPositions( positions );

matLine = new LineMaterial( {
  color: 0xffffff,
  linewidth: 5
} );

line = new Line2( geometry, matLine );
line.computeLineDistances();
scene.add( line );
```

## 这段代码到底在做什么

- 普通 THREE.Line 在很多平台上 linewidth 基本不可控。
- Line2/LineGeometry/LineMaterial 是 examples 里的粗线方案。
- linewidth 是屏幕空间宽度，不是世界单位宽度。
- resolution 用来把屏幕像素和线宽换算正确，窗口 resize 时必须更新。
- 粗线本质更像带宽度的几何条带，成本高于普通 Line。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new LineMaterial( { color: 0xffffff, linewidth: 5 } )` | `color` | 基础颜色或光源颜色。 |
| `new LineMaterial( { color: 0xffffff, linewidth: 5 } )` | `linewidth` | 线宽。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 改 linewidth | 线条宽度变化 |
| resize 后不更新 resolution | 线宽比例可能异常 |
| 切换世界单位/屏幕单位 | 理解不同线宽模式 |
| 增加线段数量 | 观察性能成本 |

## 学完能拿来做什么

- 地图路径
- 三维轨迹
- CAD 边线
- 流程连线
- 测距和标注工具

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
