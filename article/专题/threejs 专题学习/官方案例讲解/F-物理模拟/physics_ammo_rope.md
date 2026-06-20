# physics_ammo_rope.html｜Ammo Rope：绳索软体和两端连接

> 本地官方案例：[`physics_ammo_rope.html`](../../cases/physics_ammo_rope.html)  
> 本篇目标：学习绳子如何用软体线段模拟，并通过锚点连接到刚体，让球、杆和绳子形成联动系统。

## 先从现实问题说起

绳子不是硬杆，它会弯曲、下垂、被两端拉住，还会和连接的球或杆联动。

如果只用一根 Line 画出来，它不会有真实物理运动。

Ammo Rope 用软体线段模拟绳索。

## 先把基础概念说清楚

- `CreateRope` 创建由节点组成的软体绳。
- `appendAnchor` 把绳子端点连接到刚体。
- 绳子的视觉几何要每帧根据软体节点更新。

## 这个技术解决什么

这个案例适合吊绳、摆锤、牵引线、软连接系统。

它演示软体绳和刚体如何互相影响。

## 打开案例后看什么

- 看绳子两端如何连接到其他刚体。
- 观察球运动时绳子形状如何跟着改变。
- 理解绳子不是约束线的视觉效果，而是软体节点系统。

## 官网核心代码

```js
const ropeSoftBody = softBodyHelpers.CreateRope(
  physicsWorld.getWorldInfo(), ropeStart, ropeEnd,
  ropeNumSegments - 1, 0
);

ropeSoftBody.appendAnchor( 0, ball.userData.physicsBody, true, influence );
ropeSoftBody.appendAnchor( ropeNumSegments, arm.userData.physicsBody, true, influence );

physicsWorld.stepSimulation( deltaTime, 10 );
rope.geometry.attributes.position.needsUpdate = true;
```

## 这段代码到底在做什么

- CreateRope 创建的是一串软体节点，节点之间保持连接关系。
- 绳子一端锚到球上，另一端锚到杆上，所以球的重量会拉动绳子，杆的运动也会影响绳子。
- appendAnchor 的 true 表示锚点会影响连接刚体，系统不是单向视觉跟随。
- 每帧物理模拟后，代码读取软体节点位置，把它写回绳子的几何顶点。
- 绳子不是一根静态线，它是有重力、拉扯、碰撞响应的物理对象。
- 这个案例能帮你区分“用曲线画绳子”和“用物理模拟绳子”。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

这个案例的核心片段主要展示调用顺序或对象关系，没有额外需要展开的数值参数。

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 拖动或观察摆动 | 球、绳、杆互相影响 |
| 改变绳子段数 | 越多越柔顺但越耗性能 |
| 改变 influence | 两端连接更硬或更松 |
| 改变球质量 | 绳子下垂和摆动明显变化 |

## 学完能拿来做什么

- 做吊灯、摆锤、缆绳、桥索
- 做抓钩、绳索机关、秋千玩法
- 做物理教学里的摆动和张力演示
- 做工程场景中的缆索可视化
- 扩展到多段绳索和可断裂绳索

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
