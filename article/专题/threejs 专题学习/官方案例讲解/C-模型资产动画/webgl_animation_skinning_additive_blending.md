# webgl_animation_skinning_additive_blending.html｜Additive Blending：叠加动画和表情/姿态层

> 本地官方案例：[`webgl_animation_skinning_additive_blending.html`](../../cases/webgl_animation_skinning_additive_blending.html)  
> 本篇目标：学习基础动作之上如何叠加额外动作，例如一边走路一边点头、摇头、摆姿势。

## 先从现实问题说起

有时你不想替换整个动作，只想在基础动作上叠加一点变化，比如角色站着时点头、挥手、上半身瞄准。

如果每种组合都做成完整动画，资产会越来越多。

Additive blending 解决的是“在基础动作上叠加局部/增量动作”的问题。

## 先把基础概念说清楚

- 普通 blending 更像多个完整动作之间混合。
- additive blending 更像在当前姿势上额外加一层偏移。
- 它常用于表情、呼吸、上半身动作、瞄准姿势等附加动作。

## 这个技术解决什么

这个案例帮助你理解为什么角色动画系统不是只播放单个 clip。

真实项目里，叠加动画可以减少资产数量，让动作组合更灵活。

## 打开案例后看什么

- 观察基础动作保持时，附加动作如何叠上去。
- 调 additive 动作权重，看影响从无到有。
- 分清“切换动作”和“叠加动作”是两种需求。

## 官网核心代码

```js
THREE.AnimationUtils.makeClipAdditive( clip );
clip = THREE.AnimationUtils.subclip( clip, clip.name, 2, 3, 30 );

const action = mixer.clipAction( clip );
additiveActions[ name ].action = action;

setWeight( settings.action, weight );
setWeight( action, settings.weight );
action.play();
```

## 这段代码到底在做什么

- 基础动作决定角色整体行为，例如 idle、walk、run。
- 叠加动作不是替换基础动作，而是在基础姿态上增加偏移，例如点头、摇头、上半身姿态。
- makeClipAdditive 把普通动画转换成“相对变化”，让它适合叠加。
- subclip 可以从一段长动画里截取某几帧作为单独姿态或短动作。
- 每个叠加动作有自己的权重，权重越大，对最终姿态影响越明显。
- 这就是很多游戏和虚拟人系统里“下半身走路，上半身做动作”的基础思想。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `mixer.clipAction( clip )` | `第 1 个参数：clip` | clip：要播放的动画片段。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 调 sneak/sad/agree/headShake 权重 | 叠加动作逐渐显现 |
| 同时调多个叠加动作 | 最终姿态是多层混合结果 |
| 切换基础动作 | 叠加层仍可作用在不同基础动作上 |
| 把权重调到 0 | 回到纯基础动画 |

## 学完能拿来做什么

- 做角色表情、点头、挥手、受击反应
- 做虚拟人一边走一边说话
- 做上半身动作和下半身移动分离
- 做动画编辑器里的动作层
- 扩展成 IK、瞄准、手持物动画

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
