import axios from 'axios';

async function test() {
    try {
        // First login to get token
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginRes.data.data.token;

        // Then get appraisals
        const appRes = await axios.get('http://localhost:5000/api/appraisals', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Appraisals response:");
        console.dir(appRes.data.data, { depth: null });
    } catch (e) {
        console.error("Error:", e.message);
    }
}
test();
