'use client'
import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function Ball({ number, position }) {
  const meshRef = useRef()

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005
      meshRef.current.rotation.y += 0.01
    }
  })

  const color = typeof number === 'number' ? (number % 2 === 0 ? '#3b82f6' : '#f97316') : '#3b82f6'

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

export default function ThreeScene({ numbers = [] }) {
  const positions = numbers.slice(0, 5).map((_, i) => [
    i * 2 - 4,
    Math.sin(i * 0.5) * 1.5,
    0
  ])

  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        
        {numbers.slice(0, 5).map((num, i) => (
          <Ball key={i} number={num} position={positions[i]} />
        ))}
        
        <OrbitControls />
      </Canvas>
    </div>
  )
}
