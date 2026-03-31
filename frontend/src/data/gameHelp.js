export const GAME_HELP = {
  select: {
    title: 'Hướng dẫn chọn trò chơi',
    items: [
      'Dùng phím mũi tên hoặc nút Left/Right để di chuyển trên bảng chọn game.',
      'Nhấn ENTER để mở trò chơi đang được chọn.',
      'Nhấn Back để quay lại danh sách game.',
      'Nhấn Hint/Help để mở bảng hướng dẫn nhanh này.',
    ],
  },
  caro5: {
    title: 'Hướng dẫn Caro 5',
    items: [
      'Bạn chơi quân X, máy chơi quân O.',
      'Đặt 5 quân liên tiếp theo hàng, cột hoặc đường chéo để thắng.',
      'Dùng phím mũi tên để di chuyển con trỏ và nhấn ENTER để đặt quân.',
      'Back sẽ reset ván chơi, Save/Load lưu và tải trạng thái hiện tại.',
      'Hint sẽ gợi ý nước đi tiếp theo.',
    ],
  },
  caro4: {
    title: 'Hướng dẫn Caro 4',
    items: [
      'Mục tiêu là tạo 4 quân liên tiếp.',
      'Dùng phím mũi tên để chọn ô và ENTER để đặt quân.',
      'Máy đánh ngay sau lượt của bạn.',
      'Có thể đổi thời gian mỗi lượt bằng bộ đếm trên thanh header.',
      'Hint sẽ đưa con trỏ đến nước đi gợi ý.',
    ],
  },
  tictactoe: {
    title: 'Hướng dẫn Tic-tac-toe',
    items: [
      'Bạn chơi X, máy chơi O trên bàn 3x3.',
      'Dùng phím mũi tên để chọn ô và ENTER để đánh.',
      'Cần 3 quân liên tiếp để thắng.',
      'Save/Load lưu và phục hồi ván chơi đang chơi.',
      'Hint sẽ nhảy đến nước đi tốt nhất hiện tại.',
    ],
  },
  snake: {
    title: 'Hướng dẫn Rắn săn mồi',
    items: [
      'Dùng phím mũi tên hoặc WASD để đổi hướng rắn.',
      'Nhấn ENTER hoặc nút Bắt đầu để chạy/tạm dừng.',
      'Ăn mồi để tăng điểm, tránh đâm vào tường và thân rắn.',
      'Thời gian tổng ván chơi có thể thay đổi ở header.',
      'Save/Load lưu lại vị trí rắn, điểm và thời gian còn lại.',
    ],
  },
  match3: {
    title: 'Hướng dẫn Ghép hàng 3',
    items: [
      'Chọn một viên đá, sau đó đổi chỗ với ô kề bên cạnh.',
      'Chỉ các đổi chỗ tạo thành ít nhất 3 viên cùng loại mới hợp lệ.',
      'Dùng phím mũi tên để di chuyển con trỏ, ENTER để chọn/đổi chỗ.',
      'Back bỏ chọn hiện tại, Save/Load lưu trạng thái bàn chơi.',
      'Ván chơi kết thúc khi hết giờ và sẽ ghi nhận điểm.',
    ],
  },
  memory: {
    title: 'Hướng dẫn Cờ trí nhớ',
    items: [
      'Lật 2 thẻ mỗi lượt để tìm cặp giống nhau.',
      'Dùng phím mũi tên để di chuyển và ENTER để lật thẻ.',
      'Nếu đúng cặp, bạn được cộng điểm; nếu sai cặp, thẻ sẽ úp lại.',
      'Hint sẽ hiện tạm thời một cặp chưa khớp.',
      'Hết giờ sẽ kết thúc ván chơi, Save/Load lưu bộ bài hiện tại.',
    ],
  },
  draw: {
    title: 'Hướng dẫn Bảng vẽ tự do',
    items: [
      'Chọn màu, độ dày nét và bật/tắt tẩy xóa ở thanh công cụ.',
      'Có thể vẽ bằng chuột hoặc cảm ứng.',
      'Save/Load lưu và tải lại bức vẽ đang thực hiện.',
      'Nút Lưu ảnh tải ảnh PNG về máy.',
      'Back/Reset xóa toàn bộ khung vẽ hiện tại.',
    ],
  },
}

export function getGameHelp(slug) {
  return GAME_HELP[slug] || null
}
