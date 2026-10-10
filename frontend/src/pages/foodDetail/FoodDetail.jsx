import ProductDetails from "./components/ProductDetails"
import SimilarProducts from "./components/SimilarProducts"
import CustomerReviews from "./components/CustomerReviews"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import Chatbot from "../../components/Chatbot"
import { useParams } from "react-router-dom"
import { useEffect } from "react"

const FoodDetail = () => {
  const { productId } = useParams();
  console.log('FoodDetail - productId:', productId);

  useEffect(() => {
    // Đảm bảo trang luôn hiển thị từ đầu khi component mount
    window.scrollTo(0, 0);
    // Thêm CSS để đảm bảo body không có scroll position
    document.body.style.scrollTop = 0;
    document.documentElement.style.scrollTop = 0;
  }, [productId]); // Re-run when productId changes

  return (
    <div className="food-detail-page" style={{ zoom: 0.8, scrollBehavior: 'auto', backgroundColor: '#FFFBE6', minHeight: '100vh', paddingTop: '55px' }}>
      <Header />
      <ProductDetails />
      <SimilarProducts />
      <CustomerReviews />
      <Footer />
      <Chatbot />
    </div>
  )
}

export default FoodDetail
