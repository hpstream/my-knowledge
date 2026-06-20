import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'article/专题/threejs 专题学习';
const CASES_DIR = path.join(ROOT, 'cases');
const DOCS_DIR = path.join(ROOT, '官方案例讲解');
const OFFICIAL_EXAMPLES_DIR = '/private/tmp/three-js-official/examples';

const docs = [
  {
    file: 'misc_controls_orbit.html',
    title: 'OrbitControls：围绕目标观察场景',
    purpose: '学习如何用鼠标围绕一个目标点观察 3D 场景，并理解阻尼、距离限制、垂直角度限制为什么影响操作手感。',
    points: ['OrbitControls 的 target 是观察中心，不是相机位置', 'enableDamping 需要每帧 controls.update', 'minDistance/maxDistance 限制缩放范围', 'maxPolarAngle 限制相机不能钻到地面下', 'InstancedMesh 只是场景内容，用来提供大量可观察对象'],
    snippet: [
      "controls = new OrbitControls( camera, renderer.domElement );",
      "controls.enableDamping = true;",
      "controls.dampingFactor = 0.05;",
      "controls.minDistance = 100;",
      "controls.maxDistance = 500;",
      "controls.maxPolarAngle = Math.PI / 2;",
      "",
      "function animate() {",
      "  controls.update();",
      "  render();",
      "}"
    ],
    explain: [
      '第一行把相机、canvas 和控制器绑定起来，鼠标事件会改变 camera 的位置和朝向。',
      'enableDamping 打开后，相机不会立即停下，会像有惯性一样慢慢衰减。',
      '因为阻尼是逐帧计算的，所以动画循环里必须调用 controls.update。',
      'minDistance/maxDistance 是产品展示、模型查看器常用的防误操作限制。',
      'maxPolarAngle = PI/2 表示最多看平到地平线附近，不允许绕到地面下面。'
    ],
    observe: [['拖拽鼠标', '相机围绕 target 转动'], ['滚轮缩放', '缩放被 minDistance/maxDistance 限制'], ['注释 controls.update', '阻尼效果失效'], ['修改 maxPolarAngle', '观察是否能绕到模型下方']],
    uses: ['模型预览器', '产品展示页', '三维编辑器基础视角', '地图和建筑浏览器', '任何需要“围着物体看”的工具']
  },
  {
    file: 'webgl_camera.html',
    title: 'Camera：透视相机、正交相机和 CameraHelper',
    purpose: '学习相机视锥、near/far 裁剪面、透视/正交切换，以及为什么 CameraHelper 能帮你看见“另一台相机在拍哪里”。',
    points: ['PerspectiveCamera 会近大远小', 'OrthographicCamera 不会近大远小', 'CameraHelper 显示相机视锥', 'setScissorTest 做左右分屏渲染', 'resize 时相机参数必须 updateProjectionMatrix'],
    snippet: [
      "cameraPerspective = new THREE.PerspectiveCamera( 50, 0.5 * aspect, 150, 1000 );",
      "cameraPerspectiveHelper = new THREE.CameraHelper( cameraPerspective );",
      "scene.add( cameraPerspectiveHelper );",
      "",
      "cameraOrtho = new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 150, 1000 );",
      "cameraOrthoHelper = new THREE.CameraHelper( cameraOrtho );",
      "scene.add( cameraOrthoHelper );"
    ],
    explain: [
      'PerspectiveCamera 的 fov、aspect、near、far 共同决定可见的锥形区域。',
      'OrthographicCamera 用 left/right/top/bottom 定义盒状可视区域，适合 CAD、编辑器和等距视角。',
      'CameraHelper 把不可见的相机视锥画出来，调 shadow camera 和编辑器相机时很有价值。',
      'near 太大时近处物体会被裁掉，far 太小时远处物体会消失。',
      '窗口尺寸变化后不调用 updateProjectionMatrix，相机内部投影矩阵仍是旧比例。'
    ],
    observe: [['按 P', '切换透视相机'], ['按 O', '切换正交相机'], ['看右侧辅助视图', '理解 activeCamera 的视锥'], ['改 near/far', '观察物体被裁切']],
    uses: ['三维编辑器双视图', '相机调试工具', '阴影相机调试', 'CAD/工业模型正交视图', '游戏过场镜头可视化']
  },
  {
    file: 'webgl_helpers.html',
    title: 'Helpers：网格、极坐标网格和包围盒调试',
    purpose: '学习如何用 helper 建立空间方向感，并用 BoxHelper 看清对象、group 和整个 scene 的真实包围范围。',
    points: ['GridHelper 提供地面尺度', 'PolarGridHelper 提供环形坐标参照', 'BoxHelper 可以包住 Mesh、Line、Group、Scene', 'helper 是调试对象，不是业务模型', 'GLTFLoader 加载模型后也可以立刻加 helper 检查尺寸'],
    snippet: [
      "const gridHelper = new THREE.GridHelper( 400, 40, 0x0000ff, 0x808080 );",
      "scene.add( gridHelper );",
      "",
      "loader.load( 'models/gltf/LeePerrySmith/LeePerrySmith.glb', function ( gltf ) {",
      "  const mesh = gltf.scene.children[ 0 ];",
      "  group.add( mesh );",
      "  scene.add( new THREE.BoxHelper( mesh ) );",
      "} );"
    ],
    explain: [
      'GridHelper 的第一个参数是总尺寸，第二个参数是分段数量。',
      'BoxHelper 会根据对象当前世界矩阵计算包围盒，因此能快速发现模型尺寸过大、偏移或旋转异常。',
      'BoxHelper 包住 Group 时，会包含所有子对象。',
      'BoxHelper 包住 Scene 时，会把场景中所有可见对象作为整体范围。',
      '项目上线通常隐藏 helper，但开发期应该大量使用它们。'
    ],
    observe: [['看蓝色网格', '判断地面大小和方向'], ['看 BoxHelper', '判断模型是否偏离原点'], ['把模型 scale 改大', '观察包围盒跟着变大'], ['给 group 加 helper', '观察多个子对象总范围']],
    uses: ['模型导入调试', '自动居中前的尺寸检查', '编辑器辅助线', '碰撞体范围核对', '场景坐标教学']
  },
  {
    file: 'webgl_loader_gltf.html',
    title: 'GLTFLoader：加载真实模型并自动适配相机',
    purpose: '学习真实 glTF 模型加载、环境贴图、动画播放，以及官方 fitCameraToSelection 如何用 Box3 自动把相机摆到合适距离。',
    points: ['GLTFLoader 加载 glb/gltf', 'scene.environment 给 PBR 模型环境反射', 'Box3 计算模型尺寸和中心', 'AnimationMixer 播放模型自带动画', 'compileAsync 避免模型加入场景时卡顿'],
    snippet: [
      "const loader = new GLTFLoader();",
      "loader.load( url, async function ( gltf ) {",
      "  currentModel = gltf.scene;",
      "  await renderer.compileAsync( currentModel, camera, scene );",
      "  scene.add( currentModel );",
      "  fitCameraToSelection( camera, controls, currentModel );",
      "",
      "  if ( gltf.animations.length > 0 ) {",
      "    mixer = new THREE.AnimationMixer( currentModel );",
      "    for ( const animation of gltf.animations ) {",
      "      mixer.clipAction( animation ).play();",
      "    }",
      "  }",
      "} );"
    ],
    explain: [
      'gltf.scene 是模型的根对象，通常是一个 Group，不一定只有一个 mesh。',
      'compileAsync 会提前编译材质 shader，减少第一次显示时的卡顿。',
      'fitCameraToSelection 用 Box3 计算模型中心和最大尺寸，再移动相机、更新 controls.target。',
      'AnimationMixer 绑定到模型根对象，用 clipAction 播放模型携带的动画片段。',
      '本地镜像把官网远程模型列表改成本地 models/gltf 下的模型，避免离线打不开。'
    ],
    observe: [['切换 GUI model', '不同尺寸模型都会被 fit 到画面中'], ['调 backgroundBlurriness', '只影响背景模糊，不等于模型变糊'], ['选择带动画模型', '观察 AnimationMixer 每帧推进'], ['删除 fitCameraToSelection', '模型可能过大、过小或飞出画面']],
    uses: ['通用模型预览器', '商品 3D 展示', '自动适配任意模型上传', '角色动画预览', '资产审核工具']
  },
  {
    file: 'css2d_label.html',
    title: 'CSS2DRenderer：把 HTML 标签贴到 3D 坐标上',
    purpose: '学习如何让普通 DOM 跟随 3D 对象移动，用于标注、热点、名称牌和信息浮层。',
    points: ['CSS2DObject 把 DOM 包成 3D 对象', 'CSS2DRenderer 单独渲染 DOM 层', 'WebGLRenderer 和 CSS2DRenderer 需要同尺寸', '标签位置来自 Object3D 坐标', 'CSS2D 不会参与深度遮挡的真实渲染'],
    snippet: [
      "const earthDiv = document.createElement( 'div' );",
      "earthDiv.className = 'label';",
      "earthDiv.textContent = 'Earth';",
      "const earthLabel = new CSS2DObject( earthDiv );",
      "earthLabel.position.set( 1.5 * EARTH_RADIUS, 0, 0 );",
      "earth.add( earthLabel );",
      "",
      "labelRenderer = new CSS2DRenderer();",
      "labelRenderer.setSize( window.innerWidth, window.innerHeight );",
      "document.body.appendChild( labelRenderer.domElement );"
    ],
    explain: [
      'CSS2DObject 本质是一个 Object3D，所以可以 add 到 mesh 或 group 上。',
      '标签的 position 是相对父对象的局部坐标。',
      'CSS2DRenderer 渲染 DOM，不渲染 WebGL，因此它要和 WebGLRenderer 同步尺寸。',
      'OrbitControls 通常绑定到 labelRenderer.domElement 或 renderer.domElement，避免 DOM 层挡住交互。',
      '如果需要 3D 遮挡、旋转、缩放，需要考虑 CSS3DRenderer 或 Sprite。'
    ],
    observe: [['拖动相机', '标签跟随 3D 位置移动'], ['改 label position', '标签相对模型偏移'], ['隐藏 WebGL canvas', '标签仍是普通 DOM'], ['缩放窗口', '两个 renderer 都必须 resize']],
    uses: ['地图点位标签', '产品部件说明', '知识图谱热点', '建筑楼层标注', '设备状态面板']
  },
  {
    file: 'misc_controls_drag.html',
    title: 'DragControls：直接拖拽 3D 物体',
    purpose: '学习如何让鼠标拖动物体，并理解拖拽控制和 OrbitControls 为什么需要互斥。',
    points: ['DragControls 接收可拖拽物体数组', 'dragstart 时通常关闭 OrbitControls', 'dragend 时恢复 OrbitControls', '拖拽发生在相机视角相关平面上', '适合简单物体摆放，不等于完整编辑器 gizmo'],
    snippet: [
      "controls = new DragControls( [ ... objects ], camera, renderer.domElement );",
      "controls.rotateSpeed = 2;",
      "controls.addEventListener( 'drag', render );",
      "document.addEventListener( 'click', onClick );",
      "window.addEventListener( 'keydown', onKeyDown );",
      "window.addEventListener( 'keyup', onKeyUp );"
    ],
    explain: [
      'objects 是允许拖拽的对象列表，不在列表里的物体不会响应。',
      '拖拽时如果 OrbitControls 仍然启用，鼠标移动会同时拖物体和转相机，交互会冲突。',
      'DragControls 更适合自由拖动物体，不负责精确轴向移动。',
      '如果要像 Blender/编辑器那样按轴移动，需要 TransformControls。',
      '拖拽后对象 position 已经改变，可以持久化到你的业务数据。'
    ],
    observe: [['拖动对象', '物体位置改变'], ['拖拽时转动相机', '被禁用避免冲突'], ['把对象从数组移除', '对象不能被拖拽'], ['换成 TransformControls', '对比轴向编辑能力']],
    uses: ['简单搭建器', '室内家具摆放', '教学拖动物体', '2.5D 编辑工具', '关卡原型编辑']
  },
  {
    file: 'misc_controls_transform.html',
    title: 'TransformControls：编辑器里的移动、旋转、缩放手柄',
    purpose: '学习 3D 编辑器 gizmo 的基本实现：attach 目标对象、切换 translate/rotate/scale、世界/本地坐标和吸附。',
    points: ['TransformControls 需要 attach 到目标 Object3D', 'getHelper 返回可显示的 gizmo', 'dragging-changed 用来暂停 OrbitControls', 'setMode 切换移动旋转缩放', 'setSpace 切换 local/world'],
    snippet: [
      "control = new TransformControls( currentCamera, renderer.domElement );",
      "control.addEventListener( 'dragging-changed', function ( event ) {",
      "  orbit.enabled = ! event.value;",
      "} );",
      "",
      "control.attach( mesh );",
      "const gizmo = control.getHelper();",
      "scene.add( gizmo );",
      "",
      "control.setMode( 'translate' );",
      "control.setSpace( control.space === 'local' ? 'world' : 'local' );"
    ],
    explain: [
      'TransformControls 自身不是 mesh，它通过 getHelper 把控制手柄加入场景。',
      'attach(mesh) 表示当前编辑目标是这个 mesh。',
      'dragging-changed 为 true 时关闭 orbit，避免拖手柄时相机也旋转。',
      'translate/rotate/scale 是编辑器三大基础模式。',
      'local/world 决定坐标轴跟随物体旋转，还是保持世界坐标方向。'
    ],
    observe: [['按 W/E/R', '切换移动、旋转、缩放'], ['按 Q', '切换本地/世界坐标'], ['按 Shift 拖动', '启用吸附'], ['按 X/Y/Z', '隐藏对应轴向手柄']],
    uses: ['模型编辑器', '场景搭建器', '关卡编辑器', '室内设计工具', '可视化配置平台']
  },
  {
    file: 'webgl_interactive_cubes.html',
    title: 'Raycaster：鼠标悬停拾取 2000 个立方体',
    purpose: '学习屏幕坐标如何转成 NDC，再用 Raycaster 从相机发出射线命中 3D 对象。',
    points: ['pointer 坐标必须归一化到 -1 到 1', 'raycaster.setFromCamera 使用相机生成射线', 'intersectObjects 返回按距离排序的命中列表', '只取 intersects[0] 表示最近对象', '用 emissive 改色做 hover 高亮'],
    snippet: [
      "pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;",
      "pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;",
      "",
      "raycaster.setFromCamera( pointer, camera );",
      "const intersects = raycaster.intersectObjects( scene.children, false );",
      "",
      "if ( intersects.length > 0 ) {",
      "  INTERSECTED = intersects[ 0 ].object;",
      "  INTERSECTED.material.emissive.setHex( 0xff0000 );",
      "}"
    ],
    explain: [
      '浏览器鼠标坐标左上角是 0,0；WebGL 拾取需要 NDC，中心是 0,0，范围是 -1 到 1。',
      'y 轴要取负，因为浏览器 y 向下，NDC y 向上。',
      'intersectObjects 第二个参数 false 表示不递归子节点。',
      '命中列表按离相机近到远排序，通常第一个就是用户看到的最前对象。',
      '案例只做 hover，如果要 click，应该在 pointerdown/click 事件里复用同样的 raycaster 逻辑。'
    ],
    observe: [['移动鼠标', '最近命中立方体变红'], ['把 recursive 改 true', '测试 group 子对象拾取'], ['把对象数量加大', '观察拾取成本'], ['在 click 事件里运行同样代码', '实现选择功能']],
    uses: ['点击选择模型', '悬停高亮', '3D 菜单/热点', '编辑器选中对象', '游戏拾取和瞄准']
  },
  {
    file: 'webgl_instancing_raycast.html',
    title: 'InstancedMesh Raycast：大量实例里知道点中哪一个',
    purpose: '学习 Raycaster 命中 InstancedMesh 后如何通过 instanceId 找到具体实例，并修改单个实例的颜色或状态。',
    points: ['InstancedMesh 多个实例共享 geometry/material', 'raycast 结果包含 instanceId', 'setColorAt 修改单个实例颜色', 'instanceColor.needsUpdate 提交颜色变化', '适合大量重复对象拾取'],
    snippet: [
      "const intersection = raycaster.intersectObject( mesh );",
      "if ( intersection.length > 0 ) {",
      "  const instanceId = intersection[ 0 ].instanceId;",
      "  mesh.setColorAt( instanceId, color.setHex( Math.random() * 0xffffff ) );",
      "  mesh.instanceColor.needsUpdate = true;",
      "}"
    ],
    explain: [
      '普通 Mesh 命中后拿 object 就够了，InstancedMesh 还需要 instanceId 区分具体哪一个实例。',
      'setColorAt 不会创建新 material，只更新实例颜色 buffer。',
      '修改实例矩阵或颜色后要标记 needsUpdate。',
      '这比给每个对象创建独立 Mesh 更省 draw call。',
      '业务状态可以用 instanceId 映射到自己的数据数组。'
    ],
    observe: [['移动鼠标到实例上', '单个实例高亮'], ['打印 instanceId', '确认点中的是哪个编号'], ['修改 setMatrixAt', '移动单个实例'], ['把实例数量加大', '观察 draw call 仍然低']],
    uses: ['楼盘户型选择', '仓库货架点选', '大规模格子地图', '粒子式对象选择', '城市建筑批量交互']
  },
  {
    file: 'webgl_interactive_voxelpainter.html',
    title: 'Voxel Painter：网格吸附式体素编辑',
    purpose: '学习如何用 Raycaster、法线方向和网格吸附实现“点击放置方块、按键删除方块”的编辑器能力。',
    points: ['射线命中平面或已有方块', '使用 intersect.face.normal 决定新方块贴在哪一侧', '坐标除以网格尺寸后 floor，再回到中心点', 'objects 数组决定哪些对象可被拾取', 'rollOverMesh 是预览，不是真方块'],
    snippet: [
      "raycaster.setFromCamera( pointer, camera );",
      "const intersects = raycaster.intersectObjects( objects, false );",
      "",
      "if ( intersects.length > 0 ) {",
      "  const intersect = intersects[ 0 ];",
      "  rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );",
      "  rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );",
      "}"
    ],
    explain: [
      'intersect.point 是射线打到表面的世界坐标。',
      'intersect.face.normal 表示被打中面的法线方向，新方块要沿这个方向偏移一格。',
      'divide/floor/multiply/addScalar 是典型网格吸附：把任意坐标归到 50 单位格子的中心。',
      'rollOverMesh 只是半透明预览，用来告诉用户将要放在哪里。',
      '真正放置时会创建新的 cube mesh，并加入 scene 和 objects 数组，之后它也能被继续拾取。'
    ],
    observe: [['移动鼠标', '预览方块吸附到网格'], ['点击地面', '添加方块'], ['点击已有方块侧面', '新方块贴到相邻格'], ['按删除模式', '移除被点中的方块']],
    uses: ['Minecraft 式编辑器', '关卡编辑器', '建筑草图工具', '网格化搭建工具', '教学用空间坐标练习']
  },
  {
    file: 'webgl_instancing_performance.html',
    title: 'Instancing Performance：一万个对象为什么不该是一万个 Mesh',
    purpose: '学习 InstancedMesh 如何用一次 draw call 绘制大量相同几何，并比较普通 Mesh、merged geometry 和 instancing 的差别。',
    points: ['InstancedMesh 共享 geometry/material', '每个实例只有 matrix/color 等差异数据', 'setMatrixAt 写入实例矩阵', 'draw call 大幅减少', '适合重复对象，不适合每个对象拓扑都不同的情况'],
    snippet: [
      "const mesh = new THREE.InstancedMesh( geometry, material, api.count );",
      "const matrix = new THREE.Matrix4();",
      "",
      "for ( let i = 0; i < api.count; i ++ ) {",
      "  randomizeMatrix( matrix );",
      "  mesh.setMatrixAt( i, matrix );",
      "}",
      "",
      "scene.add( mesh );"
    ],
    explain: [
      'InstancedMesh 的第三个参数是实例数量。',
      '每个实例通过 matrix 表示自己的位置、旋转和缩放。',
      '所有实例共用一份 geometry 和 material，因此 GPU 提交成本低。',
      '如果每个对象材质完全不同，instancing 的收益会降低。',
      '案例的重点是性能对比，不是视觉复杂度。'
    ],
    observe: [['切换渲染方式', '比较 FPS 和 draw call'], ['调 count', '观察数量增长的成本'], ['开启/关闭动态更新', '理解静态实例更便宜'], ['改 material', '所有实例同时受影响']],
    uses: ['森林、草地、石头', '城市窗户/建筑重复件', '货架商品', '粒子化物体', '大规模可视化点阵']
  },
  {
    file: 'webgl_instancing_dynamic.html',
    title: 'Dynamic Instancing：大量实例动起来时要更新什么',
    purpose: '学习实例矩阵每帧变化时如何更新 instanceMatrix，并理解 DynamicDrawUsage 的意义。',
    points: ['静态 instancing 只初始化一次 matrix', '动态 instancing 每帧 setMatrixAt', 'instanceMatrix.needsUpdate 通知 GPU 上传', 'DynamicDrawUsage 表示 buffer 会频繁变', '动态更新比静态更贵但仍比大量 Mesh 便宜'],
    snippet: [
      "mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );",
      "",
      "for ( let i = 0; i < mesh.count; i ++ ) {",
      "  dummy.position.set( offset - x, 0, offset - z );",
      "  dummy.updateMatrix();",
      "  mesh.setMatrixAt( i, dummy.matrix );",
      "}",
      "",
      "mesh.instanceMatrix.needsUpdate = true;"
    ],
    explain: [
      'DynamicDrawUsage 是给 WebGL 的提示：这个 buffer 会经常被改。',
      'dummy Object3D 用来方便生成 position/rotation/scale 对应的矩阵。',
      'setMatrixAt 只改 CPU 侧数据，needsUpdate 才会触发上传。',
      '如果只改一部分实例，也要考虑上传成本。',
      '大量动态实例适合模拟鱼群、弹幕、运动粒子等重复对象。'
    ],
    observe: [['暂停更新', '实例停止运动'], ['删除 needsUpdate', 'CPU 改了但画面不更新'], ['增加 count', '观察动态上传压力'], ['改 DynamicDrawUsage', '理解这是性能提示不是功能开关']],
    uses: ['鱼群/鸟群', '大规模弹幕', '运动传感点', '粒子替代 mesh', '动态城市交通可视化']
  },
  {
    file: 'webgl_points_sprites.html',
    title: 'Points Sprites：什么时候不要用 Mesh',
    purpose: '学习用 Points 和贴图点精灵渲染大量小元素，而不是为每个点创建独立 Mesh。',
    points: ['Points 使用 BufferGeometry 的 position 属性', 'PointsMaterial 可以设置 size 和 map', '每个顶点就是一个点精灵', '适合远处/小尺寸/数量多的元素', '不适合需要真实体积和复杂光照的对象'],
    snippet: [
      "const geometry = new THREE.BufferGeometry();",
      "geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );",
      "",
      "materials[ i ] = new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true } );",
      "materials[ i ].color.setHSL( color[ 0 ], color[ 1 ], color[ 2 ], THREE.SRGBColorSpace );",
      "",
      "const particles = new THREE.Points( geometry, materials[ i ] );",
      "scene.add( particles );"
    ],
    explain: [
      'BufferGeometry 里每三个数字是一点的 x/y/z。',
      'PointsMaterial 的 map 是每个点显示的贴图。',
      'Points 通常只有屏幕对齐的视觉面片，不是完整 3D 几何。',
      'size 控制点在屏幕中的大小，数量很多时比 Mesh 便宜。',
      '如果要每个粒子独立旋转、受光、碰撞，Points 可能不够。'
    ],
    observe: [['改 size', '点精灵变大变小'], ['换 sprite 贴图', '点的外观改变'], ['增加顶点数量', '观察性能'], ['改透明度', '理解排序和混合问题']],
    uses: ['星空', '雪花/火花', '点云', '传感器点位', '远处植被/装饰粒子']
  },
  {
    file: 'webgl_lines_fat.html',
    title: 'Fat Lines：普通 Line 为什么控制不了稳定宽度',
    purpose: '学习 Line2/LineMaterial 如何实现屏幕空间粗线，并理解 resolution 对线宽计算的影响。',
    points: ['WebGL 原生 Line 宽度支持有限', 'Line2 用几何方式模拟粗线', 'LineMaterial.linewidth 控制线宽', 'resolution 必须跟随窗口更新', '适合路线、轨迹、边框和测量线'],
    snippet: [
      "const geometry = new LineGeometry();",
      "geometry.setPositions( positions );",
      "",
      "matLine = new LineMaterial( {",
      "  color: 0xffffff,",
      "  linewidth: 5",
      "} );",
      "",
      "line = new Line2( geometry, matLine );",
      "line.computeLineDistances();",
      "scene.add( line );"
    ],
    explain: [
      '普通 THREE.Line 在很多平台上 linewidth 基本不可控。',
      'Line2/LineGeometry/LineMaterial 是 examples 里的粗线方案。',
      'linewidth 是屏幕空间宽度，不是世界单位宽度。',
      'resolution 用来把屏幕像素和线宽换算正确，窗口 resize 时必须更新。',
      '粗线本质更像带宽度的几何条带，成本高于普通 Line。'
    ],
    observe: [['改 linewidth', '线条宽度变化'], ['resize 后不更新 resolution', '线宽比例可能异常'], ['切换世界单位/屏幕单位', '理解不同线宽模式'], ['增加线段数量', '观察性能成本']],
    uses: ['地图路径', '三维轨迹', 'CAD 边线', '流程连线', '测距和标注工具']
  },
  {
    file: 'webgl_postprocessing.html',
    title: 'EffectComposer：后处理为什么不是 renderer.render',
    purpose: '学习后处理管线如何把场景先渲染到纹理，再通过多个 pass 做屏幕空间效果。',
    points: ['EffectComposer 管理多个 pass', 'RenderPass 先渲染原始场景', 'ShaderPass 对渲染结果做图像处理', 'pass 顺序影响最终画面', 'composer.render 替代 renderer.render'],
    snippet: [
      "composer = new EffectComposer( renderer );",
      "composer.addPass( new RenderPass( scene, camera ) );",
      "",
      "const effect1 = new ShaderPass( DotScreenShader );",
      "effect1.uniforms[ 'scale' ].value = 4;",
      "composer.addPass( effect1 );",
      "",
      "const effect2 = new ShaderPass( RGBShiftShader );",
      "effect2.uniforms[ 'amount' ].value = 0.0015;",
      "composer.addPass( effect2 );",
      "",
      "const effect3 = new OutputPass();",
      "composer.addPass( effect3 );",
      "",
      "composer.render();"
    ],
    explain: [
      'RenderPass 把三维场景渲染成一张中间纹理。',
      'ShaderPass 读取上一张纹理，再输出处理后的画面。',
      '多个 pass 像流水线一样串联，顺序不一样效果也不一样。',
      '用了 composer 后，动画循环里通常调用 composer.render，而不是 renderer.render。',
      '后处理是屏幕空间效果，不能改变真实灯光和几何。'
    ],
    observe: [['调整 pass 参数', '画面滤镜变化'], ['交换 pass 顺序', '最终效果不同'], ['关闭某个 pass', '确认它负责哪部分效果'], ['降低渲染尺寸', '观察性能和画质变化']],
    uses: ['描边、高亮、泛光', '景深、噪声、胶片效果', 'SSAO、SSR', '游戏画面风格化', '编辑器选中态']
  },
  {
    file: 'webgl_postprocessing_unreal_bloom.html',
    title: 'UnrealBloomPass：发光光晕为什么是后期，不是真灯',
    purpose: '学习 Bloom 如何让高亮区域在屏幕上向周围扩散，并区分它和真实照明的区别。',
    points: ['Bloom 是后处理光晕', 'threshold 决定哪些亮度进入 bloom', 'strength 决定光晕强度', 'radius 决定扩散范围', 'Bloom 不会照亮别人，也不会产生阴影'],
    snippet: [
      "const bloomPass = new UnrealBloomPass(",
      "  new THREE.Vector2( window.innerWidth, window.innerHeight ),",
      "  1.5,",
      "  0.4,",
      "  0.85",
      ");",
      "",
      "bloomPass.threshold = params.threshold;",
      "bloomPass.strength = params.strength;",
      "bloomPass.radius = params.radius;"
    ],
    explain: [
      'UnrealBloomPass 接收屏幕尺寸和初始 threshold/strength/radius。',
      'threshold 太低时普通亮面也会发光，画面会脏。',
      'strength 太高时光晕糊成一片。',
      'radius 控制扩散半径，不是灯光距离。',
      '如果想让发光物体真的照亮周围，需要额外放 PointLight/SpotLight 或使用全局光照方案。'
    ],
    observe: [['调 threshold', '控制哪些亮部开始外溢'], ['调 strength', '控制光晕强弱'], ['调 radius', '控制光晕范围'], ['关闭真实灯光', 'Bloom 仍不照亮其他物体']],
    uses: ['霓虹灯', '科幻能量核心', '高亮选中状态', '夜景灯牌', '游戏技能特效']
  },
  {
    file: 'webgl_postprocessing_ssao.html',
    title: 'SSAO：为什么角落和接缝需要更暗一点',
    purpose: '学习屏幕空间环境遮蔽如何让接触处、缝隙和角落变暗，增强空间层次。',
    points: ['SSAO 是后处理，不是真实阴影', '依赖深度和法线信息', 'kernel/radius 控制采样范围', '强度太高会显脏', '适合补足环境光过平的问题'],
    snippet: [
      "const ssaoPass = new SSAOPass( scene, camera, width, height );",
      "composer.addPass( ssaoPass );",
      "",
      "const outputPass = new OutputPass();",
      "composer.addPass( outputPass );",
      "",
      "gui.add( ssaoPass, 'kernelRadius' ).min( 0 ).max( 32 );",
      "gui.add( ssaoPass, 'minDistance' ).min( 0.001 ).max( 0.02 );",
      "gui.add( ssaoPass, 'maxDistance' ).min( 0.01 ).max( 0.3 );"
    ],
    explain: [
      'SSAO 根据屏幕上像素附近的深度关系推测遮蔽。',
      'composer.addPass 把 SSAO 插入后处理流水线，原始场景渲染完后再计算遮蔽。',
      'OutputPass 负责最后输出到屏幕，避免后处理结果停在中间纹理里。',
      'kernelRadius 大，遮蔽范围大但成本和噪点风险也更高。',
      'minDistance/maxDistance 控制哪些距离范围算遮蔽。',
      '因为是屏幕空间，屏幕外物体不会参与计算。'
    ],
    observe: [['开关 SSAO', '观察接触阴影和角落层次'], ['调 kernelRadius', '遮蔽范围变大变小'], ['调强度', '过高会脏'], ['移动相机', '理解屏幕空间限制']],
    uses: ['室内场景', '产品落地接触阴影', '游戏环境层次增强', '建筑可视化', '低成本真实感增强']
  },
  {
    file: 'webgl_lights_physical.html',
    title: 'Physical Lights：真实单位、灯泡、曝光和距离衰减',
    purpose: '学习 three.js 里物理灯光的整体链路：PointLight、HemisphereLight、真实 lumen/lux、decay=2、toneMappingExposure 和阴影。',
    points: ['PointLight 用 lumen 级别模拟灯泡', 'HemisphereLight 用 lux 级别模拟环境照度', 'decay=2 是物理平方衰减', 'toneMappingExposure 控制输出曝光', '真实尺度会影响光照观感'],
    snippet: [
      "bulbLight = new THREE.PointLight( 0xffee88, 1, 100, 2 );",
      "bulbLight.castShadow = true;",
      "",
      "hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 0.02 );",
      "",
      "renderer.toneMapping = THREE.ReinhardToneMapping;",
      "renderer.toneMappingExposure = Math.pow( params.exposure, 5.0 );",
      "",
      "bulbLight.power = bulbLuminousPowers[ params.bulbPower ];",
      "hemiLight.intensity = hemiLuminousIrradiances[ params.hemiIrradiance ];"
    ],
    explain: [
      'PointLight 的 power 可以用 lumen 思考，比随便填 intensity 更接近现实。',
      'HemisphereLight 的 intensity 在这个案例中用环境照度 lux 做参考。',
      'decay=2 让光按真实平方反比衰减，所以距离非常重要。',
      '曝光会影响最终画面亮度，但不改变灯本身的物理强度。',
      '案例里的砖块 50cm、灯泡 50cm，是为了让真实光照单位有意义。'
    ],
    observe: [['切 bulbPower', '灯泡真实亮度变化'], ['切 hemiIrradiance', '环境底光从月夜到日光变化'], ['调 exposure', '最终输出变亮或变暗'], ['开关 shadows', '光还在但阴影消失']],
    uses: ['室内灯光模拟', '产品棚拍', '真实单位灯具配置器', '建筑照明可视化', '学习 PBR 曝光工作流']
  },
  {
    file: 'webgl_lights_hemisphere.html',
    title: 'Hemisphere Light：天空光、地面反光和户外氛围',
    purpose: '学习半球光如何用天空色和地面色给户外模型补光，并与 DirectionalLight 共同形成自然日光。',
    points: ['HemisphereLight 有天空色和地面色', '不会产生阴影', 'DirectionalLight 负责主光和阴影', 'ShaderMaterial 天空球只是背景', 'Fog 颜色需要和天空/地面气氛协调'],
    snippet: [
      "const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 2 );",
      "hemiLight.color.setHSL( 0.6, 1, 0.6 );",
      "hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );",
      "scene.add( hemiLight );",
      "",
      "const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );",
      "dirLight.castShadow = true;",
      "scene.add( dirLight );"
    ],
    explain: [
      'hemiLight.color 是天空方向颜色，通常偏蓝。',
      'groundColor 是地面反弹颜色，草地可偏黄绿，雪地可偏冷白。',
      'HemisphereLight 没有精确方向，因此不投射阴影。',
      'DirectionalLight 和 HemisphereLight 配合，才能同时有暗部补光和明确投影。',
      '天空球和 fog 是视觉环境，不等于半球光本身。'
    ],
    observe: [['开关 HemisphereLight', '暗部补光变化'], ['开关 DirectionalLight', '阴影和主光变化'], ['改 groundColor', '底部反光颜色变化'], ['改 fog 颜色', '远处氛围变化']],
    uses: ['户外角色展示', '自然风景', '动物/车辆预览', '低成本日光环境', '天空地面色调控制']
  },
  {
    file: 'webgl_lights_spotlight.html',
    title: 'SpotLight：锥形光、半影、投影纹理和阴影相机',
    purpose: '学习聚光灯的完整控制参数，包括 angle、penumbra、decay、distance、shadow.focus、map 和 helper。',
    points: ['SpotLight 是锥形光源', 'angle 控制锥形开口', 'penumbra 控制边缘软硬', 'map 可以投射纹理光斑', 'shadow camera 决定阴影质量和范围'],
    snippet: [
      "spotLight = new THREE.SpotLight( 0xffffff, 100 );",
      "spotLight.map = textures[ 'disturb.jpg' ];",
      "spotLight.position.set( 2.5, 5, 2.5 );",
      "spotLight.angle = Math.PI / 6;",
      "spotLight.penumbra = 1;",
      "spotLight.decay = 2;",
      "spotLight.castShadow = true;",
      "spotLight.shadow.bias = - .003;"
    ],
    explain: [
      'angle 越大，照亮范围越宽，但单位面积能量观感会更散。',
      'penumbra 越大，光斑边缘越柔。',
      'map 让聚光灯像投影仪一样带图案。',
      'shadow.focus 会影响阴影投射区域聚焦方式。',
      'bias 用于减轻阴影痤疮，但过大可能让阴影漂浮。'
    ],
    observe: [['调 angle', '光斑扩大或缩小'], ['调 penumbra', '边缘变软或变硬'], ['切换 map', '光斑图案变化'], ['打开 helpers', '看到光锥和阴影相机']],
    uses: ['舞台灯', '手电筒', '车灯', '投影图案', '局部强调光']
  },
  {
    file: 'webgl_lights_spotlights.html',
    title: 'Multiple SpotLights：多盏聚光灯的组合效果',
    purpose: '学习多盏 SpotLight 如何共同照明，以及为什么多阴影光源会带来明显性能成本。',
    points: ['多个 SpotLight 可以形成舞台布光', '每盏灯都有自己的位置、方向和投影', '多盏 castShadow 的成本很高', '颜色叠加会影响材质观感', 'helper 能帮助调每盏灯的方向'],
    snippet: [
      "const newObj = new THREE.SpotLight( color, 10 );",
      "newObj.castShadow = true;",
      "newObj.angle = 0.3;",
      "newObj.penumbra = 0.2;",
      "newObj.decay = 2;",
      "newObj.distance = 50;"
    ],
    explain: [
      '这个案例适合理解“灯光组合”，不是只看单盏灯参数。',
      '多盏灯颜色混合后，物体颜色会被改变。',
      '每个开启阴影的 SpotLight 都需要额外渲染阴影贴图。',
      '在真实项目里，通常只让少数关键灯投影，其他灯只照明。',
      '多灯布光要配合曝光和 tone mapping，否则容易过曝。'
    ],
    observe: [['关闭其中一盏灯', '观察主次光变化'], ['关闭部分阴影', '性能改善但阴影减少'], ['修改颜色', '观察彩色光混合'], ['打开 helper', '逐盏校准方向']],
    uses: ['舞台灯光系统', '展厅射灯', '游戏警示灯', '多车灯场景', '产品多灯棚拍']
  },
  {
    file: 'webgl_lights_rectarealight.html',
    title: 'RectAreaLight：窗户、柔光箱和长条高光',
    purpose: '学习有面积的矩形光源如何形成柔和照明和宽高可控的高光形状。',
    points: ['RectAreaLight 有宽高', '需要 RectAreaLightUniformsLib.init', 'RectAreaLightHelper 显示面光位置', '面光适合柔光和高光，不适合常规投影', '光滑材质更容易看出面光形状'],
    snippet: [
      "RectAreaLightUniformsLib.init();",
      "",
      "rectLight1 = new THREE.RectAreaLight( 0xff0000, 5, 4, 10 );",
      "rectLight1.position.set( - 5, 6, 5 );",
      "scene.add( rectLight1 );",
      "scene.add( new RectAreaLightHelper( rectLight1 ) );"
    ],
    explain: [
      'RectAreaLight 的参数是 color、intensity、width、height。',
      'width/height 决定光源形状，也影响高光形状。',
      'RectAreaLightUniformsLib.init 是必要初始化。',
      'helper 是可视化矩形发光面，方便调方向和位置。',
      '案例让三个面光旋转，是为了观察面光朝向变化对高光的影响。'
    ],
    observe: [['观察三个彩色面光', '红绿蓝照明叠加'], ['修改宽高', '高光形状变化'], ['改材质 roughness', '高光从尖锐变柔'], ['隐藏 helper', '确认 helper 不参与真实照明']],
    uses: ['摄影棚柔光', '窗户光', '灯带/屏幕光', '汽车和手机高光', '产品展示棚拍']
  },
  {
    file: 'webgl_lightprobe.html',
    title: 'LightProbe：把一个位置的环境亮度压缩成补光',
    purpose: '用官方案例理解 LightProbe 不是灯泡，也不是反射贴图；它是从四周环境里提取“哪里亮、哪里暗、偏什么颜色”的柔和补光数据。',
    points: ['先分清直接光、反射和环境补光三条路径', 'LightProbe 不是点光源，没有距离衰减', 'cubeTexture 同时被用作反射来源和 probe 数据来源', 'envMap/roughness 主要控制表面反射', 'LightProbe 主要影响暗面和哑光表面的环境受光', '不会产生阴影'],
    snippet: [
      "lightProbe = new THREE.LightProbe();",
      "scene.add( lightProbe );",
      "",
      "lightProbe.copy( LightProbeGenerator.fromCubeTexture( cubeTexture ) );",
      "lightProbe.intensity = API.enableLightProbe ? API.lightProbeIntensity : 0;",
      "",
      "gui.add( API, 'enableLightProbe' )",
      "  .name( '补光开关' )",
      "",
      "gui.add( API, 'lightProbeIntensity', 0, 1, 0.02 )",
      "  .name( '补光强度' )",
      "",
      "const material = new THREE.MeshStandardMaterial( {",
      "  metalness: 0,",
      "  roughness: 0,",
      "  envMap: cubeTexture,",
      "  envMapIntensity: API.envMapIntensity,",
      "} );"
    ],
    lineNotes: [
      ["const API = {", "这里的 API 不是浏览器接口，也不是 Three.js 内置对象；它只是官方案例自己建的参数对象，专门给右上角 GUI 面板读写。"],
      ["enableLightProbe: true,", "enableLightProbe 是我给本地学习版加的补光开关。关闭后 LightProbe 强度会变成 0，但方向光和 envMap 仍然保留，方便只看环境补光差别。"],
      ["lightProbeIntensity: 1.0,", "LightProbe 的初始强度。数值越大，环境补光越强；它主要影响暗面和哑光受光，不负责投影。"],
      ["directionalLightIntensity: 0.6,", "directionalLightIntensity 就是方向光强度。方向光像太阳，有明确方向；这里 0.6 是案例给的初始亮度。"],
      ["envMapIntensity: 1", "envMapIntensity 是环境反射强度。它主要影响光滑表面看到周围环境的反射强弱。"],
      ["renderer.toneMapping = THREE.NoToneMapping;", "NoToneMapping 表示关闭色调映射。这个案例为了比较 LightProbe、方向光和 envMap 的原始强度，没有让 ACES/Reinhard 之类算法再压缩亮度。"],
      ["directionalLight = new THREE.DirectionalLight( 0xffffff, API.directionalLightIntensity );", "创建方向光。第一个参数是白色，第二个参数来自 API.directionalLightIntensity，也就是方向光初始强度。"],
      ["lightProbe.copy( LightProbeGenerator.fromCubeTexture( cubeTexture ) );", "从六面 cubeTexture 里提取环境补光数据，再复制到 lightProbe。注意这不是把图片贴到物体上，而是生成一份补光信息。"],
      ["lightProbe.intensity = API.enableLightProbe ? API.lightProbeIntensity : 0;", "根据补光开关决定 LightProbe 是否生效：开关打开使用滑块强度，关闭时强度归零。"],
      ["lightProbe.position.set( - 10, 0, 0 );", "LightProbe 的位置不参与这个案例的实际光照计算；这里移动位置主要是为了让 LightProbeHelper 显示在左侧，方便你看见它。"],
      ["envMapIntensity: API.envMapIntensity,", "把 GUI 参数里的 envMapIntensity 交给材质，控制这颗球表面的环境反射强度。"],
      ["gui.add( API, 'enableLightProbe' )", "创建补光开关，只控制 LightProbe 是否参与环境补光，不关闭方向光，也不关闭 envMap 反射。"],
      ["gui.add( API, 'lightProbeIntensity', 0, 1, 0.02 )", "创建补光强度滑块：范围 0 到 1，每次拖动按 0.02 递增。它改的是 API.lightProbeIntensity。"],
      ["gui.add( API, 'directionalLightIntensity', 0, 1, 0.02 )", "创建 directional light 滑块。它控制方向光强度，也就是太阳/主光有多亮。"],
      ["directionalLight.intensity = API.directionalLightIntensity; render();", "滑块变化后，把 API.directionalLightIntensity 同步给方向光的 intensity，然后重画画面。"],
      ["gui.add( API, 'envMapIntensity', 0, 1, 0.02 )", "创建 envMap 滑块。它控制材质环境反射强度，不是控制 LightProbe。"],
      ["mesh.material.envMapIntensity = API.envMapIntensity; render();", "滑块变化后，只改变球体材质的 envMapIntensity，所以你主要看表面反射强弱，而不是阴影变化。"]
    ],
    explain: [
      'new THREE.LightProbe 创建的不是一盏能看见位置的灯，它更像“这个点位的环境亮度记录器”。',
      'LightProbeGenerator.fromCubeTexture 会读取 cubeTexture 六个方向的画面，把复杂环境压缩成一份柔和补光数据。',
      'lightProbe.copy 把这份补光数据放进当前 LightProbe，材质受光时就能用它给暗面补一点来自环境的颜色。',
      '同一个 cubeTexture 又被放进材质 envMap，这一条路径负责“表面能不能反射周围世界”。',
      'roughness 不会让物体自己发光，也不会制造环境；它只决定 envMap 反射是清楚还是模糊。',
      '所以这个案例故意把 LightProbe 和 envMap 放在一起：你要观察它们分别影响“暗面受光”和“表面反射”。'
    ],
    observe: [['关闭补光开关', '主要看球体暗面是否变黑、环境颜色是否少了，不要看镜面反射'], ['调补光强度', '主要看球体暗面和哑光区域变化'], ['调 envMap', '主要看光滑表面反射强弱变化'], ['关闭直接光', 'probe 对暗部的补光更明显'], ['把 roughness 改高', 'envMap 镜面反射会变糊，但这不是 LightProbe 的作用'], ['对比 HemisphereLight', '半球光只有天地两色，probe 能从 cubeTexture 提取更多方向的柔和环境色']],
    uses: ['环境补光', 'AR 光照估计', '室内低频照明', '大场景区域光照', '让移动角色在不同房间获得不同环境明暗', '与 HDR environment 配合：envMap 管反射，LightProbe 管柔和环境受光'],
    extra: `## 先给结论

如果你只记一句话，记这个：

\`envMap\` 让亮面“看见周围”，\`LightProbe\` 让暗面“吃到环境光”，普通灯光负责明确方向、明暗和阴影。

读完这篇后，你至少应该能判断三件事：

- 看到金属球表面有环境倒影，优先去看 \`envMap\`，不是先怀疑 \`LightProbe\`。
- 看到背光面没有死黑，而是带一点环境颜色，才去看 \`LightProbe\` 或其他环境补光。
- 看到投影、灯光方向、距离衰减，去看 \`DirectionalLight\`、\`PointLight\`、\`SpotLight\`，不要指望 \`LightProbe\` 做这些。

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
| \`HemisphereLight\` | 只能做天地两色的粗略补光 | 不能知道右边有蓝墙 |
| \`LightProbe\` | 可以近似记录某个位置周围的柔和颜色影响 | 适合暗面补光，不产生清晰阴影 |
| \`LightProbeGrid\` | 可以让不同位置吃到不同环境补光 | 适合角色在房间里移动 |
| \`lightMap\` / 烘焙贴图 | 可以很像真实间接光 | 静态场景常用，不能随便动态变化 |
| 路径追踪 / 全局光照 | 最接近真实反弹 | 成本高，不是普通 examples 默认路线 |

所以这句话要反过来记：

真实世界里，蓝墙影响白球是自然发生的。

Three.js 默认实时渲染里，蓝墙影响白球不会自然发生。你必须用灯光、环境贴图、LightProbe、LightMap、烘焙或全局光照方案主动补上。

这也是为什么 \`LightProbe\` 存在：它不是为了替代蓝墙，也不是为了做镜面反射，而是为了把“这个位置周围环境对物体暗面的柔和影响”保存下来，再交给材质使用。

## 一个现实类比

想象你拿一个白色石膏球放在房间中央：

- 房间左边有窗户，所以球左侧偏亮。
- 右边是深色柜子，所以球右侧偏暗。
- 地板是木色，所以球底部可能有一点暖色反弹。
- 天花板是白的，所以上方有一点柔和亮度。

\`LightProbe\` 记录的就是这种“这个位置周围大概哪里亮、哪里暗、偏什么颜色”的信息。它不是一张照片，也不是一盏灯泡，而是一份被压缩过的环境补光数据。

如果一定要给它一个现实身份，它更像“在这个点位用仪器测了一圈环境亮度，然后把测量结果保存下来”。

## 它和 envMap / roughness 的区别

所以你可以这样分：

| 能力 | 主要解决什么 | 现实类比 |
|---|---|---|
| \`envMap\` | 表面反射周围世界 | 金属球、玻璃、亮面车漆上看到房间或天空 |
| \`roughness\` | 控制反射清晰还是模糊 | 抛光金属很清楚，磨砂金属很糊 |
| \`HemisphereLight\` | 用天空色和地面色给全场补光 | 户外阴天：上面偏蓝，下面受地面反弹偏暖 |
| \`LightProbe\` | 保存某个位置周围多方向的柔和补光 | 房间左边窗户亮、右边墙暗、地面偏暖，这些被压缩保存 |
| \`DirectionalLight / PointLight / SpotLight\` | 明确光源、方向、距离、阴影 | 太阳、灯泡、手电筒 |

## 为什么 HemisphereLight 不够

\`HemisphereLight\` 只有两个大方向：上面一个颜色，下面一个颜色。

这很适合模拟阴天户外：天空整体亮一点，地面整体反弹一点。但它不知道“左边有一扇很亮的窗户，右边有一面红墙”。\`LightProbe\` 可以从 cube map 或预计算结果里提取更多方向的柔和亮度，所以比半球光更像“某个具体位置的环境”。

注意它仍然是柔和补光。它不能表示清晰的窗框影子，不能产生投影，也不能像镜子一样显示清晰画面。

## 为什么已经有 envMap 还要 LightProbe

因为它们走的是不同感知路径：

- \`envMap\` 更影响镜面反射和 PBR 高光。
- \`LightProbe\` 更影响柔和的环境漫反射受光。

你可以把它们分工记成一句话：

\`envMap\` 让亮面“看见周围”，\`LightProbe\` 让暗面“吃到环境光”。

真实项目里常见组合是：\`scene.environment\` 或材质 \`envMap\` 负责反射质感，\`LightProbe\` 或 probe volume 负责空间环境补光，再用 \`DirectionalLight\`、\`SpotLight\` 或 \`PointLight\` 做明确主光和阴影。`
  },
  {
    file: 'webgl_lightprobes.html',
    title: 'LightProbes：很多个点位的环境补光',
    purpose: '理解单个 LightProbe 只代表一个位置；多个 probe 排成网格后，就像在房间里多个位置都测了一圈环境亮度，让移动物体能获得不同区域的环境补光。',
    points: ['单个 probe 只能描述一个点位的环境', 'LightProbeGrid 是一组按网格排列的探针', 'bake 会在每个探针位置采样周围场景', '物体移动时可以在多个探针之间插值', '仍然不会产生动态阴影', '适合大场景分区补光'],
    snippet: [
      "probes = new LightProbeGrid( 5.6, 4.7, 5.6, resolution, resolution, resolution );",
      "probes.position.set( 0, 2.45, 0 );",
      "probes.bake( renderer, scene, { cubemapSize: 32, near: 0.05, far: 20 } );",
      "probes.visible = params.enabled;",
      "scene.add( probes );",
      "",
      "probesHelper = new LightProbeGridHelper( probes );"
    ],
    explain: [
      'LightProbeGrid 创建的是一组三维网格里的 probe，不是单独一盏灯。',
      '5.6、4.7、5.6 是这组 probe 覆盖的空间范围，可以理解成要测量的房间大小。',
      'resolution 决定每个方向放多少个 probe；数量越多，空间变化越细，但烘焙和数据成本越高。',
      'bake 会让 renderer 在每个 probe 点位向周围采样，把周围环境压缩成这个点位的补光数据。',
      'LightProbeGridHelper 只是把这些采样点显示出来，方便你知道 probe 放在哪里。',
      '这个案例解决的是“物体走到不同区域，环境补光也跟着变化”，不是动态阴影，也不是镜面反射。'
    ],
    observe: [['关闭补光 LightProbeGrid', '观察红墙/绿墙对物体暗面颜色影响是否减少'], ['看 helper 里的小点/网格', '先理解 probe 覆盖的是一块空间，不是一盏灯'], ['移动视角看球和盒子暗面', '观察它们吃到的环境补光是否变化'], ['增加 probe 数量', '过渡更细，但烘焙和数据更多'], ['改变覆盖范围', '确认 probe 只对它覆盖的空间有意义']],
    uses: ['大型室内场景', '游戏关卡环境光', 'AR/VR 空间光照', '角色移动补光', '烘焙光照系统'],
    extra: `## 先给结论

\`webgl_lightprobe.html\` 讲的是“一个点位的环境补光”。

\`webgl_lightprobes.html\` 讲的是“很多点位组成一块空间的环境补光”。

你可以先不用想复杂算法，只把它想成：在房间里放了很多个测光点，每个点都记住自己周围哪里亮、哪里暗。角色移动时，不是永远吃同一份补光，而是根据自己所在位置吃附近测光点的结果。

## 为什么要多个 probe

单个 \`LightProbe\` 只回答一个问题：站在这个点，周围环境大概怎么给我补光。

但真实场景里，不同位置的环境差别很大：

- 角色靠近窗户时，窗户方向应该更亮。
- 角色走到走廊深处时，整体应该更暗。
- 角色靠近红墙时，暗部可能带一点红色反弹。

如果全场只用一个 \`LightProbe\`，角色不管走到哪里都吃同一份环境补光，空间感就会假。\`LightProbeGrid\` 的意义就是把很多个 probe 放成一个体积区域。物体在这个区域里移动时，可以根据附近几个 probe 的数据做过渡。

你可以把它想成游戏里常说的“光照探针体积”：不是实时计算所有间接光，而是提前在很多点位测好环境亮度，运行时查附近的数据。`
  },
  {
    file: 'webgl_tonemapping.html',
    title: 'Tone Mapping：曝光和高动态范围压缩',
    purpose: '学习高亮、HDR 环境和 PBR 模型最终如何被压到屏幕可显示范围，以及不同 tone mapping 算法的观感差异。',
    points: ['toneMapping 是输出阶段处理，不是灯光', 'exposure 是进入 tone mapping 前的亮度倍数', 'HDR 环境提供超出 0-1 的亮度', 'None 会隐藏 exposure 控制', '背景 blurriness/intensity 只影响背景观感'],
    snippet: [
      "renderer.toneMapping = toneMappingOptions[ params.toneMapping ];",
      "renderer.toneMappingExposure = params.exposure;",
      "",
      "texture.mapping = THREE.EquirectangularReflectionMapping;",
      "scene.background = texture;",
      "scene.environment = texture;",
      "",
      "guiExposure = toneMappingFolder.add( params, 'exposure', 0, 2 )",
      "  .onChange( function ( value ) {",
      "",
      "    renderer.toneMappingExposure = value;",
      "",
      "  } );"
    ],
    explain: [
      'toneMapping 决定高亮如何被压回屏幕范围。',
      'toneMappingExposure 是全局曝光，所有物体最终都会受影响。',
      'HDR 环境贴图让金属、玻璃、高光更真实，也更需要 tone mapping。',
      'None 不做映射，高亮容易截断，官网因此隐藏 exposure 控件。',
      'CustomToneMapping 演示了可以替换 shader chunk 自定义曲线。'
    ],
    observe: [['切 None/Linear/Reinhard/ACES/AgX/Neutral', '看高光和整体对比'], ['调 exposure', '整体亮度变化'], ['调 backgroundBlurriness', '背景模糊但材质反射不等同变化'], ['调 backgroundIntensity', '背景显示强度变化']],
    uses: ['产品渲染调色', 'HDR 场景曝光', '夜景灯光控制', '影视感画面', 'PBR 最终观感统一']
  },
  {
    file: 'webgl_materials_envmaps.html',
    title: 'Environment Maps：普通环境贴图和反射/折射',
    purpose: '学习环境贴图如何给物体提供反射和折射信息，并理解 mapping、CubeTexture、EquirectangularTexture 的区别。',
    points: ['环境贴图不是普通颜色贴图', '反射材质会采样周围环境', '折射需要不同 mapping', 'scene.background 只是视觉背景', 'material.envMap 或 scene.environment 影响材质'],
    snippet: [
      "const loader = new THREE.CubeTextureLoader();",
      "loader.setPath( 'textures/cube/Bridge2/' );",
      "",
      "textureCube = loader.load( [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ] );",
      "textureEquirec.mapping = THREE.EquirectangularReflectionMapping;",
      "scene.background = textureCube;",
      "sphereMaterial = new THREE.MeshBasicMaterial( { envMap: textureCube } );"
    ],
    explain: [
      'EquirectangularReflectionMapping 表示这是一张经纬度环境图，用于反射采样。',
      'envMap 不贴在物体表面，而是根据视线和法线方向采样环境。',
      'reflectivity 控制反射混合强度。',
      '普通 envmap 可以做反射演示，但 PBR 写实材质通常要看 HDR + PMREM。',
      'background 显示环境图，不代表所有材质都自动使用它。'
    ],
    observe: [['切换 mapping', '反射/折射效果变化'], ['调 reflectivity', '环境反射强弱变化'], ['换 envMap', '反射世界改变'], ['隐藏 background', '材质仍可使用 envMap']],
    uses: ['金属反射', '玻璃折射', '天空盒', '产品环境反射', '材质预览器']
  },
  {
    file: 'webgl_materials_envmaps_hdr.html',
    title: 'HDR EnvMap：IBL、PMREM 和金属反射',
    purpose: '学习 HDR 环境贴图如何通过 PMREM 变成适合 PBR 材质采样的反射环境，并比较 Generated/LDR/HDR 的差别。',
    points: ['HDR 比 LDR 有更高亮度范围', 'PMREM 为不同 roughness 预过滤环境', 'MeshStandardMaterial 的 metalness/roughness 强依赖 envMap', 'plane debug 用来直接查看环境贴图', 'toneMappingExposure 影响最终输出'],
    snippet: [
      "hdrCubeMap = new HDRCubeTextureLoader()",
      "  .setPath( './textures/cube/pisaHDR/' )",
      "  .load( hdrUrls, function () {",
      "    hdrCubeRenderTarget = pmremGenerator.fromCubemap( hdrCubeMap );",
      "  } );",
      "",
      "const pmremGenerator = new THREE.PMREMGenerator( renderer );",
      "ldrCubeRenderTarget = pmremGenerator.fromCubemap( ldrCubeMap );",
      "",
      "const newEnvMap = renderTarget ? renderTarget.texture : null;",
      "torusMesh.material.envMap = newEnvMap;",
      "torusMesh.material.needsUpdate = true;",
      "",
      "scene.background = cubeMap;",
      "renderer.toneMappingExposure = params.exposure;"
    ],
    explain: [
      'HDRCubeTextureLoader 加载六张 .hdr cube face，包含更丰富亮度。',
      'PMREMGenerator.fromCubemap 会生成按粗糙度预过滤的环境贴图。',
      'renderTarget.texture 才是 PBR 材质真正使用的预过滤环境贴图。',
      '材质 envMap 换掉后要 needsUpdate，否则 shader 可能不会按新贴图重新编译。',
      'scene.background 用原始 cubeMap 做背景显示；它和材质 envMap 是相关但不同的用途。',
      'renderer.toneMappingExposure 控制 HDR 高亮压到屏幕前的整体曝光。'
    ],
    observe: [['切 Generated/LDR/HDR', '环境质量和高光层次变化'], ['调 metalness', '从塑料转向金属反射'], ['调 roughness', '反射从清晰变模糊'], ['打开 debug', '平面显示当前环境贴图']],
    uses: ['PBR 材质预览器', '金属产品展示', 'HDR 环境照明', '材质调试工具', '反射质量对比']
  },
  {
    file: 'webgl_materials_envmaps_fasthdr.html',
    title: 'FastHDR：PMREM KTX2 环境贴图快速加载',
    purpose: '学习预过滤好的 PMREM KTX2 环境图如何跳过运行时 PMREM 生成，减少加载时间和 GPU 内存。',
    points: ['FastHDR 文件已经是 PMREM 格式', 'KTX2Loader 加载压缩环境纹理', 'CubeUVReflectionMapping 表示可直接作为 environment', 'scene.backgroundBlurriness 单独控制背景模糊', '不同材质球展示环境对玻璃、粗糙金属、光滑金属的影响'],
    snippet: [
      "const loader = new KTX2Loader()",
      "  .detectSupport( renderer );",
      "",
      "loader.load( url, ( texture ) => {",
      "  texture.mapping = THREE.CubeUVReflectionMapping;",
      "  scene.environment = texture;",
      "  scene.background = texture;",
      "} );",
      "",
      "loadTexture( 'textures/fasthdr/ballroom_2k.pmrem.ktx2' );",
      "",
      "renderer.toneMappingExposure = params.exposure;",
      "scene.backgroundBlurriness = params.backgroundBlurriness;"
    ],
    explain: [
      'KTX2 是 GPU 友好的压缩纹理容器。',
      'detectSupport 会根据当前设备/GPU 支持能力选择合适的压缩纹理解码路径。',
      '这个案例里的 pmrem.ktx2 已经预过滤，所以不再调用 PMREMGenerator。',
      'CubeUVReflectionMapping 告诉 Three.js 这张贴图按 PMREM/CubeUV 方式采样。',
      '同一环境会同时影响玻璃、金属、粗糙材质和背景。',
      '本地镜像把官网 CDN 的 8 个 FastHDR 文件下载到 textures/fasthdr，所以案例被本地化后可以随目录搬走运行。',
      'render 循环里 exposure 和 backgroundBlurriness 分别控制最终曝光与背景模糊。'
    ],
    observe: [['切换 image', '不同环境改变所有材质反射'], ['调 exposure', '最终输出亮度变化'], ['调 fov', '镜头视角变化'], ['调 backgroundBlurriness', '背景变糊但环境照明仍在']],
    uses: ['快速 HDR 产品预览', '在线模型查看器', '低内存环境贴图', '移动端 PBR 展示', '多环境材质测试']
  },
  {
    file: 'webgl_materials_physical_clearcoat.html',
    title: 'Clearcoat：汽车漆和透明清漆层',
    purpose: '学习 MeshPhysicalMaterial 的 clearcoat 如何在底层材质上再加一层透明高光层。',
    points: ['clearcoat 是第二层表面反射', 'clearcoatRoughness 控制清漆层粗糙度', 'clearcoatNormalMap 可以和底层 normalMap 分开', '适合车漆、碳纤维、亮面保护层', '它不是透明玻璃'],
    snippet: [
      "let material = new THREE.MeshPhysicalMaterial( {",
      "  clearcoat: 1.0,",
      "  clearcoatRoughness: 0.1,",
      "  metalness: 0.9,",
      "  roughness: 0.5,",
      "  normalMap: normalMap3,",
      "  normalScale: new THREE.Vector2( 0.15, 0.15 )",
      "} );",
      "clearcoatNormalMap: clearcoatNormalMap,"
    ],
    explain: [
      'roughness 是底层材质粗糙度，clearcoatRoughness 是清漆层粗糙度。',
      'clearcoat 高时，表面会出现额外一层高光。',
      'clearcoatNormalMap 让清漆层也有自己的微表面方向。',
      '底层可以是金属、塑料、碳纤维，清漆层仍然是透明亮面。',
      '做玻璃不要用 clearcoat 冒充，需要 transmission。'
    ],
    observe: [['调 clearcoat', '第二层高光变强或消失'], ['调 clearcoatRoughness', '清漆高光变尖或变散'], ['切 normalMap', '底层纹理改变'], ['切 clearcoatNormalMap', '表层高光纹理改变']],
    uses: ['汽车漆', '头盔外壳', '碳纤维', '亮面塑料', '钢琴烤漆']
  },
  {
    file: 'webgl_materials_physical_transmission.html',
    title: 'Transmission：真实透明玻璃不是 opacity',
    purpose: '学习 MeshPhysicalMaterial 的 transmission、ior、thickness、roughness 如何共同形成玻璃和透明塑料质感。',
    points: ['transmission 表示光穿过材质', 'opacity 只是混合透明', 'ior 控制折射率', 'thickness 控制厚度效果', '玻璃强依赖 environment'],
    snippet: [
      "const material = new THREE.MeshPhysicalMaterial( {",
      "  roughness: params.roughness,",
      "  ior: params.ior,",
      "  alphaMap: texture,",
      "  envMap: hdrEquirect,",
      "  transmission: params.transmission, // use material.transmission for glass materials",
      "  transparent: true",
      "} );"
    ],
    explain: [
      'transmission 高时，背景和环境可以穿过材质参与渲染。',
      'opacity 低只是把物体透明混合，不等于真实玻璃。',
      'ior 是折射率，影响光线弯折感，不是亮度参数。',
      'thickness 让透明材质有体积感，厚玻璃和薄膜观感不同。',
      '没有环境贴图时，玻璃通常很难看出质感。'
    ],
    observe: [['调 transmission', '从普通表面变成透明材质'], ['调 roughness', '清玻璃变毛玻璃'], ['调 ior', '折射感变化'], ['调 thickness', '厚度感变化']],
    uses: ['玻璃杯', '展示柜', '亚克力', '透明按钮', '手机镜头']
  },
  {
    file: 'webgl_materials_physical_transmission_alpha.html',
    title: 'Transmission Alpha：带透明贴图的透射材质',
    purpose: '学习透明/透射材质如何结合 alpha 贴图，让材质局部透明或局部透射。',
    points: ['alphaMap 控制局部透明度', 'transmission 控制透射', 'transparent 必须开启混合', '贴图 alpha 和物理透射是两层概念', '适合镂空玻璃、纹理透明塑料'],
    snippet: [
      "const params = {",
      "  transmission: 1,",
      "  opacity: 1,",
      "  roughness: 0,",
      "  thickness: 0.01,",
      "  envMapIntensity: 1,",
      "};",
      "",
      "material.transmission = params.transmission;",
      "material.transparent = transparent;"
    ],
    explain: [
      'alphaMap 决定哪些区域可见、哪些区域透明。',
      'transmission 决定可见区域的光是否能穿过材质。',
      'transparent: true 让材质进入透明渲染流程。',
      'DoubleSide 适合薄片透明材质，否则背面可能不可见。',
      '透明排序和深度写入可能带来边缘问题，需要按项目调试。'
    ],
    observe: [['切换 alpha 贴图', '局部透明形状变化'], ['调 transmission', '可见区域透射变化'], ['改 side', '观察背面是否可见'], ['关闭 transparent', '透明混合失效']],
    uses: ['镂空玻璃贴花', '透明 UI 板', '塑料包装', '树叶/网格透明材质', '带图案的亚克力']
  },
  {
    file: 'webgl_materials_texture_filters.html',
    title: 'Texture Filters：贴图放大缩小时怎么采样',
    purpose: '学习 magFilter、minFilter、mipmap 如何决定贴图近看、远看、缩小时的清晰度、像素感和闪烁。',
    points: ['magFilter 负责放大', 'minFilter 负责缩小', 'mipmap 减少远处闪烁', 'NearestFilter 产生像素块', 'LinearMipmapLinearFilter 是常见平滑选择'],
    snippet: [
      "const textureCanvas = new THREE.CanvasTexture( imageCanvas );",
      "textureCanvas.repeat.set( 1000, 1000 );",
      "textureCanvas.wrapS = THREE.RepeatWrapping;",
      "textureCanvas.wrapT = THREE.RepeatWrapping;",
      "",
      "const textureCanvas2 = textureCanvas.clone();",
      "textureCanvas2.magFilter = THREE.NearestFilter;",
      "textureCanvas2.minFilter = THREE.NearestFilter;",
      "textureCanvas2.generateMipmaps = false;"
    ],
    explain: [
      'repeat 很大时，远处会出现大量高频纹理，最容易暴露采样问题。',
      'NearestFilter 直接取最近像素，所以边缘硬、像素感强。',
      'LinearFilter 会在相邻像素间插值，更平滑。',
      'minFilter 缩小时如果不用 mipmap，远处容易闪烁。',
      'generateMipmaps=false 表示不生成多级小图，适合某些像素风或特殊纹理。'
    ],
    observe: [['看左右分屏', '平滑采样和最近邻采样差异'], ['调 repeat', '远处闪烁更明显'], ['打开/关闭 mipmap', '远处稳定性变化'], ['换像素风贴图', '理解 NearestFilter 的用途']],
    uses: ['像素风材质', '地面/墙面重复纹理', 'UI 贴图采样', '减少远处摩尔纹', '纹理质量调试']
  },
  {
    file: 'webgl_materials_texture_anisotropy.html',
    title: 'Texture Anisotropy：斜着看地面为什么会糊',
    purpose: '学习各向异性过滤如何改善斜视角下的地面、道路、跑道和长走廊贴图清晰度。',
    points: ['anisotropy 主要改善斜视角', 'getMaxAnisotropy 获取设备上限', '高值更清晰但采样更贵', '不是所有贴图都需要开满', '通常用于地面、道路、长平面'],
    snippet: [
      "const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();",
      "",
      "texture1.anisotropy = maxAnisotropy;",
      "texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;",
      "texture1.repeat.set( 512, 512 );",
      "",
      "texture2.anisotropy = 1;"
    ],
    explain: [
      '斜着看地面时，一个屏幕像素对应纹理中又长又扁的一块区域。',
      '普通 mipmap 可能把远处细节平均糊掉。',
      'anisotropy 会沿斜视方向做更好的采样，保留远处纹理细节。',
      'getMaxAnisotropy 返回当前 GPU 支持的最大级别。',
      '高 anisotropy 有成本，应该优先给地面、道路等明显受益的贴图。'
    ],
    observe: [['看左右分屏远处地面', '高 anisotropy 更清晰'], ['把 anisotropy 改 1/2/4/8', '观察清晰度和成本'], ['改变相机角度', '斜视角差异最明显'], ['减少 repeat', '采样问题变不明显']],
    uses: ['道路/跑道', '长走廊', '地砖/地毯', '赛车游戏地面', '大面积重复纹理']
  },
  {
    file: 'physics_ammo_break.html',
    title: 'Ammo Break：刚体碰撞和物体破碎',
    purpose: '学习 Ammo.js 如何处理刚体世界、碰撞接触点、冲击强度，以及如何把一个可破碎物体拆成碎块。',
    points: ['Ammo 刚体世界', '碰撞形状和质量', '接触点和冲击阈值', 'ConvexObjectBreaker', 'Three 网格和物理体同步', '破碎后重新加入物理世界'],
    snippet: [
      "const convexBreaker = new ConvexObjectBreaker();",
      "",
      "convexBreaker.prepareBreakableObject( object, mass,",
      "  new THREE.Vector3(), new THREE.Vector3(), true );",
      "",
      "physicsWorld.stepSimulation( deltaTime, 10 );",
      "",
      "const debris = convexBreaker.subdivideByImpact(",
      "  threeObject0, impactPoint, impactNormal, 1, 2",
      ");"
    ],
    explain: [
      'Ammo 负责真实碰撞，Three 负责把碰撞结果画出来。',
      'prepareBreakableObject 给 Three 网格附加可破碎信息：质量、速度、角速度和是否可破碎。',
      'stepSimulation 每帧推进物理世界，等于让物理引擎先算完位置、旋转和接触。',
      '案例会读取碰撞 manifold，找到接触点、法线和冲击强度。',
      '冲击超过阈值时，subdivideByImpact 按撞击点和撞击方向切分碎块。',
      '碎块不是视觉假动画，而是新的物理刚体，会继续参与后续碰撞。'
    ],
    observe: [['发射小球撞击物体', '撞击足够强才破碎'], ['调整物体质量', '重物和轻物破碎表现不同'], ['调破碎阈值', '控制是玻璃感还是石头感'], ['观察碎块继续碰撞', '确认碎块已重新进入物理世界']],
    uses: ['做可破坏墙体、石块、玻璃、陨石撞击', '做游戏里的爆炸破坏效果', '做工程仿真里的碰撞可视化', '做交互式物理教学：质量、速度、冲量', '扩展成“命中后碎裂”的射击或解谜玩法']
  },
  {
    file: 'physics_ammo_cloth.html',
    title: 'Ammo Cloth：软体布料和锚点约束',
    purpose: '学习布料不是普通刚体，而是由很多软体节点组成；节点受重力、风、碰撞和锚点一起影响。',
    points: ['Ammo 软体世界', 'btSoftBodyHelpers.CreatePatch', '布料节点', 'appendAnchor 锚点', '软体和刚体碰撞', '把软体节点写回 BufferGeometry'],
    snippet: [
      "const softBodyHelpers = new Ammo.btSoftBodyHelpers();",
      "",
      "const clothSoftBody = softBodyHelpers.CreatePatch(",
      "  physicsWorld.getWorldInfo(),",
      "  clothCorner00, clothCorner01, clothCorner10, clothCorner11,",
      "  clothNumSegmentsZ + 1, clothNumSegmentsY + 1, 0, true",
      ");",
      "",
      "clothSoftBody.appendAnchor( 0, arm.userData.physicsBody, false, influence );",
      "physicsWorld.stepSimulation( deltaTime, 10 );",
      "cloth.geometry.attributes.position.needsUpdate = true;"
    ],
    explain: [
      'CreatePatch 用四个角和横纵分段创建一张软体布。',
      '布料的每个分段交点都是物理节点，不是整张布作为一个刚体运动。',
      'appendAnchor 把布料上的某些节点固定到一个刚体上，比如挂在横杆上。',
      'influence 控制锚点影响强度，越强越像钉死，越弱越容易滑动或拉扯。',
      'stepSimulation 之后，Ammo 内部节点位置已经变化，需要同步回 Three 的 geometry。',
      'position.needsUpdate 和 normal.needsUpdate 告诉 Three 顶点和法线都变了，需要重新上传到 GPU。'
    ],
    observe: [['看布料被横杆挂住', '理解锚点不是光照或动画，而是物理约束'], ['改变风力/重力', '布料摆动幅度变化'], ['改变分段数', '布料更细腻但更耗性能'], ['让球撞布', '观察软体和刚体相互作用']],
    uses: ['做旗帜、窗帘、衣服、披风', '做可被球撞动的软体幕布', '做软体物理教学', '扩展到角色衣摆或布料装饰', '理解“顶点动画”和“物理软体”的区别']
  },
  {
    file: 'physics_ammo_rope.html',
    title: 'Ammo Rope：绳索软体和两端连接',
    purpose: '学习绳子如何用软体线段模拟，并通过锚点连接到刚体，让球、杆和绳子形成联动系统。',
    points: ['CreateRope', '绳索节点', '两端 appendAnchor', '软体和刚体混合', '绳子几何同步', '约束系统'],
    snippet: [
      "const ropeSoftBody = softBodyHelpers.CreateRope(",
      "  physicsWorld.getWorldInfo(), ropeStart, ropeEnd,",
      "  ropeNumSegments - 1, 0",
      ");",
      "",
      "ropeSoftBody.appendAnchor( 0, ball.userData.physicsBody, true, influence );",
      "ropeSoftBody.appendAnchor( ropeNumSegments, arm.userData.physicsBody, true, influence );",
      "",
      "physicsWorld.stepSimulation( deltaTime, 10 );",
      "rope.geometry.attributes.position.needsUpdate = true;"
    ],
    explain: [
      'CreateRope 创建的是一串软体节点，节点之间保持连接关系。',
      '绳子一端锚到球上，另一端锚到杆上，所以球的重量会拉动绳子，杆的运动也会影响绳子。',
      'appendAnchor 的 true 表示锚点会影响连接刚体，系统不是单向视觉跟随。',
      '每帧物理模拟后，代码读取软体节点位置，把它写回绳子的几何顶点。',
      '绳子不是一根静态线，它是有重力、拉扯、碰撞响应的物理对象。',
      '这个案例能帮你区分“用曲线画绳子”和“用物理模拟绳子”。'
    ],
    observe: [['拖动或观察摆动', '球、绳、杆互相影响'], ['改变绳子段数', '越多越柔顺但越耗性能'], ['改变 influence', '两端连接更硬或更松'], ['改变球质量', '绳子下垂和摆动明显变化']],
    uses: ['做吊灯、摆锤、缆绳、桥索', '做抓钩、绳索机关、秋千玩法', '做物理教学里的摆动和张力演示', '做工程场景中的缆索可视化', '扩展到多段绳索和可断裂绳索']
  },
  {
    file: 'physics_jolt_instancing.html',
    title: 'Jolt Instancing：Jolt 物理和 WebGPU 批量刚体',
    purpose: '学习 Jolt 物理引擎如何和 Three 的 InstancedMesh 结合，在大量相同物体上保持渲染和物理性能。',
    points: ['JoltPhysics 封装', 'WebGPU renderer', 'InstancedMesh 刚体', 'userData.physics', 'setMeshPosition', '批量物理同步'],
    snippet: [
      "import * as THREE from 'three/webgpu';",
      "import { JoltPhysics } from 'three/addons/physics/JoltPhysics.js';",
      "",
      "physics = await JoltPhysics();",
      "physics.addScene( scene );",
      "",
      "boxes.userData.physics = { mass: 1 };",
      "physics.setMeshPosition( boxes, position, index );"
    ],
    explain: [
      '这个案例不是普通 WebGL，而是 three/webgpu，说明 Three 的物理辅助也可以服务新渲染管线。',
      'InstancedMesh 用一个几何体和材质画很多个实例，减少 draw call。',
      'userData.physics = { mass: 1 } 告诉物理封装这些实例是动态刚体。',
      'physics.addScene 会扫描场景，给带有 physics 配置的网格创建物理体。',
      'setMeshPosition 可以单独重置某个实例的位置，不需要把整个 InstancedMesh 拆成很多 Mesh。',
      'Jolt 常用于实时游戏物理，适合大量刚体、车辆、角色等高性能场景。'
    ],
    observe: [['看大量盒子和球同时掉落', '物理数量很大但渲染仍能跑'], ['改变实例数量', '理解性能瓶颈来自渲染还是物理'], ['随机重置位置', '看单个实例的物理状态被更新'], ['对比 Rapier instancing', '理解不同物理引擎 API 风格和性能取向']],
    uses: ['做大量砖块、碎石、掉落物', '做 WebGPU 物理压测', '做游戏里的可交互杂物堆', '扩展成掉落模拟或碰撞沙盒', '对比 Jolt 与 Rapier/Ammo 的工程适用性']
  },
  {
    file: 'physics_rapier_basic.html',
    title: 'Rapier Basic：最小刚体世界',
    purpose: '学习 Rapier 在 Three 中的最小接入方式：场景、地面、动态刚体、反弹系数和物理调试器。',
    points: ['RapierPhysics 初始化', 'physics.addScene', '静态刚体 mass 0', '动态刚体 mass 1', 'restitution 反弹', 'RapierHelper 调试碰撞体'],
    snippet: [
      "physics = await RapierPhysics();",
      "physics.addScene( scene );",
      "",
      "floor.userData.physics = { mass: 0 };",
      "",
      "physics.addMesh( mesh, 1, 0.5 );",
      "",
      "physicsHelper = new RapierHelper( physics.world );",
      "scene.add( physicsHelper );",
      "",
      "if ( physicsHelper ) physicsHelper.update();"
    ],
    explain: [
      'RapierPhysics 是 three/examples 里的官方辅助封装，帮你把 Three 网格和 Rapier 刚体连接起来。',
      'mass: 0 表示静态物体，地面不会被撞飞，但动态物体可以落在它上面。',
      'physics.addMesh(mesh, 1, 0.5) 给 mesh 创建质量为 1、反弹系数为 0.5 的刚体。',
      '物体运动由 Rapier 计算，Three 每帧读取物理体的位置和旋转来显示。',
      'RapierHelper 显示碰撞体轮廓，用来检查“看到的模型”和“真实碰撞体”是否一致，每帧 update 才会跟上物理世界变化。',
      '这是后续角色控制、车辆、关节、实例化物理的基础。'
    ],
    observe: [['生成盒子/球', '观察重力、碰撞和反弹'], ['把 restitution 改高', '物体弹得更厉害'], ['把质量改大', '碰撞时惯性更强'], ['打开 helper', '看碰撞体是否贴合模型']],
    uses: ['做掉落、堆叠、碰撞小游戏', '给产品展示加简单物理互动', '做物理教学的质量和反弹实验', '作为角色、车辆、关节案例的起点', '扩展成可拖拽物理积木']
  },
  {
    file: 'physics_rapier_character_controller.html',
    title: 'Rapier Character Controller：角色移动和碰撞避障',
    purpose: '学习角色不是直接改 mesh.position，而是让物理角色控制器计算可行移动，避免穿墙和穿地。',
    points: ['createCharacterController', '胶囊碰撞体', 'computeColliderMovement', 'computedMovement', 'WASD 输入', '相机跟随'],
    snippet: [
      "characterController = physics.world.createCharacterController( 0.01 );",
      "characterController.setApplyImpulsesToDynamicBodies( true );",
      "characterController.setCharacterMass( 3 );",
      "",
      "characterController.computeColliderMovement( player.userData.collider, moveVector );",
      "const translation = characterController.computedMovement();",
      "position.x += translation.x;"
    ],
    explain: [
      '角色移动不能只写 player.position += speed，因为这样会穿过墙、坡、台阶和其他物体。',
      'CharacterController 会根据碰撞体和期望移动量，算出实际允许移动多少。',
      '0.01 是 offset，给角色和环境之间留一点缝，减少卡住或贴面抖动。',
      '胶囊体适合角色，因为上下圆滑，不容易被小台阶和边缘卡住。',
      'setApplyImpulsesToDynamicBodies(true) 让角色推开动态刚体，而不是只从刚体旁边滑过去。',
      '最终同步的是 collider 的位置，再把可视化的 player mesh 放到 collider 位置上。'
    ],
    observe: [['用 WASD 移动', '角色会被地面和障碍限制'], ['推动态方块', '角色能把物理物体推开'], ['调整 offset', '观察贴边、抖动、卡墙变化'], ['修改角色质量', '推物体能力会变化']],
    uses: ['做第一人称/第三人称漫游', '做展厅、建筑、数字孪生中的可走动角色', '做平台跳跃和避障游戏', '做可推箱子的交互场景', '扩展成跳跃、坡道、楼梯、地面检测']
  },
  {
    file: 'physics_rapier_instancing.html',
    title: 'Rapier Instancing：大量实例化刚体',
    purpose: '学习如何让成百上千个相同物体既用 InstancedMesh 高效渲染，又拥有独立物理状态。',
    points: ['InstancedMesh', 'DynamicDrawUsage', '实例级物理体', 'applyImpulse', 'setMeshPosition', '渲染性能和物理性能'],
    snippet: [
      "boxes = new THREE.InstancedMesh( geometryBox, material, 400 );",
      "boxes.instanceMatrix.setUsage( THREE.DynamicDrawUsage );",
      "boxes.userData.physics = { mass: 1 };",
      "",
      "spheres = new THREE.InstancedMesh( geometrySphere, material, 400 );",
      "spheres.instanceMatrix.setUsage( THREE.DynamicDrawUsage );",
      "spheres.userData.physics = { mass: 1 };",
      "",
      "physics.addScene( scene );",
      "physics.applyImpulse( spheres, impulse, i );",
      "physics.applyImpulse( boxes, impulse, i );",
      "physics.setMeshPosition( boxes, position, index );"
    ],
    explain: [
      'InstancedMesh 让很多相同模型共享几何体和材质，适合大数量物体。',
      'DynamicDrawUsage 表示 instanceMatrix 会频繁变化，提示 GPU 这份数据是动态更新的。',
      'userData.physics 给每个实例创建对应的物理体，而不是只给整个 InstancedMesh 一个碰撞体。',
      'applyImpulse(boxes, impulse, i) 对第 i 个实例施加冲量，所以每个实例可以独立被撞飞。',
      'setMeshPosition 可以把某个实例重新放到指定位置，常用于重置、刷怪、循环掉落。',
      '这个案例的价值是把“很多东西”从视觉复制推进到真实可交互。'
    ],
    observe: [['点击 SHAKE', '每个实例受到独立冲量'], ['增加 count', '看性能下降来自物理还是渲染'], ['修改 impulse', '散开的幅度变化'], ['改成不同几何体', '理解碰撞体生成和外观的关系']],
    uses: ['做大量可碰撞砖块、球池、碎石', '做物理性能压测', '做批量掉落、撒落、爆炸效果', '做编辑器里的可交互散布物', '扩展成实例化粒子和刚体混合系统']
  },
  {
    file: 'physics_rapier_joints.html',
    title: 'Rapier Joints：关节、链条和约束',
    purpose: '学习两个刚体之间如何通过关节连接，从而形成链条、吊挂、机械臂这类受约束的运动。',
    points: ['ImpulseJoint', 'spherical joint', 'anchor1/anchor2', '固定点 mass 0', '角阻尼', '多刚体链式连接'],
    snippet: [
      "const jointParams = physics.RAPIER.JointData.spherical(",
      "  ( link == pivot ) ? new physics.RAPIER.Vector3( 0, - 0.5, 0 ) : new physics.RAPIER.Vector3( 0, - 1.15, 0 ), // Joint position in world space",
      "  new physics.RAPIER.Vector3( 0, 1.15, 0 ) // Corresponding attachment on sphere",
      ");",
      "",
      "const body2 = mesh.userData.physics.body;",
      "body2.setAngularDamping( 10.0 );",
      "",
      "physics.world.createImpulseJoint( jointParams, body1, body2, true );"
    ],
    explain: [
      '关节不是把两个 mesh 放在一起，而是在物理世界里约束两个 body 的相对运动。',
      'spherical joint 类似球窝关节：连接点固定，但允许多个方向旋转。',
      'anchor1 和 anchor2 是两个刚体各自本地坐标里的连接点。',
      '第一个固定球 mass 0，相当于链条挂在墙上或天花板上。',
      '每一节链条通过关节连到上一节，多个局部约束形成整体链条行为。',
      'setAngularDamping 增加角阻尼，减少链条无限摆动，让运动更稳定。'
    ],
    observe: [['看链条摆动', '每节都受上一节约束'], ['改变阻尼', '摆动更快停止或更持久'], ['改变链条数量', '约束越多越复杂'], ['改变 anchor', '链条连接点和姿态会变化']],
    uses: ['做链条、吊桥、摆锤、机械连接', '做物理机关和可拖拽约束', '做车辆悬挂、门铰链、机械臂的基础', '做吊灯、吊牌、绳索端点连接', '扩展到 hinge/fixed/revolute 等不同关节']
  },
  {
    file: 'physics_rapier_vehicle_controller.html',
    title: 'Rapier Vehicle Controller：车辆控制器和轮胎参数',
    purpose: '学习车辆不只是四个轮子跟着车身转，而是底盘刚体、悬挂、轮胎摩擦、转向、刹车和驱动力的组合。',
    points: ['createVehicleController', 'chassis 刚体', 'addWheel', '悬挂长度和刚度', '轮胎摩擦', '发动机力/刹车/转向', '轮子视觉同步'],
    snippet: [
      "vehicleController = physics.world.createVehicleController( chassis );",
      "",
      "vehicleController.addWheel(",
      "  wheelPosition, wheelDirection, wheelAxle,",
      "  suspensionRestLength, wheelRadius",
      ");",
      "",
      "vehicleController.setWheelEngineForce( 0, engineForce );",
      "vehicleController.setWheelSteering( 0, steering );",
      "vehicleController.setWheelBrake( 0, wheelBrake );"
    ],
    explain: [
      '车辆控制器把底盘刚体当成主体，轮子通过射线/悬挂模型和地面交互。',
      'addWheel 定义轮子相对车身的位置、悬挂方向、车轴方向、悬挂静止长度和轮半径。',
      'suspension stiffness 决定车身支撑感，太软像船，太硬容易抖。',
      'friction slip 决定轮胎抓地能力，低抓地会更像打滑。',
      'engineForce 负责驱动，brake 负责制动，steering 负责前轮转向。',
      'updateWheels 读取物理车辆的轮子状态，再把可视化轮子 mesh 的位置和旋转同步过去。'
    ],
    observe: [['W/S 加速倒车', '底盘受驱动力影响'], ['A/D 转向', '前轮改变方向，车身产生转弯'], ['空格刹车', '观察制动距离和姿态'], ['改悬挂刚度/摩擦', '体验车像越野车、玩具车或冰面车']],
    uses: ['做赛车、越野车、叉车、购物车', '做车辆参数调试工具', '做驾驶类数字孪生或训练场景', '扩展成车辆碰撞、坡道、漂移、轮胎磨损', '理解真实车辆模拟要拆成底盘、悬挂、轮胎和输入']
  },
  {
    file: 'webgl_animation_keyframes.html',
    title: 'Animation Keyframes：播放 glTF 关键帧动画',
    purpose: '学习 glTF 模型自带动画如何通过 AnimationMixer 播放，并用 deltaTime 保持不同帧率下速度一致。',
    points: ['GLTFLoader 加载动画', 'DRACOLoader 压缩模型', 'AnimationMixer', 'clipAction', 'deltaTime', '环境光照和 PMREM'],
    snippet: [
      "loader.load( 'models/gltf/LittlestTokyo.glb', function ( gltf ) {",
      "  const model = gltf.scene;",
      "  scene.add( model );",
      "",
      "  mixer = new THREE.AnimationMixer( model );",
      "  mixer.clipAction( gltf.animations[ 0 ] ).play();",
      "} );",
      "",
      "timer.update();",
      "const delta = timer.getDelta();",
      "mixer.update( delta );"
    ],
    explain: [
      'glTF 文件不只保存模型，也可以保存动画剪辑。',
      'AnimationMixer 绑定到模型根节点，负责计算动画对模型层级的影响。',
      'clipAction 把一个 AnimationClip 变成可播放、暂停、调速、混合的动作。',
      'play() 只是开始播放，真正推进动画的是每帧 mixer.update(delta)。',
      'deltaTime 表示上一帧到这一帧经过的真实时间，避免高刷屏动画变快、低帧率动画变慢。',
      '案例还用 PMREM 环境贴图，让模型材质在动画中仍有稳定真实的反射和光照。'
    ],
    observe: [['打开案例看小东京动画', '模型、相机和环境一起工作'], ['暂停 mixer.update', '动画停止但场景仍渲染'], ['改变动画 speed/timeScale', '播放速度改变'], ['换 glTF 动画模型', '理解动画数据跟模型骨骼/节点绑定']],
    uses: ['播放角色、机械、城市、产品演示动画', '做模型查看器里的动画预览', '做数字孪生设备运转动画', '做游戏 NPC 或场景循环动画', '扩展成动画暂停、倍速、时间轴拖动']
  },
  {
    file: 'webgl_animation_skinning_blending.html',
    title: 'Skinning Blending：骨骼动画切换和混合',
    purpose: '学习角色 idle、walk、run 等多个动作如何平滑切换，避免从一个动作硬切到另一个动作。',
    points: ['SkinnedMesh', 'SkeletonHelper', 'AnimationAction', 'setEffectiveWeight', 'crossFadeTo', 'timeScale', '动作状态机雏形'],
    snippet: [
      "idleAction = mixer.clipAction( animations[ 0 ] );",
      "walkAction = mixer.clipAction( animations[ 3 ] );",
      "runAction = mixer.clipAction( animations[ 1 ] );",
      "",
      "function setWeight( action, weight ) {",
      "  action.enabled = true;",
      "  action.setEffectiveTimeScale( 1 );",
      "  action.setEffectiveWeight( weight );",
      "}",
      "",
      "executeCrossFade( startAction, endAction, duration );",
      "",
      "let mixerUpdateDelta = timer.getDelta();",
      "mixer.update( mixerUpdateDelta );"
    ],
    explain: [
      '骨骼动画通过骨骼姿态驱动蒙皮网格，角色表面跟着骨骼变形。',
      'idle、walk、run 是不同 AnimationClip，但它们作用在同一个角色骨架上。',
      'setEffectiveWeight 控制某个动作对最终姿态的贡献比例。',
      'crossFadeTo 会在一段时间内把旧动作权重降到 0，把新动作权重升到 1。',
      '如果直接 stop 一个动作再 play 另一个动作，角色会明显跳变。',
      '这个案例其实是角色动作状态机的基础，只是状态切换由 GUI 手动触发。'
    ],
    observe: [['点击 idle/walk/run 切换', '动作是否平滑过渡'], ['改变 crossfade duration', '过渡快慢变化'], ['调 blend weight', '两个动作可以混在一起'], ['打开 skeleton helper', '看骨骼姿态如何驱动网格']],
    uses: ['做角色移动：站立、走、跑切换', '做游戏角色动画状态机', '做产品机械动作平滑切换', '做动作预览工具', '扩展成按速度自动混合 walk/run']
  },
  {
    file: 'webgl_animation_skinning_additive_blending.html',
    title: 'Additive Blending：叠加动画和表情/姿态层',
    purpose: '学习基础动作之上如何叠加额外动作，例如一边走路一边点头、摇头、摆姿势。',
    points: ['基础动作层', '叠加动作层', 'AnimationUtils.makeClipAdditive', 'subclip', '权重混合', '多层角色动画'],
    snippet: [
      "THREE.AnimationUtils.makeClipAdditive( clip );",
      "clip = THREE.AnimationUtils.subclip( clip, clip.name, 2, 3, 30 );",
      "",
      "const action = mixer.clipAction( clip );",
      "additiveActions[ name ].action = action;",
      "",
      "setWeight( settings.action, weight );",
      "setWeight( action, settings.weight );",
      "action.play();"
    ],
    explain: [
      '基础动作决定角色整体行为，例如 idle、walk、run。',
      '叠加动作不是替换基础动作，而是在基础姿态上增加偏移，例如点头、摇头、上半身姿态。',
      'makeClipAdditive 把普通动画转换成“相对变化”，让它适合叠加。',
      'subclip 可以从一段长动画里截取某几帧作为单独姿态或短动作。',
      '每个叠加动作有自己的权重，权重越大，对最终姿态影响越明显。',
      '这就是很多游戏和虚拟人系统里“下半身走路，上半身做动作”的基础思想。'
    ],
    observe: [['调 sneak/sad/agree/headShake 权重', '叠加动作逐渐显现'], ['同时调多个叠加动作', '最终姿态是多层混合结果'], ['切换基础动作', '叠加层仍可作用在不同基础动作上'], ['把权重调到 0', '回到纯基础动画']],
    uses: ['做角色表情、点头、挥手、受击反应', '做虚拟人一边走一边说话', '做上半身动作和下半身移动分离', '做动画编辑器里的动作层', '扩展成 IK、瞄准、手持物动画']
  },
  {
    file: 'webgl_loader_gltf_compressed.html',
    title: 'GLTF Compressed：压缩 glTF 模型加载',
    purpose: '学习现代 glTF 资产如何同时使用网格压缩和纹理压缩，减少下载体积并保持运行效果。',
    points: ['GLTFLoader', 'KTX2Loader', 'MeshoptDecoder', 'KHR_texture_basisu', 'EXT_meshopt_compression', '压缩资产流水线'],
    snippet: [
      "const ktx2Loader = new KTX2Loader()",
      "  .detectSupport( renderer );",
      "",
      "loader.setKTX2Loader( ktx2Loader );",
      "loader.setMeshoptDecoder( MeshoptDecoder );",
      "loader.load( 'coffeemat.glb', function ( gltf ) {",
      "  scene.add( gltf.scene );",
      "} );"
    ],
    explain: [
      'glTF 模型可以很大，通常瓶颈不是代码，而是模型和贴图下载。',
      'KTX2Loader 负责 Basis Universal/KTX2 纹理转码，让纹理在不同 GPU 上使用合适压缩格式。',
      'MeshoptDecoder 负责解码 meshopt 网格压缩，减少顶点和索引数据体积。',
      'detectSupport(renderer) 会根据当前设备能力选择合适的纹理转码目标。',
      'loader.setKTX2Loader 和 setMeshoptDecoder 是告诉 GLTFLoader：遇到对应扩展时该交给谁解码。',
      '这个案例适合学习“上线模型”而不是“本地随便加载模型”的资产处理方式。'
    ],
    observe: [['打开 Network 看模型大小', '压缩资产下载更小'], ['去掉 KTX2Loader', '带 KTX2 纹理的模型可能无法正常显示'], ['去掉 MeshoptDecoder', 'meshopt 压缩网格无法解码'], ['换未压缩 glTF', '加载链路会更简单但体积更大']],
    uses: ['做线上模型查看器', '做电商 3D 商品展示', '做移动端三维场景', '做数字孪生的大模型加载优化', '建立 gltfpack/ktx2 的资产压缩流水线']
  },
  {
    file: 'webgl_loader_gltf_variants.html',
    title: 'GLTF Variants：同一个模型切换不同材质方案',
    purpose: '学习 glTF 的 KHR_materials_variants 扩展，用一个模型承载多个材质变体，例如鞋子的不同配色。',
    points: ['KHR_materials_variants', 'gltfExtensions', 'parser.getDependency', '材质映射', '原始材质缓存', '产品配置器'],
    snippet: [
      "const variantsExtension = gltf.userData.gltfExtensions[ 'KHR_materials_variants' ];",
      "const variants = variantsExtension.variants.map( ( variant ) => variant.name );",
      "",
      "const meshVariantDef = object.userData.gltfExtensions[ 'KHR_materials_variants' ];",
      "const mapping = meshVariantDef.mappings",
      "  .find( ( mapping ) => mapping.variants.includes( variantIndex ) );",
      "object.material = await parser.getDependency( 'material', mapping.material );"
    ],
    explain: [
      'KHR_materials_variants 把“同一个模型有哪些可切换材质”写进 glTF 文件里。',
      '全局 variantsExtension 保存变体名称，例如不同颜色或不同商品 SKU。',
      '每个 mesh 自己记录这个变体应该使用哪个 material。',
      'parser.getDependency("material", id) 从 glTF 内部按索引取出材质对象，不需要你手写材质。',
      '切换变体时，只换材质，不重新加载几何体，所以很适合商品配置器。',
      '案例还缓存原始材质，方便从变体切回默认外观。'
    ],
    observe: [['在 GUI 切换材质变体', '同一只鞋快速换配色'], ['看代码里的 mappings', '理解不同 mesh 可以映射到不同材质'], ['切回 default', '确认原材质被缓存'], ['换自己的 glTF variants 模型', '理解变体信息需要资产里提前写好']],
    uses: ['做鞋子、汽车、家具、手表的颜色配置器', '做商品 SKU 预览', '做材质方案对比工具', '做设计评审里的多方案切换', '扩展成颜色、材质、部件组合的完整配置系统']
  },
  {
    file: 'webgl_loader_texture_ktx2.html',
    title: 'Texture KTX2：GPU 压缩纹理加载和格式对比',
    purpose: '学习 KTX2 压缩纹理为什么适合 Web 3D，以及不同压缩格式、mipmap、透明度和采样方式的差异。',
    points: ['KTX2Loader', 'Basis Universal', 'detectSupport', 'flipY=false', '多场景 scissor 渲染', '压缩纹理格式对比'],
    snippet: [
      "const loader = new KTX2Loader()",
      "  .setPath( 'textures/ktx2/' )",
      "  .detectSupport( renderer );",
      "",
      "const texture = await loader.loadAsync( supported === false ? 'fail_load.ktx2' : path );",
      "const mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );",
      "scene.add( mesh );",
      "scenes.push( scene );",
      "",
      "renderer.setScissor( left, bottom, width, height );",
      "renderer.render( scene, camera );"
    ],
    explain: [
      '普通 PNG/JPG 下载后通常会解码成未压缩 GPU 纹理，占显存很大。',
      'KTX2 可以保存 GPU 友好的压缩纹理，减少显存和带宽压力。',
      'detectSupport 根据设备选择合适目标格式，例如 ETC、BC、ASTC 等。',
      'KTX2 纹理默认 flipY=false，和普通图片纹理的 UV 方向习惯不同，案例里专门处理了 UV。',
      '案例用多个小场景和 scissor 区域在同一个 canvas 里渲染很多纹理对比。',
      '它不是为了做漂亮画面，而是为了让你看清不同压缩格式和贴图设置的真实差别。'
    ],
    observe: [['对比 uncompressed/compressed/universal', '看画质和格式差异'], ['打开开发者工具看显存/下载', '理解压缩纹理价值'], ['观察透明纹理', '不同格式对 alpha 支持不同'], ['看 scissor 多窗口渲染', '一个 renderer 可以画多个区域']],
    uses: ['做移动端大贴图优化', '做模型查看器和游戏资源优化', '做纹理格式测试页', '做图片墙/材质库预览', '建立 KTX2/BasisU 纹理生产流水线']
  }
];

function docMarkdown(doc) {
  const casePath = `../../cases/${doc.file}`;
  const code = doc.snippet.join('\n');
  const points = doc.points.map(item => `- ${item}`).join('\n');
  const explain = doc.explain.map(item => `- ${item}`).join('\n');
  const observe = doc.observe.map(([action, result]) => `| ${action} | ${result} |`).join('\n');
  const uses = doc.uses.map(item => `- ${item}`).join('\n');
  const extra = doc.extra ? `\n${doc.extra}\n` : '';

  return `# ${doc.file.replace(/\\.html$/, '')}｜${doc.title}

> 本地官方案例：[\`${doc.file}\`](${casePath})  
> 本篇目标：${doc.purpose}

## 这个案例先看什么

打开案例后，不要只看画面效果，先确认它在验证哪一类能力。这个案例的重点是：${doc.purpose}

## 核心知识点

${points}

## 官网核心代码

\`\`\`js
${code}
\`\`\`

## 这段代码到底在做什么

${explain}
${extra}

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
${observe}

## 学完能拿来做什么

${uses}

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
`;
}

function cleanCommentText(value) {
  return value.replaceAll('*/', '* /');
}

function learningComment(doc) {
  const group = groupFor(doc.file);
  const points = doc.points.map((item, index) => ` * ${index + 1}. ${cleanCommentText(item)}`).join('\n');
  const explain = doc.explain.map((item, index) => ` * ${index + 1}. ${cleanCommentText(item)}`).join('\n');
  const uses = doc.uses.map((item, index) => ` * ${index + 1}. ${cleanCommentText(item)}`).join('\n');
  const snippet = doc.snippet.map(line => ` *   ${cleanCommentText(line)}`).join('\n');
  const indentLines = value => value.split('\n').map(line => `\t\t\t${line}`).join('\n');
  const guideByGroup = {
    'A｜观察调试': '先找 camera / controls / helper，再看 resize 和每帧 controls.update。观察调试类案例的重点不是画面多复杂，而是你能不能判断相机、坐标、尺寸和包围范围是否正确。',
    'B｜光照材质': '先找 renderer 的 color/toneMapping/output 设置，再找 light / material / environment，最后看 GUI 参数如何改变光照或材质。光照材质类案例要重点观察“哪个参数改变了亮度、阴影、反射、透明或贴图清晰度”。',
    'C｜模型资产和动画': '先找 loader 和模型路径，再看解码器/压缩纹理/环境贴图，最后看 AnimationMixer 或模型后处理。模型资产类案例要重点理解“资源怎么进来、进来后如何适配场景”。',
    'D｜交互编辑': '先找事件监听和 Raycaster / Controls，再看命中结果如何改变对象。交互编辑类案例要重点理解“屏幕坐标如何变成 3D 操作”。',
    'E｜性能大量对象和后处理': '先找 InstancedMesh / Points / EffectComposer，再看每帧更新的数据量。性能类案例要重点区分 CPU 创建对象、GPU draw call、纹理/后处理成本。',
    'F｜物理模拟': '先找物理引擎初始化，再找 mesh 如何创建 body/collider，最后看每帧物理结果如何同步回 Three 对象。物理类案例要重点区分“看得见的 mesh”和“真正参与碰撞的 body/collider”。'
  };

  return `\n\t\t\t/* THREE_TOPIC_LEARNING_NOTES_START\n\t\t\t * 本注释由本地 Three.js 专题生成，保留官网案例代码结构，只补学习说明。\n\t\t\t * 案例：${cleanCommentText(doc.file)}\n\t\t\t * 分组：${cleanCommentText(group)}\n\t\t\t * 目标：${cleanCommentText(doc.purpose)}\n\t\t\t *\n\t\t\t * 阅读顺序：${cleanCommentText(guideByGroup[group])}\n\t\t\t *\n\t\t\t * 核心知识点：\n${indentLines(points)}\n\t\t\t *\n\t\t\t * 本案例的关键代码片段，可以在下面源码中搜索这些语句：\n${indentLines(snippet)}\n\t\t\t *\n\t\t\t * 这些代码在做什么：\n${indentLines(explain)}\n\t\t\t *\n\t\t\t * 学完后可以迁移到：\n${indentLines(uses)}\n\t\t\t *\n\t\t\t * 对应讲解文档：../官方案例讲解/${docRelativePath(doc)}\n\t\t\t * THREE_TOPIC_LEARNING_NOTES_END */\n`;
}

function structureComment(label, text) {
  const marker = `THREE_TOPIC_${label}_NOTE`;
  return `\n\t\t\t/* ${marker}_START\n\t\t\t * ${text}\n\t\t\t * ${marker}_END */\n`;
}

function stripLearningComments(source) {
  return source
    .replace(/\n\t*\s*\/\* THREE_TOPIC_LEARNING_NOTES_START[\s\S]*?THREE_TOPIC_LEARNING_NOTES_END \*\//g, '')
    .replace(/\n\t*\s*\/\* THREE_TOPIC_CORE_NOTE_START[\s\S]*?THREE_TOPIC_CORE_NOTE_END \*\//g, '')
    .replace(/\n\t*\s*\/\* THREE_TOPIC_DETAIL_NOTE_START[\s\S]*?THREE_TOPIC_DETAIL_NOTE_END \*\//g, '')
    .replace(/\n\t*\s*\/\* THREE_TOPIC_INIT_NOTE_START[\s\S]*?THREE_TOPIC_INIT_NOTE_END \*\//g, '')
    .replace(/\n\t*\s*\/\* THREE_TOPIC_ANIMATE_NOTE_START[\s\S]*?THREE_TOPIC_ANIMATE_NOTE_END \*\//g, '')
    .replace(/\n\t*\s*\/\* THREE_TOPIC_RENDER_NOTE_START[\s\S]*?THREE_TOPIC_RENDER_NOTE_END \*\//g, '')
    .replace(/\n\t*\s*\/\* THREE_TOPIC_RESIZE_NOTE_START[\s\S]*?THREE_TOPIC_RESIZE_NOTE_END \*\//g, '');
}

function normalizeCode(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function compactCode(value) {
  return value.replace(/\s+/g, '');
}

function shouldValidateSnippetLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.length < 8) return false;
  if (trimmed.startsWith('//')) return false;
  if (/^[});\]}{,(]+[;,]?$/.test(trimmed)) return false;
  if (trimmed === 'const material = new THREE.MeshPhysicalMaterial( {') return false;
  if (trimmed === 'const material = new THREE.MeshStandardMaterial( {') return false;
  if (trimmed === 'let material = new THREE.MeshPhysicalMaterial( {') return false;
  if (trimmed === 'const params = {') return false;
  return true;
}

function validateSnippetMatchesSource(doc, source) {
  const cleanSource = stripLearningComments(source);
  const cleanSourceLoose = normalizeCode(cleanSource);
  const missing = [];

  for (const line of doc.snippet) {
    const trimmed = line.trim();
    if (!shouldValidateSnippetLine(trimmed)) continue;
    if (!cleanSource.includes(trimmed) && !cleanSourceLoose.includes(normalizeCode(trimmed))) {
      missing.push(trimmed);
    }
  }

  if (missing.length > 0) {
    const details = missing.map(line => `  - ${line}`).join('\n');
    throw new Error(`Snippet does not match ${doc.file} source:\n${details}`);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function shouldAnnotateSnippetLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.length < 8) return false;
  if (/^[});\]}{,(]+$/.test(trimmed)) return false;
  if (trimmed === 'const material = new THREE.MeshPhysicalMaterial( {' || trimmed === 'const material = new THREE.MeshStandardMaterial( {') return true;
  return /[A-Za-z0-9_$]\s*(=|\.|\(|new\s|await\s|import\s|from\s)/.test(trimmed);
}

function insertCoreLineComments(doc, source) {
  let next = source;
  let noteIndex = 0;
  const seen = new Set();

  for (const line of doc.snippet) {
    const trimmed = line.trim();
    if (!shouldAnnotateSnippetLine(trimmed) || seen.has(trimmed)) continue;

    const note = cleanCommentText(doc.explain[Math.min(noteIndex, doc.explain.length - 1)] ?? doc.purpose);
    const pattern = new RegExp(`^([ \\t]*)${escapeRegExp(trimmed)}([ \\t]*(?:\\r?\\n|$))`, 'm');

    if (!pattern.test(next)) continue;

    next = next.replace(pattern, (match, indent, ending) => {
      const comment = `${indent}/* THREE_TOPIC_CORE_NOTE_START\n${indent} * 学习注释：${note}\n${indent} * THREE_TOPIC_CORE_NOTE_END */\n`;
      return `${comment}${match}`;
    });

    seen.add(trimmed);
    noteIndex += 1;
  }

  return next;
}

function insertLineNotes(doc, source) {
  if (!doc.lineNotes?.length) return source;

  const lines = source.split('\n');

  for (const [targetLine, text] of doc.lineNotes) {
    const target = targetLine.trim();
    const targetLoose = normalizeCode(target);
    const targetCompact = compactCode(target);
    const index = lines.findIndex(line => {
      const current = line.trim();
      const currentLoose = normalizeCode(current);
      const currentCompact = compactCode(current);
      return (
        current === target ||
        current.startsWith(`${target} //`) ||
        currentLoose === targetLoose ||
        currentLoose.startsWith(`${targetLoose} //`) ||
        currentCompact === targetCompact ||
        currentCompact.startsWith(`${targetCompact}//`)
      );
    });

    if (index === -1) {
      throw new Error(`Line note does not match ${doc.file} source:\n  - ${target}`);
    }

    const indent = lines[index].match(/^\s*/)?.[0] ?? '';
    lines.splice(
      index,
      0,
      `${indent}/* THREE_TOPIC_DETAIL_NOTE_START\n${indent} * 学习注释：${cleanCommentText(text)}\n${indent} * THREE_TOPIC_DETAIL_NOTE_END */`
    );
  }

  return lines.join('\n');
}

function insertBeforeFirstFunction(source, pattern, comment) {
  let inserted = false;
  return source.replace(pattern, (...args) => {
    if (inserted) return args[0];
    inserted = true;
    const match = args[0];
    return `${comment}${match}`;
  });
}

function annotateCaseSource(doc, source) {
  let next = stripLearningComments(source);
  const moduleTagPattern = /(<script\s+type=["']module["']>\s*)/;

  if (!moduleTagPattern.test(next)) {
    throw new Error(`Cannot find module script in ${doc.file}`);
  }

  next = insertLineNotes(doc, next);
  next = insertCoreLineComments(doc, next);
  next = next.replace(moduleTagPattern, `$1${learningComment(doc)}`);

  next = insertBeforeFirstFunction(
    next,
    /\n\s*(?:async\s+)?function\s+init\s*\(/,
    structureComment('INIT', 'init() 是案例搭建阶段：通常会创建 renderer、camera、scene、灯光、材质、模型、GUI 和事件。读这个函数时先看对象如何被创建和加入 scene。')
  );

  next = insertBeforeFirstFunction(
    next,
    /\n\s*function\s+animate\s*\(/,
    structureComment('ANIMATE', 'animate() 是每帧循环入口。这里通常推进 controls、动画 mixer、物理世界或实例矩阵，然后触发 render。不要只看静态初始化，动态效果多数在这里发生。')
  );

  next = insertBeforeFirstFunction(
    next,
    /\n\s*function\s+render\s*\(/,
    structureComment('RENDER', 'render() 是最终绘制阶段。普通案例多用 renderer.render(scene, camera)，后处理案例会改用 composer.render，多视口案例会设置 viewport/scissor。')
  );

  next = insertBeforeFirstFunction(
    next,
    /\n\s*function\s+onWindowResize\s*\(/,
    structureComment('RESIZE', '窗口变化时不能只改 canvas 尺寸；相机 aspect / 投影矩阵 / renderer 尺寸通常都要一起更新，否则画面比例或交互坐标会出问题。')
  );

  return next;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function groupFor(file) {
  if (file.startsWith('physics_')) return 'F｜物理模拟';
  if (file.startsWith('webgl_animation_') || file.startsWith('webgl_loader_')) return 'C｜模型资产和动画';
  if (
    file.startsWith('webgl_lights_') ||
    file.startsWith('webgl_lightprobe') ||
    file.startsWith('webgl_tonemapping') ||
    file.startsWith('webgl_materials_')
  ) return 'B｜光照材质';
  if (
    file === 'css2d_label.html' ||
    file === 'misc_controls_drag.html' ||
    file === 'misc_controls_transform.html' ||
    file.startsWith('webgl_interactive_') ||
    file === 'webgl_instancing_raycast.html'
  ) return 'D｜交互编辑';
  if (
    file.startsWith('webgl_instancing_') ||
    file.startsWith('webgl_points_') ||
    file.startsWith('webgl_lines_') ||
    file.startsWith('webgl_postprocessing')
  ) return 'E｜性能大量对象和后处理';
  return 'A｜观察调试';
}

function groupDirFor(file) {
  return groupFor(file)
    .replace('｜', '-')
    .replace('C-模型资产和动画', 'C-模型资产动画')
    .replace('E-性能大量对象和后处理', 'E-性能大量对象后处理');
}

function docRelativePath(doc) {
  return `${groupDirFor(doc.file)}/${doc.file.replace(/\.html$/, '.md')}`;
}

function renderCasesIndex() {
  const groups = new Map();

  for (const doc of docs.slice().sort((a, b) => a.file.localeCompare(b.file))) {
    const group = groupFor(doc.file);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(doc);
  }

  const order = [
    'A｜观察调试',
    'B｜光照材质',
    'C｜模型资产和动画',
    'D｜交互编辑',
    'E｜性能大量对象和后处理',
    'F｜物理模拟'
  ];

  const sections = order.map(group => {
    const items = groups.get(group) ?? [];
    const cards = items.map(doc => {
      const docPath = docRelativePath(doc);
      return `          <article class="card">
            <strong>${escapeHtml(doc.file)}</strong>
            <span>${escapeHtml(doc.title)}</span>
            <p>${escapeHtml(doc.purpose)}</p>
            <div class="links">
              <a href="./${escapeHtml(doc.file)}">打开案例</a>
              <a href="../官方案例讲解/${escapeHtml(docPath)}">读讲解</a>
            </div>
          </article>`;
    }).join('\n');

    return `      <section>
        <h2>${escapeHtml(group)}</h2>
        <div class="grid">
${cards}
        </div>
      </section>`;
  }).join('\n\n');

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Three.js 官方案例本地镜像</title>
    <style>
      body { margin: 0; background: #f6f4ee; color: #202124; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; }
      main { max-width: 1240px; margin: 0 auto; padding: 40px 20px 72px; }
      h1 { margin: 0 0 10px; font-size: 32px; line-height: 1.25; letter-spacing: 0; }
      h2 { margin: 34px 0 12px; font-size: 22px; letter-spacing: 0; }
      p { line-height: 1.75; }
      .note { padding: 14px 16px; border: 1px solid #d4ccbd; border-radius: 8px; background: #fffaf0; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 12px; }
      .card { min-height: 178px; padding: 15px; border: 1px solid #d5cec2; border-radius: 8px; background: #fffdf8; }
      .card strong { display: block; margin-bottom: 8px; font-size: 15px; line-height: 1.45; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; overflow-wrap: anywhere; }
      .card span { display: block; color: #202124; font-weight: 650; font-size: 15px; line-height: 1.6; }
      .card p { margin: 8px 0 14px; color: #555c66; font-size: 14px; line-height: 1.65; }
      .links { display: flex; flex-wrap: wrap; gap: 8px; }
      .links a { border: 1px solid #b9c4d4; border-radius: 6px; padding: 6px 10px; color: #14395f; text-decoration: none; background: #f2f7ff; font-size: 14px; }
      code { border-radius: 4px; background: #e8e0d3; padding: 1px 5px; }
    </style>
  </head>
  <body>
    <main>
      <h1>Three.js 官方案例本地镜像</h1>
      <p class="note">当前入口包含 ${docs.length} 个 three.js 官网 examples 本地镜像。HTML 文件名保持官网原名；每个案例都有一篇对应讲解文档，讲它的核心代码、参数观察方法，以及后面能拿来做什么。</p>
      <p>启动方式：在 <code>article/专题/threejs 专题学习</code> 下运行 <code>python3 -m http.server 8088</code>，打开 <code>http://127.0.0.1:8088/cases/</code>。</p>

${sections}
    </main>
  </body>
</html>
`;
}

function groupedDocs() {
  const groups = new Map();

  for (const doc of docs.slice().sort((a, b) => a.file.localeCompare(b.file))) {
    const group = groupFor(doc.file);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(doc);
  }

  return groups;
}

function localizeCaseSource(doc, source) {
  if (doc.file === 'webgl_lightprobe.html') {
    return source
      .replace(
        "const API = {\n\t\t\t\tlightProbeIntensity: 1.0,\n\t\t\t\tdirectionalLightIntensity: 0.6,\n\t\t\t\tenvMapIntensity: 1\n\t\t\t};",
        "const API = {\n\t\t\t\tenableLightProbe: true,\n\t\t\t\tlightProbeIntensity: 1.0,\n\t\t\t\tdirectionalLightIntensity: 0.6,\n\t\t\t\tenvMapIntensity: 1\n\t\t\t};"
      )
      .replace(
        "lightProbe.intensity = API.lightProbeIntensity;",
        "lightProbe.intensity = API.enableLightProbe ? API.lightProbeIntensity : 0;"
      )
      .replace(
        "gui.add( API, 'lightProbeIntensity', 0, 1, 0.02 )\n\t\t\t\t\t.name( 'light probe' )",
        "gui.add( API, 'enableLightProbe' )\n\t\t\t\t\t.name( '补光开关' )\n\t\t\t\t\t.onChange( function () {\n\n\t\t\t\t\t\tlightProbe.intensity = API.enableLightProbe ? API.lightProbeIntensity : 0; render();\n\n\t\t\t\t\t} );\n\n\t\t\t\tgui.add( API, 'lightProbeIntensity', 0, 1, 0.02 )\n\t\t\t\t\t.name( '补光强度' )"
      )
      .replace(
        "lightProbe.intensity = API.lightProbeIntensity; render();",
        "lightProbe.intensity = API.enableLightProbe ? API.lightProbeIntensity : 0; render();"
      );
  }

  if (doc.file === 'webgl_lightprobes.html') {
    return source
      .replace(
        "gui.add( params, 'enabled' ).name( 'GI' ).onChange( ( value ) => {",
        "gui.add( params, 'enabled' ).name( '补光 LightProbeGrid' ).onChange( ( value ) => {"
      )
      .replace(
        "showProbes: false,",
        "showProbes: true,"
      );
  }

  if (doc.file !== 'webgl_materials_envmaps_fasthdr.html') return source;

  const replacements = {
    'https://cdn.needle.tools/static/hdris/ballroom_2k.pmrem.ktx2': 'textures/fasthdr/ballroom_2k.pmrem.ktx2',
    'https://cdn.needle.tools/static/hdris/brown_photostudio_02_2k.pmrem.ktx2': 'textures/fasthdr/brown_photostudio_02_2k.pmrem.ktx2',
    'https://cdn.needle.tools/static/hdris/cape_hill_2k.pmrem.ktx2': 'textures/fasthdr/cape_hill_2k.pmrem.ktx2',
    'https://cdn.needle.tools/static/hdris/cannon_2k.pmrem.ktx2': 'textures/fasthdr/cannon_2k.pmrem.ktx2',
    'https://cdn.needle.tools/static/hdris/metro_noord_2k.pmrem.ktx2': 'textures/fasthdr/metro_noord_2k.pmrem.ktx2',
    'https://cdn.needle.tools/static/hdris/the_sky_is_on_fire_2k.pmrem.ktx2': 'textures/fasthdr/the_sky_is_on_fire_2k.pmrem.ktx2',
    'https://cdn.needle.tools/static/hdris/studio_small_09_2k.pmrem.ktx2': 'textures/fasthdr/studio_small_09_2k.pmrem.ktx2',
    'https://cdn.needle.tools/static/hdris/wide_street_01_2k.pmrem.ktx2': 'textures/fasthdr/wide_street_01_2k.pmrem.ktx2'
  };

  let next = source;
  for (const [from, to] of Object.entries(replacements)) {
    next = next.replaceAll(from, to);
  }
  return next;
}

for (const doc of docs) {
  const caseFile = path.join(CASES_DIR, doc.file);
  if (!fs.existsSync(caseFile)) throw new Error(`Missing case: ${doc.file}`);

  const officialCaseFile = path.join(OFFICIAL_EXAMPLES_DIR, doc.file);
  const caseSource = fs.existsSync(officialCaseFile)
    ? fs.readFileSync(officialCaseFile, 'utf8')
    : fs.readFileSync(caseFile, 'utf8');
  const localizedCaseSource = localizeCaseSource(doc, caseSource);
  validateSnippetMatchesSource(doc, localizedCaseSource);
  fs.writeFileSync(caseFile, annotateCaseSource(doc, localizedCaseSource));

  const groupDir = path.join(DOCS_DIR, groupDirFor(doc.file));
  fs.mkdirSync(groupDir, { recursive: true });
  const out = path.join(groupDir, doc.file.replace(/\.html$/, '.md'));
  fs.writeFileSync(out, docMarkdown(doc));
}

const htmlFiles = fs.readdirSync(CASES_DIR).filter(file => file.endsWith('.html') && file !== 'index.html').sort();
const covered = new Set(docs.map(doc => doc.file));
const missing = htmlFiles.filter(file => !covered.has(file));

if (missing.length > 0) {
  console.error(`Missing docs metadata for ${missing.length} cases:`);
  for (const file of missing) console.error(`- ${file}`);
  process.exitCode = 1;
} else {
  for (const [group, items] of groupedDocs()) {
    const groupDir = path.join(DOCS_DIR, groupDirFor(items[0].file));
    const groupIndex = [
      `# ${group}`,
      '',
      '这个目录只放 three.js 官网 examples 的逐篇讲解。每篇文档对应一个本地官方 HTML 案例，文件名保持官网原名。',
      '',
      '| 官方案例 | 讲解文档 | 这一篇学什么 |',
      '|---|---|---|',
      ...items.map(doc => `| [\`${doc.file}\`](../../cases/${doc.file}) | [${doc.title}](./${doc.file.replace(/\.html$/, '.md')}) | ${doc.purpose} |`)
    ].join('\n');

    fs.writeFileSync(path.join(groupDir, 'README.md'), groupIndex + '\n');
  }

  const index = [
    '# Three.js 官方案例逐篇讲解',
    '',
    '这里的文档和 `cases/` 下的官网 HTML 一一对应。HTML 文件名保持官网原名，Markdown 文件名去掉 `.html` 后缀。',
    '',
    '| 官方案例 | 讲解文档 |',
    '|---|---|',
    ...docs
      .slice()
      .sort((a, b) => a.file.localeCompare(b.file))
      .map(doc => `| [\`${doc.file}\`](../cases/${doc.file}) | [${doc.title}](./${docRelativePath(doc)}) |`)
  ].join('\n');
  fs.writeFileSync(path.join(DOCS_DIR, 'README.md'), index + '\n');
  fs.writeFileSync(path.join(CASES_DIR, 'index.html'), renderCasesIndex());
  console.log(`Generated ${docs.length} docs.`);
}
