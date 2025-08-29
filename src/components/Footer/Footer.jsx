import styles from "./Footer.module.css";
import {
  FaInstagram,
  FaLinkedin,
  FaWhatsapp,
  FaPhoneAlt,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const Footer = () => {
  const navigate = useNavigate();

  const handleHomeClick = (e) => {
    e.preventDefault();
    navigate("/", { state: { scrollTo: "hero" } });
  };

  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.container}>
        <div className={styles.columns}>
          {/* Column 1: Logo + description */}
          <div className={styles.col}>
            <div className={styles.logoCard}>
              <img src={logo} alt="Teppich Art logo" />
            </div>
            <p className={styles.blurb}>
              At Teppich Art, we specialize in creating beautiful, high-quality
              rugs and artistic designs for homes and offices.
            </p>
          </div>

          {/* Column 2: Company links */}
          <div className={styles.col}>
            <h4 className={styles.heading}>Company</h4>
            <ul className={styles.linkList}>
              <li>
                <a href="/" onClick={handleHomeClick}>Home</a>
              </li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/samples">Product Category</a></li>
              <li><a href="/choose">Gallery</a></li>
            </ul>
          </div>

          {/* Column 3: Address + Connect with Us */}
          <div className={styles.col}>
            <h4 className={styles.heading}>Address</h4>
            <address className={styles.addr}>
              Jallapur,
              <br />
              Bhadohi-221401,
              <br />
              Uttar Pradesh, India
            </address>

            <h5 className={styles.subHeading}>Connect with Us</h5>
            <div className={styles.socials}>
              <a href="https://www.linkedin.com/in/teppich-art-b82b64270?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noreferrer"><FaLinkedin /></a>
              <a href="https://www.instagram.com/teppich_art?igsh=MWl5MmQzcHZ2eW5vZw%3D%3D&utm_source=qr" target="_blank" rel="noreferrer"><FaInstagram /></a>
              <a href="https://wa.me/917860912005" target="_blank" rel="noreferrer"><FaWhatsapp /></a>
            </div>
          </div>

          {/* Column 4: Regional Contacts */}
          <div className={styles.col}>
            <h4 className={styles.heading}>Contact</h4>

            <h5 className={styles.subHeading}>For India Region</h5>
            <h6>Shadab Kaisar</h6>
            <ul className={styles.regionContacts}>
              <li><FaPhoneAlt /> <a href="tel:+917860912005">+91 7860912005</a></li>
              <li><MdEmail /> <a href="mailto:support@teppichart.com">support@teppichart.com</a></li>
            </ul>

            <h5 className={styles.subHeading}>For Middle East Region</h5>
            <h6>Aisha Khan</h6>
            <ul className={styles.regionContacts}>
              <li><FaPhoneAlt /> <a href="tel:+971 58 912 8264">+971 58 912 8264</a></li>
              <li><MdEmail /> <a href="mailto:ayesha@teppichart.com">ayesha@teppichart.com</a></li>
            </ul>
          </div>
        </div>

        <hr className={styles.divider} />
        <p className={styles.copyright}>
          © 2025 Teppich Art. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
