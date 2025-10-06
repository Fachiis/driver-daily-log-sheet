'use client'

import React from 'react'

interface Point {
   x: number
   y: number
}

interface InteractiveGridProps {
   className?: string
   size?: number
   intensity?: number
   blur?: number
   stroke?: number
   color?: string
   speed?: number
}

const InteractiveGrid = ({
   className = '',
   size = 40,
   intensity = 0.4,
   blur = 0.8,
   stroke = 1.0,
   color = 'rgb(148 163 184)', // slate-400
   speed = 0.6,
}: Readonly<InteractiveGridProps>) => {
   const [points, setPoints] = React.useState<Point[]>([])
   const [mousePosition, setMousePosition] = React.useState<Point>({
      x: 0,
      y: 0,
   })
   const canvasRef = React.useRef<HTMLCanvasElement>(null)
   const containerRef = React.useRef<HTMLDivElement>(null)
   const animationFrameRef = React.useRef<number>(0)

   React.useEffect(() => {
      if (!containerRef.current) return

      const updatePoints = () => {
         const { width, height } = containerRef.current!.getBoundingClientRect()
         const cols = Math.floor(width / size)
         const rows = Math.floor(height / size)
         const newPoints: Point[] = []

         for (let i = 0; i <= cols; i++) {
            for (let j = 0; j <= rows; j++) {
               newPoints.push({
                  x: (i * width) / cols,
                  y: (j * height) / rows,
               })
            }
         }

         setPoints(newPoints)
      }

      updatePoints()
      window.addEventListener('resize', updatePoints)

      return () => {
         window.removeEventListener('resize', updatePoints)
      }
   }, [size])

   React.useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas || !containerRef.current) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const container = containerRef.current

      const updateCanvasSize = () => {
         const rect = container.getBoundingClientRect()
         const dpr = window.devicePixelRatio || 1
         canvas.width = rect.width * dpr
         canvas.height = rect.height * dpr
         canvas.style.width = `${rect.width}px`
         canvas.style.height = `${rect.height}px`
         ctx.scale(dpr, dpr)
      }

      updateCanvasSize()

      const drawGrid = () => {
         if (!ctx || !canvas) return

         ctx.clearRect(0, 0, canvas.width, canvas.height)
         ctx.strokeStyle = color
         ctx.lineWidth = stroke

         points.forEach((point) => {
            const distance = Math.sqrt(
               Math.pow(point.x - mousePosition.x, 2) +
                  Math.pow(point.y - mousePosition.y, 2)
            )
            const maxDistance = 150 // Increased interaction radius
            const influence = Math.max(0, 1 - distance / maxDistance)

            const offsetX = (point.x - mousePosition.x) * influence * intensity
            const offsetY = (point.y - mousePosition.y) * influence * intensity

            // Draw horizontal line
            ctx.beginPath()
            ctx.moveTo(point.x + offsetX, point.y + offsetY)
            ctx.lineTo(point.x + size + offsetX, point.y + offsetY)
            ctx.stroke()

            // Draw vertical line
            ctx.beginPath()
            ctx.moveTo(point.x + offsetX, point.y + offsetY)
            ctx.lineTo(point.x + offsetX, point.y + size + offsetY)
            ctx.stroke()
         })
      }

      const handleMouseMove = (e: MouseEvent) => {
         const rect = canvas.getBoundingClientRect()
         setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
         })
      }

      const animate = () => {
         drawGrid()
         animationFrameRef.current = requestAnimationFrame(animate)
      }

      container.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('resize', updateCanvasSize)
      animate()

      return () => {
         container.removeEventListener('mousemove', handleMouseMove)
         window.removeEventListener('resize', updateCanvasSize)
         if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
         }
      }
   }, [points, mousePosition, color, stroke, size, intensity])

   return (
      <div ref={containerRef} className={`relative w-full h-full ${className}`}>
         <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{
               filter: `blur(${blur}px)`,
               transition: `all ${speed}s ease-out`,
            }}
         />
      </div>
   )
}

export default InteractiveGrid
