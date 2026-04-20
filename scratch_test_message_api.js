import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:5000/api'; // Test against local first or mock

async function testMessageAPI() {
    console.log('Testing Chat Message API...');
    
    // Note: This requires a valid token. For now we will just check if the route exists
    try {
        const response = await axios.post(`${API_URL}/chats/message`, {
            chatId: '69e0cc9bb7d55be168279729', // Mughal chat from audit
            text: 'Automated test message'
        }, {
            headers: { Authorization: 'Bearer MOCK_TOKEN' }
        });
        console.log('Success:', response.status);
    } catch (err) {
        if (err.response?.status === 401) {
            console.log('✅ Route exists and is protected (401 received).');
        } else {
            console.error('❌ Test failed:', err.message, err.response?.status);
        }
    }
}

testMessageAPI();
