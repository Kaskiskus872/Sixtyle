
        const api_baseUrl = 'https://project-pkk-production.up.railway.app';
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${api_baseUrl}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Save token to localStorage
                    localStorage.setItem('jwtToken', data.token);

                    // Decode token to check role
                    const payload = JSON.parse(atob(data.token.split('.')[1]));
                    if (payload.role === 'admin') {
                        window.location.href = 'dashboard.html';
                    } else if (payload.role === 'customer') {
                        window.location.href = 'index.html';
                    } else {
                        alert('Unknown role. Access denied.');
                    }
                } else {
                    alert(data.error || 'Login failed');
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred. Please try again.');
            }
        });