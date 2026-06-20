# webgl_lights_rectarealight.html｜RectAreaLight：窗户、柔光箱和长条高光

> 本地官方案例：[`webgl_lights_rectarealight.html`](../../cases/webgl_lights_rectarealight.html)  
> 本篇目标：学习有面积的矩形光源如何形成柔和照明和宽高可控的高光形状。

## 先从现实问题说起

现实摄影里，柔光箱、窗户、灯带都不是一个点在发光，而是一整块面在发光。

点光源像小灯泡，容易有硬高光；面积越大的光源，高光形状和柔和感越明显。

`RectAreaLight` 解决的是“有宽高的发光面”带来的柔光和矩形高光。

## 先把基础概念说清楚

- `width` 和 `height` 不是 helper 的装饰尺寸，而是参与照明计算的发光面大小。
- 它适合窗户光、柔光箱、屏幕光、灯带和产品摄影高光。
- 它不适合做常规投影阴影；需要阴影时通常用 DirectionalLight、PointLight 或 SpotLight。

## 这个技术解决什么

这个案例让你看到同样是灯光，面积光和点光/聚光/方向光的用途不同。

当你做汽车、手机、玻璃瓶、金属产品展示时，RectAreaLight 的高光形状很有用。

## 打开案例后看什么

- 看白色 TorusKnot 上彩色矩形高光怎么随灯旋转。
- 改宽高时，看高光形状和柔和感变化。
- 记住 RectAreaLightHelper 只负责可视化位置，不负责照亮物体。

## 官网核心代码

```js
RectAreaLightUniformsLib.init();

rectLight1 = new THREE.RectAreaLight( 0xff0000, 5, 4, 10 );
rectLight1.position.set( - 5, 6, 5 );
scene.add( rectLight1 );
scene.add( new RectAreaLightHelper( rectLight1 ) );
```

## 这段代码到底在做什么

- RectAreaLight 的参数是 color、intensity、width、height。
- width/height 决定光源形状，也影响高光形状。
- RectAreaLightUniformsLib.init 是必要初始化。
- helper 是可视化矩形发光面，方便调方向和位置。
- 案例让三个面光旋转，是为了观察面光朝向变化对高光的影响。

## 和前面几种光有什么区别

`RectAreaLight` 的心智模型不是“一个点在发光”，而是“一个有宽高的矩形面在发光”。它更像摄影棚里的柔光箱、窗户、灯带或发光屏幕。

| 光源 | 你可以怎么理解 | 主要看什么 | 适合什么 |
|---|---|---|---|
| `PointLight` | 一个灯泡点向四周发光 | 位置、距离衰减、阴影 | 灯泡、蜡烛、小范围灯 |
| `SpotLight` | 手电筒/舞台灯的锥形光 | `angle`、`penumbra`、光斑、阴影 | 舞台追光、投影光斑、局部强调 |
| `DirectionalLight` | 很远的太阳，光线近似平行 | 方向、阴影范围 | 日光、户外主光 |
| `HemisphereLight` | 天空色和地面色的环境补光 | 暗部是否被抬亮 | 户外氛围、低成本补光 |
| `RectAreaLight` | 一个矩形发光面 | `width`、`height`、朝向、柔和高光形状 | 窗户光、柔光箱、灯带、屏幕光 |

所以这篇和前面的重点不一样：

- 前面的 `PointLight` 更像真实灯泡，核心是 `power/intensity`、`distance`、`decay` 和阴影。
- `HemisphereLight` 主要是全场补光，没有明确投影方向，也不会产生清晰阴影。
- `SpotLight` 是锥形范围，适合控制光斑大小和边缘软硬。
- `RectAreaLight` 多了 `width` 和 `height`，这两个值不是 helper 的装饰尺寸，而是真正参与照明计算的发光面尺寸。

看这个案例时，重点盯着白色 TorusKnot 上的彩色高光：矩形光旋转时，高光会跟着改变方向；如果把宽高改大，高光会更像一条宽的柔光带。这个效果在光滑材质上最明显，所以案例里材质用了 `roughness: 0`。

另外要分清：`RectAreaLightHelper` 只是把矩形光源画出来，方便你看它在哪里、朝哪边；它自己不负责照亮物体。`RectAreaLight` 本身也不适合拿来做常规投影阴影，Three.js 当前实现里它没有 shadow support。要投影阴影时，通常还是用 `DirectionalLight`、`PointLight` 或 `SpotLight`。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new THREE.RectAreaLight( 0xff0000, 5, 4, 10 )` | `第 1 个参数：0xff0000` | color：矩形面光颜色。 |
| `new THREE.RectAreaLight( 0xff0000, 5, 4, 10 )` | `第 2 个参数：5` | intensity：面光强度。 |
| `new THREE.RectAreaLight( 0xff0000, 5, 4, 10 )` | `第 3 个参数：4` | width：面光宽度。 |
| `new THREE.RectAreaLight( 0xff0000, 5, 4, 10 )` | `第 4 个参数：10` | height：面光高度。 |
| `rectLight1.position.set( - 5, 6, 5 )` | `第 1 个参数：- 5` | x：第一个分量。 |
| `rectLight1.position.set( - 5, 6, 5 )` | `第 2 个参数：6` | y：第二个分量。 |
| `rectLight1.position.set( - 5, 6, 5 )` | `第 3 个参数：5` | z：第三个分量。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 观察三个彩色面光 | 红绿蓝照明叠加 |
| 修改宽高 | 高光形状变化 |
| 改材质 roughness | 高光从尖锐变柔 |
| 隐藏 helper | 确认 helper 不参与真实照明 |

## 学完能拿来做什么

- 摄影棚柔光
- 窗户光
- 灯带/屏幕光
- 汽车和手机高光
- 产品展示棚拍

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
