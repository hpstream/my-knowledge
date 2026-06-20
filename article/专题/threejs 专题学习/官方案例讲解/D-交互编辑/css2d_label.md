# css2d_label.html｜CSS2DRenderer：把 HTML 标签贴到 3D 坐标上

> 本地官方案例：[`css2d_label.html`](../../cases/css2d_label.html)  
> 本篇目标：学习如何让普通 DOM 跟随 3D 对象移动，用于标注、热点、名称牌和信息浮层。

## 先从现实问题说起

3D 场景里经常需要给物体加文字标签，比如地图点位、设备名称、人物姓名。

如果用 3D 文字，排版、清晰度和交互都麻烦；如果直接用 HTML，又要跟着 3D 位置走。

`CSS2DRenderer` 解决的是“让 HTML 标签绑定到 3D 物体位置”的问题。

## 先把基础概念说清楚

- `CSS2DObject` 把一个 DOM 元素包装成 3D 对象。
- `CSS2DRenderer` 负责把这些 DOM 标签投影到屏幕位置。
- 它适合纯文字/简单标签，不负责 3D 遮挡和复杂光照。

## 这个技术解决什么

这个案例适合做标注、信息牌、地图标签、设备名称。

它让你保持 HTML/CSS 的排版优势，同时跟随 3D 场景移动。

## 打开案例后看什么

- 旋转相机时，看标签是否跟着 3D 物体位置移动。
- 理解 WebGLRenderer 画 3D，CSS2DRenderer 画 HTML 标签。
- 注意标签是 DOM 层，不是真正的 mesh。

## 官网核心代码

```js
const earthDiv = document.createElement( 'div' );
earthDiv.className = 'label';
earthDiv.textContent = 'Earth';
const earthLabel = new CSS2DObject( earthDiv );
earthLabel.position.set( 1.5 * EARTH_RADIUS, 0, 0 );
earth.add( earthLabel );

labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( labelRenderer.domElement );
```

## 这段代码到底在做什么

- CSS2DObject 本质是一个 Object3D，所以可以 add 到 mesh 或 group 上。
- 标签的 position 是相对父对象的局部坐标。
- CSS2DRenderer 渲染 DOM，不渲染 WebGL，因此它要和 WebGLRenderer 同步尺寸。
- OrbitControls 通常绑定到 labelRenderer.domElement 或 renderer.domElement，避免 DOM 层挡住交互。
- 如果需要 3D 遮挡、旋转、缩放，需要考虑 CSS3DRenderer 或 Sprite。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `earthLabel.position.set( 1.5 * EARTH_RADIUS, 0, 0 )` | `第 1 个参数：1.5 * EARTH_RADIUS` | x：第一个分量。 |
| `earthLabel.position.set( 1.5 * EARTH_RADIUS, 0, 0 )` | `第 2 个参数：0` | y：第二个分量。 |
| `earthLabel.position.set( 1.5 * EARTH_RADIUS, 0, 0 )` | `第 3 个参数：0` | z：第三个分量。 |
| `labelRenderer.setSize( window.innerWidth, window.innerHeight )` | `第 1 个参数：window.innerWidth` | width：宽度。 |
| `labelRenderer.setSize( window.innerWidth, window.innerHeight )` | `第 2 个参数：window.innerHeight` | height：高度。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 拖动相机 | 标签跟随 3D 位置移动 |
| 改 label position | 标签相对模型偏移 |
| 隐藏 WebGL canvas | 标签仍是普通 DOM |
| 缩放窗口 | 两个 renderer 都必须 resize |

## 学完能拿来做什么

- 地图点位标签
- 产品部件说明
- 知识图谱热点
- 建筑楼层标注
- 设备状态面板

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
