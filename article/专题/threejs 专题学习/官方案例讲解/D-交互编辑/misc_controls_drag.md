# misc_controls_drag.html｜DragControls：直接拖拽 3D 物体

> 本地官方案例：[`misc_controls_drag.html`](../../cases/misc_controls_drag.html)  
> 本篇目标：学习如何让鼠标拖动物体，并理解拖拽控制和 OrbitControls 为什么需要互斥。

## 先从现实问题说起

很多工具需要直接拖动物体，比如摆放家具、拖拽零件、调整场景里的简单物体。

如果自己从鼠标坐标算 3D 位置，会涉及相机、射线、平面投影，容易出错。

`DragControls` 提供了基础的拖拽物体能力。

## 先把基础概念说清楚

- DragControls 需要一组可拖拽物体、相机和 renderer DOM。
- 拖拽时通常要暂停 OrbitControls，避免一边拖物体一边转相机。
- 它适合简单拖拽，不是完整编辑器里的移动/旋转/缩放 gizmo。

## 这个技术解决什么

这个案例适合快速实现“鼠标拖动物体”的基础交互。

如果你需要轴向移动、旋转、缩放和吸附，应该看 TransformControls。

## 打开案例后看什么

- 拖拽物体时看相机控制是否被暂时禁用。
- 观察 dragstart/drag/dragend 事件分别适合做什么。
- 理解拖拽发生在和相机视角相关的空间里。

## 官网核心代码

```js
controls = new DragControls( [ ... objects ], camera, renderer.domElement );
controls.rotateSpeed = 2;
controls.addEventListener( 'drag', render );
document.addEventListener( 'click', onClick );
window.addEventListener( 'keydown', onKeyDown );
window.addEventListener( 'keyup', onKeyUp );
```

## 这段代码到底在做什么

- objects 是允许拖拽的对象列表，不在列表里的物体不会响应。
- 拖拽时如果 OrbitControls 仍然启用，鼠标移动会同时拖物体和转相机，交互会冲突。
- DragControls 更适合自由拖动物体，不负责精确轴向移动。
- 如果要像 Blender/编辑器那样按轴移动，需要 TransformControls。
- 拖拽后对象 position 已经改变，可以持久化到你的业务数据。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new DragControls( [ ... objects ], camera, renderer.domElement )` | `第 1 个参数：[ ... objects ]` | objects：允许拖拽的对象数组。 |
| `new DragControls( [ ... objects ], camera, renderer.domElement )` | `第 2 个参数：camera` | camera：用于鼠标映射的相机。 |
| `new DragControls( [ ... objects ], camera, renderer.domElement )` | `第 3 个参数：renderer.domElement` | domElement：接收事件的 DOM 元素。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 拖动对象 | 物体位置改变 |
| 拖拽时转动相机 | 被禁用避免冲突 |
| 把对象从数组移除 | 对象不能被拖拽 |
| 换成 TransformControls | 对比轴向编辑能力 |

## 学完能拿来做什么

- 简单搭建器
- 室内家具摆放
- 教学拖动物体
- 2.5D 编辑工具
- 关卡原型编辑

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
