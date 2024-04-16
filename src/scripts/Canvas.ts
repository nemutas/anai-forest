import * as THREE from 'three'
import { DRACOLoader, GLTF, GLTFLoader } from 'three/examples/jsm/Addons.js'
import { RawShaderMaterial } from './core/ExtendedMaterials'
import { Three } from './core/Three'
import groundFS from './shader/ground.fs'
import groundVS from './shader/ground.vs'
import baseFS from './shader/tree_base.fs'
import baseVS from './shader/tree_base.vs'
import depthVS from './shader/depth.vs'
import depthFS from './shader/depth.fs'
import sporeVS from './shader/spore.vs'
import sporeFS from './shader/spore.fs'
import { ColorEffect } from './postprocessing/ColorEffect'
import { HBlurEffect } from './postprocessing/HBlurEffect'
import { VBlurEffect } from './postprocessing/VBlurEffect'
import { OutputEffect } from './postprocessing/OutputEffect'

export class Canvas extends Three {
  private groundMaterial!: RawShaderMaterial
  private depthMaterial: RawShaderMaterial
  private spore!: THREE.Points<THREE.BufferGeometry, RawShaderMaterial>
  private leaves: THREE.Mesh[] = []
  private depthRenderTarget: THREE.WebGLRenderTarget
  private mainSceneRenderTarget: THREE.WebGLRenderTarget
  private sporeRenderTarget: THREE.WebGLRenderTarget
  private colorEffect: ColorEffect
  private vBlurEffect: VBlurEffect
  private hBlurEffect: HBlurEffect
  private hBlurEffect2: HBlurEffect
  private outputEffect: OutputEffect

  constructor(canvas: HTMLCanvasElement) {
    super(canvas)

    this.init()

    this.depthMaterial = this.createDepthMaterial()
    this.depthRenderTarget = this.createRenderTarget()
    this.mainSceneRenderTarget = this.createRenderTarget()
    this.sporeRenderTarget = this.createRenderTarget(1)
    this.colorEffect = new ColorEffect(this.renderer, this.mainSceneRenderTarget.texture, this.depthRenderTarget.texture, this.sporeRenderTarget.texture)
    this.vBlurEffect = new VBlurEffect(this.renderer, this.colorEffect.texture)
    this.hBlurEffect = new HBlurEffect(this.renderer, this.vBlurEffect.texture, 4.0)
    this.hBlurEffect2 = new HBlurEffect(this.renderer, this.hBlurEffect.texture)
    this.outputEffect = new OutputEffect(this.renderer, this.hBlurEffect2.texture)

    this.createLight()

    this.loadAssets().then((gltf) => {
      this.createMainScene(gltf)
      window.addEventListener('resize', this.resize.bind(this))
      this.addMouseEvents()
      this.renderer.setAnimationLoop(this.anime.bind(this))
    })
  }

  private async loadAssets() {
    const loader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
    loader.setDRACOLoader(dracoLoader)

    const gltf = await loader.loadAsync(import.meta.env.BASE_URL + 'models/forest.drc')
    dracoLoader.dispose()

    return gltf
  }

  private init() {
    this.scene.background = new THREE.Color('#000')
  }

  private createRenderTarget(dpr?: number) {
    const { width, height } = this.size
    const _dpr = dpr ?? this.renderer.getPixelRatio()
    const rt = new THREE.WebGLRenderTarget(width * _dpr, height * _dpr)
    return rt
  }

  private createDepthMaterial() {
    return new RawShaderMaterial({
      uniforms: {},
      vertexShader: depthVS,
      fragmentShader: depthFS,
      glslVersion: '300 es',
    })
  }

  private createLight() {
    const directionalLight = new THREE.DirectionalLight()
    directionalLight.position.set(3.5, 5, -7)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(2048, 2048)
    const frustum = 10
    directionalLight.shadow.camera = new THREE.OrthographicCamera(-frustum, frustum, frustum, -frustum, 0.01, 20)
    this.scene.add(directionalLight)

    // this.scene.add(new THREE.CameraHelper(directionalLight.shadow.camera))
  }

  private createMainScene(gltf: GLTF) {
    // console.log(gltf)

    const findObject = <T extends THREE.Object3D>(name: string, parent?: THREE.Object3D) => {
      return (parent ?? gltf.scene).children.find((c) => c.name === name) as T
    }

    this.camera = gltf.cameras[0] as THREE.PerspectiveCamera
    this.camera.near = 1
    this.camera.far = 50
    this.camera.updateProjectionMatrix()

    // ground
    const ground = findObject<THREE.Mesh>('ground')
    this.groundMaterial = new RawShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: groundVS,
      fragmentShader: groundFS,
      glslVersion: '300 es',
    })
    ground.material = this.groundMaterial
    this.scene.add(ground)

    const shadowGeo = ground.geometry.clone()
    const shadowMat = new THREE.ShadowMaterial({ color: '#000', transparent: true, opacity: 0.12 })
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat)
    shadowMesh.receiveShadow = true
    shadowMesh.position.y += 0.001
    this.scene.add(shadowMesh)

    // tree
    const treeBaseMaterial = new RawShaderMaterial({
      uniforms: {},
      vertexShader: baseVS,
      fragmentShader: baseFS,
      glslVersion: '300 es',
    })

    const tree = findObject('tree')
    const treeBase = findObject<THREE.Mesh>('base', tree)
    const treeLeaves = findObject<THREE.Mesh>('leaves', tree)

    const treeCoordinates = gltf.scene.children.filter((c) => c.name.startsWith('tree'))
    treeCoordinates.forEach((coord) => {
      const base = treeBase.clone()
      base.castShadow = true

      base.material = treeBaseMaterial
      const leaves = treeLeaves.clone()

      const group = new THREE.Group()
      group.add(base)
      group.add(leaves)
      this.scene.add(group)

      group.position.copy(coord.position)
      group.rotation.copy(coord.rotation)
      group.scale.copy(coord.scale)

      this.leaves.push(leaves)
    })

    // spores
    const sporeGeo = new THREE.BufferGeometry()

    const positions: number[] = []
    const r = () => Math.random() * 2.0 - 1.0
    for (let i = 0; i < 30; i++) {
      positions.push(r(), r(), r())
    }
    sporeGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

    const sporeMat = new RawShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: sporeVS,
      fragmentShader: sporeFS,
      glslVersion: '300 es',
      transparent: true,
      depthTest: false,
    })
    this.spore = new THREE.Points(sporeGeo, sporeMat)
    this.spore.layers.set(1)
    this.scene.add(this.spore)
  }

  private resize() {
    const { width, height } = this.size
    const dpr = this.renderer.getPixelRatio()
    this.depthRenderTarget.setSize(width * dpr, height * dpr)
    this.mainSceneRenderTarget.setSize(width * dpr, height * dpr)
    this.sporeRenderTarget.setSize(width, height)
    this.colorEffect.resize()
    this.vBlurEffect.resize()
    this.hBlurEffect.resize()
    this.hBlurEffect2.resize()
    this.outputEffect.resize()
  }

  private addMouseEvents() {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) * 2.0 - 1.0
      const y = (1.0 - e.clientY / window.innerHeight) * 2.0 - 1.0
      this.scene.lookAt(-x * 0.03, -y * 0.03, 1)
    })
  }

  private anime() {
    this.updateTime()
    this.scene.overrideMaterial = null

    this.groundMaterial.uniforms.uTime.value += this.time.delta
    this.leaves.forEach((leaf, i) => (leaf.rotation.y = ((i % 2) * 2 - 1) * Math.sin(this.time.elapsed * 0.03) * Math.PI))

    this.spore.material.uniforms.uTime.value += this.time.delta
    this.camera.layers.set(1)
    this.renderer.setRenderTarget(this.sporeRenderTarget)
    this.renderer.render(this.scene, this.camera)

    this.camera.layers.set(0)
    this.renderer.setRenderTarget(this.mainSceneRenderTarget)
    this.renderer.render(this.scene, this.camera)

    this.scene.overrideMaterial = this.depthMaterial
    this.renderer.setRenderTarget(this.depthRenderTarget)
    this.renderer.render(this.scene, this.camera)

    this.colorEffect.render()
    this.vBlurEffect.render()
    this.hBlurEffect.render()
    this.hBlurEffect2.render()

    this.renderer.setRenderTarget(null)
    this.renderer.render(this.outputEffect.scene, this.outputEffect.camera)

    // this.render()
  }
}
