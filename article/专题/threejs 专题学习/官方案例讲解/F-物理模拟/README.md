# F｜物理模拟

这个目录只放 three.js 官网 examples 的逐篇讲解。每篇文档对应一个本地官方 HTML 案例，文件名保持官网原名。

| 官方案例 | 讲解文档 | 这一篇学什么 |
|---|---|---|
| [`physics_ammo_break.html`](../../cases/physics_ammo_break.html) | [Ammo Break：刚体碰撞和物体破碎](./physics_ammo_break.md) | 学习 Ammo.js 如何处理刚体世界、碰撞接触点、冲击强度，以及如何把一个可破碎物体拆成碎块。 |
| [`physics_ammo_cloth.html`](../../cases/physics_ammo_cloth.html) | [Ammo Cloth：软体布料和锚点约束](./physics_ammo_cloth.md) | 学习布料不是普通刚体，而是由很多软体节点组成；节点受重力、风、碰撞和锚点一起影响。 |
| [`physics_ammo_rope.html`](../../cases/physics_ammo_rope.html) | [Ammo Rope：绳索软体和两端连接](./physics_ammo_rope.md) | 学习绳子如何用软体线段模拟，并通过锚点连接到刚体，让球、杆和绳子形成联动系统。 |
| [`physics_jolt_instancing.html`](../../cases/physics_jolt_instancing.html) | [Jolt Instancing：Jolt 物理和 WebGPU 批量刚体](./physics_jolt_instancing.md) | 学习 Jolt 物理引擎如何和 Three 的 InstancedMesh 结合，在大量相同物体上保持渲染和物理性能。 |
| [`physics_rapier_basic.html`](../../cases/physics_rapier_basic.html) | [Rapier Basic：最小刚体世界](./physics_rapier_basic.md) | 学习 Rapier 在 Three 中的最小接入方式：场景、地面、动态刚体、反弹系数和物理调试器。 |
| [`physics_rapier_character_controller.html`](../../cases/physics_rapier_character_controller.html) | [Rapier Character Controller：角色移动和碰撞避障](./physics_rapier_character_controller.md) | 学习角色不是直接改 mesh.position，而是让物理角色控制器计算可行移动，避免穿墙和穿地。 |
| [`physics_rapier_instancing.html`](../../cases/physics_rapier_instancing.html) | [Rapier Instancing：大量实例化刚体](./physics_rapier_instancing.md) | 学习如何让成百上千个相同物体既用 InstancedMesh 高效渲染，又拥有独立物理状态。 |
| [`physics_rapier_joints.html`](../../cases/physics_rapier_joints.html) | [Rapier Joints：关节、链条和约束](./physics_rapier_joints.md) | 学习两个刚体之间如何通过关节连接，从而形成链条、吊挂、机械臂这类受约束的运动。 |
| [`physics_rapier_vehicle_controller.html`](../../cases/physics_rapier_vehicle_controller.html) | [Rapier Vehicle Controller：车辆控制器和轮胎参数](./physics_rapier_vehicle_controller.md) | 学习车辆不只是四个轮子跟着车身转，而是底盘刚体、悬挂、轮胎摩擦、转向、刹车和驱动力的组合。 |
