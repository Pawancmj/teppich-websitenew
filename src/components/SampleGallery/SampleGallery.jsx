import { Link } from "react-router-dom";
import styles from "./SampleGallery.module.css";
import { useData } from "../../context/DataContext";

const SampleGallery = () => {
  const { sampleData, loading } = useData();

  if (loading) return <p>Loading...</p>;

  if (!sampleData || sampleData.length === 0) return <p>No samples available.</p>;

  return (
    <section className={styles.sampleSection}>
      <div className={styles.slogan}>
        <h2>“Weaving Dreams Into Threads, Crafting Stories Beneath Your Feet.”</h2>
        <p>
          Discover the artistry of carpets — where heritage meets innovation,
          and every piece is a masterpiece of time, skill, and soul.
        </p>
      </div>

      <div className={styles.gallery}>
        {sampleData.map(({ id, name, subheading, description, image }) => (
          <div key={id} className={styles.sample}>
            <img src={image} alt={name} className={styles.sampleImage} />
            <div className={styles.sampleContent}>
              <h2 className={styles.sampleName}>{name}</h2>
              <h4 className={styles.sampleSub}>{subheading}</h4>
              <p className={styles.sampleDesc}>{description}</p>
              <Link to={`/samples/${id}`} className={styles.viewSample}>
                Explore
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SampleGallery;
