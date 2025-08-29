import { useParams, useNavigate } from "react-router-dom";
import styles from "./SampleDetail.module.css";

// Importing images for each sample explicitly
import sample1_1 from "../../assets/images/sample1/sample1-1.jpg";
import sample1_2 from "../../assets/images/sample1/sample1-2.jpg";
import sample1_3 from "../../assets/images/sample1/sample1-3.jpg";
import sample1_4 from "../../assets/images/sample1/sample1-4.jpg";
import sample1_5 from "../../assets/images/sample1/sample1-5.jpg";
import sample1_6 from "../../assets/images/sample1/sample1-6.jpg";
import sample1_7 from "../../assets/images/sample1/sample1-7.jpg";
import sample1_8 from "../../assets/images/sample1/sample1-8.jpg";
import sample1_9 from "../../assets/images/sample1/sample1-9.jpg";
import sample1_10 from "../../assets/images/sample1/sample1-10.jpg";
import sample1_11 from "../../assets/images/sample1/sample1-11.jpg";
import sample1_12 from "../../assets/images/sample1/sample1-12.jpg";
import sample1_13 from "../../assets/images/sample1/sample1-13.jpg";
import sample1_14 from "../../assets/images/sample1/sample1-14.jpg";
import sample1_15 from "../../assets/images/sample1/sample1-15.jpg";
import sample1_16 from "../../assets/images/sample1/sample1-16.jpg";
import sample1_17 from "../../assets/images/sample1/sample1-17.jpg";
import sample1_18 from "../../assets/images/sample1/sample1-18.jpg";
import sample1_19 from "../../assets/images/sample1/sample1-19.jpg";
import sample1_20 from "../../assets/images/sample1/sample1-20.JPG";

import sample2_1 from "../../assets/images/sample2/sample2-1.JPG";
import sample2_2 from "../../assets/images/sample2/sample2-2.JPG";
import sample2_3 from "../../assets/images/sample2/sample2-3.JPG";
import sample2_4 from "../../assets/images/sample2/sample2-4.JPG";
import sample2_5 from "../../assets/images/sample2/sample2-5.JPG";
import sample2_6 from "../../assets/images/sample2/sample2-6.JPG";
import sample2_7 from "../../assets/images/sample2/sample2-7.JPG";
import sample2_8 from "../../assets/images/sample2/sample2-8.JPG";
import sample2_9 from "../../assets/images/sample2/sample2-9.JPG";
import sample2_10 from "../../assets/images/sample2/sample2-10.JPG";
import sample2_11 from "../../assets/images/sample2/sample2-11.JPG";
import sample2_12 from "../../assets/images/sample2/sample2-12.JPG";
import sample2_13 from "../../assets/images/sample2/sample2-13.JPG";
import sample2_14 from "../../assets/images/sample2/sample2-14.JPG";
import sample2_15 from "../../assets/images/sample2/sample2-15.JPG";
import sample2_16 from "../../assets/images/sample2/sample2-16.JPG";
import sample2_17 from "../../assets/images/sample2/sample2-17.JPG";
import sample2_18 from "../../assets/images/sample2/sample2-18.JPG";
import sample2_19 from "../../assets/images/sample2/sample2-19.JPG";
import sample2_20 from "../../assets/images/sample2/sample2-20.JPG";
import sample2_21 from "../../assets/images/sample2/sample2-21.JPG";
import sample2_22 from "../../assets/images/sample2/sample2-22.JPG";
import sample2_23 from "../../assets/images/sample2/sample2-23.JPG";
import sample2_24 from "../../assets/images/sample2/sample2-24.JPG";
import sample2_25 from "../../assets/images/sample2/sample2-25.JPG";
import sample2_26 from "../../assets/images/sample2/sample2-26.JPG";
import sample2_27 from "../../assets/images/sample2/sample2-27.JPG";
import sample2_28 from "../../assets/images/sample2/sample2-28.JPG";
import sample2_29 from "../../assets/images/sample2/sample2-29.JPG";
import sample2_30 from "../../assets/images/sample2/sample2-30.JPG";
import sample2_31 from "../../assets/images/sample2/sample2-31.JPG";
import sample2_32 from "../../assets/images/sample2/sample2-32.JPG";
import sample2_33 from "../../assets/images/sample2/sample2-33.JPG";
import sample2_34 from "../../assets/images/sample2/sample2-34.JPG";
import sample2_35 from "../../assets/images/sample2/sample2-35.JPG";
import sample2_36 from "../../assets/images/sample2/sample2-36.JPG";


import sample3_1 from "../../assets/images/sample3/sample3-1.JPG";
import sample3_2 from "../../assets/images/sample3/sample3-2.JPG";
import sample3_3 from "../../assets/images/sample3/sample3-3.JPG";
import sample3_4 from "../../assets/images/sample3/sample3-4.JPG";
import sample3_5 from "../../assets/images/sample3/sample3-5.JPG";
import sample3_6 from "../../assets/images/sample3/sample3-6.JPG";
import sample3_7 from "../../assets/images/sample3/sample3-7.JPG";
import sample3_8 from "../../assets/images/sample3/sample3-8.JPG";
import sample3_9 from "../../assets/images/sample3/sample3-9.JPG";
import sample3_10 from "../../assets/images/sample3/sample3-10.JPG";
import sample3_11 from "../../assets/images/sample3/sample3-11.JPG";
import sample3_12 from "../../assets/images/sample3/sample3-12.JPG";
import sample3_13 from "../../assets/images/sample3/sample3-13.JPG";
import sample3_14 from "../../assets/images/sample3/sample3-14.JPG";
import sample3_15 from "../../assets/images/sample3/sample3-15.JPG";
import sample3_16 from "../../assets/images/sample3/sample3-16.JPG";
import sample3_17 from "../../assets/images/sample3/sample3-17.JPG";
import sample3_18 from "../../assets/images/sample3/sample3-18.JPG";
import sample3_19 from "../../assets/images/sample3/sample3-19.JPG";
import sample3_20 from "../../assets/images/sample3/sample3-20.JPG";
import sample3_21 from "../../assets/images/sample3/sample3-21.JPG";
import sample3_22 from "../../assets/images/sample3/sample3-22.JPG";
import sample3_23 from "../../assets/images/sample3/sample3-23.JPG";


const SampleDetail = () => {
  const { sampleId } = useParams();
  const navigate = useNavigate();

  // Data for heading + slogan
  const sampleData = {
    1: {
      title: "From Yarn to Masterpiece: The Hand Tufting Journey",
      slogan:
        "The loom is silent, the heart is loud, Each tuft a whisper, soft and proud.",
    },
    2: {
      title: "Hand-Woven: Woven with Intention, Designed by Hand",
      slogan:
        "Weaving stillness into motion, a quiet art unfolds.",
    },
    3: {
      title: "Hand Knotted — Masterpieces Made One Knot at a Time",
      slogan: "Binding threads with patience, a rhythm to prove.",
    },
  };

  // Images for each sample
  const sampleImages = {
    1: [
      sample1_1, sample1_2, sample1_3, sample1_4, sample1_5,
      sample1_6, sample1_7, sample1_8, sample1_9, sample1_10,
      sample1_11, sample1_12, sample1_13, sample1_14, sample1_15,
      sample1_16, sample1_17, sample1_18, sample1_19, sample1_20,
    ],

    2: [
      sample2_1, sample2_2, sample2_3, sample2_4, sample2_5,
      sample2_6, sample2_7, sample2_8, sample2_9, sample2_10,
      sample2_11, sample2_12, sample2_13, sample2_14, sample2_15,
      sample2_16, sample2_17, sample2_18, sample2_19, sample2_20,
      sample2_21, sample2_22, sample2_23, sample2_24, sample2_25,
      sample2_26, sample2_27, sample2_28, sample2_29, sample2_30,
      sample2_31, sample2_32, sample2_33, sample2_34, sample2_35,
      sample2_36,
    ],

    3: [
      sample3_1, sample3_2, sample3_3, sample3_4, sample3_5,
      sample3_6, sample3_7, sample3_8, sample3_9, sample3_10,
      sample3_11, sample3_12, sample3_13, sample3_14, sample3_15,
      sample3_16, sample3_17, sample3_18, sample3_19, sample3_20,
      sample3_21, sample3_22, sample3_23,
    ],
  };

  const images = sampleImages[sampleId] || [];
  const { title, slogan } = sampleData[sampleId] || {};

  return (
    <section className={styles.sampleDetail}>
      {/* 🔙 Back Button */}
      <button onClick={() => navigate("/samples")} className={styles.backButton}>
        Back
      </button>

      {/* 🎨 Title + Slogan */}
      <div className={styles.slogan}>
        <h2>{title}</h2>
        <p>{slogan}</p>
      </div>

      {/* 🖼️ Gallery */}
      <div className={styles.imageGallery}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Sample ${sampleId} - ${i + 1}`}
            className={styles.sampleImage}
          />
        ))}
      </div>
    </section>
  );
};

export default SampleDetail;
