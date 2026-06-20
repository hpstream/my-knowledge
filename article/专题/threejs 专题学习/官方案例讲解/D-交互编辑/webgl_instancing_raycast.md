# webgl_instancing_raycast.html｜InstancedMesh Raycast：大量实例里知道点中哪一个

> 本地官方案例：[`webgl_instancing_raycast.html`](../../cases/webgl_instancing_raycast.html)  
> 本篇目标：学习 Raycaster 命中 InstancedMesh 后如何通过 instanceId 找到具体实例，并修改单个实例的颜色或状态。

## 先从现实问题说起

大量重复物体用 InstancedMesh 可以省性能，但用户点击时，你还要知道点中的是第几个实例。

如果不能区分实例，就没法给单个对象高亮、选中或修改状态。

这个案例讲 Raycaster 命中 InstancedMesh 后如何拿到 `instanceId`。

## 先把基础概念说清楚

- InstancedMesh 的所有实例共享 geometry/material，但每个实例有自己的矩阵和可选颜色。
- Raycaster 命中实例时，结果里会带 `instanceId`。
- `setColorAt` 可以修改某个实例的颜色，修改后要设置 `instanceColor.needsUpdate`。

## 这个技术解决什么

它适合大量格子、树、建筑、座位、货架等重复对象的点击/悬停。

你既能保留 instancing 性能，又能对单个实例做交互反馈。

## 打开案例后看什么

- 鼠标移动时看被命中的单个实例如何变色。
- 观察代码如何从 intersection 里取 `instanceId`。
- 理解实例级交互不是创建一万个 Mesh。

## 官网核心代码

```js
const intersection = raycaster.intersectObject( mesh );
if ( intersection.length > 0 ) {
  const instanceId = intersection[ 0 ].instanceId;
  mesh.setColorAt( instanceId, color.setHex( Math.random() * 0xffffff ) );
  mesh.instanceColor.needsUpdate = true;
}
```

## 这段代码到底在做什么

- 普通 Mesh 命中后拿 object 就够了，InstancedMesh 还需要 instanceId 区分具体哪一个实例。
- setColorAt 不会创建新 material，只更新实例颜色 buffer。
- 修改实例矩阵或颜色后要标记 needsUpdate。
- 这比给每个对象创建独立 Mesh 更省 draw call。
- 业务状态可以用 instanceId 映射到自己的数据数组。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `raycaster.intersectObject( mesh )` | `第 1 个参数：mesh` | object：要检测的对象。 |
| `mesh.setColorAt( instanceId, color.setHex( Math.random() * 0xffffff ) )` | `第 1 个参数：instanceId` | index：实例编号。 |
| `mesh.setColorAt( instanceId, color.setHex( Math.random() * 0xffffff ) )` | `第 2 个参数：color.setHex( Math.random() * 0xffffff )` | color：实例颜色。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 移动鼠标到实例上 | 单个实例高亮 |
| 打印 instanceId | 确认点中的是哪个编号 |
| 修改 setMatrixAt | 移动单个实例 |
| 把实例数量加大 | 观察 draw call 仍然低 |

## 学完能拿来做什么

- 楼盘户型选择
- 仓库货架点选
- 大规模格子地图
- 粒子式对象选择
- 城市建筑批量交互

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
