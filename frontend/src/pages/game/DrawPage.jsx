import { useRef, useState, useEffect } from 'react'
import GameHeader from '@/components/game/GameHeader'
import { Eraser, Trash2, Download, Minus, Plus } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import toast from 'react-hot-toast'

const COLORS = ['#0f1117','#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#ffffff','#6b7280']

export default function DrawPage() {
  const { saveGame, loadGame } = useGameStore()
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [color, setColor] = useState('#3b82f6')
  const [size, setSize] = useState(4)
  const [eraser, setEraser] = useState(false)
  const lastPos = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height
    const src = e.touches?.[0] || e
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY }
  }

  const startDraw = (e) => {
    e.preventDefault()
    setDrawing(true)
    const pos = getPos(e)
    lastPos.current = pos
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, (eraser ? size*3 : size)/2, 0, Math.PI*2)
    ctx.fillStyle = eraser ? '#ffffff' : color
    ctx.fill()
  }

  const draw = (e) => {
    e.preventDefault()
    if (!drawing) return
    const pos = getPos(e)
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

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  const handleSave = () => {
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png')
      saveGame('draw', { dataUrl, color, size, eraser })
      toast.success('Đã lưu bản vẽ!')
    } catch {
      toast.error('Không thể lưu')
    }
  }

  const handleLoad = () => {
    const s = loadGame('draw')
    if (!s?.dataUrl) return toast.error('Chưa có bản vẽ đã lưu')
    const img = new Image()
    img.onload = () => {
      const ctx = canvasRef.current.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height)
      setColor(s.color || '#3b82f6')
      setSize(s.size || 4)
      setEraser(!!s.eraser)
      toast.success('Đã tải bản vẽ!')
    }
    img.src = s.dataUrl
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
        gameName="Bảng vẽ tự do"
        onReset={clearCanvas}
        onSave={handleSave}
        onLoad={handleLoad}
        timerKey={0}
        paused
      />

      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 overflow-auto">
        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {/* Colors */}
          <div className="flex gap-1.5">
            {COLORS.map(c => (
              <button key={c} onClick={() => { setColor(c); setEraser(false) }}
                className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                style={{ background: c, borderColor: color === c && !eraser ? '#2451ff' : '#e5e7eb' }} />
            ))}
          </div>

          <div className="w-px h-6 bg-[var(--border)]" />

          {/* Size */}
          <div className="flex items-center gap-1">
            <button onClick={() => setSize(s => Math.max(1,s-1))} className="btn-icon"><Minus size={14}/></button>
            <span className="w-6 text-center text-sm font-bold">{size}</span>
            <button onClick={() => setSize(s => Math.min(20,s+1))} className="btn-icon"><Plus size={14}/></button>
          </div>

          <div className="w-px h-6 bg-[var(--border)]" />

          <button onClick={() => setEraser(v => !v)}
            className={`btn-icon ${eraser ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : ''}`}>
            <Eraser size={16}/>
          </button>
          <button onClick={clearCanvas} className="btn-icon text-red-500"><Trash2 size={16}/></button>
          <button onClick={download} className="btn-secondary text-xs px-3 py-1.5"><Download size={14}/> Lưu ảnh</button>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef} width={640} height={400}
          className="rounded-2xl border border-[var(--border)] touch-none"
          style={{ cursor: eraser ? 'cell' : 'crosshair', maxWidth: '100%', background: '#fff' }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        />
        <p className="text-xs text-[var(--text-muted)]">💡 Vẽ tự do bằng chuột hoặc cảm ứng</p>
      </div>
    </div>
  )
}
