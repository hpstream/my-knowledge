# webgl_materials_envmaps_fasthdr.html｜FastHDR：PMREM KTX2 环境贴图快速加载

> 本地官方案例：[`webgl_materials_envmaps_fasthdr.html`](../../cases/webgl_materials_envmaps_fasthdr.html)  
> 本篇目标：学习预过滤好的 PMREM KTX2 环境图如何跳过运行时 PMREM 生成，减少加载时间和 GPU 内存。

## 先从现实问题说起

HDR + PMREM 能让 PBR 材质更真实，但运行时生成 PMREM 有加载时间和显存成本。

在线模型查看器、移动端产品展示不能每次都让用户等太久。

FastHDR 解决的是：把环境图提前处理好，运行时更快加载、更省内存。

## 先把基础概念说清楚

- `.pmrem.ktx2` 可以理解成已经做好 PMREM 的压缩环境图。
- `KTX2Loader` 负责加载这种 GPU 友好的压缩纹理。
- `scene.environment = texture` 让所有 PBR 材质默认使用这张环境图。

## 这个技术解决什么

这个案例真正的主角是环境图加载链路，不是 5 个材质球本身。

5 个球只是测试样品，用来观察同一张环境图在玻璃、金属、哑光和亮面塑料上的表现。

## 打开案例后看什么

- 切换不同 FastHDR 环境，看 5 个球的反射和高光一起变化。
- 调 backgroundBlurriness，看背景变糊但材质反射不是同一回事。
- 调 exposure，看最终画面整体曝光变化。

## 官网核心代码

```js
const loader = new KTX2Loader()
  .detectSupport( renderer );

loader.load( url, ( texture ) => {
  texture.mapping = THREE.CubeUVReflectionMapping;
  scene.environment = texture;
  scene.background = texture;
} );

loadTexture( 'textures/fasthdr/ballroom_2k.pmrem.ktx2' );

renderer.toneMappingExposure = params.exposure;
scene.backgroundBlurriness = params.backgroundBlurriness;

const sphere01 = new THREE.Mesh( sphereGeometry, new THREE.MeshPhysicalMaterial( {
  transmission: 1.0,
  thickness: 2.0,
  metalness: 0.0,
  roughness: 0.0,
} ) );

const sphere03 = new THREE.Mesh( sphereGeometry, new THREE.MeshStandardMaterial( {
  metalness: 1.0,
  roughness: 0.0,
} ) );
```

## 这段代码到底在做什么

- KTX2 是 GPU 友好的压缩纹理容器。
- detectSupport 会根据当前设备/GPU 支持能力选择合适的压缩纹理解码路径。
- 这个案例里的 pmrem.ktx2 已经预过滤，所以不再调用 PMREMGenerator。
- CubeUVReflectionMapping 告诉 Three.js 这张贴图按 PMREM/CubeUV 方式采样。
- 同一环境会同时影响玻璃、金属、粗糙材质和背景。
- 本地镜像把官网 CDN 的 8 个 FastHDR 文件下载到 textures/fasthdr，所以案例被本地化后可以随目录搬走运行。
- render 循环里 exposure 和 backgroundBlurriness 分别控制最终曝光与背景模糊。

## 和 HDR EnvMap 案例有什么区别

这两个案例都在讲 HDR 环境反射，但重点不同：`webgl_materials_envmaps_hdr.html` 是教你“PMREM 怎么从 HDR/LDR 环境图运行时生成出来”，这个案例是教你“PMREM 已经提前做好后，怎么快速加载来用”。

| 对比点 | `webgl_materials_envmaps_hdr.html` | `webgl_materials_envmaps_fasthdr.html` |
|---|---|---|
| 主要目标 | 理解 HDR/LDR 环境图、PMREM 和 PBR 反射流程 | 使用已经预过滤好的 FastHDR/KTX2 环境图 |
| 环境图文件 | 六张 cube face：`.hdr` 或 `.png` | 一张 `.pmrem.ktx2` |
| 加载器 | `HDRCubeTextureLoader`、`CubeTextureLoader` | `KTX2Loader` |
| PMREM | 运行时用 `PMREMGenerator` 生成 | 文件里已经带好 PMREM 数据 |
| 赋值方式 | 把 `renderTarget.texture` 给材质 `envMap` | 直接设置 `scene.environment = texture` |
| 性能侧重点 | 适合理解原理和调试不同环境来源 | 加载更快、GPU 内存更低，更接近项目优化方案 |
| 画面观察 | 一个金属环面，重点看 `roughness/metalness` 和 HDR/LDR 差异 | 5 个球，重点看同一环境对玻璃、金属、哑光和塑料的影响 |

一句话记：`hdr` 是“现场把环境图加工成 PBR 能用的反射贴图”，`fasthdr` 是“直接使用已经加工好的成品环境贴图”。

## toneMappingExposure 是控制曝光吗

是的，`renderer.toneMappingExposure = params.exposure` 控制的是最终输出画面的曝光。

但它不是在改灯光强度，也不是在改 HDR 环境贴图本身。它更像相机或后期里的“整体曝光”：场景里的灯光、材质、环境反射先算完，然后 Three.js 在把 HDR 亮度压到屏幕可显示范围时，用这个值整体调亮或调暗。

这个案例里还设置了：

```js
renderer.toneMapping = THREE.ACESFilmicToneMapping;
```

所以画面流程可以这样理解：

1. `scene.environment` 提供 HDR 环境光和反射。
2. 5 个球根据自己的 `metalness`、`roughness`、`transmission` 算出不同材质效果。
3. `ACESFilmicToneMapping` 把 HDR 高亮压到普通屏幕能显示的范围。
4. `toneMappingExposure` 决定压缩前整体提亮还是压暗。

| `params.exposure` | 画面变化 | 你该怎么理解 |
|---|---|---|
| 小于 `1.0` | 整体变暗 | 相机曝光降低 |
| 等于 `1.0` | 默认亮度 | 不额外加减曝光 |
| 大于 `1.0` | 整体变亮，高光更容易过曝 | 相机曝光提高 |

所以它和 `light.intensity` 的区别是：`light.intensity` 只改变某盏灯；`toneMappingExposure` 影响最终整张画面，包括背景、金属反射、玻璃高光和所有物体。

## 这些球的材质参数在干嘛

这排球不是随便摆的，它们用同一张 `scene.environment`，但材质参数不同，所以你能比较环境贴图在玻璃、哑光、金属和光滑塑料上的差别。

| 参数 | 控制什么 | 在这个案例里怎么看 |
|---|---|---|
| `transmission` | 透光/透射强度，`1.0` 接近完全透光 | `sphere01` 像玻璃球，不只是表面反光，还能看到环境穿过材质后的效果 |
| `thickness` | 材质内部厚度感，不会真的把球模型变厚 | 值越大，玻璃感越明显；它通常配合 `transmission` 才有意义 |
| `metalness` | 金属度，`0.0` 是非金属，`1.0` 是金属 | 金属球主要靠环境反射出质感；非金属保留自己的颜色和普通高光 |
| `roughness` | 表面粗糙度，`0.0` 很光滑，`1.0` 很粗糙 | 越光滑，环境反射越清楚；越粗糙，反射越散、越哑光 |

这里不要把 `roughness` 理解成模型表面真的凹凸了。它只改变反射和高光的散开程度；如果要让表面看起来有细小凹凸，那是 `normalMap` 或 `bumpMap` 负责的事。

## 5 个球分别代表什么

这 5 个球是在用同一个 FastHDR 环境图做材质对比。环境贴图没有变，变的是每个球的 PBR 材质参数。

注意这里的 5 个球只是“测试样品”，目的是观察同一张环境图在不同材质上的反射、透光和粗糙度差异。这个案例真正的主角仍然是 `FastHDR / .pmrem.ktx2 / KTX2Loader / scene.environment` 这条环境贴图加载链路。

所以它会展示玻璃球，但不会把玻璃参数讲到最细；真正要学玻璃的 `transmission`、`ior`、`thickness`，要看 `webgl_materials_physical_transmission.html`。它会展示亮面塑料和金属，但不是专门讲车漆清漆层；真正要学表面清漆高光，要看 `webgl_materials_physical_clearcoat.html`。

| 球 | 核心参数 | 代表的材质 | 这个球要你观察什么 |
|---|---|---|---|
| `sphere01` | `transmission: 1.0`、`thickness: 2.0`、`roughness: 0.0` | 光滑透明玻璃 | 环境不仅出现在表面反射里，还会参与透过玻璃后的观感。 |
| `sphere02` | `metalness: 0.0`、`roughness: 1.0` | 粗糙非金属，接近哑光白球 | 环境反射被打散，球看起来不亮、不镜面。 |
| `sphere03` | `metalness: 1.0`、`roughness: 0.0` | 光滑金属，接近镜面金属球 | 环境反射最清楚，HDR 环境的亮部会直接塑造金属质感。 |
| `sphere04` | `metalness: 1.0`、`roughness: 0.5`、`color: 0x888888` | 粗糙金属 | 仍然是金属，但反射更模糊，亮斑更散。 |
| `sphere05` | `metalness: 0.0`、`roughness: 0.0`、`color: 0x6ab440` | 光滑非金属，像绿色亮面塑料或漆面 | 有清晰高光，但不会像金属一样主要靠环境反射决定颜色。 |

一句话记：`sphere01` 看透光，`sphere02` 看哑光，`sphere03` 看镜面金属，`sphere04` 看粗糙金属，`sphere05` 看光滑非金属。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new THREE.MeshPhysicalMaterial( { transmission: 1.0, thickness: 2.0, metalness: 0.0, roughness: 0.0 } )` | `transmission` | 透光/透射强度，用来做玻璃、液体等能透光的材质。 |
| `new THREE.MeshPhysicalMaterial( { transmission: 1.0, thickness: 2.0, metalness: 0.0, roughness: 0.0 } )` | `thickness` | 透射材质的厚度感，不改变真实几何体尺寸。 |
| `new THREE.MeshPhysicalMaterial( { transmission: 1.0, thickness: 2.0, metalness: 0.0, roughness: 0.0 } )` | `metalness` | 金属度，0 是非金属，1 是金属。 |
| `new THREE.MeshPhysicalMaterial( { transmission: 1.0, thickness: 2.0, metalness: 0.0, roughness: 0.0 } )` | `roughness` | 粗糙度，0 反射清晰，1 反射发散。 |
| `texture.mapping = THREE.CubeUVReflectionMapping` | `mapping` | 纹理映射方式，决定贴图作为反射、折射或全景图使用。 |
| `renderer.toneMappingExposure = params.exposure` | `toneMappingExposure` | 输出阶段的全局曝光，影响整张画面明暗，不改变灯光或贴图本身。 |
| `scene.backgroundBlurriness = params.backgroundBlurriness` | `backgroundBlurriness` | 背景模糊强度，只影响背景，不会让模型材质变糊。 |
| `loader.load( url, ( texture ) => { texture.mapping = THREE.CubeUVReflectionMapping; scene.environment = textur` | `第 1 个参数：url` | url：资源路径。 |
| `loader.load( url, ( texture ) => { texture.mapping = THREE.CubeUVReflectionMapping; scene.environment = textur` | `第 2 个参数：( texture ) => {   texture.mapping = THREE.CubeUVReflectionMapping;   scene.environment = texture;   scene.background = texture; }` | onLoad：加载成功回调。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 切换 image | 不同环境改变所有材质反射 |
| 调 exposure | 最终输出亮度变化 |
| 调 fov | 镜头视角变化 |
| 调 backgroundBlurriness | 背景变糊但环境照明仍在 |

## 学完能拿来做什么

- 快速 HDR 产品预览
- 在线模型查看器
- 低内存环境贴图
- 移动端 PBR 展示
- 多环境材质测试

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
