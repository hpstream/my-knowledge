# physics_rapier_joints.html｜Rapier Joints：关节、链条和约束

> 本地官方案例：[`physics_rapier_joints.html`](../../cases/physics_rapier_joints.html)  
> 本篇目标：学习两个刚体之间如何通过关节连接，从而形成链条、吊挂、机械臂这类受约束的运动。

## 先从现实问题说起

链条、吊灯、机械臂、摆锤不是单个刚体，而是多个刚体通过关节连接。

没有关节约束，物体只会各自掉落，不能保持连接关系。

Rapier joints 解决的是刚体之间的受约束运动。

## 先把基础概念说清楚

- joint 像两个刚体之间的连接器。
- anchor1/anchor2 是连接点在各自刚体上的位置。
- 固定点通常用质量 0 的刚体，动态部分通过关节挂上去。

## 这个技术解决什么

这个案例适合链条、吊挂、机械结构、摆动物体。

它让你理解物理不是只有碰撞，还包括约束关系。

## 打开案例后看什么

- 看多个刚体如何通过 spherical joint 连接成链。
- 观察固定点和动态刚体的区别。
- 调阻尼时，看链条摆动是否更快停下。

## 官网核心代码

```js
const jointParams = physics.RAPIER.JointData.spherical(
  ( link == pivot ) ? new physics.RAPIER.Vector3( 0, - 0.5, 0 ) : new physics.RAPIER.Vector3( 0, - 1.15, 0 ), // Joint position in world space
  new physics.RAPIER.Vector3( 0, 1.15, 0 ) // Corresponding attachment on sphere
);

const body2 = mesh.userData.physics.body;
body2.setAngularDamping( 10.0 );

physics.world.createImpulseJoint( jointParams, body1, body2, true );
```

## 这段代码到底在做什么

- 关节不是把两个 mesh 放在一起，而是在物理世界里约束两个 body 的相对运动。
- spherical joint 类似球窝关节：连接点固定，但允许多个方向旋转。
- anchor1 和 anchor2 是两个刚体各自本地坐标里的连接点。
- 第一个固定球 mass 0，相当于链条挂在墙上或天花板上。
- 每一节链条通过关节连到上一节，多个局部约束形成整体链条行为。
- setAngularDamping 增加角阻尼，减少链条无限摆动，让运动更稳定。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new physics.RAPIER.Vector3( 0, - 0.5, 0 )` | `第 1 个参数：0` | x：横向分量。 |
| `new physics.RAPIER.Vector3( 0, - 0.5, 0 )` | `第 2 个参数：- 0.5` | y：纵向分量。 |
| `new physics.RAPIER.Vector3( 0, - 0.5, 0 )` | `第 3 个参数：0` | z：深度分量。 |
| `new physics.RAPIER.Vector3( 0, - 1.15, 0 )` | `第 1 个参数：0` | x：横向分量。 |
| `new physics.RAPIER.Vector3( 0, - 1.15, 0 )` | `第 2 个参数：- 1.15` | y：纵向分量。 |
| `new physics.RAPIER.Vector3( 0, - 1.15, 0 )` | `第 3 个参数：0` | z：深度分量。 |
| `new physics.RAPIER.Vector3( 0, 1.15, 0 )` | `第 1 个参数：0` | x：横向分量。 |
| `new physics.RAPIER.Vector3( 0, 1.15, 0 )` | `第 2 个参数：1.15` | y：纵向分量。 |
| `new physics.RAPIER.Vector3( 0, 1.15, 0 )` | `第 3 个参数：0` | z：深度分量。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 看链条摆动 | 每节都受上一节约束 |
| 改变阻尼 | 摆动更快停止或更持久 |
| 改变链条数量 | 约束越多越复杂 |
| 改变 anchor | 链条连接点和姿态会变化 |

## 学完能拿来做什么

- 做链条、吊桥、摆锤、机械连接
- 做物理机关和可拖拽约束
- 做车辆悬挂、门铰链、机械臂的基础
- 做吊灯、吊牌、绳索端点连接
- 扩展到 hinge/fixed/revolute 等不同关节

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
