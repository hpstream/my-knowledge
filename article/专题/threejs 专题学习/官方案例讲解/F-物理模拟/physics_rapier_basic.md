# physics_rapier_basic.html｜Rapier Basic：最小刚体世界

> 本地官方案例：[`physics_rapier_basic.html`](../../cases/physics_rapier_basic.html)  
> 本篇目标：学习 Rapier 在 Three 中的最小接入方式：场景、地面、动态刚体、反弹系数和物理调试器。

## 先从现实问题说起

物理模拟最小要解决三件事：有重力、有碰撞、有物体能动。

新手常把 mesh.position 当成物理，结果物体会穿地、没有反弹、没有真实碰撞。

这个案例讲 Rapier 在 Three 里的最小刚体世界。

## 先把基础概念说清楚

- `RapierPhysics()` 初始化物理世界。
- 质量为 0 的物体通常是静态地面，质量大于 0 的物体会受力运动。
- `restitution` 控制反弹，调试 helper 可以显示碰撞体。

## 这个技术解决什么

它适合作为 Rapier 物理入门：先让球掉到地上并反弹。

后面的角色控制、车辆、关节、实例化刚体都建立在这个基础上。

## 打开案例后看什么

- 看哪些对象是静态刚体，哪些是动态刚体。
- 调 restitution，看反弹效果变化。
- 打开 helper，看碰撞体和可见 mesh 是否对齐。

## 官网核心代码

```js
physics = await RapierPhysics();
physics.addScene( scene );

floor.userData.physics = { mass: 0 };

physics.addMesh( mesh, 1, 0.5 );

physicsHelper = new RapierHelper( physics.world );
scene.add( physicsHelper );

if ( physicsHelper ) physicsHelper.update();
```

## 这段代码到底在做什么

- RapierPhysics 是 three/examples 里的官方辅助封装，帮你把 Three 网格和 Rapier 刚体连接起来。
- mass: 0 表示静态物体，地面不会被撞飞，但动态物体可以落在它上面。
- physics.addMesh(mesh, 1, 0.5) 给 mesh 创建质量为 1、反弹系数为 0.5 的刚体。
- 物体运动由 Rapier 计算，Three 每帧读取物理体的位置和旋转来显示。
- RapierHelper 显示碰撞体轮廓，用来检查“看到的模型”和“真实碰撞体”是否一致，每帧 update 才会跟上物理世界变化。
- 这是后续角色控制、车辆、关节、实例化物理的基础。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new RapierHelper( physics.world )` | `第 1 个参数：physics.world` | world：要可视化的 Rapier 物理世界。 |
| `physics.addScene( scene )` | `第 1 个参数：scene` | scene：交给物理封装同步的 Three 场景。 |
| `physics.addMesh( mesh, 1, 0.5 )` | `第 1 个参数：mesh` | mesh：要创建物理体的 Three 网格。 |
| `physics.addMesh( mesh, 1, 0.5 )` | `第 2 个参数：1` | mass：质量，0 常表示静态物体。 |
| `physics.addMesh( mesh, 1, 0.5 )` | `第 3 个参数：0.5` | restitution：反弹系数。 |
| `physicsHelper.update( )` | `无参数` | delta：可选帧间隔；无参数时按控件/辅助对象内部状态更新。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 生成盒子/球 | 观察重力、碰撞和反弹 |
| 把 restitution 改高 | 物体弹得更厉害 |
| 把质量改大 | 碰撞时惯性更强 |
| 打开 helper | 看碰撞体是否贴合模型 |

## 学完能拿来做什么

- 做掉落、堆叠、碰撞小游戏
- 给产品展示加简单物理互动
- 做物理教学的质量和反弹实验
- 作为角色、车辆、关节案例的起点
- 扩展成可拖拽物理积木

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
