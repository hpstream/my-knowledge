# webgl_points_sprites.html｜Points Sprites：什么时候不要用 Mesh

> 本地官方案例：[`webgl_points_sprites.html`](../../cases/webgl_points_sprites.html)  
> 本篇目标：学习用 Points 和贴图点精灵渲染大量小元素，而不是为每个点创建独立 Mesh。

## 先从现实问题说起

如果你要画成千上万个小点，比如星空、雪花、灰尘、粒子，用每个点一个 Mesh 太浪费。

很多小元素只是远处的视觉点，不需要真实体积和复杂光照。

`Points` 和点精灵解决的是“大量小元素低成本显示”的问题。

## 先把基础概念说清楚

- Points 里的每个顶点就是一个点。
- `PointsMaterial.size` 控制点大小，`map` 可以让点用一张小贴图显示。
- 它适合小而多的元素，不适合需要真实几何体积的对象。

## 这个技术解决什么

这个案例适合星空、粒子、远处人群点、数据散点。

它用 BufferGeometry 一次性提交大量点位置，比大量 Mesh 轻。

## 打开案例后看什么

- 看 geometry 的 position 属性如何存所有点。
- 调 size 和贴图时，看点精灵外观变化。
- 记住它是视觉点，不是每个点都有复杂碰撞和光照。

## 官网核心代码

```js
const geometry = new THREE.BufferGeometry();
geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

materials[ i ] = new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true } );
materials[ i ].color.setHSL( color[ 0 ], color[ 1 ], color[ 2 ], THREE.SRGBColorSpace );

const particles = new THREE.Points( geometry, materials[ i ] );
scene.add( particles );
```

## 这段代码到底在做什么

- BufferGeometry 里每三个数字是一点的 x/y/z。
- PointsMaterial 的 map 是每个点显示的贴图。
- Points 通常只有屏幕对齐的视觉面片，不是完整 3D 几何。
- size 控制点在屏幕中的大小，数量很多时比 Mesh 便宜。
- 如果要每个粒子独立旋转、受光、碰撞，Points 可能不够。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, trans` | `size` | 尺寸参数，常用于点精灵、helper 或控件。 |
| `new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, trans` | `map` | 基础颜色贴图，决定表面颜色和图案，不负责凹凸、粗糙或金属感。 |
| `new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, trans` | `blending` | 透明混合方式，影响粒子、发光或叠加效果。 |
| `new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, trans` | `depthTest` | 是否进行深度测试。 |
| `new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, trans` | `transparent` | 是否启用透明渲染流程。 |
| `new THREE.Points( geometry, materials[ i ] )` | `第 1 个参数：geometry` | geometry：点云几何数据。 |
| `new THREE.Points( geometry, materials[ i ] )` | `第 2 个参数：materials[ i ]` | material：点云材质。 |
| `geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) )` | `第 1 个参数：'position'` | name：属性名。 |
| `geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) )` | `第 2 个参数：new THREE.Float32BufferAttribute( vertices, 3 )` | attribute：BufferAttribute 数据。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 改 size | 点精灵变大变小 |
| 换 sprite 贴图 | 点的外观改变 |
| 增加顶点数量 | 观察性能 |
| 改透明度 | 理解排序和混合问题 |

## 学完能拿来做什么

- 星空
- 雪花/火花
- 点云
- 传感器点位
- 远处植被/装饰粒子

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
