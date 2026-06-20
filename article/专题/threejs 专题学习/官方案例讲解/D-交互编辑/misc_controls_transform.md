# misc_controls_transform.html｜TransformControls：编辑器里的移动、旋转、缩放手柄

> 本地官方案例：[`misc_controls_transform.html`](../../cases/misc_controls_transform.html)  
> 本篇目标：学习 3D 编辑器 gizmo 的基本实现：attach 目标对象、切换 translate/rotate/scale、世界/本地坐标和吸附。

## 先从现实问题说起

3D 编辑器里，用户需要像 Blender/Unity 一样移动、旋转、缩放选中对象。

普通拖拽只能把物体拉来拉去，不能精确沿轴移动，也不能切换本地/世界坐标。

`TransformControls` 就是编辑器里的 gizmo 手柄。

## 先把基础概念说清楚

- `attach(object)` 把控制器绑定到当前选中对象。
- `setMode` 切换 translate/rotate/scale。
- `setSpace` 切换 local/world，吸附参数可以让移动或旋转按步进发生。

## 这个技术解决什么

这个案例适合做编辑器、关卡工具、模型摆放工具。

它解决的是精确变换对象，不是普通相机观察，也不是简单点击拾取。

## 打开案例后看什么

- 切换移动/旋转/缩放模式，看 gizmo 形态变化。
- 切 local/world，看轴方向是否跟随物体旋转。
- 拖动 gizmo 时，注意 OrbitControls 为什么要暂停。

## 官网核心代码

```js
control = new TransformControls( currentCamera, renderer.domElement );
control.addEventListener( 'dragging-changed', function ( event ) {
  orbit.enabled = ! event.value;
} );

control.attach( mesh );
const gizmo = control.getHelper();
scene.add( gizmo );

control.setMode( 'translate' );
control.setSpace( control.space === 'local' ? 'world' : 'local' );
```

## 这段代码到底在做什么

- TransformControls 自身不是 mesh，它通过 getHelper 把控制手柄加入场景。
- attach(mesh) 表示当前编辑目标是这个 mesh。
- dragging-changed 为 true 时关闭 orbit，避免拖手柄时相机也旋转。
- translate/rotate/scale 是编辑器三大基础模式。
- local/world 决定坐标轴跟随物体旋转，还是保持世界坐标方向。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new TransformControls( currentCamera, renderer.domElement )` | `第 1 个参数：currentCamera` | camera：当前编辑视角相机。 |
| `new TransformControls( currentCamera, renderer.domElement )` | `第 2 个参数：renderer.domElement` | domElement：接收手柄事件的 DOM 元素。 |
| `control.attach( mesh )` | `第 1 个参数：mesh` | object：TransformControls 当前编辑目标。 |
| `control.setMode( 'translate' )` | `第 1 个参数：'translate'` | mode：TransformControls 模式，如 translate/rotate/scale。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 按 W/E/R | 切换移动、旋转、缩放 |
| 按 Q | 切换本地/世界坐标 |
| 按 Shift 拖动 | 启用吸附 |
| 按 X/Y/Z | 隐藏对应轴向手柄 |

## 学完能拿来做什么

- 模型编辑器
- 场景搭建器
- 关卡编辑器
- 室内设计工具
- 可视化配置平台

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
