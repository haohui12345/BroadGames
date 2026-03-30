import Modal from '@/components/common/Modal'

export default function GameHelpModal({ open, onClose, help }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={help?.title || 'Huong dan'}
      size="lg"
    >
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-muted)]">
          Cac nut dieu khien van uu tien hien thi tren ban game. Phan nay chi tom tat cach choi va thao tac.
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
