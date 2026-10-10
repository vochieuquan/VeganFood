"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap"
import { appTheme } from "../../../constant/color_constants"
import StaffSidebar from "../StaffSidebar/StaffSidebar"
import { getProfile, updateProfile } from "../../../api/customer_profile"

const StaffProfile = () => {
  const [provinces, setProvinces] = useState([])
  const [wards, setWards] = useState([])
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedWard, setSelectedWard] = useState("")
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' })
  const [profile, setProfile] = useState({
    email: '',
    name: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    position: 'Staff',
    created_at: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        let addressParts = { street: '', ward: '', province: '' };
        if (data.address) {
          const parts = data.address.split(',').map(part => part.trim());
          if (parts.length >= 3) {
            addressParts.street = parts[0];
            addressParts.ward = parts[1];
            addressParts.province = parts[2];
            setSelectedProvince(addressParts.province);
            setSelectedWard(addressParts.ward);
          } else if (parts.length === 2) {
            addressParts.street = parts[0];
            addressParts.province = parts[1];
            setSelectedProvince(addressParts.province);
          } else if (parts.length === 1) {
            addressParts.street = parts[0];
          }
        }
        setProfile({
          email: data.email || '',
          name: data.name || '',
          phoneNumber: data.phoneNumber || '',
          address: addressParts.street || '',
          dateOfBirth: data.birthDate || '',
          gender: data.gender || '',
          position: data.position || 'Staff',
          created_at: data.created_at || ''
        });
      } catch (err) {
        setAlert({ show: true, variant: 'danger', message: 'Lỗi khi tải thông tin hồ sơ.' })
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    fetch('https://vietnamlabs.com/api/vietnamprovince')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.data)) setProvinces(data.data);
        else setProvinces([]);
      });
  }, [])

  useEffect(() => {
    if (selectedProvince) {
      const province = provinces.find(p => p.province === selectedProvince);
      if (province) {
        setWards(province.wards);
        if (provinces.length > 0 && selectedWard) {
          const wardExists = province.wards.some(ward => ward.name === selectedWard);
          if (!wardExists) {
            if (!profile.address) {
              setSelectedWard('');
            }
          }
        }
      } else {
        setWards([]);
      }
    } else {
      setWards([]);
      if (!profile.address) {
        setSelectedWard('');
      }
    }
  }, [selectedProvince, provinces, selectedWard, profile.address])

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dateOfBirth' && value) {
      const dateObj = new Date(value);
      if (!isNaN(dateObj.getTime())) {
        const formattedDate = dateObj.toISOString().split('T')[0];
        setProfile(prev => ({ ...prev, [name]: formattedDate }));
        return;
      }
    }
    setProfile(prev => ({ ...prev, [name]: value }));
  }

  const handleAddressChange = (e) => {
    setProfile(prev => ({ ...prev, address: e.target.value }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let formattedDate = profile.dateOfBirth;
      if (formattedDate) {
        const dateObj = new Date(formattedDate);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toISOString().split('T')[0];
        }
      }
      let fullAddress = profile.address || '';
      if (selectedWard) {
        fullAddress = fullAddress ? `${fullAddress}, ${selectedWard}` : selectedWard;
      }
      if (selectedProvince) {
        fullAddress = fullAddress ? `${fullAddress}, ${selectedProvince}` : selectedProvince;
      }
      const profileData = {
        name: profile.name,
        phoneNumber: profile.phoneNumber,
        address: fullAddress,
        dateOfBirth: formattedDate,
        gender: profile.gender
      };
      await updateProfile(profileData);
      setAlert({ show: true, variant: 'success', message: 'Cập nhật hồ sơ thành công!' });
      setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
    } catch (error) {
      setAlert({ show: true, variant: 'danger', message: 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.' });
    }
  }

  return (
    <div className="dashboard-container">
      <StaffSidebar />
      <div className="main-content" style={{ backgroundColor: appTheme.background }}>
        <Container fluid className="p-4">
          <Row className="mb-4">
            <Col>
              <h2 style={{ color: appTheme.primary }}>Staff Profile</h2>
              <p className="text-muted">Manage your personal information and account settings.</p>
            </Col>
          </Row>
          {alert.show && (
            <Alert variant={alert.variant} className="mb-4" onClose={() => setAlert({ ...alert, show: false })} dismissible>
              {alert.message}
            </Alert>
          )}
          <Row>
            <Col md={12}>
              <Card>
                <Card.Header style={{ backgroundColor: appTheme.primary, color: "white" }}>
                  <h5 className="mb-0">Personal Information</h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleProfileChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={profile.email}
                            readOnly
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phoneNumber"
                            value={profile.phoneNumber}
                            onChange={e => {
                              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                              handleProfileChange({ target: { name: 'phoneNumber', value } });
                            }}
                            maxLength={10}
                            pattern="[0-9]{10}"
                            required
                            inputMode="numeric"
                            autoComplete="off"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Date of Birth</Form.Label>
                          <Form.Control
                            type="date"
                            name="dateOfBirth"
                            value={profile.dateOfBirth}
                            onChange={handleProfileChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Gender</Form.Label>
                          <Form.Select
                            name="gender"
                            value={profile.gender}
                            onChange={handleProfileChange}
                          >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Position</Form.Label>
                          <Form.Control type="text" name="position" value={profile.position} disabled />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Join Date</Form.Label>
                      <Form.Control type="text" name="joinDate" value={profile.created_at ? new Date(profile.created_at).toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace('T', ' ').replace(/\./g, '-') : ''} disabled />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="House number, street name"
                        value={profile.address}
                        name="address"
                        onChange={handleAddressChange}
                      />
                    </Form.Group>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Province/City</Form.Label>
                          <Form.Select
                            value={selectedProvince}
                            onChange={e => setSelectedProvince(e.target.value)}
                          >
                            <option value="">Select province/city</option>
                            {provinces.map(province => (
                              <option key={province.province} value={province.province}>
                                {province.province}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Ward</Form.Label>
                          <Form.Select
                            value={selectedWard}
                            onChange={e => setSelectedWard(e.target.value)}
                            disabled={!wards.length}
                          >
                            <option value="">{!selectedProvince ? "Phường/Xã" : "Select ward"}</option>
                            {wards.map(ward => (
                              <option key={ward.name} value={ward.name}>
                                {ward.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="d-flex gap-2 mt-3">
                      <Button type="submit" style={{ backgroundColor: appTheme.primary, border: "none" }}>
                        Update Profile
                      </Button>
                      <Button variant="outline-secondary">Cancel</Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  )
}

export default StaffProfile
