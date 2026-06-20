# webgl_instancing_performance.html｜Instancing Performance：一万个对象为什么不该是一万个 Mesh

> 本地官方案例：[`webgl_instancing_performance.html`](../../cases/webgl_instancing_performance.html)  
> 本篇目标：学习 InstancedMesh 如何用一次 draw call 绘制大量相同几何，并比较普通 Mesh、merged geometry 和 instancing 的差别。

## 先从现实问题说起

一万个相同几何如果创建一万个 Mesh，浏览器要提交一万次绘制相关工作，性能很容易崩。

但很多场景里对象形状一样，只是位置、旋转、颜色不同。

`InstancedMesh` 解决的是“用少量 draw call 绘制大量重复对象”的问题。

## 先把基础概念说清楚

- InstancedMesh 共享同一份 geometry 和 material。
- 每个实例只额外存自己的 matrix、color 等差异数据。
- draw call 减少后，CPU 提交压力会明显下降。

## 这个技术解决什么

这个案例适合草地、树木、石头、货架、建筑窗格、海量重复装饰物。

如果每个对象拓扑完全不同，instancing 就不适合。

## 打开案例后看什么

- 比较普通 Mesh、合并几何、InstancedMesh 的性能差异。
- 看 setMatrixAt 如何给每个实例设置位置。
- 理解 instancing 省的是重复对象的绘制提交成本。

## 官网核心代码

```js
const mesh = new THREE.InstancedMesh( geometry, material, api.count );
const matrix = new THREE.Matrix4();

for ( let i = 0; i < api.count; i ++ ) {
  randomizeMatrix( matrix );
  mesh.setMatrixAt( i, matrix );
}

scene.add( mesh );
```

## 这段代码到底在做什么

- InstancedMesh 的第三个参数是实例数量。
- 每个实例通过 matrix 表示自己的位置、旋转和缩放。
- 所有实例共用一份 geometry 和 material，因此 GPU 提交成本低。
- 如果每个对象材质完全不同，instancing 的收益会降低。
- 案例的重点是性能对比，不是视觉复杂度。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new THREE.InstancedMesh( geometry, material, api.count )` | `第 1 个参数：geometry` | geometry：所有实例共享的几何体。 |
| `new THREE.InstancedMesh( geometry, material, api.count )` | `第 2 个参数：material` | material：所有实例共享的材质。 |
| `new THREE.InstancedMesh( geometry, material, api.count )` | `第 3 个参数：api.count` | count：实例数量。 |
| `mesh.setMatrixAt( i, matrix )` | `第 1 个参数：i` | index：实例编号。 |
| `mesh.setMatrixAt( i, matrix )` | `第 2 个参数：matrix` | matrix：该实例的变换矩阵。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 切换渲染方式 | 比较 FPS 和 draw call |
| 调 count | 观察数量增长的成本 |
| 开启/关闭动态更新 | 理解静态实例更便宜 |
| 改 material | 所有实例同时受影响 |

## 学完能拿来做什么

- 森林、草地、石头
- 城市窗户/建筑重复件
- 货架商品
- 粒子化物体
- 大规模可视化点阵

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
