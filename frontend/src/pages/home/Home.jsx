"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../../components/Header"
import Navigation from "./components/Navigation"
import Carousel from "../../components/Carousel"
import BestsellerSection from "./components/BestsellerSection"
import PreviouslyOrderedSection from "./components/PreviouslyOrderedSection"
import CategorySection from "./components/CategorySection"
import Footer from "../../components/Footer"
import Chatbot from '../../components/Chatbot';
import SuggestFoodFollowBody from '../suggest_food/SuggestFoodFollowBody';

const Home = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    if (token && user) {
      const { role } = JSON.parse(user)
      switch (role) {
        case "manager":
          navigate("/manager-dashboard")
          break
        case "staff":
          navigate("/staff-dashboard")
          break
        case "owner":
          navigate("/owner-dashboard")
          break
        default:
          navigate("/")
          break
      }
    }
  }, [navigate])

  return (
    <div className="home-page" style={{zoom: 0.8}}>
      <SuggestFoodFollowBody />
      <Chatbot />
      <Header />
      <Navigation />
      <Carousel />
      <BestsellerSection />
      <PreviouslyOrderedSection />
      <CategorySection />
      <Footer />
    </div>
  )
}

export default Home
