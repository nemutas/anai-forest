import * as THREE from 'three'
import { FrameBuffer } from '../core/FrameBuffer'
import { RawShaderMaterial } from '../core/ExtendedMaterials'
import vertexShader from '../shader/quad.vs'
import fragmentShader from '../shader/effect_color.fs'

export class ColorEffect extends FrameBuffer {
  constructor(renderer: THREE.WebGLRenderer, colorMap: THREE.Texture, depthMap: THREE.Texture, sporeMap: THREE.Texture) {
    const material = new RawShaderMaterial({
      uniforms: {
        tColorMap: { value: colorMap },
        tDepthMap: { value: depthMap },
        tSporeMap: { value: sporeMap },
      },
      vertexShader,
      fragmentShader,
      glslVersion: '300 es',
    })

    super(renderer, material)
  }
}
