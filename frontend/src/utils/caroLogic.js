// Shared Caro logic for win detection and simple AI move selection.
// Check win after placing at (r,c)
export function checkWin(board, r, c, player, winLen = 5) {
  const rows = board.length, cols = board[0].length
  const dirs = [[0,1],[1,0],[1,1],[1,-1]]

  for (const [dr, dc] of dirs) {
    const line = [{ row: r, col: c }]
    for (const sign of [-1, 1]) {
      let nr = r + dr * sign, nc = c + dc * sign
      while (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === player) {
        line.push({ row: nr, col: nc })
        nr += dr * sign; nc += dc * sign
      }
    }
    if (line.length >= winLen) return { won: true, line }
  }
  return { won: false, line: [] }
}

// Score a line for AI evaluation
function scoreLine(board, r, c, dr, dc, player, opp, winLen, rows, cols) {
  let score = 0
  const dirs = [1, -1]
  for (const sign of dirs) {
    let count = 0, open = 0, nr = r + dr * sign, nc = c + dc * sign
    while (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      if (board[nr][nc] === player) { count++; nr += dr * sign; nc += dc * sign }
      else { if (board[nr][nc] === null) open++; break }
    }
    score += count * 10 + open * 3
  }
  return score
}

// Evaluate a position for a player
function evalPos(board, r, c, player, opp, winLen) {
  const rows = board.length, cols = board[0].length
  const dirs = [[0,1],[1,0],[1,1],[1,-1]]
  let total = 0
  for (const [dr, dc] of dirs) {
    total += scoreLine(board, r, c, dr, dc, player, opp, winLen, rows, cols)
  }
  return total
}

// Simple AI: pick best move by threat + opportunity scoring
export function aiMove(board, aiPlayer, humanPlayer, winLen = 5) {
  const rows = board.length, cols = board[0].length
  let best = null, bestScore = -Infinity
  const candidates = []

  // Collect cells near existing pieces
  const nearby = new Set()
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c]) {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = r + dr, nc = c + dc
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !board[nr][nc]) {
              nearby.add(`${nr},${nc}`)
            }
          }
        }
      }
    }
  }

  const cells = nearby.size > 0
    ? [...nearby].map(k => { const [r,c] = k.split(',').map(Number); return [r,c] })
    : [[Math.floor(rows/2), Math.floor(cols/2)]]

  for (const [r, c] of cells) {
    if (board[r][c]) continue
    // Try winning
    board[r][c] = aiPlayer
    if (checkWin(board, r, c, aiPlayer, winLen).won) { board[r][c] = null; return { row: r, col: c } }
    board[r][c] = null
    // Try blocking
    board[r][c] = humanPlayer
    if (checkWin(board, r, c, humanPlayer, winLen).won) { board[r][c] = null; candidates.push({ r, c, score: 9000 }); continue }
    board[r][c] = null
    // Heuristic score
    const s = evalPos(board, r, c, aiPlayer, humanPlayer, winLen) * 1.2
              + evalPos(board, r, c, humanPlayer, aiPlayer, winLen)
    candidates.push({ r, c, score: s })
  }

  candidates.sort((a, b) => b.score - a.score)
  if (candidates.length > 0) return { row: candidates[0].r, col: candidates[0].c }

  // Fallback: center
  return { row: Math.floor(rows/2), col: Math.floor(cols/2) }
}
