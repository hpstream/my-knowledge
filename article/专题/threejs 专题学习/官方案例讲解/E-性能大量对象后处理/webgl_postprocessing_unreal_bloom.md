# webgl_postprocessing_unreal_bloom.html｜UnrealBloomPass：发光光晕为什么是后期，不是真灯

> 本地官方案例：[`webgl_postprocessing_unreal_bloom.html`](../../cases/webgl_postprocessing_unreal_bloom.html)  
> 本篇目标：学习 Bloom 如何让高亮区域在屏幕上向周围扩散，并区分它和真实照明的区别。

## 先从现实问题说起

霓虹灯、魔法能量、太阳边缘、科幻 UI 常常需要亮部向外扩散的光晕。

这个光晕不是物体真的照亮了别人，而是摄像机/后期看到高亮后产生的视觉扩散。

`Bloom` 解决的是“亮的地方在屏幕上发散发光”的效果。

## 先把基础概念说清楚

- `threshold` 决定哪些亮度会进入 bloom。
- `strength` 决定光晕强度。
- `radius` 决定光晕扩散范围。

## 这个技术解决什么

这个案例适合霓虹、能量体、发光 UI、游戏特效和产品高亮。

Bloom 不会产生真实照明，不会让旁边物体变亮，也不会产生阴影。

## 打开案例后看什么

- 调 threshold，看哪些区域开始产生光晕。
- 调 strength/radius，看光晕强度和范围。
- 分清 emissive 材质的亮和 Bloom 后期光晕的关系。

## 官网核心代码

```js
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2( window.innerWidth, window.innerHeight ),
  1.5,
  0.4,
  0.85
);

bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;
```

## 这段代码到底在做什么

- UnrealBloomPass 接收屏幕尺寸和初始 threshold/strength/radius。
- threshold 太低时普通亮面也会发光，画面会脏。
- strength 太高时光晕糊成一片。
- radius 控制扩散半径，不是灯光距离。
- 如果想让发光物体真的照亮周围，需要额外放 PointLight/SpotLight 或使用全局光照方案。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 )` | `第 1 个参数：new THREE.Vector2( window.innerWidth, window.innerHeight )` | resolution：后处理分辨率。 |
| `new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 )` | `第 2 个参数：1.5` | strength：泛光强度。 |
| `new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 )` | `第 3 个参数：0.4` | radius：泛光扩散半径。 |
| `new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 )` | `第 4 个参数：0.85` | threshold：进入泛光的亮度阈值。 |
| `new THREE.Vector2( window.innerWidth, window.innerHeight )` | `第 1 个参数：window.innerWidth` | x：横向分量。 |
| `new THREE.Vector2( window.innerWidth, window.innerHeight )` | `第 2 个参数：window.innerHeight` | y：纵向分量。 |
| `bloomPass.threshold = params.threshold` | `threshold` | 阈值，决定效果从什么亮度或强度开始生效。 |
| `bloomPass.strength = params.strength` | `strength` | 效果强度。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 调 threshold | 控制哪些亮部开始外溢 |
| 调 strength | 控制光晕强弱 |
| 调 radius | 控制光晕范围 |
| 关闭真实灯光 | Bloom 仍不照亮其他物体 |

## 学完能拿来做什么

- 霓虹灯
- 科幻能量核心
- 高亮选中状态
- 夜景灯牌
- 游戏技能特效

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
