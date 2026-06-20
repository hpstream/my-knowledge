# webgl_lights_spotlight.html｜SpotLight：锥形光、半影、投影纹理和阴影相机

> 本地官方案例：[`webgl_lights_spotlight.html`](../../cases/webgl_lights_spotlight.html)  
> 本篇目标：学习聚光灯的完整控制参数，包括 angle、penumbra、decay、distance、shadow.focus、map 和 helper。

## 先从现实问题说起

舞台灯、手电筒、车灯、投影灯都不是照亮全场，而是照亮一个锥形范围。

你经常需要控制光斑大小、边缘软硬、距离衰减、阴影范围，甚至让光斑带一张图案。

`SpotLight` 就是解决这种“定向锥形光”的工具。

## 先把基础概念说清楚

- `angle` 控制光锥开口，越大照亮范围越宽。
- `penumbra` 控制边缘软硬，越大边缘越柔。
- `map` 可以让聚光灯像投影仪一样投出纹理图案。

## 这个技术解决什么

这个案例适合学习一盏聚光灯的完整调试思路，而不是只看 `intensity`。

真实项目里，角色追光、展台重点光、车灯、投影光斑都需要这些参数。

## 打开案例后看什么

- 调 angle，看光斑范围如何变大变小。
- 调 penumbra，看光斑边缘从硬变软。
- 打开 helper，看光锥和阴影相机到底覆盖哪里。

## 官网核心代码

```js
spotLight = new THREE.SpotLight( 0xffffff, 100 );
spotLight.map = textures[ 'disturb.jpg' ];
spotLight.position.set( 2.5, 5, 2.5 );
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 1;
spotLight.decay = 2;
spotLight.castShadow = true;
spotLight.shadow.bias = - .003;
```

## 这段代码到底在做什么

- angle 越大，照亮范围越宽，但单位面积能量观感会更散。
- penumbra 越大，光斑边缘越柔。
- map 让聚光灯像投影仪一样带图案。
- shadow.focus 会影响阴影投射区域聚焦方式。
- bias 用于减轻阴影痤疮，但过大可能让阴影漂浮。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new THREE.SpotLight( 0xffffff, 100 )` | `第 1 个参数：0xffffff` | color：聚光灯颜色。 |
| `new THREE.SpotLight( 0xffffff, 100 )` | `第 2 个参数：100` | intensity：聚光灯强度。 |
| `spotLight.map = textures[ 'disturb.jpg' ]` | `map` | 基础颜色贴图，决定表面颜色和图案，不负责凹凸、粗糙或金属感。 |
| `spotLight.angle = Math.PI / 6` | `angle` | 聚光灯光锥开口角，数值越大照亮范围越宽。 |
| `spotLight.penumbra = 1` | `penumbra` | 聚光灯边缘软化比例。 |
| `spotLight.decay = 2` | `decay` | 灯光距离衰减系数。 |
| `spotLight.castShadow = true` | `castShadow` | 是否投射阴影。 |
| `spotLight.position.set( 2.5, 5, 2.5 )` | `第 1 个参数：2.5` | x：第一个分量。 |
| `spotLight.position.set( 2.5, 5, 2.5 )` | `第 2 个参数：5` | y：第二个分量。 |
| `spotLight.position.set( 2.5, 5, 2.5 )` | `第 3 个参数：2.5` | z：第三个分量。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 调 angle | 光斑扩大或缩小 |
| 调 penumbra | 边缘变软或变硬 |
| 切换 map | 光斑图案变化 |
| 打开 helpers | 看到光锥和阴影相机 |

## 学完能拿来做什么

- 舞台灯
- 手电筒
- 车灯
- 投影图案
- 局部强调光

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
