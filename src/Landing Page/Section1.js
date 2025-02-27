import React, { useState, useEffect, useRef } from 'react';
import styles from './Section1.module.css';
import { Link, useNavigate } from 'react-router-dom';
import mainVideo from './video.mp4';

function Section1() {
  const [fadeInClass, setFadeInClass] = useState('');
  const heroContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFadeInClass(styles.fadeIn);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, []);

  const words = ['Insights.', 'Mapping.', 'Tracking.'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  // Typing animation logic
  useEffect(() => {
    const handleTyping = () => {
      const currentWord = words[currentWordIndex];
      if (isDeleting) {
        setDisplayedText((prev) => prev.slice(0, -1));
        setTypingSpeed(110);
      } else {
        setDisplayedText((prev) => currentWord.slice(0, prev.length + 1));
        setTypingSpeed(150);
      }

      if (!isDeleting && displayedText === currentWord) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && displayedText === '') {
        setIsDeleting(false);
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, typingSpeed, currentWordIndex, words]);

  return (
    <section
      className={`${styles.heroContainer} ${fadeInClass}`}
      ref={heroContainerRef}
    >
      <div className={styles.heroContent}>
        <video
          className={styles.backgroundImage}
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={mainVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <nav className={styles.navigation}>
          <div className={styles.navLinks}>
            <a href='https://supply2u.jhubafrica.com/' className={styles.navItem}>About Us</a>
            <a href='https://supply2u.jhubafrica.com/#solutions' className={styles.navItem}>Our Solutions</a>
            <div className={styles.navItem}>Contact Us</div>
          </div>
          <button className={styles.joinButton} onClick={() => navigate('/Login')}>Log In</button>
        </nav>
        <div className={styles.content}>
          <h1 className={styles.heroTitle}>
            Smart Agriculture with<br /> Geo
            <span className="typing-container"> {displayedText}</span>
          </h1>
          <p className={styles.titleDescription}>
            Transforming agriculture supply chains through precise integration of farm geolocation data,<br />
            real-time analytics, and consumer behavior insights. Empowering stakeholders at every step<br />
            with unparalleled efficiency and informed decision-making.
          </p>
        </div>
        <div className={styles.ctaContainer}>
          <Link className={styles.ctaButton} onClick={() => navigate('/Signup')}>GET STARTED</Link>
        </div>
      </div>
    </section>
  );
}

export default Section1;
