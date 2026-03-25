export const conversations = [
  {
    id: 'm1',
    members: ['u2', 'u3'],
    updatedAt: '2026-03-12 08:00',
  },
  {
    id: 'm2',
    members: ['u2', 'u5'],
    updatedAt: '2026-03-12 09:30',
  },
]

export const messages = [
  {
    id: 'msg1',
    conversationId: 'm1',
    senderId: 'u2',
    content: 'Chơi caro không?',
    createdAt: '2026-03-12 07:55',
  },
  {
    id: 'msg2',
    conversationId: 'm1',
    senderId: 'u3',
    content: 'Có nè, vào game đi.',
    createdAt: '2026-03-12 07:56',
  },
  {
    id: 'msg3',
    conversationId: 'm2',
    senderId: 'u5',
    content: 'Ranking hôm nay cao ghê.',
    createdAt: '2026-03-12 09:20',
  },
]