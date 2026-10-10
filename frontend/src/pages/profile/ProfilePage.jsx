import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Nav, Card, Form, Button, Alert } from 'react-bootstrap';
import Header from '../../components/Header';
import './ProfilePage.css';
import SideBarProfile from '../../components/SideBarProfile';
import { getProfile, updateProfile } from '../../api/customer_profile';

const ProfilePage = () => {
    // State for dynamic address
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    
    // State for alert message
    const [alert, setAlert] = useState({ show: false, variant: '', message: '' });

    // State for profile info
    const [profile, setProfile] = useState({
        email: '',
        name: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
        gender: ''
    });

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfile();
                
                // Phân tích địa chỉ để lấy Tỉnh/Thành phố và Phường/xã
                let addressParts = { street: '', ward: '', province: '' };
                
                if (data.address) {
                    // Địa chỉ có dạng: Số nhà Đường, Phường/xã, Tỉnh/Thành Phố
                    const parts = data.address.split(',').map(part => part.trim());
                    
                    if (parts.length >= 3) {
                        // Có đủ 3 phần: Số nhà Đường, Phường/xã, Tỉnh/Thành Phố
                        addressParts.street = parts[0];
                        addressParts.ward = parts[1];
                        addressParts.province = parts[2];
                        
                        // Cập nhật selectedProvince và selectedWard
                        setSelectedProvince(addressParts.province);
                        setSelectedWard(addressParts.ward);
                    } else if (parts.length === 2) {
                        // Chỉ có 2 phần: Số nhà Đường, Tỉnh/Thành Phố
                        addressParts.street = parts[0];
                        addressParts.province = parts[1];
                        
                        // Cập nhật selectedProvince
                        setSelectedProvince(addressParts.province);
                    } else if (parts.length === 1) {
                        // Chỉ có 1 phần: coi như là địa chỉ đường
                        addressParts.street = parts[0];
                    }
                }
                
                // Map API response fields to component state fields
                // API returns 'birthDate' but we use 'dateOfBirth' in our component
                setProfile({
                    email: data.email || '',
                    name: data.name || '',
                    phoneNumber: data.phoneNumber || '',
                    address: addressParts.street || '', // Chỉ lấy phần đường làm địa chỉ
                    dateOfBirth: data.birthDate || '', // Map birthDate to dateOfBirth
                    gender: data.gender || ''
                });
            } catch (err) {
                console.error('Error fetching profile:', err);
            }
        };
        fetchProfile();
    }, []);

    // Fetch provinces data
    useEffect(() => {
        fetch('https://vietnamlabs.com/api/vietnamprovince')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data.data)) setProvinces(data.data);
                else setProvinces([]);
            });
    }, []);

    // Update wards when province changes
    useEffect(() => {
        if (selectedProvince) {
            const province = provinces.find(p => p.province === selectedProvince);
            if (province) {
                setWards(province.wards);
                // Chỉ reset selectedWard nếu không phải là lần đầu load dữ liệu
                // và nếu selectedWard không tồn tại trong danh sách wards mới
                if (provinces.length > 0 && selectedWard) {
                    const wardExists = province.wards.some(ward => ward.name === selectedWard);
                    if (!wardExists) {
                        // Giữ lại giá trị selectedWard nếu đang hiển thị từ dữ liệu API
                        // Chỉ reset khi người dùng thay đổi province
                        if (!profile.address) {
                            setSelectedWard('');
                        }
                    }
                }
            } else {
                // Nếu không tìm thấy province trong danh sách, vẫn giữ selectedWard
                setWards([]);
            }
        } else {
            setWards([]);
            // Không reset selectedWard nếu đang hiển thị từ dữ liệu API
            if (!profile.address) {
                setSelectedWard('');
            }
        }
    }, [selectedProvince, provinces, selectedWard, profile.address]);

    // Handle profile input change
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        // Format date to YYYY-MM-DD if the field is dateOfBirth
        if (name === 'dateOfBirth' && value) {
            // The date picker already returns YYYY-MM-DD format
            // We just need to ensure it's properly formatted
            const dateObj = new Date(value);
            if (!isNaN(dateObj.getTime())) {
                const formattedDate = dateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD
                setProfile(prev => ({
                    ...prev,
                    [name]: formattedDate
                }));
                return;
            }
        }
        
        // For other fields, update normally
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle address change
    const handleAddressChange = (e) => {
        setProfile(prev => ({
            ...prev,
            address: e.target.value
        }));
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Format date to YYYY-MM-DD format if it exists
            let formattedDate = profile.dateOfBirth;
            if (formattedDate) {
                // Ensure date is in YYYY-MM-DD format
                const dateObj = new Date(formattedDate);
                if (!isNaN(dateObj.getTime())) {
                    formattedDate = dateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD
                }
            }
            
            // Tạo địa chỉ đầy đủ từ các thành phần
            let fullAddress = profile.address || '';
            
            // Thêm phường/xã nếu có
            if (selectedWard) {
                fullAddress = fullAddress ? `${fullAddress}, ${selectedWard}` : selectedWard;
            }
            
            // Thêm tỉnh/thành phố nếu có
            if (selectedProvince) {
                fullAddress = fullAddress ? `${fullAddress}, ${selectedProvince}` : selectedProvince;
            }
            
            // Prepare data for API
            // Map component state fields to API expected fields
            const profileData = {
                name: profile.name,
                phoneNumber: profile.phoneNumber,
                address: fullAddress, // Địa chỉ đầy đủ: Số nhà Đường, Phường/xã, Tỉnh/Thành Phố
                dateOfBirth: formattedDate, // Sử dụng birthDate thay vì dateOfBirth cho API
                gender: profile.gender
            };
            console.log('Before formatting:', profileData);

            // Call API to update profile
            await updateProfile(profileData);
            
            // Show success message
            setAlert({
                show: true,
                variant: 'success',
                message: 'Profile updated successfully!'
            });
            
            // Hide alert after 3 seconds
            setTimeout(() => {
                setAlert({ show: false, variant: '', message: '' });
            }, 3000);
            
        } catch (error) {
            console.error('Error updating profile:', error);
            
            // Show error message
            setAlert({
                show: true,
                variant: 'danger',
                message: 'Failed to update profile. Please try again.'
            });
        }
    };

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#FFFBE6', zoom: 0.8 }}>
            <Header />
            <Container className="flex-grow-1 py-4 mt-100">
                <Row>
                    <Col md={3}>
                        {SideBarProfile.map(item => (
                            <Card className="sidebarprofile" style={{ marginBottom: '10px', borderRadius: '0' }} key={item.id}>
                                <Nav className="flex-column">
                                    <Nav.Link
                                        key={item.id}
                                        href={item.link}
                                        className={`sidebarprofile-item ${item.active ? 'active' : ''}`}
                                    >
                                        <img src={item.icon} alt="" className="sidebarprofile-icon" />
                                        <span>{item.title}</span>
                                    </Nav.Link>
                                </Nav>
                            </Card>
                        ))}
                    </Col>
                    <Col md={9}>
                        <Card className="content-card">
                            <Card.Body>
                                <h3 className="mb-4">Account Information</h3>
                                {alert.show && (
                                    <Alert variant={alert.variant} onClose={() => setAlert({...alert, show: false})} dismissible>
                                        {alert.message}
                                    </Alert>
                                )}
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control type="email" value={profile.email} readOnly />
                                    </Form.Group>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Full Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={profile.name}
                                                    onChange={handleProfileChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Phone Number</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    name="phoneNumber"
                                                    value={profile.phoneNumber}
                                                    onChange={handleProfileChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
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
                                    </Row>
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
                                    <Button variant="success" className="mt-3 end-btn" type="submit">
                                        Update Information
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ProfilePage;