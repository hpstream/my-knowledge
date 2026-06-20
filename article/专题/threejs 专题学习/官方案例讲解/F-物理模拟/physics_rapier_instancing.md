# physics_rapier_instancing.html｜Rapier Instancing：大量实例化刚体

> 本地官方案例：[`physics_rapier_instancing.html`](../../cases/physics_rapier_instancing.html)  
> 本篇目标：学习如何让成百上千个相同物体既用 InstancedMesh 高效渲染，又拥有独立物理状态。

## 先从现实问题说起

成百上千个箱子既要参与物理碰撞，又要高效渲染。

每个箱子一个 Mesh 会增加渲染成本；全部合成一个 Mesh 又失去独立物理状态。

Rapier + InstancedMesh 解决的是大量实例化刚体。

## 先把基础概念说清楚

- 每个实例有自己的物理刚体。
- InstancedMesh 共享几何和材质，用实例矩阵显示不同位置。
- 物理世界更新后，要把每个刚体的 transform 写回实例矩阵。

## 这个技术解决什么

它适合大量相同物体的物理场景，比如箱堆、砖块、碎块。

你同时获得实例化渲染性能和独立物理行为。

## 打开案例后看什么

- 观察大量物体是否保持独立碰撞。
- 看 applyImpulse 如何影响单个或一批刚体。
- 理解实例矩阵同步是渲染和物理连接点。

## 官网核心代码

```js
boxes = new THREE.InstancedMesh( geometryBox, material, 400 );
boxes.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
boxes.userData.physics = { mass: 1 };

spheres = new THREE.InstancedMesh( geometrySphere, material, 400 );
spheres.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
spheres.userData.physics = { mass: 1 };

physics.addScene( scene );
physics.applyImpulse( spheres, impulse, i );
physics.applyImpulse( boxes, impulse, i );
physics.setMeshPosition( boxes, position, index );
```

## 这段代码到底在做什么

- InstancedMesh 让很多相同模型共享几何体和材质，适合大数量物体。
- DynamicDrawUsage 表示 instanceMatrix 会频繁变化，提示 GPU 这份数据是动态更新的。
- userData.physics 给每个实例创建对应的物理体，而不是只给整个 InstancedMesh 一个碰撞体。
- applyImpulse(boxes, impulse, i) 对第 i 个实例施加冲量，所以每个实例可以独立被撞飞。
- setMeshPosition 可以把某个实例重新放到指定位置，常用于重置、刷怪、循环掉落。
- 这个案例的价值是把“很多东西”从视觉复制推进到真实可交互。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new THREE.InstancedMesh( geometryBox, material, 400 )` | `第 1 个参数：geometryBox` | geometry：所有实例共享的几何体。 |
| `new THREE.InstancedMesh( geometryBox, material, 400 )` | `第 2 个参数：material` | material：所有实例共享的材质。 |
| `new THREE.InstancedMesh( geometryBox, material, 400 )` | `第 3 个参数：400` | count：实例数量。 |
| `new THREE.InstancedMesh( geometrySphere, material, 400 )` | `第 1 个参数：geometrySphere` | geometry：所有实例共享的几何体。 |
| `new THREE.InstancedMesh( geometrySphere, material, 400 )` | `第 2 个参数：material` | material：所有实例共享的材质。 |
| `new THREE.InstancedMesh( geometrySphere, material, 400 )` | `第 3 个参数：400` | count：实例数量。 |
| `boxes.instanceMatrix.setUsage( THREE.DynamicDrawUsage )` | `第 1 个参数：THREE.DynamicDrawUsage` | usage：BufferAttribute 使用方式提示。 |
| `spheres.instanceMatrix.setUsage( THREE.DynamicDrawUsage )` | `第 1 个参数：THREE.DynamicDrawUsage` | usage：BufferAttribute 使用方式提示。 |
| `physics.addScene( scene )` | `第 1 个参数：scene` | scene：交给物理封装同步的 Three 场景。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 点击 SHAKE | 每个实例受到独立冲量 |
| 增加 count | 看性能下降来自物理还是渲染 |
| 修改 impulse | 散开的幅度变化 |
| 改成不同几何体 | 理解碰撞体生成和外观的关系 |

## 学完能拿来做什么

- 做大量可碰撞砖块、球池、碎石
- 做物理性能压测
- 做批量掉落、撒落、爆炸效果
- 做编辑器里的可交互散布物
- 扩展成实例化粒子和刚体混合系统

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
