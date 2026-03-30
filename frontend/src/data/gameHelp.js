export const GAME_HELP = {
  select: {
    title: 'Huong dan chon tro choi',
    items: [
      'Dung phim mui ten hoac nut Left/Right de di chuyen tren bang chon game.',
      'Nhan ENTER de mo tro choi dang duoc chon.',
      'Nhan Back de quay lai danh sach game.',
      'Nhan Hint/Help de mo bang huong dan nhanh nay.',
    ],
  },
  caro5: {
    title: 'Huong dan Caro 5',
    items: [
      'Ban choi quan X, may choi quan O.',
      'Dat 5 quan lien tiep theo hang, cot hoac duong cheo de thang.',
      'Dung phim mui ten de di chuyen con tro va nhan ENTER de dat quan.',
      'Back se reset van choi, Save/Load luu va tai trang thai hien tai.',
      'Hint se goi y nuoc di tiep theo.',
    ],
  },
  caro4: {
    title: 'Huong dan Caro 4',
    items: [
      'Muc tieu la tao 4 quan lien tiep.',
      'Dung phim mui ten de chon o va ENTER de dat quan.',
      'May danh ngay sau luot cua ban.',
      'Co the doi thoi gian moi luot bang bo dem tren thanh header.',
      'Hint se dua con tro den nuoc di goi y.',
    ],
  },
  tictactoe: {
    title: 'Huong dan Tic-tac-toe',
    items: [
      'Ban choi X, may choi O tren ban 3x3.',
      'Dung phim mui ten de chon o va ENTER de danh.',
      'Can 3 quan lien tiep de thang.',
      'Save/Load luu va phuc hoi van choi dang choi.',
      'Hint se nhay den nuoc di tot nhat hien tai.',
    ],
  },
  snake: {
    title: 'Huong dan Ran san moi',
    items: [
      'Dung phim mui ten hoac WASD de doi huong ran.',
      'Nhan ENTER hoac nut Bat dau de chay/tam dung.',
      'An moi de tang diem, tranh dam vao tuong va than ran.',
      'Thoi gian tong van choi co the thay doi o header.',
      'Save/Load luu lai vi tri ran, diem va thoi gian con lai.',
    ],
  },
  match3: {
    title: 'Huong dan Ghep hang 3',
    items: [
      'Chon mot vien da, sau do doi cho voi o ke ben canh.',
      'Chi cac doi cho tao thanh it nhat 3 vien cung loai moi hop le.',
      'Dung phim mui ten de di chuyen con tro, ENTER de chon/doi cho.',
      'Back bo chon hien tai, Save/Load luu trang thai ban choi.',
      'Van choi ket thuc khi het gio va se ghi nhan diem.',
    ],
  },
  memory: {
    title: 'Huong dan Co tri nho',
    items: [
      'Lat 2 the moi luot de tim cap giong nhau.',
      'Dung phim mui ten de di chuyen va ENTER de lat the.',
      'Neu dung cap, ban duoc cong diem; neu sai cap, the se up lai.',
      'Hint se hien tam thoi mot cap chua khop.',
      'Het gio se ket thuc van choi, Save/Load luu bo bai hien tai.',
    ],
  },
  draw: {
    title: 'Huong dan Bang ve tu do',
    items: [
      'Chon mau, do day net va bat/tat tay xoa o thanh cong cu.',
      'Co the ve bang chuot hoac cam ung.',
      'Save/Load luu va tai lai buc ve dang thuc hien.',
      'Nut Luu anh tai anh PNG ve may.',
      'Back/Reset xoa toan bo khung ve hien tai.',
    ],
  },
}

export function getGameHelp(slug) {
  return GAME_HELP[slug] || null
}
