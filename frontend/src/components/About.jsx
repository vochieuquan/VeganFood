import "./About.css"
import Header from "./Header"
import khoaImage from '../assets/image/khoa.jpg';
import khanhImage from '../assets/image/khanh.jpg';
import haiImage from '../assets/image/hai.jpg';
import kietImage from '../assets/image/kiet.jpg';
import quanImage from '../assets/image/quan.jpg';

export default function About() {
  return (
    <section className="about" style={{zoom: 0.8}}>
      <Header />
      <div className="about-container">
        <div className="about-content">
          <h2>About VeganFood</h2>
          <p>
            We believe that vegan food is not only healthy but also environmentally friendly. With over 5 years of
            experience, VeganFood is committed to bringing you delicious, nutritious, and diverse plant-based meals.
          </p>
          <div className="features">
            {/* 1. Online Ordering */}
            <div className="feature">
              <a href="/" className="feature-icon">
                🛒
              </a>
              <div>
                <h3>Convenient Online Ordering</h3>
                <p>
                  With our smart online ordering platform, you can easily choose from a diverse menu within minutes. The
                  user-friendly interface and detailed support help you order quickly and accurately.
                </p>
                <p>Special promotional programs are updated weekly, exclusively for online orders.</p>
              </div>
            </div>
            {/* 2. Home Delivery */}
            <div className="feature">
              <a href="/" className="feature-icon">
                🚚
              </a>
              <div>
                <h3>Safe Home Delivery</h3>
                <p>
                  Our professional delivery team ensures your meals arrive hot, clean, and on time. Fast delivery in
                  just 30 minutes within the city.
                </p>
                <p>Supports cashless payment and real-time order tracking.</p>
              </div>
            </div>
            {/* 3. Catering Services */}
            <div className="feature">
              <a href="/" className="feature-icon">
                🎉
              </a>
              <div>
                <h3>Vegan Catering Service</h3>
                <p>
                  We provide vegan catering for events, weddings, birthdays, or gatherings. Custom menus designed based
                  on your preferences and dietary needs.
                </p>
                <p>We also offer decoration, staff service, and professional event consultation.</p>
              </div>
            </div>
            {/* 4. Privacy Policy */}
            <div className="feature">
              <a href="/" className="feature-icon">
                🔒
              </a>
              <div>
                <h3>Privacy Policy</h3>
                <p>
                  VeganFood is committed to protecting all customer personal information. All data is encrypted and
                  securely stored according to international standards.
                </p>
                <p>We do not share your data with third parties without your consent.</p>
              </div>
            </div>
            {/* 5. Terms of Use */}
            <div className="feature">
              <a href="/" className="feature-icon">
                📄
              </a>
              <div>
                <h3>Terms of Use</h3>
                <p>
                  By using VeganFood's services, you agree to the terms regarding payment, delivery, and content usage.
                </p>
                <p>We encourage you to read carefully to understand your rights and responsibilities.</p>
              </div>
            </div>
            {/* 6. Contact & Support */}
            <div className="feature">
              <a href="/" className="feature-icon">
                ☎️
              </a>
              <div>
                <h3>Contact & Support</h3>
                <p>Our customer support team is available from 8AM to 10PM daily via hotline, email, or fanpage.</p>
                <p>All feedback is recorded and responded to within 24 hours to ensure the best experience for you.</p>
              </div>
            </div>
          </div>

          {/* Founder Section */}
          <div className="founders-section">
            <h2 className="founders-title">Meet Our Founders</h2>
            
            <div className="founders-grid">
              <div className="founder-card">
                <div className="founder-image">
                  <img src={khoaImage} alt="Khoa Pham" />
                </div>
                <div className="founder-info">
                  <h3>Khoa Pham</h3>
                  <p className="founder-title">CEO & Co-Founder</p>
                  
                </div>
              </div>

              <div className="founder-card">
                <div className="founder-image">
                  <img src={quanImage} alt="Chieu Quan" />
                </div>
                <div className="founder-info">
                  <h3>Chieu Quan</h3>
                  <p className="founder-title">CTO & Co-Founder</p>
                  
                </div>
              </div>

              <div className="founder-card">
                <div className="founder-image">
                  <img src={kietImage} alt="Kiet Luong" />
                </div>
                <div className="founder-info">
                  <h3>Kiet Luong</h3>
                  <p className="founder-title">Head of Nutrition</p>
                  
                </div>
              </div>

              <div className="founder-card">
                <div className="founder-image">
                  <img src={khanhImage} alt="Bao Khanh" />
                </div>
                <div className="founder-info">
                  <h3>Bao Khanh</h3>
                  <p className="founder-title">Head of Sustainability</p>
                  
                </div>
              </div>

              <div className="founder-card">
                <div className="founder-image">
                  <img src={haiImage} alt="Minh Hai" />
                </div>
                <div className="founder-info">
                  <h3>Minh Hai</h3>
                  <p className="founder-title">Head of Marketing</p>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="about-image">
          <img src="/Logo.png" alt="About VeganFood" />
        </div>
      </div>
    </section>
  )
}
