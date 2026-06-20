# D｜交互编辑

这个目录只放 three.js 官网 examples 的逐篇讲解。每篇文档对应一个本地官方 HTML 案例，文件名保持官网原名。

| 官方案例 | 讲解文档 | 这一篇学什么 |
|---|---|---|
| [`css2d_label.html`](../../cases/css2d_label.html) | [CSS2DRenderer：把 HTML 标签贴到 3D 坐标上](./css2d_label.md) | 学习如何让普通 DOM 跟随 3D 对象移动，用于标注、热点、名称牌和信息浮层。 |
| [`misc_controls_drag.html`](../../cases/misc_controls_drag.html) | [DragControls：直接拖拽 3D 物体](./misc_controls_drag.md) | 学习如何让鼠标拖动物体，并理解拖拽控制和 OrbitControls 为什么需要互斥。 |
| [`misc_controls_transform.html`](../../cases/misc_controls_transform.html) | [TransformControls：编辑器里的移动、旋转、缩放手柄](./misc_controls_transform.md) | 学习 3D 编辑器 gizmo 的基本实现：attach 目标对象、切换 translate/rotate/scale、世界/本地坐标和吸附。 |
| [`webgl_instancing_raycast.html`](../../cases/webgl_instancing_raycast.html) | [InstancedMesh Raycast：大量实例里知道点中哪一个](./webgl_instancing_raycast.md) | 学习 Raycaster 命中 InstancedMesh 后如何通过 instanceId 找到具体实例，并修改单个实例的颜色或状态。 |
| [`webgl_interactive_cubes.html`](../../cases/webgl_interactive_cubes.html) | [Raycaster：鼠标悬停拾取 2000 个立方体](./webgl_interactive_cubes.md) | 学习屏幕坐标如何转成 NDC，再用 Raycaster 从相机发出射线命中 3D 对象。 |
| [`webgl_interactive_voxelpainter.html`](../../cases/webgl_interactive_voxelpainter.html) | [Voxel Painter：网格吸附式体素编辑](./webgl_interactive_voxelpainter.md) | 学习如何用 Raycaster、法线方向和网格吸附实现“点击放置方块、按键删除方块”的编辑器能力。 |
