import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form, Card, Row, Col, Container, Badge, Image } from 'react-bootstrap';
import { Heart, Activity } from 'lucide-react';
import './SuggestFoodFollowBody.css';
import { getProducts } from '../../api/product';
import { requestFoodSuggestions } from '../../api/ai';

async function callGeminiForFoodSuggestion(userInfo, products) {
  const response = await requestFoodSuggestions({
    height: Number(userInfo.height),
    weight: Number(userInfo.weight),
    healthStatus: userInfo.healthStatus,
    products: products.slice(0, 40),
  });
  return response?.text || "Sorry, unable to provide suggestions at this time.";
}

const SuggestFoodFollowBody = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('form'); // 'form' or 'suggestions'
  const [userInfo, setUserInfo] = useState({
    height: '',
    weight: '',
    healthStatus: ''
  });
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Load products when component mounts
    const loadProducts = async () => {
      try {
        const productData = await getProducts();
        setProducts(productData);
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };
    loadProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!userInfo.height || !userInfo.weight || !userInfo.healthStatus) {
      alert('Please fill in all information!');
      return;
    }
    const height = Number(userInfo.height);
    const weight = Number(userInfo.weight);
    if (!Number.isFinite(height) || !Number.isFinite(weight) || height < 100 || height > 250 || weight < 20 || weight > 200) {
      alert('Height must be between 100 and 250 cm, and weight must be between 20 and 200 kg.');
      return;
    }

    setIsLoading(true);
    try {
      const aiResponse = await callGeminiForFoodSuggestion(userInfo, products);
      
      // Try to parse JSON response
      try {
        // Clean response text (remove markdown formatting if any)
        const cleanResponse = aiResponse.replace(/```json\s*|\s*```/g, '').trim();
        const parsed = JSON.parse(cleanResponse);
        
        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
          // Map AI suggestions with real data from products
          const mappedSuggestions = parsed.suggestions.map(suggestion => {
            const product = products.find(p => p.product_id === suggestion.product_id);
            if (product) {
              return {
                product_id: product.product_id,
                name: product.name,
                description: product.description,
                price: product.price,
                image_url: product.image_url,
                category: product.category,
                reason: suggestion.reason
              };
            }
            return null;
          }).filter(item => item !== null); // Remove null items
          
          setSuggestions(mappedSuggestions);
          setStep('suggestions');
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        // Fallback: if can't parse JSON, create default suggestions
        const fallbackSuggestions = products.slice(0, 3).map(product => ({
          product_id: product.product_id,
          name: product.name,
          description: product.description,
          price: product.price,
          image_url: product.image_url,
          category: product.category,
          reason: "Dish suggested based on your information"
        }));
        setSuggestions(fallbackSuggestions);
        setStep('suggestions');
      }
    } catch (err) {
      console.error('Error getting suggestions:', err);
      alert('An error occurred while getting food suggestions!');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('form');
    setUserInfo({ height: '', weight: '', healthStatus: '' });
    setSuggestions([]);
  };

  const getBMI = () => {
    if (userInfo.height && userInfo.weight) {
      const heightInM = userInfo.height / 100;
      const bmi = userInfo.weight / (heightInM * heightInM);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) return { text: 'Underweight', color: '#ffa500' };
    if (bmi < 25) return { text: 'Normal', color: '#28a745' };
    if (bmi < 30) return { text: 'Overweight', color: '#ffc107' };
    return { text: 'Obese', color: '#dc3545' };
  };

  // Handle click on suggestion card
  const handleSuggestionClick = (productId) => {
    navigate(`/foodDetail/${productId}`);
    setIsOpen(false); // Close popup when navigating
  };

  return (
    <>
      {/* Suggest Food Button */}
      <div className="suggest-food-button" onClick={() => setIsOpen(true)}>
        <Heart size={24} />
        <span className="suggest-food-button-text">Food Suggestions</span>
      </div>

      {/* Modal */}
      <Modal 
        show={isOpen} 
        onHide={() => setIsOpen(false)} 
        size="lg" 
        centered
        className="suggest-food-modal"
      >
        <Modal.Header closeButton className="suggest-food-header">
          <div className="d-flex align-items-center">
            <div className="suggest-food-avatar me-3">
              <Activity size={20} />
            </div>
            <div>
              <Modal.Title className="suggest-food-title">Food Suggestions</Modal.Title>
              <small className="suggest-food-subtitle">Based on your body information</small>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body>
          {step === 'form' ? (
            <Container>
              <h5 className="text-center mb-4">Enter Your Information</h5>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Height (cm)</Form.Label>
                    <Form.Control
                      type="number"
                      name="height"
                      value={userInfo.height}
                      onChange={handleInputChange}
                      placeholder="e.g., 170"
                      min="100"
                      max="250"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Weight (kg)</Form.Label>
                    <Form.Control
                      type="number"
                      name="weight"
                      value={userInfo.weight}
                      onChange={handleInputChange}
                      placeholder="e.g., 65"
                      min="20"
                      max="200"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Health Status</Form.Label>
                <Form.Select
                  name="healthStatus"
                  value={userInfo.healthStatus}
                  onChange={handleInputChange}
                >
                  <option value="">Select health status</option>
                  <option value="normal">Normal</option>
                  <option value="diabetes">Diabetes</option>
                  <option value="high blood pressure">High Blood Pressure</option>
                  <option value="obesity">Obesity</option>
                  <option value="underweight">Underweight</option>
                  <option value="heart disease">Heart Disease</option>
                  <option value="stomach problems">Stomach Problems</option>
                </Form.Select>
              </Form.Group>

              {getBMI() && (
                <Card className="bmi-info mb-3">
                  <Card.Body className="text-center">
                    <span>Your BMI: </span>
                    <strong style={{ color: getBMIStatus(getBMI()).color }}>
                      {getBMI()} ({getBMIStatus(getBMI()).text})
                    </strong>
                  </Card.Body>
                </Card>
              )}

              <Button 
                variant="primary"
                className="w-100 suggest-food-submit"
                onClick={handleSubmit}
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? 'Analyzing...' : 'Get Food Suggestions'}
              </Button>
            </Container>
          ) : (
            <Container>
              <div className="text-center mb-4">
                <h5>Food Suggestions for You</h5>
                <small className="text-muted">
                  Based on: {userInfo.height}cm, {userInfo.weight}kg, {userInfo.healthStatus}
                </small>
              </div>

              <Row>
                {suggestions.map((suggestion, index) => (
                  <Col key={index} xs={12} className="mb-3">
                    <Card 
                      className="suggestion-card h-100"
                      onClick={() => handleSuggestionClick(suggestion.product_id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col xs={3}>
                            <Image 
                              src={suggestion.image_url} 
                              alt={suggestion.name}
                              rounded
                              fluid
                              style={{ height: '80px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/150x150?text=No+Image';
                              }}
                            />
                          </Col>
                          <Col xs={9}>
                            <Card.Title className="mb-2 text-primary">
                              {suggestion.name}
                            </Card.Title>
                            <Card.Text className="mb-2 text-muted small">
                              {suggestion.description}
                            </Card.Text>
                            <Card.Text className="mb-2">
                              <strong>Why suitable:</strong> {suggestion.reason}
                            </Card.Text>
                            <div className="d-flex justify-content-between align-items-center">
                              <Badge bg="info">{suggestion.category}</Badge>
                              <strong className="text-primary fs-5">
                                {suggestion.price?.toLocaleString()}₫
                              </strong>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              <div className="d-flex gap-2 mt-4">
                <Button variant="outline-secondary" onClick={resetForm} className="flex-fill">
                  Enter Again
                </Button>
                <Button variant="primary" onClick={() => setIsOpen(false)} className="flex-fill">
                  View Menu
                </Button>
              </div>
            </Container>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SuggestFoodFollowBody;
