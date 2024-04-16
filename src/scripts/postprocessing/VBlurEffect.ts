import * as THREE from 'three'
import { FrameBuffer } from '../core/FrameBuffer'
import { RawShaderMaterial } from '../core/ExtendedMaterials'
import vertexShader from '../shader/quad.vs'
import fragmentShader from '../shader/effect_vblur.fs'

export class VBlurEffect extends FrameBuffer {
  constructor(renderer: THREE.WebGLRenderer, source: THREE.Texture, scale = 1) {
    const material = new RawShaderMaterial({
      uniforms: {
        tSource: { value: source },
        uResolution: { value: [0, 0] },
        uScale: { value: scale },
      },
      vertexShader,
      fragmentShader,
      glslVersion: '300 es',
    })

    super(renderer, material)
    this.uniforms.uResolution.value = [this.size.width, this.size.height]
  }

  resize() {
    super.resize()
    this.uniforms.uResolution.value = [this.size.width, this.size.height]
  }
}
