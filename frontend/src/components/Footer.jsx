import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      {/* Decorative background elements */}
      <div className="footer-bg-decorations">
        <div className="footer-bg-circle-1"></div>
        <div className="footer-bg-circle-2"></div>
        <div className="footer-bg-circle-3"></div>
      </div>

      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-brand">
            <div>
              <h3 className="footer-brand-title">VeganFood</h3>
              <p className="footer-brand-description">
                Delicious & nutritious vegetarian food for a healthy lifestyle
              </p>
            </div>
          </div>

          {/* Menu Section */}
          <div className="footer-section">
            <h4 className="footer-section-title">Menu</h4>
            <ul className="footer-section-list">
              <li className="footer-section-item">
                <a href="#vegetables" className="footer-section-link">
                  Vegetables
                </a>
              </li>
              <li className="footer-section-item">
                <a href="#mushrooms" className="footer-section-link">
                  Mushrooms
                </a>
              </li>
              <li className="footer-section-item">
                <a href="#beans-tofu" className="footer-section-link">
                  Beans & Tofu
                </a>
              </li>
              <li className="footer-section-item">
                <a href="#noodles" className="footer-section-link">
                  noodles
                </a>
              </li>
              <li className="footer-section-item">
                <a href="#desserts" className="footer-section-link">
                  Desserts
                </a>
              </li>
            </ul>
          </div>

          {/* Services Section */}
          <div className="footer-section">
            <h4 className="footer-section-title">Services</h4>
            <ul className="footer-section-list">
              <li className="footer-section-item">
                <a href="/about" className="footer-section-link">
                  About
                </a>
              </li>
              <li className="footer-section-item">
                <a href="/faq" className="footer-section-link">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="footer-section">
            <h4 className="footer-section-title">Contact</h4>
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <span className="footer-contact-icon">📍</span>
                <span className="footer-contact-text">
                  FPT University, Da Nang City, Vietnam
                </span>
              </div>
              <div className="footer-contact-item">
                <span className="footer-contact-icon">📞</span>
                <span className="footer-contact-text">19006066</span>
              </div>
              <div className="footer-contact-item">
                <span className="footer-contact-icon">✉️</span>
                <span className="footer-contact-text">info@veganfood.vn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-bottom-copyright">
              &copy; 2025 VeganFood. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="/about" className="footer-bottom-link">
                Privacy Policy
              </a>
              <a href="/about" className="footer-bottom-link">
                Terms of Use
              </a>
              
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
