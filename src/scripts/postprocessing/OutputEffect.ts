import * as THREE from 'three'
import { FrameBuffer } from '../core/FrameBuffer'
import { RawShaderMaterial } from '../core/ExtendedMaterials'
import vertexShader from '../shader/quad.vs'
import fragmentShader from '../shader/effect_output.fs'

export class OutputEffect extends FrameBuffer {
  constructor(renderer: THREE.WebGLRenderer, source: THREE.Texture) {
    const material = new RawShaderMaterial({
      uniforms: {
        tSource: { value: source },
        uResolution: { value: [0, 0] },
      },
      vertexShader,
      fragmentShader,
      glslVersion: '300 es',
    })

    super(renderer, material, { dpr: 1 })
    this.uniforms.uResolution.value = [this.size.width, this.size.height]
  }

  resize() {
    super.resize()
    this.uniforms.uResolution.value = [this.size.width, this.size.height]
  }
}
