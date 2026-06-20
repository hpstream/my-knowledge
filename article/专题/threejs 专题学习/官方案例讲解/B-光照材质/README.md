# B｜光照材质

这个目录只放 three.js 官网 examples 的逐篇讲解。每篇文档对应一个本地官方 HTML 案例，文件名保持官网原名。

## 环境贴图和 PBR 材质先用白话分清

先不要把红框里的案例当成一堆文件名看。它们其实是在讲一条完整链路：

**周围环境长什么样 -> 物体表面怎么反射/透光 -> 最后画面怎么压到屏幕上。**

你可以把它想成拍产品照片：

1. 房间、天空、摄影棚灯箱，是“环境”。
2. 产品是金属、玻璃、塑料、车漆，是“材质”。
3. 相机曝光、后期调色，是“tone mapping”。

Three.js 里也差不多：

- `envMap` / `scene.environment`：给物体一个“周围世界”，让金属、玻璃、亮面塑料能反射环境。
- `PMREM`：把环境图提前做成很多档“清晰/模糊版本”，这样 `roughness` 粗糙的物体可以反射模糊环境，光滑物体可以反射清楚环境。
- `MeshPhysicalMaterial`：决定物体自己是什么材质，比如清漆、玻璃、透明塑料。
- `toneMapping`：所有光照和材质都算完以后，决定最终画面显示到屏幕上是亮、暗、灰，还是高光有层次。

### 不是给 scene 设置一张 map 就够了吗

如果只是让物体“有环境反射”，你记住一行确实就能先跑起来：

```js
scene.environment = texture;
```

但这行只回答一个问题：**物体反射/受环境光时，周围世界用哪张图。**

红框里的其他概念不是都在重复这件事，它们分别在回答别的问题：

| 概念 | 白话理解 | 它解决的问题 |
|---|---|---|
| `scene.background` | 背景图 | 摄像机背后显示什么。只负责“看见的背景”，不等于所有材质都自动有真实反射。 |
| `scene.environment` | 全场默认环境反射/环境光 | PBR 材质默认从哪里取环境反射。金属、玻璃、亮面塑料主要看这个。 |
| `material.envMap` | 某一个材质单独指定环境图 | 只想让某个物体用不同环境反射时用它。 |
| `CubeTexture` | 6 张图拼成一个周围世界 | 老派天空盒/环境贴图格式：前后左右上下各一张。 |
| `EquirectangularTexture` | 一张 360 度全景图 | 现在很常见的 HDRI/全景环境图格式。 |
| `HDR / LDR` | 亮度范围高/低 | HDR 能保存太阳、灯泡这种很亮的信息；LDR 普通图片亮度范围小。 |
| `PMREM` | 把环境图加工成“适合粗糙度采样”的版本 | 光滑材质反射清楚，粗糙材质反射模糊；没有 PMREM，PBR 反射会不自然。 |
| `.pmrem.ktx2` | 已经加工好、压缩好的 PMREM 环境图 | 项目里加载更快、显存更省，不用运行时再生成 PMREM。 |
| `clearcoat` | 材质表面额外一层透明亮漆 | 车漆、头盔、钢琴烤漆这种“外面还有一层亮膜”。 |
| `transmission` | 光真的穿过材质 | 玻璃、亚克力、透明塑料。它不是简单把物体调透明。 |
| `alphaMap` | 用黑白图控制哪里透明 | 局部透明、镂空、贴花玻璃、有图案的透明塑料。 |
| `toneMapping` | 最终把 HDR 画面压到屏幕上 | 材质和环境都算完后，控制高光、曝光、整体观感。 |

所以最小理解可以这样记：

```js
scene.environment = texture;
```

这是“让物体知道周围环境是什么”。

但如果你继续遇到这些问题，就需要其他概念：

- 反射太假、粗糙度不自然：看 `PMREM`。
- 加载慢、显存高：看 `.pmrem.ktx2` / `KTX2Loader`。
- 要车漆那层亮膜：看 `clearcoat`。
- 要真实玻璃：看 `transmission`。
- 要局部透明图案：看 `alphaMap`。
- 整体太亮、太灰、高光炸了：看 `toneMapping`。

它们不是多余，而是分工不同。`scene.environment` 是环境来源；`clearcoat`、`transmission`、`alphaMap` 是材质行为；`toneMapping` 是最终显示。

### HDR 到底是什么

先把 `HDR` 当成一句人话：**这张图不只记录颜色，还记录“有多亮”。**

普通图片更像你手机随手拍的一张照片。它能告诉你：这里是白色、那里是黄色、这里是墙、那里是窗户。但如果窗户外面太阳很亮，普通图片经常只能记成一片白。它知道“白”，但不知道“这个白到底比墙亮多少倍”。

HDR 图片更像专业相机保留了更多亮度信息。它不只知道窗户是白的，还知道窗户比墙亮很多，灯泡比桌子亮很多，太阳比天空亮很多。

用更直白的例子看：

```txt
普通 JPG/PNG：
墙是白的，灯也是白的，太阳也是白的。
它们看起来都差不多白。

HDR：
墙是白的。
灯比墙亮很多。
太阳比灯还亮很多。
这些亮度差会被保留下来。
```

这就是为什么 3D 里喜欢用 HDR 环境图。金属、玻璃、车漆这些材质很依赖“哪里特别亮”。如果环境图知道窗户很亮，金属球上就会有明显的窗户高光；如果环境图只是一张普通图片，很多亮度差被压没了，反射就容易假、平、没有真实高光。

所以：

- `环境贴图`：意思是“这张图代表周围世界”。
- `HDR 环境图`：意思是“这张周围世界的图，还保留了真实亮度差”。

它们不是两个并列概念。关系是：

```txt
环境贴图
├─ 普通环境贴图：能告诉物体周围长什么样
└─ HDR 环境图：不仅告诉周围长什么样，还告诉哪里特别亮
```

代码上可能都是：

```js
scene.environment = texture;
```

区别在于 `texture` 里面装的内容质量不同。普通贴图像普通照片；HDR 贴图像带真实亮度信息的环境照片。

### 这几篇到底各讲什么

`webgl_materials_envmaps.html` 讲最基础的环境贴图。  
你先把它理解成：拿一张“周围世界的照片”给物体照镜子用。物体不是把图片贴到表面，而是根据表面朝向去“看”环境，所以金属球能看到周围倒影。它适合解决“envMap 到底是什么”。

`webgl_materials_envmaps_hdr.html` 讲 HDR 环境图为什么要经过 PMREM。  
HDR 环境图里有很亮的太阳、灯、天空亮部，适合做真实反射。但 PBR 材质不能直接粗暴用一张原图解决所有粗糙度：光滑金属要清楚倒影，粗糙金属要模糊倒影。`PMREMGenerator` 就是在运行时把环境图加工成 PBR 材质好用的版本。它适合学习原理。

`webgl_materials_envmaps_fasthdr.html` 讲项目优化版环境图。  
它不是重新讲一遍 envMap，而是说：既然 PMREM 每次运行时生成有成本，那我能不能提前做好？`.pmrem.ktx2` 就是提前处理好的环境图，运行时用 `KTX2Loader` 直接加载。它适合真实项目、移动端、在线模型查看器。

这里虽然摆了 5 个球：玻璃、哑光、光滑金属、粗糙金属、亮面塑料，但这些球主要是“测试样品”。它们的作用是让你看同一张环境图在不同材质上的反射差异，不是把玻璃、车漆、透明贴图这些材质原理讲透。

`webgl_materials_physical_clearcoat.html` 讲“表面多一层清漆”。  
比如汽车漆、头盔、钢琴烤漆：底下可能是金属、塑料或碳纤维，但最外面还有一层透明亮面保护层。`clearcoat` 管这层额外高光。它不是玻璃，不负责让你看穿物体。

`webgl_materials_physical_transmission.html` 讲真正的玻璃/透明塑料。  
`opacity` 只是把物体整体变淡，像半透明贴片；`transmission` 才更像真实玻璃，光能穿过去，还会受 `ior` 折射率、`thickness` 厚度、`roughness` 毛玻璃程度影响。玻璃很依赖环境图，因为没有环境反射时，玻璃会看起来很假。

`webgl_materials_physical_transmission_alpha.html` 讲“不是整块都透明”。  
它比 transmission 多了一个重点：用 `alphaMap` 控制哪里透明、哪里不透明。比如一块有图案的磨砂玻璃、带镂空图案的塑料片、透明 UI 面板。`alphaMap` 管局部可见性，`transmission` 管可见区域有没有玻璃透射感。

`webgl_tonemapping.html` 讲最终画面怎么显示。  
前面所有环境、金属、玻璃、高光都算完以后，画面可能有超过屏幕显示范围的高亮。`toneMapping` 决定怎么把这些高亮压下来，`toneMappingExposure` 决定整体曝光。它不改变某个材质是什么，而是像相机/后期一样影响最终观感。

### 新手阅读顺序

如果你现在还是小白，按这个顺序看会顺很多：

1. 先看 `webgl_materials_envmaps.html`：理解环境贴图不是普通贴图，而是“反射的世界”。
2. 再看 `webgl_materials_envmaps_hdr.html`：理解 HDR 和 PMREM 为什么让 PBR 反射更真实。
3. 再看 `webgl_materials_envmaps_fasthdr.html`：理解真实项目里怎么把这套东西加载得更快。
4. 然后按材质目标选：车漆看 `clearcoat`，玻璃看 `transmission`，局部透明看 `transmission_alpha`。
5. 最后看 `webgl_tonemapping.html`：理解为什么同一个场景会因为曝光和 tone mapping 看起来完全不一样。

### 什么时候用哪个

如果你只是想让金属或玻璃“有周围倒影”，先用 `scene.environment` 或 `material.envMap`，对应 `envmaps` 系列。

如果你做的是 PBR 写实材质，尤其有金属、玻璃、粗糙度变化，就要关心 HDR + PMREM，对应 `envmaps_hdr` 或 `envmaps_fasthdr`。

如果你做的是车漆、头盔、亮面保护层，用 `clearcoat`。它是表面多一层亮高光，不是看穿物体。

如果你做的是玻璃杯、亚克力、透明塑料，用 `transmission`。它是真透射，不是简单把 `opacity` 调低。

如果你做的是有图案的透明材质，比如贴花玻璃、镂空塑料，用 `transmission_alpha`。

如果你觉得“材质都对，但画面亮度、高光、灰度不对”，看 `tonemapping`。这是最终输出问题，不是某一张贴图或某一个材质通道的问题。

| 官方案例 | 讲解文档 | 这一篇学什么 |
|---|---|---|
| [`webgl_lightprobe.html`](../../cases/webgl_lightprobe.html) | [LightProbe：把一个位置的环境亮度压缩成补光](./webgl_lightprobe.md) | 用官方案例理解 LightProbe 不是灯泡，也不是反射贴图；它是从四周环境里提取“哪里亮、哪里暗、偏什么颜色”的柔和补光数据。 |
| [`webgl_lightprobes.html`](../../cases/webgl_lightprobes.html) | [LightProbes：很多个点位的环境补光](./webgl_lightprobes.md) | 理解单个 LightProbe 只代表一个位置；多个 probe 排成网格后，就像在房间里多个位置都测了一圈环境亮度，让移动物体能获得不同区域的环境补光。 |
| [`webgl_lights_hemisphere.html`](../../cases/webgl_lights_hemisphere.html) | [Hemisphere Light：天空光、地面反光和户外氛围](./webgl_lights_hemisphere.md) | 学习半球光如何用天空色和地面色给户外模型补光，并与 DirectionalLight 共同形成自然日光。 |
| [`webgl_lights_physical.html`](../../cases/webgl_lights_physical.html) | [Physical Lights：真实单位、灯泡、曝光和距离衰减](./webgl_lights_physical.md) | 学习 three.js 里物理灯光的整体链路：PointLight、HemisphereLight、真实 lumen/lux、decay=2、toneMappingExposure 和阴影。 |
| [`webgl_lights_rectarealight.html`](../../cases/webgl_lights_rectarealight.html) | [RectAreaLight：窗户、柔光箱和长条高光](./webgl_lights_rectarealight.md) | 学习有面积的矩形光源如何形成柔和照明和宽高可控的高光形状。 |
| [`webgl_lights_spotlight.html`](../../cases/webgl_lights_spotlight.html) | [SpotLight：锥形光、半影、投影纹理和阴影相机](./webgl_lights_spotlight.md) | 学习聚光灯的完整控制参数，包括 angle、penumbra、decay、distance、shadow.focus、map 和 helper。 |
| [`webgl_lights_spotlights.html`](../../cases/webgl_lights_spotlights.html) | [Multiple SpotLights：多盏聚光灯的组合效果](./webgl_lights_spotlights.md) | 学习多盏 SpotLight 如何共同照明，以及为什么多阴影光源会带来明显性能成本。 |
| [`webgl_materials_envmaps_fasthdr.html`](../../cases/webgl_materials_envmaps_fasthdr.html) | [FastHDR：PMREM KTX2 环境贴图快速加载](./webgl_materials_envmaps_fasthdr.md) | 学习预过滤好的 PMREM KTX2 环境图如何跳过运行时 PMREM 生成，减少加载时间和 GPU 内存。 |
| [`webgl_materials_envmaps_hdr.html`](../../cases/webgl_materials_envmaps_hdr.html) | [HDR EnvMap：IBL、PMREM 和金属反射](./webgl_materials_envmaps_hdr.md) | 学习 HDR 环境贴图如何通过 PMREM 变成适合 PBR 材质采样的反射环境，并比较 Generated/LDR/HDR 的差别。 |
| [`webgl_materials_envmaps.html`](../../cases/webgl_materials_envmaps.html) | [Environment Maps：普通环境贴图和反射/折射](./webgl_materials_envmaps.md) | 学习环境贴图如何给物体提供反射和折射信息，并理解 mapping、CubeTexture、EquirectangularTexture 的区别。 |
| [`webgl_materials_physical_clearcoat.html`](../../cases/webgl_materials_physical_clearcoat.html) | [Clearcoat：汽车漆和透明清漆层](./webgl_materials_physical_clearcoat.md) | 学习 MeshPhysicalMaterial 的 clearcoat 如何在底层材质上再加一层透明高光层。 |
| [`webgl_materials_physical_transmission_alpha.html`](../../cases/webgl_materials_physical_transmission_alpha.html) | [Transmission Alpha：带透明贴图的透射材质](./webgl_materials_physical_transmission_alpha.md) | 学习透明/透射材质如何结合 alpha 贴图，让材质局部透明或局部透射。 |
| [`webgl_materials_physical_transmission.html`](../../cases/webgl_materials_physical_transmission.html) | [Transmission：真实透明玻璃不是 opacity](./webgl_materials_physical_transmission.md) | 学习 MeshPhysicalMaterial 的 transmission、ior、thickness、roughness 如何共同形成玻璃和透明塑料质感。 |
| [`webgl_materials_texture_anisotropy.html`](../../cases/webgl_materials_texture_anisotropy.html) | [Texture Anisotropy：斜着看地面为什么会糊](./webgl_materials_texture_anisotropy.md) | 学习各向异性过滤如何改善斜视角下的地面、道路、跑道和长走廊贴图清晰度。 |
| [`webgl_materials_texture_filters.html`](../../cases/webgl_materials_texture_filters.html) | [Texture Filters：贴图放大缩小时怎么采样](./webgl_materials_texture_filters.md) | 学习 magFilter、minFilter、mipmap 如何决定贴图近看、远看、缩小时的清晰度、像素感和闪烁。 |
| [`webgl_tonemapping.html`](../../cases/webgl_tonemapping.html) | [Tone Mapping：曝光和高动态范围压缩](./webgl_tonemapping.md) | 学习高亮、HDR 环境和 PBR 模型最终如何被压到屏幕可显示范围，以及不同 tone mapping 算法的观感差异。 |
