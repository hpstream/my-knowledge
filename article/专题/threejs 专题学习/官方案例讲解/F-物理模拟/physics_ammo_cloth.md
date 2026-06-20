# physics_ammo_cloth.html｜Ammo Cloth：软体布料和锚点约束

> 本地官方案例：[`physics_ammo_cloth.html`](../../cases/physics_ammo_cloth.html)  
> 本篇目标：学习布料不是普通刚体，而是由很多软体节点组成；节点受重力、风、碰撞和锚点一起影响。

## 先从现实问题说起

布料不是一个硬物体。旗子、幕布、衣服会弯曲、摆动、被风吹、被锚点固定。

如果用普通刚体，布料只能像木板一样整体移动。

Ammo 软体布料用很多节点模拟布面变形。

## 先把基础概念说清楚

- `CreatePatch` 可以创建一张由软体节点组成的布。
- `appendAnchor` 把布的某些节点固定到刚体或世界位置。
- 每帧要把软体节点位置写回 BufferGeometry，渲染画面才会跟着变形。

## 这个技术解决什么

这个案例适合旗帜、布帘、软体片状物的物理原型。

它让你理解软体和刚体的区别：布不是一个 transform，而是一堆节点共同运动。

## 打开案例后看什么

- 看布料节点如何受重力、风和碰撞影响。
- 观察锚点位置为什么固定不动。
- 注意物理软体数据如何同步回 Three 几何。

## 官网核心代码

```js
const softBodyHelpers = new Ammo.btSoftBodyHelpers();

const clothSoftBody = softBodyHelpers.CreatePatch(
  physicsWorld.getWorldInfo(),
  clothCorner00, clothCorner01, clothCorner10, clothCorner11,
  clothNumSegmentsZ + 1, clothNumSegmentsY + 1, 0, true
);

clothSoftBody.appendAnchor( 0, arm.userData.physicsBody, false, influence );
physicsWorld.stepSimulation( deltaTime, 10 );
cloth.geometry.attributes.position.needsUpdate = true;
```

## 这段代码到底在做什么

- CreatePatch 用四个角和横纵分段创建一张软体布。
- 布料的每个分段交点都是物理节点，不是整张布作为一个刚体运动。
- appendAnchor 把布料上的某些节点固定到一个刚体上，比如挂在横杆上。
- influence 控制锚点影响强度，越强越像钉死，越弱越容易滑动或拉扯。
- stepSimulation 之后，Ammo 内部节点位置已经变化，需要同步回 Three 的 geometry。
- position.needsUpdate 和 normal.needsUpdate 告诉 Three 顶点和法线都变了，需要重新上传到 GPU。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

这个案例的核心片段主要展示调用顺序或对象关系，没有额外需要展开的数值参数。

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 看布料被横杆挂住 | 理解锚点不是光照或动画，而是物理约束 |
| 改变风力/重力 | 布料摆动幅度变化 |
| 改变分段数 | 布料更细腻但更耗性能 |
| 让球撞布 | 观察软体和刚体相互作用 |

## 学完能拿来做什么

- 做旗帜、窗帘、衣服、披风
- 做可被球撞动的软体幕布
- 做软体物理教学
- 扩展到角色衣摆或布料装饰
- 理解“顶点动画”和“物理软体”的区别

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
