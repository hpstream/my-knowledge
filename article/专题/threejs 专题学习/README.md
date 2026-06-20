# Three.js 专题学习｜官方 examples 深拆版

> 当前规则：案例不再使用自写简化版，全部改为 three.js 官网 examples 的本地镜像。  
> HTML 文件名保持官网原名，例如 `webgl_materials_envmaps_hdr.html`。  
> 文档负责拆源码、讲参数、讲能做什么，案例负责保持官方演示效果。

---

## 怎么运行

在专题根目录启动静态服务：

```bash
cd "article/专题/threejs 专题学习"
python3 -m http.server 8088
```

打开：

```text
http://127.0.0.1:8088/cases/
```

当前本地镜像包含 48 个官方 HTML 案例，入口：[cases/index.html](./cases/index.html)。案例依赖本目录下的 `build/`、`cases/jsm/`、`cases/textures/`、`cases/models/`、`vendor/`。FastHDR、Ammo、Rapier、Jolt 的运行依赖已经尽量落到本地，避免学习时被 CDN 卡住。

---

## 逐篇案例讲解

所有迁移过来的官网 HTML 都有一篇独立讲解文档：

[官方案例讲解索引](./官方案例讲解/README.md)

每篇讲解都固定回答四件事：

1. 这个官网案例到底在验证什么能力。
2. 核心代码每一段在做什么。
3. 参数应该怎么调，调完应该观察什么。
4. 这些知识后面能拿来做什么。

---

## 主线目录

| 主线 | 解决什么 | 目录 |
|---|---|---|
| A 观察调试 | 相机、控制器、helper、包围盒、自动居中 | [官方案例讲解/A-观察调试](./官方案例讲解/A-观察调试/README.md) |
| B 光照材质 | 灯光、材质、曝光、环境贴图、纹理采样 | [官方案例讲解/B-光照材质](./官方案例讲解/B-光照材质/README.md) |
| C 模型资产 | glTF 加载、遍历、居中、变体、压缩、动画 | [官方案例讲解/C-模型资产动画](./官方案例讲解/C-模型资产动画/README.md) |
| D 交互编辑 | Raycaster、hover/click、拖拽、TransformControls、标签 | [官方案例讲解/D-交互编辑](./官方案例讲解/D-交互编辑/README.md) |
| E 性能大量对象 | InstancedMesh、Points、Lines、后处理成本 | [官方案例讲解/E-性能大量对象后处理](./官方案例讲解/E-性能大量对象后处理/README.md) |
| F 物理模拟 | Rapier、Ammo、Jolt、刚体、碰撞体、关节、软体 | [官方案例讲解/F-物理模拟](./官方案例讲解/F-物理模拟/README.md) |

---

## 这些知识后面能做什么

学 Three.js 最容易卡住的地方不是“不知道概念”，而是“不知道怎么把概念组合成东西”。这 48 个官方案例可以按下面这些真实项目目标去理解。

| 你想做什么 | 需要重点学哪些案例 | 最终会组合出什么能力 |
|---|---|---|
| 通用 3D 模型查看器 | `webgl_loader_gltf`、`misc_controls_orbit`、`webgl_camera`、`webgl_helpers`、`webgl_materials_envmaps_hdr` | 上传或选择模型后自动居中、自动适配相机、能旋转缩放查看，并有真实环境反射 |
| 电商 3D 商品展示 | `webgl_loader_gltf_variants`、`webgl_materials_physical_clearcoat`、`webgl_materials_physical_transmission`、`webgl_tonemapping` | 同一商品切颜色/材质，展示车漆、玻璃、亚克力、金属等真实质感 |
| 3D 编辑器/搭建工具 | `misc_controls_transform`、`misc_controls_drag`、`webgl_interactive_voxelpainter`、`css2d_label`、`webgl_instancing_raycast` | 点选物体、拖拽、移动旋转缩放、网格吸附、给 3D 对象加 HTML 标签 |
| 建筑/展厅/数字孪生漫游 | `physics_rapier_character_controller`、`webgl_lights_physical`、`webgl_materials_envmaps_hdr`、`webgl_postprocessing_ssao` | 角色在场景中行走，不穿墙，空间有真实明暗、环境反射和角落压暗 |
| 物理互动小游戏 | `physics_rapier_basic`、`physics_rapier_joints`、`physics_rapier_vehicle_controller`、`physics_ammo_rope`、`physics_ammo_break` | 掉落、碰撞、链条、车辆、绳索、破碎等真实物理互动 |
| 大量对象和性能优化 | `webgl_instancing_performance`、`webgl_instancing_dynamic`、`physics_rapier_instancing`、`webgl_points_sprites`、`webgl_loader_texture_ktx2` | 成千上万个对象仍能跑，知道何时用实例化、点精灵、压缩纹理和压缩模型 |
| 角色动画系统 | `webgl_animation_keyframes`、`webgl_animation_skinning_blending`、`webgl_animation_skinning_additive_blending` | 播放 glTF 动画，站立/走/跑平滑切换，叠加点头、摇头、表情、姿态 |
| 灯光和材质调试工具 | `webgl_lights_spotlight`、`webgl_lights_rectarealight`、`webgl_lightprobe`、`webgl_tonemapping`、`webgl_materials_texture_anisotropy` | 能解释画面为什么暗、为什么糊、为什么不像玻璃/金属，并能用参数修正 |
| 后期视觉效果 | `webgl_postprocessing`、`webgl_postprocessing_unreal_bloom`、`webgl_postprocessing_ssao` | 发光光晕、环境遮蔽、多 pass 渲染，让画面从“能显示”变成“有完成度” |

换句话说，这些案例不是孤立知识点。后面真正做项目时，通常是这样的组合：

- 产品展示 = glTF 加载 + OrbitControls + HDR 环境 + PBR 材质 + tone mapping。
- 商品配置器 = glTF variants + 材质切换 + 标签 + 交互拾取。
- 编辑器 = Raycaster + DragControls + TransformControls + helper + 包围盒。
- 漫游场景 = 相机控制 + 角色控制器 + 物理碰撞 + 光照材质 + 后期。
- 物理游戏 = Rapier 刚体 + joints/vehicle/character + instancing + 碰撞调试。
- 大场景优化 = InstancedMesh + KTX2 + meshopt + anisotropy + 按需后处理。

---

## 学习方式

不要把官网 examples 当成“看一眼效果”的图库。每篇文章要按下面顺序读：

1. 先打开本地官方案例，看 GUI 参数和最终画面。
2. 再读文档里的源码拆解，知道每段代码解决什么问题。
3. 回到案例里改参数，确认自己能预测画面变化。
4. 最后把这个能力迁移到一个自己的小作品里。

这套专题不会承诺“看完所有 examples 就自动掌握 Three.js”。真正有用的是把官方案例拆成可复用能力：灯光、PBR、模型、交互、性能、物理，再组合成自己的场景。

---

## 已经执行的案例规则

1. HTML 文件名保持官网原名。
2. 不再保留旧的 `a01/b01/...` 自写案例作为学习入口。
3. 每个迁移过来的官网 HTML 都有一篇对应讲解文档。
4. 能本地化的依赖放进 `cases/` 或 `vendor/`。
5. 如果某个官网案例本身覆盖多个知识点，文档只抽取本篇要学的那部分。
