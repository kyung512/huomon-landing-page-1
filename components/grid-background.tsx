"use client"

import { useEffect, useRef } from "react"

export function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    let particles: Particle[] = []
    const gridSize = 40
    let animationFrameId: number

    // Particle class
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number

      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.size = Math.random() * 1.5 + 0.5
        this.speedX = (Math.random() - 0.5) * 0.3
        this.speedY = (Math.random() - 0.5) * 0.3
        this.opacity = Math.random() * 0.5 + 0.1
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        // Wrap around edges
        if (this.x < 0) this.x = width
        if (this.x > width) this.x = 0
        if (this.y < 0) this.y = height
        if (this.y > height) this.y = 0
      }

      draw() {
        ctx!.beginPath()
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(120, 160, 255, ${this.opacity})` // Brighter blue particles
        ctx!.fill()
      }
    }

    // Initialize
    function init() {
      canvas.width = width = window.innerWidth
      canvas.height = height = window.innerHeight

      particles = []
      const particleCount = Math.floor((width * height) / 15000)

      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle())
      }
    }

    // Draw grid
    function drawGrid() {
      ctx.strokeStyle = "rgba(50, 80, 120, 0.1)" // Reduced opacity for more subtle grid
      ctx.lineWidth = 0.5

      // Vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
    }

    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, width, height)

      // Draw darker gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, "#050a10") // Darker top color
      gradient.addColorStop(1, "#070d14") // Darker bottom color
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw grid with slightly more visible lines against darker background
      drawGrid()

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    // Handle resize
    function handleResize() {
      init()
    }

    window.addEventListener("resize", handleResize)
    init()
    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />
}
