import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const navigate = useNavigate();

  // Custom handler for Home to scroll to Hero
  const handleHomeClick = (e) => {
    e.preventDefault();
    navigate("/", { state: { scrollTo: "hero" } });
  };

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navList}>
        <li>
          {/* ✅ Home stays as custom handler */}
          <a href="/" onClick={handleHomeClick} className={styles.navLink}>
            Home
          </a>
        </li>

        {/* ✅ NavLink auto adds "active" */}
        <li>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            About Us
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/samples"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Collections
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/choose"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Gallery
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
