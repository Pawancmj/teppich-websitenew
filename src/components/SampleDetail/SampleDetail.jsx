import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./SampleDetail.module.css";
import { useData } from "../../context/DataContext";

const SampleDetail = () => {
  const { sampleId } = useParams();
  const navigate = useNavigate();
  const { collection, loading } = useData();

  // Main large image for modal open state
  const [baseSelectedImg, setBaseSelectedImg] = useState(null);
  // Currently viewed related image inside modal
  const [relatedSelectedImg, setRelatedSelectedImg] = useState(null);

  if (loading) {
    return <p>Loading data...</p>;
  }

  const sampleItem = collection.find((item) => String(item.id) === sampleId);

  if (!sampleItem) {
    return (
      <section className={styles.sampleDetail}>
        <button onClick={() => navigate("/samples")} className={styles.backButton}>
          Back
        </button>
        <p>Sample not found.</p>
      </section>
    );
  }

  const { images = [], title = "Untitled Sample", slogan = "" } = sampleItem;

  const selectedImg = relatedSelectedImg || baseSelectedImg;

  const currentImageObj = selectedImg
    ? images.find((img) => img.url === selectedImg)
    : null;

  // Called when clicking main gallery images
  const openModalWithImage = (imgUrl) => {
    setBaseSelectedImg(imgUrl);
    setRelatedSelectedImg(null);
  };

  // Close button handler
  const closeModal = () => {
    if (relatedSelectedImg) {
      // Close related image view only - revert to base image
      setRelatedSelectedImg(null);
    } else {
      // Close entire modal
      setBaseSelectedImg(null);
    }
  };

  return (
    <section className={styles.sampleDetail}>
      <button onClick={() => navigate("/samples")} className={styles.backButton}>
        Back
      </button>

      <div className={styles.slogan}>
        <h2>{title}</h2>
        <p>{slogan}</p>
      </div>

      <div className={styles.imageGallery}>
        {images.length > 0 ? (
          images.map((img, i) => (
            <img
              key={i}
              src={img.url || img}
              alt={`${title} - Image ${i + 1}`}
              className={styles.sampleImage}
              onClick={() => openModalWithImage(img.url || img)}
            />
          ))
        ) : (
          <p>No images available for this sample.</p>
        )}
      </div>

      {baseSelectedImg && (
        <div
          className={styles.modal}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <span className={styles.close} onClick={closeModal}>
            &times;
          </span>

          <div className={styles.modalInner} onClick={(e) => e.stopPropagation()}>
            <img src={selectedImg} alt="Large view" className={styles.modalContent} />

            {currentImageObj && currentImageObj.relatedImages?.length > 0 && (
              <div className={styles.relatedImages}>
                <div className={styles.relatedImagesGrid}>
                  {currentImageObj.relatedImages.map((relImg, i) => (
                    <img
                      key={i}
                      src={relImg}
                      alt={`Related image ${i + 1}`}
                      className={styles.relatedThumbnail}
                      onClick={() => setRelatedSelectedImg(relImg)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default SampleDetail;
