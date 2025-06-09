"use client"

import { useEffect, useRef } from "react"

interface Star {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  angle: number
}

export function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas to full screen
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    // Initialize stars
    function initStars() {
      const stars: Star[] = []
      const starCount = Math.floor((window.innerWidth * window.innerHeight) / 3000) // Increase density by reducing divisor from 10000 to 3000

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5, // Increase max size from 1.5 to 2
          speed: Math.random() * 0.5 + 0.1, // Increase max speed from 0.3 to 0.5
          opacity: Math.random() * 0.7 + 0.2, // Increase opacity range from 0.1-0.6 to 0.2-0.9
          angle: Math.random() * Math.PI * 2, // Random direction
        })
      }

      starsRef.current = stars
    }

    // Animation loop
    let animationFrameId: number

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw and update stars
      starsRef.current.forEach((star) => {
        // Draw star
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 180, 255, ${star.opacity})` // Brighter purple-blue color
        ctx.fill()

        // Update position
        star.x += Math.cos(star.angle) * star.speed
        star.y += Math.sin(star.angle) * star.speed

        // Reset if out of bounds
        if (star.x < -10 || star.x > canvas.width + 10 || star.y < -10 || star.y > canvas.height + 10) {
          // Determine which edge to spawn from
          const edge = Math.floor(Math.random() * 4)

          if (edge === 0) {
            // Top
            star.x = Math.random() * canvas.width
            star.y = -10
            star.angle = Math.random() * Math.PI + Math.PI / 2 // Downward
          } else if (edge === 1) {
            // Right
            star.x = canvas.width + 10
            star.y = Math.random() * canvas.height
            star.angle = Math.random() * Math.PI + Math.PI // Leftward
          } else if (edge === 2) {
            // Bottom
            star.x = Math.random() * canvas.width
            star.y = canvas.height + 10
            star.angle = Math.random() * Math.PI - Math.PI / 2 // Upward
          } else {
            // Left
            star.x = -10
            star.y = Math.random() * canvas.height
            star.angle = Math.random() * Math.PI // Rightward
          }

          // Randomize properties again
          star.size = Math.random() * 1.5 + 0.5
          star.speed = Math.random() * 0.3 + 0.1
          star.opacity = Math.random() * 0.5 + 0.1
        }
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ background: "transparent" }}
    />
  )
}
