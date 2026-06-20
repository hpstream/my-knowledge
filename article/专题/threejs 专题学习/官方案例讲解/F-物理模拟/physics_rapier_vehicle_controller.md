# physics_rapier_vehicle_controller.html｜Rapier Vehicle Controller：车辆控制器和轮胎参数

> 本地官方案例：[`physics_rapier_vehicle_controller.html`](../../cases/physics_rapier_vehicle_controller.html)  
> 本篇目标：学习车辆不只是四个轮子跟着车身转，而是底盘刚体、悬挂、轮胎摩擦、转向、刹车和驱动力的组合。

## 先从现实问题说起

车辆不是四个轮子简单跟着车身转。真实车辆有底盘、悬挂、轮胎摩擦、转向、刹车和驱动力。

如果只给车身加力，车会像盒子滑行，不像车。

Rapier Vehicle Controller 解决的是车辆物理控制。

## 先把基础概念说清楚

- chassis 是车身刚体。
- wheel 参数包含悬挂长度、刚度、摩擦、转向、驱动力等。
- 物理轮子负责计算，视觉轮子还需要同步位置和旋转。

## 这个技术解决什么

这个案例适合车、卡丁车、物理驾驶原型。

它展示车辆是多个物理参数组合，不是单纯移动模型。

## 打开案例后看什么

- 按控制键时，看转向、驱动力、刹车如何影响车辆。
- 观察悬挂对车身姿态的影响。
- 理解视觉轮子为什么要跟随物理结果更新。

## 官网核心代码

```js
vehicleController = physics.world.createVehicleController( chassis );

vehicleController.addWheel(
  wheelPosition, wheelDirection, wheelAxle,
  suspensionRestLength, wheelRadius
);

vehicleController.setWheelEngineForce( 0, engineForce );
vehicleController.setWheelSteering( 0, steering );
vehicleController.setWheelBrake( 0, wheelBrake );
```

## 这段代码到底在做什么

- 车辆控制器把底盘刚体当成主体，轮子通过射线/悬挂模型和地面交互。
- addWheel 定义轮子相对车身的位置、悬挂方向、车轴方向、悬挂静止长度和轮半径。
- suspension stiffness 决定车身支撑感，太软像船，太硬容易抖。
- friction slip 决定轮胎抓地能力，低抓地会更像打滑。
- engineForce 负责驱动，brake 负责制动，steering 负责前轮转向。
- updateWheels 读取物理车辆的轮子状态，再把可视化轮子 mesh 的位置和旋转同步过去。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

这个案例的核心片段主要展示调用顺序或对象关系，没有额外需要展开的数值参数。

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| W/S 加速倒车 | 底盘受驱动力影响 |
| A/D 转向 | 前轮改变方向，车身产生转弯 |
| 空格刹车 | 观察制动距离和姿态 |
| 改悬挂刚度/摩擦 | 体验车像越野车、玩具车或冰面车 |

## 学完能拿来做什么

- 做赛车、越野车、叉车、购物车
- 做车辆参数调试工具
- 做驾驶类数字孪生或训练场景
- 扩展成车辆碰撞、坡道、漂移、轮胎磨损
- 理解真实车辆模拟要拆成底盘、悬挂、轮胎和输入

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
