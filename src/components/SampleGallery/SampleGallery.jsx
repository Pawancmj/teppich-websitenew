import { Link } from "react-router-dom";
import styles from "./SampleGallery.module.css";

// Corrected paths
import sample1 from "../../assets/sample1.png";
import sample2 from "../../assets/sample2.png";
import sample3 from "../../assets/sample3.png";

const SampleGallery = () => {
  const samples = [
    {
      id: 1,
      name: "From Yarn to Masterpiece: The Hand Tufting Journey",
      subheading:
        "The loom is silent, the heart is loud, Each tuft a whisper, soft and proud.",
      description:
        "A blend of tradition and creativity, hand tufting transforms yarn into timeless elegance.",
      image: sample1,
    },
    {
      id: 2,
      name: "Hand-Woven: Woven with Intention, Designed by Hand",
      subheading:
        "Weaving stillness into motion, a quiet art unfolds.",
      description:
        "In each gentle pass of the shuttle, a story is formed—one of patience, tradition, and artistry.",
      image: sample3,
    },
    {
      id: 3,
      name: "Hand Knotted — Masterpieces Made One Knot at a Time",
      subheading: "Binding threads with patience, a rhythm to prove.",
      description:
        "From the first knot to the final finish, hand-knotted carpets are a labor of love, crafted to last generations.",
      image: sample2,
    },
  ];

  return (
    <section className={styles.sampleSection}>
      {/* 🎨 Slogan Heading */}
      <div className={styles.slogan}>
        <h2>
          “Weaving Dreams Into Threads, Crafting Stories Beneath Your Feet.”
        </h2>
        <p>
          Discover the artistry of carpets — where heritage meets innovation,
          and every piece is a masterpiece of time, skill, and soul.
        </p>
      </div>

      {/* 🖼️ Samples Grid */}
      <div className={styles.gallery}>
        {samples.map((sample) => (
          <div key={sample.id} className={styles.sample}>
            <img
              src={sample.image}
              alt={sample.name}
              className={styles.sampleImage}
            />
            <div className={styles.sampleContent}>
              <h2 className={styles.sampleName}>{sample.name}</h2>
              <h4 className={styles.sampleSub}>{sample.subheading}</h4>
              <p className={styles.sampleDesc}>{sample.description}</p>
              <Link to={`/samples/${sample.id}`} className={styles.viewSample}>
                View Sample
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SampleGallery;
