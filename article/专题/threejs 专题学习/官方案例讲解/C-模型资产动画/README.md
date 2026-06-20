# C｜模型资产和动画

这个目录只放 three.js 官网 examples 的逐篇讲解。每篇文档对应一个本地官方 HTML 案例，文件名保持官网原名。

| 官方案例 | 讲解文档 | 这一篇学什么 |
|---|---|---|
| [`webgl_animation_keyframes.html`](../../cases/webgl_animation_keyframes.html) | [Animation Keyframes：播放 glTF 关键帧动画](./webgl_animation_keyframes.md) | 学习 glTF 模型自带动画如何通过 AnimationMixer 播放，并用 deltaTime 保持不同帧率下速度一致。 |
| [`webgl_animation_skinning_additive_blending.html`](../../cases/webgl_animation_skinning_additive_blending.html) | [Additive Blending：叠加动画和表情/姿态层](./webgl_animation_skinning_additive_blending.md) | 学习基础动作之上如何叠加额外动作，例如一边走路一边点头、摇头、摆姿势。 |
| [`webgl_animation_skinning_blending.html`](../../cases/webgl_animation_skinning_blending.html) | [Skinning Blending：骨骼动画切换和混合](./webgl_animation_skinning_blending.md) | 学习角色 idle、walk、run 等多个动作如何平滑切换，避免从一个动作硬切到另一个动作。 |
| [`webgl_loader_gltf_compressed.html`](../../cases/webgl_loader_gltf_compressed.html) | [GLTF Compressed：压缩 glTF 模型加载](./webgl_loader_gltf_compressed.md) | 学习现代 glTF 资产如何同时使用网格压缩和纹理压缩，减少下载体积并保持运行效果。 |
| [`webgl_loader_gltf_variants.html`](../../cases/webgl_loader_gltf_variants.html) | [GLTF Variants：同一个模型切换不同材质方案](./webgl_loader_gltf_variants.md) | 学习 glTF 的 KHR_materials_variants 扩展，用一个模型承载多个材质变体，例如鞋子的不同配色。 |
| [`webgl_loader_gltf.html`](../../cases/webgl_loader_gltf.html) | [GLTFLoader：加载真实模型并自动适配相机](./webgl_loader_gltf.md) | 学习真实 glTF 模型加载、环境贴图、动画播放，以及官方 fitCameraToSelection 如何用 Box3 自动把相机摆到合适距离。 |
| [`webgl_loader_texture_ktx2.html`](../../cases/webgl_loader_texture_ktx2.html) | [Texture KTX2：GPU 压缩纹理加载和格式对比](./webgl_loader_texture_ktx2.md) | 学习 KTX2 压缩纹理为什么适合 Web 3D，以及不同压缩格式、mipmap、透明度和采样方式的差异。 |
