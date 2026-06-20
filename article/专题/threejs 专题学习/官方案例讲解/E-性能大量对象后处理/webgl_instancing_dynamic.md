# webgl_instancing_dynamic.html｜Dynamic Instancing：大量实例动起来时要更新什么

> 本地官方案例：[`webgl_instancing_dynamic.html`](../../cases/webgl_instancing_dynamic.html)  
> 本篇目标：学习实例矩阵每帧变化时如何更新 instanceMatrix，并理解 DynamicDrawUsage 的意义。

## 先从现实问题说起

大量相同物体如果每个都建一个 Mesh，CPU 和 draw call 会吃不消。

InstancedMesh 可以高效画很多实例，但如果这些实例每帧都动起来，就必须更新实例矩阵。

这个案例讲动态 instancing 每帧要更新什么。

## 先把基础概念说清楚

- `setMatrixAt` 写入某个实例的变换矩阵。
- `instanceMatrix.needsUpdate = true` 通知 GPU 重新上传矩阵数据。
- `DynamicDrawUsage` 告诉底层这个 buffer 会频繁改变。

## 这个技术解决什么

它适合大量重复物体需要运动的场景，比如粒子式物件、群体、动态阵列。

它比每个物体一个 Mesh 便宜，但比静态 instancing 更贵。

## 打开案例后看什么

- 看每帧如何循环更新所有实例矩阵。
- 注意 needsUpdate 不写时 GPU 不知道数据变了。
- 区分静态实例和动态实例的性能差异。

## 官网核心代码

```js
mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );

for ( let i = 0; i < mesh.count; i ++ ) {
  dummy.position.set( offset - x, 0, offset - z );
  dummy.updateMatrix();
  mesh.setMatrixAt( i, dummy.matrix );
}

mesh.instanceMatrix.needsUpdate = true;
```

## 这段代码到底在做什么

- DynamicDrawUsage 是给 WebGL 的提示：这个 buffer 会经常被改。
- dummy Object3D 用来方便生成 position/rotation/scale 对应的矩阵。
- setMatrixAt 只改 CPU 侧数据，needsUpdate 才会触发上传。
- 如果只改一部分实例，也要考虑上传成本。
- 大量动态实例适合模拟鱼群、弹幕、运动粒子等重复对象。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage )` | `第 1 个参数：THREE.DynamicDrawUsage` | usage：BufferAttribute 使用方式提示。 |
| `dummy.position.set( offset - x, 0, offset - z )` | `第 1 个参数：offset - x` | x：第一个分量。 |
| `dummy.position.set( offset - x, 0, offset - z )` | `第 2 个参数：0` | y：第二个分量。 |
| `dummy.position.set( offset - x, 0, offset - z )` | `第 3 个参数：offset - z` | z：第三个分量。 |
| `mesh.setMatrixAt( i, dummy.matrix )` | `第 1 个参数：i` | index：实例编号。 |
| `mesh.setMatrixAt( i, dummy.matrix )` | `第 2 个参数：dummy.matrix` | matrix：该实例的变换矩阵。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 暂停更新 | 实例停止运动 |
| 删除 needsUpdate | CPU 改了但画面不更新 |
| 增加 count | 观察动态上传压力 |
| 改 DynamicDrawUsage | 理解这是性能提示不是功能开关 |

## 学完能拿来做什么

- 鱼群/鸟群
- 大规模弹幕
- 运动传感点
- 粒子替代 mesh
- 动态城市交通可视化

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
