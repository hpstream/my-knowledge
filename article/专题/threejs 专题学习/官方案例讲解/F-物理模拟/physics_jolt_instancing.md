# physics_jolt_instancing.html｜Jolt Instancing：Jolt 物理和 WebGPU 批量刚体

> 本地官方案例：[`physics_jolt_instancing.html`](../../cases/physics_jolt_instancing.html)  
> 本篇目标：学习 Jolt 物理引擎如何和 Three 的 InstancedMesh 结合，在大量相同物体上保持渲染和物理性能。

## 先从现实问题说起

大量物理物体如果每个都单独 Mesh 渲染，会很吃性能；但只做 instancing 又要保持每个物体有独立物理状态。

Jolt 物理和 Three 的实例化渲染结合，可以同时考虑物理和绘制效率。

这个案例讲 Jolt + InstancedMesh 的批量刚体同步。

## 先把基础概念说清楚

- 物理世界负责每个刚体的位置和旋转。
- InstancedMesh 负责把大量相同几何高效画出来。
- 每帧要把物理体 transform 写回实例矩阵。

## 这个技术解决什么

它适合大量箱子、球体、碎块等相同形状刚体。

目标是减少渲染成本，同时保留独立碰撞和物理运动。

## 打开案例后看什么

- 看每个实例是否有独立物理状态。
- 观察物理更新后如何同步到 instanced mesh。
- 区分物理性能和渲染性能是两件事。

## 官网核心代码

```js
import * as THREE from 'three/webgpu';
import { JoltPhysics } from 'three/addons/physics/JoltPhysics.js';

physics = await JoltPhysics();
physics.addScene( scene );

boxes.userData.physics = { mass: 1 };
physics.setMeshPosition( boxes, position, index );
```

## 这段代码到底在做什么

- 这个案例不是普通 WebGL，而是 three/webgpu，说明 Three 的物理辅助也可以服务新渲染管线。
- InstancedMesh 用一个几何体和材质画很多个实例，减少 draw call。
- userData.physics = { mass: 1 } 告诉物理封装这些实例是动态刚体。
- physics.addScene 会扫描场景，给带有 physics 配置的网格创建物理体。
- setMeshPosition 可以单独重置某个实例的位置，不需要把整个 InstancedMesh 拆成很多 Mesh。
- Jolt 常用于实时游戏物理，适合大量刚体、车辆、角色等高性能场景。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `physics.addScene( scene )` | `第 1 个参数：scene` | scene：交给物理封装同步的 Three 场景。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 看大量盒子和球同时掉落 | 物理数量很大但渲染仍能跑 |
| 改变实例数量 | 理解性能瓶颈来自渲染还是物理 |
| 随机重置位置 | 看单个实例的物理状态被更新 |
| 对比 Rapier instancing | 理解不同物理引擎 API 风格和性能取向 |

## 学完能拿来做什么

- 做大量砖块、碎石、掉落物
- 做 WebGPU 物理压测
- 做游戏里的可交互杂物堆
- 扩展成掉落模拟或碰撞沙盒
- 对比 Jolt 与 Rapier/Ammo 的工程适用性

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
