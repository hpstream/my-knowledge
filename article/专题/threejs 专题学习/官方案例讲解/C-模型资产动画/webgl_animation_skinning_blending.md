# webgl_animation_skinning_blending.html｜Skinning Blending：骨骼动画切换和混合

> 本地官方案例：[`webgl_animation_skinning_blending.html`](../../cases/webgl_animation_skinning_blending.html)  
> 本篇目标：学习角色 idle、walk、run 等多个动作如何平滑切换，避免从一个动作硬切到另一个动作。

## 先从现实问题说起

游戏角色不只是播放一个动作。它可能站立、走路、跑步、挥手，还要在动作之间平滑切换。

如果直接从一个动作跳到另一个动作，角色会抽一下，看起来很假。

这个案例讲骨骼动画的动作混合和权重控制。

## 先把基础概念说清楚

- 骨骼动画是骨头驱动网格变形，`SkinnedMesh` 负责把骨骼动作作用到模型上。
- `AnimationMixer` 管所有动作，`AnimationAction` 管某个动作片段。
- 动作权重像调音台音量，不同动作可以按比例混合。

## 这个技术解决什么

这个案例适合学习角色状态切换，比如 idle -> walk -> run。

真实项目里，动作切换通常都要淡入淡出，而不是瞬间替换。

## 打开案例后看什么

- 切换动作时看是否平滑过渡。
- 调权重时看多个动作如何叠加。
- 注意 mixer、action、clip 三者各自负责什么。

## 官网核心代码

```js
idleAction = mixer.clipAction( animations[ 0 ] );
walkAction = mixer.clipAction( animations[ 3 ] );
runAction = mixer.clipAction( animations[ 1 ] );

function setWeight( action, weight ) {
  action.enabled = true;
  action.setEffectiveTimeScale( 1 );
  action.setEffectiveWeight( weight );
}

executeCrossFade( startAction, endAction, duration );

let mixerUpdateDelta = timer.getDelta();
mixer.update( mixerUpdateDelta );
```

## 这段代码到底在做什么

- 骨骼动画通过骨骼姿态驱动蒙皮网格，角色表面跟着骨骼变形。
- idle、walk、run 是不同 AnimationClip，但它们作用在同一个角色骨架上。
- setEffectiveWeight 控制某个动作对最终姿态的贡献比例。
- crossFadeTo 会在一段时间内把旧动作权重降到 0，把新动作权重升到 1。
- 如果直接 stop 一个动作再 play 另一个动作，角色会明显跳变。
- 这个案例其实是角色动作状态机的基础，只是状态切换由 GUI 手动触发。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `mixer.clipAction( animations[ 0 ] )` | `第 1 个参数：animations[ 0 ]` | clip：要播放的动画片段。 |
| `mixer.clipAction( animations[ 3 ] )` | `第 1 个参数：animations[ 3 ]` | clip：要播放的动画片段。 |
| `mixer.clipAction( animations[ 1 ] )` | `第 1 个参数：animations[ 1 ]` | clip：要播放的动画片段。 |
| `mixer.update( mixerUpdateDelta )` | `第 1 个参数：mixerUpdateDelta` | delta：可选帧间隔；无参数时按控件/辅助对象内部状态更新。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 点击 idle/walk/run 切换 | 动作是否平滑过渡 |
| 改变 crossfade duration | 过渡快慢变化 |
| 调 blend weight | 两个动作可以混在一起 |
| 打开 skeleton helper | 看骨骼姿态如何驱动网格 |

## 学完能拿来做什么

- 做角色移动：站立、走、跑切换
- 做游戏角色动画状态机
- 做产品机械动作平滑切换
- 做动作预览工具
- 扩展成按速度自动混合 walk/run

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
