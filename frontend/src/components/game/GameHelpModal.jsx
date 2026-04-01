// Simple help modal that renders the game-specific instructions list.
import Modal from '@/components/common/Modal'

export default function GameHelpModal({ open, onClose, help }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={help?.title || 'Hướng dẫn'}
      size="lg"
    >
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-muted)]">
          Các nút điều khiển vẫn ưu tiên hiển thị trên bàn game. Phần này chỉ tóm tắt cách chơi và thao tác.
        </p>
        <ul className="space-y-2 text-sm leading-6 text-[var(--text-primary)] list-disc pl-5">
          {(help?.items || []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </Modal>
  )
}
