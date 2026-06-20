# webgl_lights_hemisphere.html｜Hemisphere Light：天空光、地面反光和户外氛围

> 本地官方案例：[`webgl_lights_hemisphere.html`](../../cases/webgl_lights_hemisphere.html)  
> 本篇目标：学习半球光如何用天空色和地面色给户外模型补光，并与 DirectionalLight 共同形成自然日光。

## 先从现实问题说起

户外场景里，太阳不是唯一光源。天空会从上方给蓝白色柔光，地面也会从下方反弹一点颜色。

如果只用一盏 DirectionalLight，背光面可能太黑，模型会显得像棚拍硬光。

`HemisphereLight` 用一个简单办法模拟“上面天空、下面地面”的环境补光。

## 先把基础概念说清楚

- `skyColor` 是从上方来的颜色，`groundColor` 是从下方来的颜色。
- 半球光没有明确光线方向，不会投射阴影。
- 它通常和 `DirectionalLight` 配合：方向光负责太阳和阴影，半球光负责暗部不死黑。

## 这个技术解决什么

这个案例解决的是低成本户外氛围光，不是精确全局光照。

当你需要快速让户外模型更自然，又不想上复杂环境光方案时，可以先用 HemisphereLight。

## 打开案例后看什么

- 开关 HemisphereLight，看暗部是否被柔和抬亮。
- 调整 groundColor，看模型底部颜色如何变化。
- 观察 DirectionalLight 和 HemisphereLight 分别负责什么。

## 官网核心代码

```js
const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 2 );
hemiLight.color.setHSL( 0.6, 1, 0.6 );
hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
scene.add( hemiLight );

const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
dirLight.castShadow = true;
scene.add( dirLight );
```

## 这段代码到底在做什么

- hemiLight.color 是天空方向颜色，通常偏蓝。
- groundColor 是地面反弹颜色，草地可偏黄绿，雪地可偏冷白。
- HemisphereLight 没有精确方向，因此不投射阴影。
- DirectionalLight 和 HemisphereLight 配合，才能同时有暗部补光和明确投影。
- 天空球和 fog 是视觉环境，不等于半球光本身。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new THREE.HemisphereLight( 0xffffff, 0xffffff, 2 )` | `第 1 个参数：0xffffff` | skyColor：天空方向颜色。 |
| `new THREE.HemisphereLight( 0xffffff, 0xffffff, 2 )` | `第 2 个参数：0xffffff` | groundColor：地面方向颜色。 |
| `new THREE.HemisphereLight( 0xffffff, 0xffffff, 2 )` | `第 3 个参数：2` | intensity：半球光强度。 |
| `new THREE.DirectionalLight( 0xffffff, 3 )` | `第 1 个参数：0xffffff` | color：方向光颜色。 |
| `new THREE.DirectionalLight( 0xffffff, 3 )` | `第 2 个参数：3` | intensity：方向光强度。 |
| `dirLight.castShadow = true` | `castShadow` | 是否投射阴影。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 开关 HemisphereLight | 暗部补光变化 |
| 开关 DirectionalLight | 阴影和主光变化 |
| 改 groundColor | 底部反光颜色变化 |
| 改 fog 颜色 | 远处氛围变化 |

## 学完能拿来做什么

- 户外角色展示
- 自然风景
- 动物/车辆预览
- 低成本日光环境
- 天空地面色调控制

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
