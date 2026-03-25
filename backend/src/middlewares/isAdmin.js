/**
 * Middleware kiểm tra quyền admin
 * Phải dùng SAU middleware authenticate
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa xác thực' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' });
  }

  next();
};

module.exports = { isAdmin };