import { useEffect, useRef, useState } from 'react'
import { Eraser, Trash2, Download, Minus, Plus } from 'lucide-react'
import GameHeader from '@/components/game/GameSessionHeader'
import { useGameStore } from '@/store/gameStore'
import { getGameHelp } from '@/data/gameHelp'

const COLORS = ['#0f1117', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff', '#6b7280']

export default function DrawingBoardPage() {
  const { saveGame, loadGame } = useGameStore()
  const help = getGameHelp('draw')
  const canvasRef = useRef(null)
  const lastPos = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [color, setColor] = useState('#3b82f6')
  const [size, setSize] = useState(4)
  const [eraser, setEraser] = useState(false)

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  const restoreCanvas = (imageData) => {
    if (!imageData) return clearCanvas()
    const image = new Image()
    image.onload = () => {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.drawImage(image, 0, 0, canvasRef.current.width, canvasRef.current.height)
    }
    image.src = imageData
  }

  useEffect(() => {
    clearCanvas()
  }, [])

  const getPos = (event) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height
    const source = event.touches?.[0] || event
    return {
      x: (source.clientX - rect.left) * scaleX,
      y: (source.clientY - rect.top) * scaleY,
    }
  }

  const startDraw = (event) => {
    event.preventDefault()
    setDrawing(true)
    const pos = getPos(event)
    lastPos.current = pos
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, (eraser ? size * 3 : size) / 2, 0, Math.PI * 2)
    ctx.fillStyle = eraser ? '#ffffff' : color
    ctx.fill()
  }

  const draw = (event) => {
    event.preventDefault()
    if (!drawing) return
    const pos = getPos(event)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = eraser ? '#ffffff' : color
    ctx.lineWidth = eraser ? size * 3 : size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = pos
  }

  const endDraw = () => setDrawing(false)

  const handleSave = () => {
    saveGame('draw', {
      imageData: canvasRef.current.toDataURL('image/png'),
      color,
      size,
      eraser,
    })
  }

  const handleLoad = () => {
    const snapshot = loadGame('draw')
    if (!snapshot) return
    restoreCanvas(snapshot.imageData)
    setColor(snapshot.color || '#3b82f6')
    setSize(snapshot.size || 4)
    setEraser(Boolean(snapshot.eraser))
  }

  const download = () => {
    const link = document.createElement('a')
    link.download = 'boardzone-drawing.png'
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  return (
    <div className="flex flex-col h-full">
      <GameHeader
        gameSlug="draw"
        gameName="Bang ve tu do"
        onReset={clearCanvas}
        onSave={handleSave}
        onLoad={handleLoad}
        timerKey={0}
        paused
        showTimer={false}
        help={help}
      />

      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 overflow-auto">
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <div className="flex gap-1.5">
            {COLORS.map((value) => (
              <button
                key={value}
                onClick={() => { setColor(value); setEraser(false) }}
                className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                style={{ background: value, borderColor: color === value && !eraser ? '#2451ff' : '#e5e7eb' }}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-[var(--border)]" />

          <div className="flex items-center gap-1">
            <button onClick={() => setSize((value) => Math.max(1, value - 1))} className="btn-icon"><Minus size={14} /></button>
            <span className="w-6 text-center text-sm font-bold">{size}</span>
            <button onClick={() => setSize((value) => Math.min(20, value + 1))} className="btn-icon"><Plus size={14} /></button>
          </div>

          <div className="w-px h-6 bg-[var(--border)]" />

          <button
            onClick={() => setEraser((value) => !value)}
            className={`btn-icon ${eraser ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : ''}`}
          >
            <Eraser size={16} />
          </button>
          <button onClick={clearCanvas} className="btn-icon text-red-500"><Trash2 size={16} /></button>
          <button onClick={download} className="btn-secondary text-xs px-3 py-1.5"><Download size={14} /> Luu anh</button>
        </div>

        <canvas
          ref={canvasRef}
          width={640}
          height={400}
          className="rounded-2xl border border-[var(--border)] touch-none"
          style={{ cursor: eraser ? 'cell' : 'crosshair', maxWidth: '100%', background: '#fff' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <p className="text-xs text-[var(--text-muted)]">Ve tu do bang chuot hoac cam ung. Save/Load se luu lai buc ve hien tai.</p>
      </div>
    </div>
  )
}
