/**
 * requireRole(...roles)
 * Usage: router.get('/admin/users', verifyToken, requireRole('admin'), handler)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Tidak terautentikasi." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Akses ditolak. Fitur ini membutuhkan role: ${roles.join(" / ")}.`,
      });
    }

    next();
  };
};

module.exports = requireRole;
