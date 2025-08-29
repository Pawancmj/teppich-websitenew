import React from 'react';
import './About.css';
import companyImage from '../assets/gallery-121.png';

const About = () => {
  return (
    <section className="aboutSection" id="about">
      <div className="container">
        {/* Left Image */}
        <div className="imageContainer">
          <img src={companyImage} alt="Artistic Carpet" />
        </div>

        {/* Right Philosophy & Aim */}
        <div className="textContainer">
          <h2 className="heading">The Journey Behind Teppich Art</h2>
          <p className="text">
           Founded in 2002, Teppich Art is a leading carpet manufacturing company based in Bhadohi, India, the world’s renowned carpet hub. For over two decades, we have been at the forefront of the handmade carpet industry, combining traditional craftsmanship with modern production capabilities to deliver carpets of exceptional quality to clients across the globe.
           At Teppich Art, we specialize in manufacturing a wide range of handcrafted carpets, from hand-knotted and hand-tufted to handwoven and custom-made designs. Each piece is thoughtfully created by skilled artisans, using the finest materials to ensure unmatched quality, durability, and beauty.
          </p>
          <p className="text">
            We pride ourselves not only on our craftsmanship but also on our business values. On-time delivery, consistent quality, transparent communication, and scalable production capacity are the pillars of our operations. With a workforce of skilled artisans supported by modern infrastructure, we are able to handle everything from small bespoke orders to bulk shipments with equal precision.
            At Teppich Art, our mission is clear: to be a trusted global manufacturing partner delivering carpets that meet the highest standards of design, quality, and reliability. As we continue to grow, we remain committed to innovation, sustainability, and preserving the weaving traditions of Bhadohi while serving the evolving needs of the international market.
          </p>
        </div>
      </div>

      {/* Divider for Why Choose Us Section */}
      <hr className="divider" />

      {/* Why Choose Us Section (merged here) */}
      <div className="choose-inner">
        <h2 className="heading">Why Choose Us</h2>

        <div className="choose-points">
          <div className="point">
            <h2>Masterful Workmanship</h2>
            <p>
              Every carpet we create is a masterpiece, blending traditional artistry with modern
              design. Our skilled artisans pay attention to every detail, ensuring perfection in
              every weave.
            </p>
          </div>

          <div className="point">
            <h2>Timely Project Completion</h2>
            <p>
              We respect your time and ensure projects are delivered on schedule without compromising
              on quality. Our streamlined process guarantees efficiency and reliability.
            </p>
          </div>

          <div className="point">
            <h2>Competitive Pricing</h2>
            <p>
              Luxury doesn’t always have to come at a high price. We offer competitive pricing without
              compromising on craftsmanship or materials.
            </p>
          </div>

          <div className="point">
            <h2>Sustainable Practice</h2>
            <p>
              Our commitment to sustainability ensures eco-friendly practices at every stage of
              production, from sourcing raw materials to final finishes.
            </p>
          </div>
        </div>

        <div className="choose-slogan">
          <p>
            “Dedicated to delivering excellence, innovative designs, and outstanding customer service”
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
