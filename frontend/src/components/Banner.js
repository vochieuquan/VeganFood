import React from 'react';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Banner.css';
import bannerImage1 from '../assets/image/foods/image1.png';
import bannerImage2 from '../assets/image/foods/image2.png';
import bannerImage3 from '../assets/image/foods/image3.png';
const Banner = () => {
  const slides = [
    {
      image: bannerImage1,
      title: "Khám phá ẩm thực chay",
      description: "Thực đơn đa dạng với các món ăn thuần chay tốt cho sức khỏe"
    },
    {
      image: bannerImage2,
      title: "Nguyên liệu tươi sạch",
      description: "Tất cả nguyên liệu đều được tuyển chọn kỹ càng từ các nguồn organic"
    },
    {
      image: bannerImage3,
      title: "Không gian xanh mát",
      description: "Không gian nhà hàng được thiết kế hài hòa với thiên nhiên"
    }
  ];

  return (
    <Carousel fade interval={3000} className="banner-carousel">
      {slides.map((slide, index) => (
        <Carousel.Item key={index}>
          <img
            className="d-block w-100"
            src={slide.image}
            alt={slide.title}
          />
          <Carousel.Caption>
            <h2>{slide.title}</h2>
            <p>{slide.description}</p>
            <button className="cta-button">Xem thực đơn</button>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default Banner;