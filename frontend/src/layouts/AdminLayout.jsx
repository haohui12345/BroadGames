import { Link, Outlet, useNavigate } from "react-router-dom"
import "./AdminLayout.css"

const AdminLayout = ({ user }) => {
  const navigate = useNavigate()

  // ❗ chặn không phải admin
  if (!user || user.role !== "admin") {
    navigate("/")
    return null
  }

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <h2>ADMIN</h2>

        <Link to="/admin/users">Users</Link>
        <Link to="/admin/games">Games</Link>
        <Link to="/admin/stats">Stats</Link>

        <button onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        <div className="admin-header">
          <h3>Admin Dashboard</h3>
        </div>

        <div className="admin-main">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout  