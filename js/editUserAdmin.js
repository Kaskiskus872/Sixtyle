const api_baseUrl = 'https://project-pkk-production.up.railway.app';
        // Ambil id dari query string
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');
        if (!userId) {
            alert('User ID not found!');
            window.location.href = 'dashboard.html';
        }
        // Fetch user data
        async function fetchUser() {
            try {
                const res = await fetch(`${api_baseUrl}/auth/users`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` }
                });
                const data = await res.json();
                const user = (data.data || []).find(u => u.id == userId);
                if (!user) {
                    alert('User not found!');
                    window.location.href = 'dashboard.html';
                }
                document.getElementById('username').value = user.username;
                document.getElementById('email').value = user.email;
                document.getElementById('role').value = user.role;
            } catch (err) {
                alert('Failed to fetch user data!');
                window.location.href = 'dashboard.html';
            }
        }
        fetchUser();
        document.getElementById('editUserForm').onsubmit = async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const role = document.getElementById('role').value;
            try {
                const res = await fetch(`${api_baseUrl}/auth/users/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('jwtToken')}` },
                    body: JSON.stringify({ username, email, role })
                });
                const data = await res.json();
                if (res.ok) {
                    alert('User updated successfully!');
                    window.location.href = 'dashboard.html';
                } else {
                    alert(data.error || 'Failed to update user');
                }
            } catch (err) {
                alert('Error updating user!');
            }
        }