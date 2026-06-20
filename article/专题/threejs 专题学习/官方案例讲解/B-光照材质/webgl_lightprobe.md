# webgl_lightprobe.html｜LightProbe：把一个位置的环境亮度压缩成补光

> 本地官方案例：[`webgl_lightprobe.html`](../../cases/webgl_lightprobe.html)  
> 本篇目标：用官方案例理解 LightProbe 不是灯泡，也不是反射贴图；它是从四周环境里提取“哪里亮、哪里暗、偏什么颜色”的柔和补光数据。

## 先从现实问题说起

现实里，一个白球放在蓝墙旁边，暗面会带一点蓝色；放在暖色木地板旁边，底部会有一点暖色。

但普通实时渲染不会自动计算所有光线反弹。如果只靠一盏灯，暗面很容易死黑；如果只靠环境贴图，亮面反射有了，暗面受光仍然可能不自然。

`LightProbe` 解决的是“暗面吃到一点周围环境补光”的问题。

## 先把基础概念说清楚

- `envMap` 更像让亮面“照镜子”，负责表面反射。
- `LightProbe` 更像在某个位置测了一圈周围亮度，压缩成柔和补光数据。
- 它不是灯泡，没有明确位置照射、距离衰减，也不会产生清晰阴影。

## 这个技术解决什么

这个案例帮助你分清三条路径：普通灯光负责方向和阴影，envMap 负责反射，LightProbe 负责柔和环境补光。

当场景暗面太死、又不想开昂贵全局光照时，LightProbe 是一种低成本近似。

## 打开案例后看什么

- 看球体暗面是否带一点环境颜色，而不是纯黑。
- 调 envMap 时主要看表面反射变化，调 LightProbe 时主要看暗面补光变化。
- 不要期待 LightProbe 做清晰投影或镜面倒影。

## 官网核心代码

```js
lightProbe = new THREE.LightProbe();
scene.add( lightProbe );

lightProbe.copy( LightProbeGenerator.fromCubeTexture( cubeTexture ) );
lightProbe.intensity = API.enableLightProbe ? API.lightProbeIntensity : 0;

gui.add( API, 'enableLightProbe' )
  .name( '补光开关' )

gui.add( API, 'lightProbeIntensity', 0, 1, 0.02 )
  .name( '补光强度' )

const material = new THREE.MeshStandardMaterial( {
  metalness: 0,
  roughness: 0,
  envMap: cubeTexture,
  envMapIntensity: API.envMapIntensity,
} );
```

## 这段代码到底在做什么

- new THREE.LightProbe 创建的不是一盏能看见位置的灯，它更像“这个点位的环境亮度记录器”。
- LightProbeGenerator.fromCubeTexture 会读取 cubeTexture 六个方向的画面，把复杂环境压缩成一份柔和补光数据。
- lightProbe.copy 把这份补光数据放进当前 LightProbe，材质受光时就能用它给暗面补一点来自环境的颜色。
- 同一个 cubeTexture 又被放进材质 envMap，这一条路径负责“表面能不能反射周围世界”。
- roughness 不会让物体自己发光，也不会制造环境；它只决定 envMap 反射是清楚还是模糊。
- 所以这个案例故意把 LightProbe 和 envMap 放在一起：你要观察它们分别影响“暗面受光”和“表面反射”。

## 先给结论

如果你只记一句话，记这个：

`envMap` 让亮面“看见周围”，`LightProbe` 让暗面“吃到环境光”，普通灯光负责明确方向、明暗和阴影。

读完这篇后，你至少应该能判断三件事：

- 看到金属球表面有环境倒影，优先去看 `envMap`，不是先怀疑 `LightProbe`。
- 看到背光面没有死黑，而是带一点环境颜色，才去看 `LightProbe` 或其他环境补光。
- 看到投影、灯光方向、距离衰减，去看 `DirectionalLight`、`PointLight`、`SpotLight`，不要指望 `LightProbe` 做这些。

## 先把容易混的几件事拆开

你觉得 LightProbe 难理解，不是因为你缺一个特别高级的前置知识，而是因为 Three.js 这里把几件很像的事放在了同一个画面里：

- 物体有没有颜色。
- 物体有没有被灯照亮。
- 物体表面能不能反射周围。
- 物体暗面能不能吃到环境里的柔和补光。

这四件事不是一个系统。

## 你说的蓝色影响，在 Three.js 默认不会自动发生

你这个理解放在真实世界里是对的：右边有一面蓝墙，中间放一个白色小球，现实里白球靠近蓝墙的一侧会带一点蓝。

原因是现实里光会来回反弹：

- 灯光或太阳先照到蓝墙。
- 蓝墙吸收一部分光，反射出偏蓝的光。
- 这些偏蓝的反射光再照到白球。
- 所以白球暗面会被蓝墙“染”一点蓝。

这叫间接光，也可以理解成颜色反弹。

但 Three.js 普通实时渲染默认不会自动算这一步。默认情况下，蓝墙只是一个有蓝色材质的物体，它不会自动把蓝色光反弹到白球上。

也就是说，在 Three.js 里你放：

- 一个蓝色墙面
- 一个白色小球
- 一盏普通灯

白球不会因为旁边有蓝墙就自然变蓝。除非你额外做了某种“环境光/间接光”的方案。

这些方案包括：

| 方案 | 能不能让白球受蓝墙影响 | 代价和特点 |
|---|---|---|
| 手动加一盏偏蓝的弱光 | 可以模拟 | 最简单，但是假，需要你自己调 |
| `HemisphereLight` | 只能做天地两色的粗略补光 | 不能知道右边有蓝墙 |
| `LightProbe` | 可以近似记录某个位置周围的柔和颜色影响 | 适合暗面补光，不产生清晰阴影 |
| `LightProbeGrid` | 可以让不同位置吃到不同环境补光 | 适合角色在房间里移动 |
| `lightMap` / 烘焙贴图 | 可以很像真实间接光 | 静态场景常用，不能随便动态变化 |
| 路径追踪 / 全局光照 | 最接近真实反弹 | 成本高，不是普通 examples 默认路线 |

所以这句话要反过来记：

真实世界里，蓝墙影响白球是自然发生的。

Three.js 默认实时渲染里，蓝墙影响白球不会自然发生。你必须用灯光、环境贴图、LightProbe、LightMap、烘焙或全局光照方案主动补上。

这也是为什么 `LightProbe` 存在：它不是为了替代蓝墙，也不是为了做镜面反射，而是为了把“这个位置周围环境对物体暗面的柔和影响”保存下来，再交给材质使用。

## 一个现实类比

想象你拿一个白色石膏球放在房间中央：

- 房间左边有窗户，所以球左侧偏亮。
- 右边是深色柜子，所以球右侧偏暗。
- 地板是木色，所以球底部可能有一点暖色反弹。
- 天花板是白的，所以上方有一点柔和亮度。

`LightProbe` 记录的就是这种“这个位置周围大概哪里亮、哪里暗、偏什么颜色”的信息。它不是一张照片，也不是一盏灯泡，而是一份被压缩过的环境补光数据。

如果一定要给它一个现实身份，它更像“在这个点位用仪器测了一圈环境亮度，然后把测量结果保存下来”。

## 它和 envMap / roughness 的区别

所以你可以这样分：

| 能力 | 主要解决什么 | 现实类比 |
|---|---|---|
| `envMap` | 表面反射周围世界 | 金属球、玻璃、亮面车漆上看到房间或天空 |
| `roughness` | 控制反射清晰还是模糊 | 抛光金属很清楚，磨砂金属很糊 |
| `HemisphereLight` | 用天空色和地面色给全场补光 | 户外阴天：上面偏蓝，下面受地面反弹偏暖 |
| `LightProbe` | 保存某个位置周围多方向的柔和补光 | 房间左边窗户亮、右边墙暗、地面偏暖，这些被压缩保存 |
| `DirectionalLight / PointLight / SpotLight` | 明确光源、方向、距离、阴影 | 太阳、灯泡、手电筒 |

## 为什么 HemisphereLight 不够

`HemisphereLight` 只有两个大方向：上面一个颜色，下面一个颜色。

这很适合模拟阴天户外：天空整体亮一点，地面整体反弹一点。但它不知道“左边有一扇很亮的窗户，右边有一面红墙”。`LightProbe` 可以从 cube map 或预计算结果里提取更多方向的柔和亮度，所以比半球光更像“某个具体位置的环境”。

注意它仍然是柔和补光。它不能表示清晰的窗框影子，不能产生投影，也不能像镜子一样显示清晰画面。

## 为什么已经有 envMap 还要 LightProbe

因为它们走的是不同感知路径：

- `envMap` 更影响镜面反射和 PBR 高光。
- `LightProbe` 更影响柔和的环境漫反射受光。

你可以把它们分工记成一句话：

`envMap` 让亮面“看见周围”，`LightProbe` 让暗面“吃到环境光”。

真实项目里常见组合是：`scene.environment` 或材质 `envMap` 负责反射质感，`LightProbe` 或 probe volume 负责空间环境补光，再用 `DirectionalLight`、`SpotLight` 或 `PointLight` 做明确主光和阴影。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new THREE.MeshStandardMaterial( { metalness: 0, roughness: 0, envMap: cubeTexture, envMapIntensity: API.envMap` | `metalness` | 金属度，越高越像金属。 |
| `new THREE.MeshStandardMaterial( { metalness: 0, roughness: 0, envMap: cubeTexture, envMapIntensity: API.envMap` | `roughness` | 粗糙度，越高反射越散。 |
| `new THREE.MeshStandardMaterial( { metalness: 0, roughness: 0, envMap: cubeTexture, envMapIntensity: API.envMap` | `envMap` | 环境贴图，控制反射来源。 |
| `new THREE.MeshStandardMaterial( { metalness: 0, roughness: 0, envMap: cubeTexture, envMapIntensity: API.envMap` | `envMapIntensity` | 环境反射强度。 |
| `lightProbe.intensity = API.enableLightProbe ? API.lightProbeIntensity : 0` | `intensity` | 灯光或效果强度。 |
| `lightProbe.copy( LightProbeGenerator.fromCubeTexture( cubeTexture ) )` | `第 1 个参数：LightProbeGenerator.fromCubeTexture( cubeTexture )` | source：复制来源。 |
| `gui.add( API, 'enableLightProbe' )` | `enableLightProbe` | enableLightProbe 是这个核心片段里的业务参数。 |
| `gui.add( API, 'lightProbeIntensity', 0, 1, 0.02 )` | `lightProbeIntensity` | LightProbe 环境补光强度。 |
| `gui.add( API, 'lightProbeIntensity', 0, 1, 0.02 )` | `0 到 1` | GUI 滑条范围。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 关闭补光开关 | 主要看球体暗面是否变黑、环境颜色是否少了，不要看镜面反射 |
| 调补光强度 | 主要看球体暗面和哑光区域变化 |
| 调 envMap | 主要看光滑表面反射强弱变化 |
| 关闭直接光 | probe 对暗部的补光更明显 |
| 把 roughness 改高 | envMap 镜面反射会变糊，但这不是 LightProbe 的作用 |
| 对比 HemisphereLight | 半球光只有天地两色，probe 能从 cubeTexture 提取更多方向的柔和环境色 |

## 学完能拿来做什么

- 环境补光
- AR 光照估计
- 室内低频照明
- 大场景区域光照
- 让移动角色在不同房间获得不同环境明暗
- 与 HDR environment 配合：envMap 管反射，LightProbe 管柔和环境受光

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
