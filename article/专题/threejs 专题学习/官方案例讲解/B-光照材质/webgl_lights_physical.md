# webgl_lights_physical.html｜Physical Lights：真实单位、灯泡、曝光和距离衰减

> 本地官方案例：[`webgl_lights_physical.html`](../../cases/webgl_lights_physical.html)  
> 本篇目标：学习 three.js 里物理灯光的整体链路：PointLight、HemisphereLight、真实 lumen/lux、decay=2、toneMappingExposure 和阴影。

## 先从现实问题说起

很多新手调灯光只会把 `intensity` 往大改，结果场景一会儿过曝，一会儿太暗，换个尺度又全错。

现实里的灯有功率、距离衰减、曝光。离灯越远越暗，灯泡越亮照得越远，相机曝光也会影响最终画面。

这个案例想让你建立“真实单位灯光”的整体感觉。

## 先把基础概念说清楚

- `PointLight` 可以像灯泡一样向四周发光。
- `decay: 2` 接近现实里的平方衰减，距离变远亮度会明显下降。
- `toneMappingExposure` 像相机曝光，影响最终画面明暗，不是某一盏灯本身。

## 这个技术解决什么

当你做室内灯泡、夜景、真实比例房间时，需要同时考虑灯的功率、距离、曝光和材质。

这个案例把灯泡、半球环境光、阴影和曝光放在一起，让你理解它们是一条链。

## 打开案例后看什么

- 调 bulbPower，看灯泡亮度和阴影范围的变化。
- 调 exposure，看最终画面整体变亮/变暗。
- 开关 shadows，看光还在但阴影消失时画面有什么差别。

## 官网核心代码

```js
bulbLight = new THREE.PointLight( 0xffee88, 1, 100, 2 );
bulbLight.castShadow = true;

hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 0.02 );

renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = Math.pow( params.exposure, 5.0 );

bulbLight.power = bulbLuminousPowers[ params.bulbPower ];
hemiLight.intensity = hemiLuminousIrradiances[ params.hemiIrradiance ];
```

## 这段代码到底在做什么

- PointLight 的 power 可以用 lumen 思考，比随便填 intensity 更接近现实。
- HemisphereLight 的 intensity 在这个案例中用环境照度 lux 做参考。
- decay=2 让光按真实平方反比衰减，所以距离非常重要。
- 曝光会影响最终画面亮度，但不改变灯本身的物理强度。
- 案例里的砖块 50cm、灯泡 50cm，是为了让真实光照单位有意义。

## 贴图为什么会有很多张

一个 PBR 材质通常不是只靠一张图片。不同图片会接到不同的材质通道上，共同决定最终效果。

| 贴图 | 接到哪里 | 作用 | 会不会覆盖别的贴图 |
|---|---|---|---|
| `hardwood2_diffuse.jpg` | `floorMat.map` | 地板的基础颜色和木纹图案 | 不会，只负责地板颜色 |
| `brick_diffuse.jpg` | `cubeMat.map` | 砖块的基础颜色和砖纹图案 | 不会，只负责砖块颜色 |
| `brick_bump.jpg` | `cubeMat.bumpMap` | 用灰度制造凹凸光影，看起来有砖缝起伏 | 不会，它只影响光照凹凸感 |
| `earth_atmos_2048.jpg` | `ballMat.map` | 球体表面的基础颜色和地球图案 | 不会，只负责球体颜色 |
| `earth_specular_2048.jpg` | `ballMat.metalnessMap` | 被这个案例用来控制球体不同区域的金属/反射强弱 | 不会，它是另一个材质通道 |

所以代码里连续写两次 `textureLoader.load()` 不是重复，也不是后一次覆盖前一次。回调里的 `map` 只是“当前刚加载完成的那张贴图”的局部变量名。真正决定贴图用途的是赋给了哪个材质属性：

```js
ballMat.map = colorMap;              // 颜色通道
ballMat.metalnessMap = metalnessMap; // 金属度通道
```

理解方式：同一个材质可以同时挂很多张贴图，因为它们控制的是不同通道，不是同一个东西。

| 通道 | 它控制什么 | 图片通常长什么样 | 和其他贴图的区别 |
|---|---|---|---|
| `map` | 表面基础颜色，也叫颜色贴图、漫反射贴图 | 正常彩色图片，比如地球、砖墙、木纹 | 只告诉材质“这里是什么颜色”，不负责凹凸、金属、粗糙 |
| `normalMap` | 表面每个像素的法线方向 | 偏蓝紫色的 RGB 图片 | 比 `bumpMap` 信息更完整，可以表现更复杂的细节方向；它不改变模型真实轮廓，只改变光照计算 |
| `bumpMap` | 表面高低起伏 | 黑白/灰度图 | 只用明暗表示“高低差”，比 `normalMap` 简单；适合砖缝、细小压纹这类轻微凹凸 |
| `roughnessMap` | 每个位置的粗糙度 | 黑白/灰度图 | 控制反光是清晰还是发散：白色更粗糙、更哑光，黑色更光滑、反射更锐 |
| `metalnessMap` | 每个位置的金属度 | 黑白/灰度图 | 控制哪里像金属：白色更金属，黑色更像塑料、石头、木头等非金属 |
| `alphaMap` | 每个位置的透明度 | 黑白/灰度图 | 控制哪里透明或被裁掉，常用于叶片、网格、贴花边缘 |
| `emissiveMap` | 每个位置的自发光 | 通常是彩色或灰度发光区域 | 不靠灯照也会亮，常用于屏幕、灯带、科幻纹路 |

举个直观例子：一面砖墙的 `map` 画出红砖颜色，`bumpMap` 或 `normalMap` 让砖缝看起来凹进去，`roughnessMap` 让水泥缝更哑光、砖面稍微反光，`metalnessMap` 通常全黑，因为砖墙不是金属。

> 额外注意：在标准 PBR 工作流里，`map` 这种颜色贴图通常使用 `THREE.SRGBColorSpace`；`bumpMap`、`metalnessMap` 这类数据贴图通常按线性数据理解。这个案例的重点是物理灯光和材质通道关系。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new THREE.PointLight( 0xffee88, 1, 100, 2 )` | `第 1 个参数：0xffee88` | color：点光源颜色。 |
| `new THREE.PointLight( 0xffee88, 1, 100, 2 )` | `第 2 个参数：1` | intensity：点光源强度。 |
| `new THREE.PointLight( 0xffee88, 1, 100, 2 )` | `第 3 个参数：100` | distance：光照影响距离，0 表示无限远。 |
| `new THREE.PointLight( 0xffee88, 1, 100, 2 )` | `第 4 个参数：2` | decay：距离衰减系数，2 接近真实平方衰减。 |
| `new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 0.02 )` | `第 1 个参数：0xddeeff` | skyColor：天空方向颜色。 |
| `new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 0.02 )` | `第 2 个参数：0x0f0e0d` | groundColor：地面方向颜色。 |
| `new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 0.02 )` | `第 3 个参数：0.02` | intensity：半球光强度。 |
| `bulbLight.castShadow = true` | `castShadow` | 是否投射阴影。 |
| `renderer.toneMapping = THREE.ReinhardToneMapping` | `toneMapping` | 色调映射方式，把高亮结果压缩到屏幕可显示范围。 |
| `renderer.toneMappingExposure = Math.pow( params.exposure, 5.0 )` | `toneMappingExposure` | 最终输出曝光值，影响画面明暗。 |
| `bulbLight.power = bulbLuminousPowers[ params.bulbPower ]` | `power` | 点光源总发光量，可按流明理解。 |
| `hemiLight.intensity = hemiLuminousIrradiances[ params.hemiIrradiance ]` | `intensity` | 灯光或效果强度。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 切 bulbPower | 灯泡真实亮度变化 |
| 切 hemiIrradiance | 环境底光从月夜到日光变化 |
| 调 exposure | 最终输出变亮或变暗 |
| 开关 shadows | 光还在但阴影消失 |

## 学完能拿来做什么

- 室内灯光模拟
- 产品棚拍
- 真实单位灯具配置器
- 建筑照明可视化
- 学习 PBR 曝光工作流

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
