# physics_rapier_character_controller.html｜Rapier Character Controller：角色移动和碰撞避障

> 本地官方案例：[`physics_rapier_character_controller.html`](../../cases/physics_rapier_character_controller.html)  
> 本篇目标：学习角色不是直接改 mesh.position，而是让物理角色控制器计算可行移动，避免穿墙和穿地。

## 先从现实问题说起

角色移动不能简单改 mesh.position。直接改位置很容易穿墙、卡进地面、爬坡异常。

游戏角色需要先根据输入算想移动的方向，再让物理控制器判断这一步是否可行。

Rapier Character Controller 解决的是角色移动和碰撞避障。

## 先把基础概念说清楚

- 角色通常用胶囊碰撞体表示，比较适合人体轮廓。
- `computeColliderMovement` 根据期望移动和碰撞环境计算实际可移动量。
- `computedMovement` 是物理允许后的移动结果，不一定等于你输入的方向。

## 这个技术解决什么

它适合第三人称/第一人称角色、漫游、编辑器人物控制。

目标是让角色能走、能撞墙停下、能贴地，而不是穿模。

## 打开案例后看什么

- 按 WASD 时，看角色是否被墙和地面阻挡。
- 观察相机如何跟随角色。
- 理解输入方向和最终物理移动量之间的区别。

## 官网核心代码

```js
characterController = physics.world.createCharacterController( 0.01 );
characterController.setApplyImpulsesToDynamicBodies( true );
characterController.setCharacterMass( 3 );

characterController.computeColliderMovement( player.userData.collider, moveVector );
const translation = characterController.computedMovement();
position.x += translation.x;
```

## 这段代码到底在做什么

- 角色移动不能只写 player.position += speed，因为这样会穿过墙、坡、台阶和其他物体。
- CharacterController 会根据碰撞体和期望移动量，算出实际允许移动多少。
- 0.01 是 offset，给角色和环境之间留一点缝，减少卡住或贴面抖动。
- 胶囊体适合角色，因为上下圆滑，不容易被小台阶和边缘卡住。
- setApplyImpulsesToDynamicBodies(true) 让角色推开动态刚体，而不是只从刚体旁边滑过去。
- 最终同步的是 collider 的位置，再把可视化的 player mesh 放到 collider 位置上。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

这个案例的核心片段主要展示调用顺序或对象关系，没有额外需要展开的数值参数。

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 用 WASD 移动 | 角色会被地面和障碍限制 |
| 推动态方块 | 角色能把物理物体推开 |
| 调整 offset | 观察贴边、抖动、卡墙变化 |
| 修改角色质量 | 推物体能力会变化 |

## 学完能拿来做什么

- 做第一人称/第三人称漫游
- 做展厅、建筑、数字孪生中的可走动角色
- 做平台跳跃和避障游戏
- 做可推箱子的交互场景
- 扩展成跳跃、坡道、楼梯、地面检测

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
