import { Link } from "react-router-dom";
import styles from "./HeroSection.module.css";
import heroBg from "../../assets/hero.png";
import logo from "../../assets/logo.png";
import img1 from "../../assets/img1.jpeg";
import img2 from "../../assets/img2.jpeg";
import img3 from "../../assets/img3.jpeg";
import img4 from "../../assets/img4.png"; // ✅ new 4th image

// ✅ Corrected paths (2 levels up from HeroSection.jsx)
import g1 from "../../assets/gallery-1.png";
import g2 from "../../assets/gallery-2.png";
import g3 from "../../assets/gallery-3.png";
import g4 from "../../assets/gallery-4.png";
import g5 from "../../assets/gallery-5.JPG";
import g6 from "../../assets/gallery-6.png";
import g7 from "../../assets/gallery-7.png";
import g8 from "../../assets/gallery-8.JPG";
import g9 from "../../assets/gallery-9.png";
import g10 from "../../assets/gallery-10.png";
import g11 from "../../assets/gallery-11.png";
import g12 from "../../assets/gallery-12.jpg";

const HeroSection = () => {
  const galleryImages = [g1,g2,g3,g4,g5,g6,g7,g8,g9,g10,g11,g12];

  return (
    <>
      {/* ✅ Root section with id="hero" */}
      <section
        id="hero"
        className={styles.hero}
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <img src={logo} alt="Logo" className={styles.logo} />
        <p className={styles.subtitle}>
          Handmade Stories You Can Walk On
        </p>
        <br />
        <p className={styles.heroLine}>
          <br />
          Premium carpets crafted to elevate every space—customized to suit your style, needs, and lifestyle
        </p>
      </section>

      {/* ✅ 2x2 Grid */}
      <div className={styles.gridContainer}>
        <div className={styles.gridItem}>
          <img src={img1} alt="Carpet 1" />
          <h3>From Fiber to Floor: How We Make Our Carpets</h3>
          <h4>From premium wool to vibrant natural dyes, we prepare every material with care—because exceptional carpets begin with exceptional foundations</h4>
          <p>Crafting a masterpiece begins with meticulous material preparation. From selecting the finest wool to hand-dyeing vibrant hues, every step is essential. Our artisans spin, dye, and weave with passion to create carpets that tell a story</p>
        </div>

        <div className={styles.gridItem}>
          <img src={img3} alt="Carpet 3" />
          <h3>Where Color Meets Craft: The Art of Wool Dyeing</h3>
          <h4>Dyed in warmth, spun with grace—colors born to find their place</h4>
          <p>In steaming pots of color deep, the woolen strands begin to steep. With every swirl and every shade, a future carpet’s hue is laid. Hands that stir with care and grace, bring warmth and soul to every place.</p>
        </div>

        <div className={styles.gridItem}>
          <img src={img2} alt="Carpet 2" />
          <h3>From Imagination to Pattern: The Art of Carpet Design</h3>
          <h4>What starts as a pattern on paper becomes a masterpiece under the loom</h4>
          <p>Carpet designing begins with a vision—sketched by hand or digitally crafted, each pattern tells a cultural or artistic story. From motif selection to color planning, the design process balances tradition, creativity, and precision. Designs are carefully charted onto graph paper or software, guiding the weavers thread by thread.</p>
        </div>

        {/* ✅ New 4th grid item */}
        <div className={styles.gridItem}>
          <img src={img4} alt="Carpet 4" />
          <h3>Where Every Detail Matters- Sheared, Carved, Perfected</h3>
          <h4>Carved with care, sheared with reverence, sculpted by hand, shaped in silence</h4>
          <p>In the hush of the workshop, hands move like memory—shearing softness into light, carving stories into thread, finishing what the loom began with grace and quiet devotion.</p>
        </div>
      </div>

      {/* Heading below grid */}
      <div className={styles.gridTextSection}>
        <h2 className={styles.gridHeading}>
          Handmade Heritage, Woven to Perfection.
        </h2>
        <p className={styles.gridSubHeading}>
          Each carpet is more than décor – it’s a timeless piece of art, crafted with care, 
          precision, and the legacy of generations. Discover the beauty of tradition woven 
          into every thread.
        </p>
      </div>

      {/* Gallery Section */}
      <div className={styles.gallerySection}>
        <h2 className={styles.galleryTitle}>Our Masterpieces Gallery</h2>
        <div className={styles.galleryGrid}>
          {galleryImages.slice(0, 4).map((img, index) => (
            <div key={index} className={styles.galleryItem}>
              <img src={img} alt={`Gallery ${index + 1}`} />
            </div>
          ))}
        </div>
        <Link to="/choose">
          <button className={styles.showMoreBtn}>See More</button>
        </Link>
      </div>
    </>
  );
};

export default HeroSection;
