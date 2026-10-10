"use client";

import { useState, useEffect } from "react";
import { PencilSquare } from "react-bootstrap-icons";
import { useParams } from "react-router-dom";
import { getProductReviews, submitReview } from "../../../api/feedback";
import {
  Container,
  Button,
  Modal,
  Form,
  Card,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import "./CustomerReviews.css";

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  const { productId } = useParams();

  // Fetch all reviews of the current product
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsData = await getProductReviews(productId);
        // Sort reviews by date in descending order (newest first)
        const sortedReviews = (reviewsData || []).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setReviews(sortedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      setToastMessage("❌ You must be logged in to submit a review.");
      setToastVariant("danger");
      setShowToast(true);
      return;
    }

    if (!newComment.trim()) return;

    const payload = {
      productId: parseInt(productId),
      comment: newComment.trim(),
    };

    try {
      // Submit the review using the API service
      await submitReview(payload);
      
      // Update UI on success
      setToastMessage("Review submitted successfully!");
      setShowSuccessAlert(true);
      setNewComment("");
      setShowModal(false);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);

      // Refresh and sort the reviews list
      const refreshedReviews = await getProductReviews(productId);
      const sortedReviews = (refreshedReviews || []).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setReviews(sortedReviews);
    } catch (error) {
      console.error("Error submitting review:", error);
      setToastMessage("❌ Failed to submit review.");
      setToastVariant("danger");
      setShowToast(true);
    }
  };

  return (
    <section className="customer-reviews-section py-5 bg-light">
      {/* Success Alert */}
      {showSuccessAlert && (
        <div 
          className="position-fixed top-0 end-0 m-4 shadow-lg" 
          style={{ 
            zIndex: 1050,
            backgroundColor: '#48BB78',
            borderColor: '#48BB78',
            color: '#2d3748',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 20px',
            minWidth: '300px',
            animation: 'slideInRight 0.3s ease'
          }}
        >
          <div className="d-flex align-items-center">
            <div className="me-3" style={{ color: '#347928', fontWeight: 'bold' }}>✓</div>
            <div>
              <strong style={{ color: '#347928' }}>Success!</strong>
              <div className="mt-1">{toastMessage}</div>
            </div>
          </div>
        </div>
      )}
      <Container>
        {/* Section Header - Matching SimilarProducts style */}
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-dark mb-3">Customer Reviews</h2>
          <p className="fs-5 text-muted mb-4">What our customers say about this product</p>
          
          <div className="d-flex justify-content-center gap-3 align-items-center">
            <Button
              variant="success"
              onClick={() => setShowModal(true)}
              className="d-flex align-items-center gap-2 px-4 py-2"
              style={{ borderRadius: '8px' }}
            >
              <PencilSquare size={16} />
              Write a Review
            </Button>
            <span className="text-muted">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>

        <div className="reviews-container">
          {reviews.length > 0 ? (
            <Card className="mb-4">
              <Card.Body className="p-0">
                <div 
                  className="d-flex flex-column" 
                  style={{ 
                    maxHeight: '350px',
                    overflowY: 'auto'
                  }}
                >
                  {reviews.map((review, index) => (
                    <div 
                      key={index} 
                      className="d-flex justify-content-between align-items-center p-3 border-bottom"
                      style={{
                        minHeight: '70px',
                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                             style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                          {review.userName?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-medium">{review.userName || "Anonymous"}</span>
                            <span className="text-muted small">•</span>
                            <span className="text-muted small">{formatDate(review.createdAt)}</span>
                          </div>
                          <p className="mb-0 text-muted small" style={{ lineHeight: '1.4' }}>"{review.comment}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Card className="mb-4">
              <Card.Body className="p-0">
                <div 
                  className="d-flex flex-column align-items-center justify-content-center" 
                  style={{ 
                    minHeight: '200px',
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  <div className="text-center p-4">
                    <div className="mb-3">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-muted"
                      >
                        <path
                          d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.9 16 3 15.1 3 14V6C3 4.9 3.9 4 5 4H19C20.1 4 21 4.9 21 6V14C21 15.1 20.1 16 19 16H14L9 21V16Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h5 className="mb-2">No reviews yet</h5>
                    <p className="text-muted mb-4">
                      Be the first to review this product
                    </p>
                    <Button 
                      variant="success" 
                      onClick={() => setShowModal(true)}
                      className="d-inline-flex align-items-center"
                    >
                      <PencilSquare className="me-2" size={16} />
                      Write the first review
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Review Modal */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          className="review-modal"
        >
          <Form onSubmit={handleSubmitReview}>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold">Write a Review</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Share your thoughts</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  maxLength={500}
                  placeholder="Type your feedback here..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="text-end mt-1">
                  <small className="text-muted">{newComment.length}/500</small>
                </div>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="outline-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="success" disabled={!newComment.trim()}>
                Submit Review
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Error Toast Message */}
        <ToastContainer position="bottom-end" className="p-3">
          <Toast
            bg={toastVariant}
            show={showToast}
            onClose={() => setShowToast(false)}
            delay={3000}
            autohide
          >
            <Toast.Body className="text-white">{toastMessage}</Toast.Body>
          </Toast>
        </ToastContainer>
      </Container>
    </section>
  );
};

export default CustomerReviews;
