"use client"

import Header from "./Header"
import "./faq.css"

const faqs = [
  {
    question: "Does VeganFood offer home delivery?",
    answer:
      "Yes, we provide home delivery within Ho Chi Minh City and nearby areas with a team of professional shippers.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Typically between 30 to 60 minutes depending on your location and order status. It may take longer during peak hours.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept cash, bank transfer, and e-wallets such as Momo, ZaloPay, and VNPay.",
  },
  {
    question: "How can I place an online order?",
    answer:
      "You can order through the VeganFood website or mobile app. Just select your favorite dishes and enter your delivery info.",
  },
  {
    question: "Does VeganFood offer vegetarian catering services?",
    answer:
      "Yes, we provide vegetarian catering for events such as birthdays, weddings, and corporate meetings.",
  },
  {
    question: "How can I cancel my order?",
    answer:
      "Please contact our Customer Support within 10 minutes after placing your order to cancel it free of charge.",
  },
  {
    question: "Does VeganFood have branches in other provinces?",
    answer:
      "Currently, we only have branches in Ho Chi Minh City. However, expansion plans are underway.",
  },
  {
    question: "Can I track my order status?",
    answer:
      "Yes, after placing your order, you will receive a real-time tracking link via SMS or email.",
  },
  {
    question: "Is food safety guaranteed?",
    answer:
      "All dishes are prepared in a kitchen that meets food safety standards and are regularly inspected by authorities.",
  },
  {
    question: "Can I provide feedback if I'm not satisfied?",
    answer:
      "Absolutely! You can share your feedback via our hotline, email, or fanpage, and we will use it to improve our service.",
  },
  {
    question: "Does VeganFood offer promotions?",
    answer:
      "Yes, we regularly offer discounts, loyalty points, and special deals for loyal customers.",
  },
  {
    question: "Is the menu updated regularly?",
    answer:
      "The menu is updated weekly with seasonal dishes and based on customer feedback to ensure variety.",
  },
]

export default function Faq() {
  return (
    <div className="faq-page" style={{zoom: 0.8}}>
      <Header />
      <section className="faq-section">
        <div className="faq-header">
          <h2>Frequently Asked Questions</h2>
          <p>Learn more about VeganFood services</p>
        </div>

        <div className="faq-grid">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-card">
              <div className="faq-question">
                <h3>{faq.question}</h3>
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
