# webgl_loader_gltf_compressed.html｜GLTF Compressed：压缩 glTF 模型加载

> 本地官方案例：[`webgl_loader_gltf_compressed.html`](../../cases/webgl_loader_gltf_compressed.html)  
> 本篇目标：学习现代 glTF 资产如何同时使用网格压缩和纹理压缩，减少下载体积并保持运行效果。

## 先从现实问题说起

模型面数一高，文件就会很大，网页加载慢，移动端更明显。

这个案例里的模型同时用了 meshopt 网格压缩和 KTX2 纹理压缩：一个减少几何数据体积，一个减少贴图体积和显存压力。

它讲的是“上线用的 glTF 资产”怎么加载，而不是本地随便打开一个未压缩模型。

## 先把基础概念说清楚

- `MeshoptDecoder` 负责解码 meshopt 压缩后的网格数据。
- `KTX2Loader` 负责加载和转码 KTX2 压缩纹理。
- `GLTFLoader` 自己负责 glTF 主流程，但遇到压缩扩展时，需要你把对应解码器交给它。

## 这个技术解决什么

它适合解决模型文件太大、加载慢的问题。

如果少了 `MeshoptDecoder`，压缩网格可能无法解码；如果少了 `KTX2Loader`，压缩贴图可能无法正常显示。

## 打开案例后看什么

- 看 `setKTX2Loader` 和 `setMeshoptDecoder` 分别交给 GLTFLoader 什么能力。
- 看压缩模型加载后，最终仍然是 `scene.add( gltf.scene )`。
- 理解压缩减少下载体积和显存压力，但需要加载器/解码器配合。

## 官网核心代码

```js
const ktx2Loader = new KTX2Loader()
  .detectSupport( renderer );

loader.setKTX2Loader( ktx2Loader );
loader.setMeshoptDecoder( MeshoptDecoder );
loader.load( 'coffeemat.glb', function ( gltf ) {
  scene.add( gltf.scene );
} );
```

## 这段代码到底在做什么

- glTF 模型可以很大，通常瓶颈不是代码，而是模型和贴图下载。
- KTX2Loader 负责 Basis Universal/KTX2 纹理转码，让纹理在不同 GPU 上使用合适压缩格式。
- MeshoptDecoder 负责解码 meshopt 网格压缩，减少顶点和索引数据体积。
- detectSupport(renderer) 会根据当前设备能力选择合适的纹理转码目标。
- loader.setKTX2Loader 和 setMeshoptDecoder 是告诉 GLTFLoader：遇到对应扩展时该交给谁解码。
- 这个案例适合学习“上线模型”而不是“本地随便加载模型”的资产处理方式。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `loader.load( 'coffeemat.glb', function ( gltf ) { scene.add( gltf.scene ); } )` | `第 1 个参数：'coffeemat.glb'` | url：资源路径。 |
| `loader.load( 'coffeemat.glb', function ( gltf ) { scene.add( gltf.scene ); } )` | `第 2 个参数：function ( gltf ) {   scene.add( gltf.scene ); }` | onLoad：加载成功回调。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 打开 Network 看模型大小 | 压缩资产下载更小 |
| 去掉 KTX2Loader | 带 KTX2 纹理的模型可能无法正常显示 |
| 去掉 MeshoptDecoder | meshopt 压缩网格无法解码 |
| 换未压缩 glTF | 加载链路会更简单但体积更大 |

## 学完能拿来做什么

- 做线上模型查看器
- 做电商 3D 商品展示
- 做移动端三维场景
- 做数字孪生的大模型加载优化
- 建立 gltfpack/ktx2 的资产压缩流水线

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
