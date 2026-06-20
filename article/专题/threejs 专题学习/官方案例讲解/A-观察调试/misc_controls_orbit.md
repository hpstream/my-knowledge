# misc_controls_orbit.html｜OrbitControls：围绕目标观察场景

> 本地官方案例：[`misc_controls_orbit.html`](../../cases/misc_controls_orbit.html)  
> 本篇目标：学习如何用鼠标围绕一个目标点观察 3D 场景，并理解阻尼、距离限制、垂直角度限制为什么影响操作手感。

## 先从现实问题说起

你做 3D 页面时，第一个会遇到的问题不是模型多复杂，而是用户怎么舒服地看它。

如果相机只能固定在一个角度，用户看不到背面；如果滚轮可以无限缩放，用户可能钻进模型里或者离得太远；如果拖动很生硬，整个页面会像调试工具，不像可用产品。

`OrbitControls` 解决的就是“围绕一个目标观察场景”的基础交互。你可以把它想成电商 3D 商品查看器：鼠标拖动转一圈，滚轮靠近/远离，但始终围绕商品中心。

## 先把基础概念说清楚

- `camera.position` 是相机站在哪里，`controls.target` 是相机一直看向哪里。很多新手会混淆这两个东西。
- `enableDamping` 是惯性手感，打开后必须每帧调用 `controls.update()`，否则阻尼不会持续生效。
- `minDistance/maxDistance` 像给用户设安全距离，`maxPolarAngle` 像限制相机不能翻到地面下面。

## 这个技术解决什么

这个案例让你看到 OrbitControls 不是“能拖动相机”这么简单，而是在控制观察中心、缩放范围、垂直角度和操作手感。

真实项目里，只要你做模型预览、地图观察、产品展示、编辑器视口，都会先遇到这些限制问题。

## 打开案例后看什么

- 拖动画面时，看相机是不是围绕固定目标转，而不是物体自己在转。
- 滚轮缩放时，看距离限制是否阻止相机过近或过远。
- 打开阻尼后，看为什么动画循环里必须持续 `controls.update()`。

## 官网核心代码

```js
controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 100;
controls.maxDistance = 500;
controls.maxPolarAngle = Math.PI / 2;

function animate() {
  controls.update();
  render();
}
```

## 这段代码到底在做什么

- 第一行把相机、canvas 和控制器绑定起来，鼠标事件会改变 camera 的位置和朝向。
- enableDamping 打开后，相机不会立即停下，会像有惯性一样慢慢衰减。
- 因为阻尼是逐帧计算的，所以动画循环里必须调用 controls.update。
- minDistance/maxDistance 是产品展示、模型查看器常用的防误操作限制。
- maxPolarAngle = PI/2 表示最多看平到地平线附近，不允许绕到地面下面。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new OrbitControls( camera, renderer.domElement )` | `第 1 个参数：camera` | camera：被控制的相机。 |
| `new OrbitControls( camera, renderer.domElement )` | `第 2 个参数：renderer.domElement` | domElement：接收鼠标/触摸事件的 DOM 元素。 |
| `controls.enableDamping = true` | `enableDamping` | 是否启用阻尼惯性；开启后需要每帧 controls.update()。 |
| `controls.dampingFactor = 0.05` | `dampingFactor` | 阻尼系数，影响 OrbitControls 惯性衰减速度。 |
| `controls.minDistance = 100` | `minDistance` | 相机离目标点最近距离。 |
| `controls.maxDistance = 500` | `maxDistance` | 相机离目标点最远距离。 |
| `controls.maxPolarAngle = Math.PI / 2` | `maxPolarAngle` | OrbitControls 最大垂直旋转角，常用来防止相机绕到地面下方。 |
| `controls.update( )` | `无参数` | delta：可选帧间隔；无参数时按控件/辅助对象内部状态更新。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 拖拽鼠标 | 相机围绕 target 转动 |
| 滚轮缩放 | 缩放被 minDistance/maxDistance 限制 |
| 注释 controls.update | 阻尼效果失效 |
| 修改 maxPolarAngle | 观察是否能绕到模型下方 |

## 学完能拿来做什么

- 模型预览器
- 产品展示页
- 三维编辑器基础视角
- 地图和建筑浏览器
- 任何需要“围着物体看”的工具

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
