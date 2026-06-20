# webgl_helpers.html｜Helpers：网格、极坐标网格和包围盒调试

> 本地官方案例：[`webgl_helpers.html`](../../cases/webgl_helpers.html)  
> 本篇目标：学习如何用 helper 建立空间方向感，并用 BoxHelper 看清对象、group 和整个 scene 的真实包围范围。

## 先从现实问题说起

新手做 3D 场景时，最容易迷失方向：地面在哪、模型有多大、中心点在哪、包围盒到底多宽。

如果你只看最终渲染画面，很多问题很难判断，比如模型是不是缩放错了、是不是离原点很远、group 里到底包了哪些对象。

Helper 的作用就是把这些看不见的调试信息画出来。

## 先把基础概念说清楚

- `GridHelper` 像地面方格纸，帮你建立尺度感。
- `PolarGridHelper` 像雷达圆环，帮你看环形距离和方向。
- `BoxHelper` 像给模型套一个透明纸箱，让你知道对象或整个 scene 的真实范围。

## 这个技术解决什么

这个案例解决的是“怎么调试空间关系”，不是做最终美术效果。

真实项目里，模型导入后大小不对、位置偏移、group 层级混乱时，helper 是最快的排查工具。

## 打开案例后看什么

- 看网格如何帮你判断模型在地面上的位置和尺度。
- 看 BoxHelper 包住单个对象、group、scene 时范围有什么变化。
- 记住 helper 是调试对象，不是业务模型，最终项目可以按需隐藏或删除。

## 官网核心代码

```js
const gridHelper = new THREE.GridHelper( 400, 40, 0x0000ff, 0x808080 );
scene.add( gridHelper );

loader.load( 'models/gltf/LeePerrySmith/LeePerrySmith.glb', function ( gltf ) {
  const mesh = gltf.scene.children[ 0 ];
  group.add( mesh );
  scene.add( new THREE.BoxHelper( mesh ) );
} );
```

## 这段代码到底在做什么

- GridHelper 的第一个参数是总尺寸，第二个参数是分段数量。
- BoxHelper 会根据对象当前世界矩阵计算包围盒，因此能快速发现模型尺寸过大、偏移或旋转异常。
- BoxHelper 包住 Group 时，会包含所有子对象。
- BoxHelper 包住 Scene 时，会把场景中所有可见对象作为整体范围。
- 项目上线通常隐藏 helper，但开发期应该大量使用它们。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new THREE.GridHelper( 400, 40, 0x0000ff, 0x808080 )` | `第 1 个参数：400` | size：网格总尺寸。 |
| `new THREE.GridHelper( 400, 40, 0x0000ff, 0x808080 )` | `第 2 个参数：40` | divisions：分割数量。 |
| `new THREE.GridHelper( 400, 40, 0x0000ff, 0x808080 )` | `第 3 个参数：0x0000ff` | colorCenterLine：中心线颜色。 |
| `new THREE.GridHelper( 400, 40, 0x0000ff, 0x808080 )` | `第 4 个参数：0x808080` | colorGrid：普通网格线颜色。 |
| `new THREE.BoxHelper( mesh )` | `第 1 个参数：mesh` | object：要计算包围盒的对象。 |
| `loader.load( 'models/gltf/LeePerrySmith/LeePerrySmith.glb', function ( gltf ) { const mesh = gltf.scene.childr` | `第 1 个参数：'models/gltf/LeePerrySmith/LeePerrySmith.glb'` | url：资源路径。 |
| `loader.load( 'models/gltf/LeePerrySmith/LeePerrySmith.glb', function ( gltf ) { const mesh = gltf.scene.childr` | `第 2 个参数：function ( gltf ) {   const mesh = gltf.scene.children[ 0 ];   group.add( mesh );   scene.add( new THREE.BoxHelper( mesh ) ); }` | onLoad：加载成功回调。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 看蓝色网格 | 判断地面大小和方向 |
| 看 BoxHelper | 判断模型是否偏离原点 |
| 把模型 scale 改大 | 观察包围盒跟着变大 |
| 给 group 加 helper | 观察多个子对象总范围 |

## 学完能拿来做什么

- 模型导入调试
- 自动居中前的尺寸检查
- 编辑器辅助线
- 碰撞体范围核对
- 场景坐标教学

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
