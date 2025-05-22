const api_baseUrl = 'https://project-pkk-production.up.railway.app';
        document.getElementById('createUserForm').onsubmit = async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            try {
                const res = await fetch(`${api_baseUrl}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('jwtToken')}` },
                    body: JSON.stringify({ username, email, password, role })
                });
                const data = await res.json();
                if (res.ok) {
                    alert('User created successfully!');
                    window.location.href = 'dashboard.html';
                } else {
                    alert(data.error || 'Failed to create user');
                }
            } catch (err) {
                alert('Error creating user!');
            }
        }