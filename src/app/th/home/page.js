'use client';
import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const slides = [
  {
    image: "/test.jpeg",
    title: "ยินดีต้อนรับสู่ Inspiro Slider",
    description: "นี่คือตัวอย่างสไลด์ฮีโร่สำหรับหน้าแรกของคุณ"
  },
  {
    image: "/test.jpeg",
    title: "สไลด์ที่สอง",
    description: "คุณสามารถเพิ่มสไลด์ได้ตามต้องการ"
  }
];

function HomePage() {
  return (
    <div
      className="inspiro-slider"
      data-height="100vh"
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
      }}
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        // navigation
        // pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        style={{
          width: '100vw',
          height: '100vh'
        }}
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div
              className="slide"
              style={{
                backgroundImage: `url('${slide.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100vh',
                width: '100vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div className="container">
                <div className="slide-captions text-center">
                  <h1 className="text-white">{slide.title}</h1>
                  <p className="text-white">{slide.description}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default HomePage
