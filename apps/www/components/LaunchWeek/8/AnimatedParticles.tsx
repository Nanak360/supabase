import React, { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { AdditiveBlending } from 'three'
import { Trail } from '@react-three/drei'
import { range } from 'lodash'

interface Props {
  index?: number
  animate?: boolean
  children: any
  config: any
}

const Particle = ({ index = 0, animate = true, children, config }: Props) => {
  const particle = useRef<any>(null)

  // With a higher xRandomnessShape,
  // more particles will be condenced at the start of the curve (center)
  // and fewer will float around (external)
  const pathOffsetShape =
    Math.pow(
      Math.random() * config.xRandomnessShape,
      config.xRandomness - 1 + 1 - config.xRandomness / 2
    ) * config.xThickness
  const pathOffset = pathOffsetShape * (pathOffsetShape < 1 || Math.random() < 0.5 ? 1 : -1)
  const verticalRandomness = Math.random() * (config.yThickness - 1) + 1 - config.yThickness / 2
  // Show some trails only if there are less than 30 particles
  const hasTrail =
    index + 1 <= config.trails || config.particles < 10
      ? index === 0
      : config.particles < 30
      ? index < 2
      : false
  const speed = hasTrail
    ? // if a trail goes too slow, it won't be noticeable
      // so always assign max available speed
      config.max_speed
    : Math.random() * (config.min_speed - config.max_speed) + config.max_speed
  const circumference = (config.widthRadius * Math.PI * 2) / 100
  const delayOffsetFactor = 100
  const delayOffset = Math.random() * (delayOffsetFactor - 1) + 1

  useFrame(({ clock }) => {
    if (animate) {
      const timer = clock.getElapsedTime() * speed + delayOffset
      // When the loop count is even, draw bottom 8 shape
      // if odd, draw top 8 shape
      const isEven = Math.floor(timer / circumference) % 2 == 0
      particle.current.position.x = isEven
        ? Math.sin(timer) * config.widthRadius * config.widthRatio + pathOffset
        : Math.sin(timer) * config.widthRadius + pathOffset
      particle.current.position.y = isEven
        ? Math.cos(timer) * config.bottomHeightRadius -
          config.bottomHeightRadius +
          verticalRandomness
        : -Math.cos(timer) * config.topHeightRadius + config.topHeightRadius + verticalRandomness
    }
  })

  return (
    <>
      {hasTrail && (
        <Trail
          width={config.trailWidth} // Width of the line
          color={'white'} // Color of the line
          length={config.trailLength} // Length of the line
          decay={config.trailDecay} // How fast the line fades away
          local={true} // Wether to use the target's world or local positions
          stride={0} // Min distance between previous and current point
          interval={1} // Number of frames to wait before next calculation
          target={particle} // Optional target. This object will produce the trail.
          attenuation={(width) => (width / 2) * width} // A function to define the width in each point along it.
        />
      )}
      <mesh ref={particle}>{children}</mesh>
    </>
  )
}

let defaultConfig = {
  particles: 1500,
  particlesSize: 1.8,
  particlesSides: 5,
  particlesBlending: true,
  lightIntensity: 0.75,
  widthRadius: 100,
  widthRatio: 1.2,
  topHeightRadius: 80,
  bottomHeightRadius: 100,
  trails: 0,
  trailWidth: 40,
  trailLength: 100,
  trailDecay: 450,
  color: 'white',
  xThickness: 5,
  xRandomnessShape: 3.5,
  xRandomness: 2.5,
  yThickness: 20,
  max_speed: 1.3,
  min_speed: -0.3,
}

export default function () {
  const [particles, setParticles] = useState(range(0, 1))
  const [config, setConfig] = useState(defaultConfig)
  const isWindowUndefined = typeof window === 'undefined'
  if (isWindowUndefined) return null
  const hash = window.location.hash

  const handleSetConfig = (name: string, value: any) => {
    setConfig((prevConfig) => ({ ...prevConfig, [name]: value }))
  }
  const init = async () => {
    if (hash !== '#debug') return
    const dat = await import('dat.gui')
    const gui = new dat.GUI()
    const particlesFolder = gui.addFolder('Particles')
    const shapeFolder = gui.addFolder('Shape')
    const speedFolder = gui.addFolder('Speed')
    const trailFolder = gui.addFolder('Trail')
    gui.width = 500
    particlesFolder
      .add(config, 'particles')
      .min(1)
      .max(5000)
      .step(1)
      .name('Count')
      .onChange((value) => {
        handleSetConfig('particles', value)
        setParticles(range(0, value))
      })
    particlesFolder
      .add(config, 'particlesSize')
      .min(1)
      .max(10)
      .step(0.05)
      .name('Size')
      .onChange((value) => handleSetConfig('particlesSize', value))
    particlesFolder
      .add(config, 'particlesSides')
      .min(3)
      .max(20)
      .step(1)
      .name('Sides')
      .onChange((value) => handleSetConfig('particlesSides', value))
    particlesFolder
      .add(config, 'lightIntensity')
      .min(0)
      .max(10)
      .step(0.05)
      .name('Light intensity')
      .onChange((value) => handleSetConfig('lightIntensity', value))
    particlesFolder
      .add(config, 'particlesBlending')
      .name('Blending')
      .onChange((value) => handleSetConfig('particles¶Blending', value))
    shapeFolder
      .add(config, 'widthRadius')
      .min(1)
      .max(200)
      .step(1)
      .name('Width Radius')
      .onChange((value) => handleSetConfig('widthRadius', value))
    shapeFolder
      .add(config, 'widthRatio')
      .min(0.5)
      .max(3)
      .step(0.01)
      .name('Top/Bottom Ratio')
      .onChange((value) => handleSetConfig('widthRatio', value))
    shapeFolder
      .add(config, 'topHeightRadius')
      .min(1)
      .max(200)
      .step(1)
      .name('Height Radius - Top')
      .onChange((value) => handleSetConfig('topHeightRadius', value))
    shapeFolder
      .add(config, 'bottomHeightRadius')
      .min(1)
      .max(200)
      .step(1)
      .name('Height Radius - Bottom')
      .onChange((value) => handleSetConfig('bottomHeightRadius', value))
    shapeFolder
      .add(config, 'xThickness')
      .min(1)
      .max(100)
      .step(0.1)
      .name('Stroke Width')
      .onChange((value) => handleSetConfig('xThickness', value))
    shapeFolder
      .add(config, 'xRandomnessShape')
      .min(0)
      .max(5)
      .step(0.001)
      .name('Randomness shape')
      .onChange((value) => handleSetConfig('xRandomnessShape', value))
    shapeFolder
      .add(config, 'xRandomness')
      .min(0)
      .max(50)
      .step(0.01)
      .name('Randomness')
      .onChange((value) => handleSetConfig('xRandomness', value))
    shapeFolder
      .add(config, 'yThickness')
      .min(1)
      .max(50)
      .step(0.1)
      .name('y thickness')
      .onChange((value) => handleSetConfig('yThickness', value))
    speedFolder
      .add(config, 'min_speed')
      .min(-6)
      .max(6)
      .step(0.1)
      .name('Min speed')
      .onChange((value) => handleSetConfig('min_speed', value))
    speedFolder
      .add(config, 'max_speed')
      .min(-6)
      .max(6)
      .step(0.1)
      .name('Max speed')
      .onChange((value) => handleSetConfig('max_speed', value))
    trailFolder
      .add(config, 'trails')
      .min(0)
      .max(10)
      .step(1)
      .name('Count')
      .onChange((value) => handleSetConfig('trails', value))
    trailFolder
      .add(config, 'trailWidth')
      .min(0)
      .max(100)
      .step(0.1)
      .name('Thickness')
      .onChange((value) => handleSetConfig('trailWidth', value))
    trailFolder
      .add(config, 'trailLength')
      .min(1)
      .max(100)
      .step(0.1)
      .name('Length')
      .onChange((value) => handleSetConfig('trailLength', value))
    trailFolder
      .add(config, 'trailDecay')
      .min(1)
      .max(1000)
      .step(0.1)
      .name('Decay')
      .onChange((value) => handleSetConfig('trailLength', value))

    particlesFolder.open()
    shapeFolder.open()
    speedFolder.open()
    trailFolder.open()
  }

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    setParticles(range(0, config.particles))
  }, [config.particles])

  const Geometry = useMemo(
    () => () => <circleGeometry args={[config.particlesSize, config.particlesSides]} />,
    []
  )
  const Material = () =>
    useMemo(
      () => (
        <meshStandardMaterial
          color={config.color}
          blending={config.particlesBlending ? AdditiveBlending : undefined}
        />
      ),
      []
    )

  return (
    <Canvas linear dpr={[1, 2]} camera={{ fov: 75, position: [0, 0, 400] }}>
      <ambientLight intensity={config.lightIntensity} />
      {particles?.map((_, index) => (
        <Particle key={`particle-${index}`} index={index} config={config}>
          <Geometry />
          <Material />
        </Particle>
      ))}
    </Canvas>
  )
}
