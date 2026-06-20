# Three.js 官方案例逐篇讲解

这里的文档和 `cases/` 下的官网 HTML 一一对应。HTML 文件名保持官网原名，Markdown 文件名去掉 `.html` 后缀。

| 官方案例 | 讲解文档 |
|---|---|
| [`css2d_label.html`](../cases/css2d_label.html) | [CSS2DRenderer：把 HTML 标签贴到 3D 坐标上](./D-交互编辑/css2d_label.md) |
| [`misc_controls_drag.html`](../cases/misc_controls_drag.html) | [DragControls：直接拖拽 3D 物体](./D-交互编辑/misc_controls_drag.md) |
| [`misc_controls_orbit.html`](../cases/misc_controls_orbit.html) | [OrbitControls：围绕目标观察场景](./A-观察调试/misc_controls_orbit.md) |
| [`misc_controls_transform.html`](../cases/misc_controls_transform.html) | [TransformControls：编辑器里的移动、旋转、缩放手柄](./D-交互编辑/misc_controls_transform.md) |
| [`physics_ammo_break.html`](../cases/physics_ammo_break.html) | [Ammo Break：刚体碰撞和物体破碎](./F-物理模拟/physics_ammo_break.md) |
| [`physics_ammo_cloth.html`](../cases/physics_ammo_cloth.html) | [Ammo Cloth：软体布料和锚点约束](./F-物理模拟/physics_ammo_cloth.md) |
| [`physics_ammo_rope.html`](../cases/physics_ammo_rope.html) | [Ammo Rope：绳索软体和两端连接](./F-物理模拟/physics_ammo_rope.md) |
| [`physics_jolt_instancing.html`](../cases/physics_jolt_instancing.html) | [Jolt Instancing：Jolt 物理和 WebGPU 批量刚体](./F-物理模拟/physics_jolt_instancing.md) |
| [`physics_rapier_basic.html`](../cases/physics_rapier_basic.html) | [Rapier Basic：最小刚体世界](./F-物理模拟/physics_rapier_basic.md) |
| [`physics_rapier_character_controller.html`](../cases/physics_rapier_character_controller.html) | [Rapier Character Controller：角色移动和碰撞避障](./F-物理模拟/physics_rapier_character_controller.md) |
| [`physics_rapier_instancing.html`](../cases/physics_rapier_instancing.html) | [Rapier Instancing：大量实例化刚体](./F-物理模拟/physics_rapier_instancing.md) |
| [`physics_rapier_joints.html`](../cases/physics_rapier_joints.html) | [Rapier Joints：关节、链条和约束](./F-物理模拟/physics_rapier_joints.md) |
| [`physics_rapier_vehicle_controller.html`](../cases/physics_rapier_vehicle_controller.html) | [Rapier Vehicle Controller：车辆控制器和轮胎参数](./F-物理模拟/physics_rapier_vehicle_controller.md) |
| [`webgl_animation_keyframes.html`](../cases/webgl_animation_keyframes.html) | [Animation Keyframes：播放 glTF 关键帧动画](./C-模型资产动画/webgl_animation_keyframes.md) |
| [`webgl_animation_skinning_additive_blending.html`](../cases/webgl_animation_skinning_additive_blending.html) | [Additive Blending：叠加动画和表情/姿态层](./C-模型资产动画/webgl_animation_skinning_additive_blending.md) |
| [`webgl_animation_skinning_blending.html`](../cases/webgl_animation_skinning_blending.html) | [Skinning Blending：骨骼动画切换和混合](./C-模型资产动画/webgl_animation_skinning_blending.md) |
| [`webgl_camera.html`](../cases/webgl_camera.html) | [Camera：透视相机、正交相机和 CameraHelper](./A-观察调试/webgl_camera.md) |
| [`webgl_helpers.html`](../cases/webgl_helpers.html) | [Helpers：网格、极坐标网格和包围盒调试](./A-观察调试/webgl_helpers.md) |
| [`webgl_instancing_dynamic.html`](../cases/webgl_instancing_dynamic.html) | [Dynamic Instancing：大量实例动起来时要更新什么](./E-性能大量对象后处理/webgl_instancing_dynamic.md) |
| [`webgl_instancing_performance.html`](../cases/webgl_instancing_performance.html) | [Instancing Performance：一万个对象为什么不该是一万个 Mesh](./E-性能大量对象后处理/webgl_instancing_performance.md) |
| [`webgl_instancing_raycast.html`](../cases/webgl_instancing_raycast.html) | [InstancedMesh Raycast：大量实例里知道点中哪一个](./D-交互编辑/webgl_instancing_raycast.md) |
| [`webgl_interactive_cubes.html`](../cases/webgl_interactive_cubes.html) | [Raycaster：鼠标悬停拾取 2000 个立方体](./D-交互编辑/webgl_interactive_cubes.md) |
| [`webgl_interactive_voxelpainter.html`](../cases/webgl_interactive_voxelpainter.html) | [Voxel Painter：网格吸附式体素编辑](./D-交互编辑/webgl_interactive_voxelpainter.md) |
| [`webgl_lightprobe.html`](../cases/webgl_lightprobe.html) | [LightProbe：把一个位置的环境亮度压缩成补光](./B-光照材质/webgl_lightprobe.md) |
| [`webgl_lightprobes.html`](../cases/webgl_lightprobes.html) | [LightProbes：很多个点位的环境补光](./B-光照材质/webgl_lightprobes.md) |
| [`webgl_lights_hemisphere.html`](../cases/webgl_lights_hemisphere.html) | [Hemisphere Light：天空光、地面反光和户外氛围](./B-光照材质/webgl_lights_hemisphere.md) |
| [`webgl_lights_physical.html`](../cases/webgl_lights_physical.html) | [Physical Lights：真实单位、灯泡、曝光和距离衰减](./B-光照材质/webgl_lights_physical.md) |
| [`webgl_lights_rectarealight.html`](../cases/webgl_lights_rectarealight.html) | [RectAreaLight：窗户、柔光箱和长条高光](./B-光照材质/webgl_lights_rectarealight.md) |
| [`webgl_lights_spotlight.html`](../cases/webgl_lights_spotlight.html) | [SpotLight：锥形光、半影、投影纹理和阴影相机](./B-光照材质/webgl_lights_spotlight.md) |
| [`webgl_lights_spotlights.html`](../cases/webgl_lights_spotlights.html) | [Multiple SpotLights：多盏聚光灯的组合效果](./B-光照材质/webgl_lights_spotlights.md) |
| [`webgl_lines_fat.html`](../cases/webgl_lines_fat.html) | [Fat Lines：普通 Line 为什么控制不了稳定宽度](./E-性能大量对象后处理/webgl_lines_fat.md) |
| [`webgl_loader_gltf_compressed.html`](../cases/webgl_loader_gltf_compressed.html) | [GLTF Compressed：压缩 glTF 模型加载](./C-模型资产动画/webgl_loader_gltf_compressed.md) |
| [`webgl_loader_gltf_variants.html`](../cases/webgl_loader_gltf_variants.html) | [GLTF Variants：同一个模型切换不同材质方案](./C-模型资产动画/webgl_loader_gltf_variants.md) |
| [`webgl_loader_gltf.html`](../cases/webgl_loader_gltf.html) | [GLTFLoader：加载真实模型并自动适配相机](./C-模型资产动画/webgl_loader_gltf.md) |
| [`webgl_loader_texture_ktx2.html`](../cases/webgl_loader_texture_ktx2.html) | [Texture KTX2：GPU 压缩纹理加载和格式对比](./C-模型资产动画/webgl_loader_texture_ktx2.md) |
| [`webgl_materials_envmaps_fasthdr.html`](../cases/webgl_materials_envmaps_fasthdr.html) | [FastHDR：PMREM KTX2 环境贴图快速加载](./B-光照材质/webgl_materials_envmaps_fasthdr.md) |
| [`webgl_materials_envmaps_hdr.html`](../cases/webgl_materials_envmaps_hdr.html) | [HDR EnvMap：IBL、PMREM 和金属反射](./B-光照材质/webgl_materials_envmaps_hdr.md) |
| [`webgl_materials_envmaps.html`](../cases/webgl_materials_envmaps.html) | [Environment Maps：普通环境贴图和反射/折射](./B-光照材质/webgl_materials_envmaps.md) |
| [`webgl_materials_physical_clearcoat.html`](../cases/webgl_materials_physical_clearcoat.html) | [Clearcoat：汽车漆和透明清漆层](./B-光照材质/webgl_materials_physical_clearcoat.md) |
| [`webgl_materials_physical_transmission_alpha.html`](../cases/webgl_materials_physical_transmission_alpha.html) | [Transmission Alpha：带透明贴图的透射材质](./B-光照材质/webgl_materials_physical_transmission_alpha.md) |
| [`webgl_materials_physical_transmission.html`](../cases/webgl_materials_physical_transmission.html) | [Transmission：真实透明玻璃不是 opacity](./B-光照材质/webgl_materials_physical_transmission.md) |
| [`webgl_materials_texture_anisotropy.html`](../cases/webgl_materials_texture_anisotropy.html) | [Texture Anisotropy：斜着看地面为什么会糊](./B-光照材质/webgl_materials_texture_anisotropy.md) |
| [`webgl_materials_texture_filters.html`](../cases/webgl_materials_texture_filters.html) | [Texture Filters：贴图放大缩小时怎么采样](./B-光照材质/webgl_materials_texture_filters.md) |
| [`webgl_points_sprites.html`](../cases/webgl_points_sprites.html) | [Points Sprites：什么时候不要用 Mesh](./E-性能大量对象后处理/webgl_points_sprites.md) |
| [`webgl_postprocessing_ssao.html`](../cases/webgl_postprocessing_ssao.html) | [SSAO：为什么角落和接缝需要更暗一点](./E-性能大量对象后处理/webgl_postprocessing_ssao.md) |
| [`webgl_postprocessing_unreal_bloom.html`](../cases/webgl_postprocessing_unreal_bloom.html) | [UnrealBloomPass：发光光晕为什么是后期，不是真灯](./E-性能大量对象后处理/webgl_postprocessing_unreal_bloom.md) |
| [`webgl_postprocessing.html`](../cases/webgl_postprocessing.html) | [EffectComposer：后处理为什么不是 renderer.render](./E-性能大量对象后处理/webgl_postprocessing.md) |
| [`webgl_tonemapping.html`](../cases/webgl_tonemapping.html) | [Tone Mapping：曝光和高动态范围压缩](./B-光照材质/webgl_tonemapping.md) |
