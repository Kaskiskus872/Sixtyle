 // Check if user is admin
        async function checkAdminAccess() {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                alert('Access denied. Please log in as admin.');
                window.location.href = 'login.html';
                return;
            }

            try {
                const response = await fetch('https://project-pkk-production.up.railway.app/auth/verify', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (data.role !== 'admin') {
                    alert('Access denied. Admins only.');
                    window.location.href = 'login.html';
                }
            } catch (error) {
                console.error('Error verifying admin access:', error);
                alert('Access denied. Please log in as admin.');
                window.location.href = 'login.html';
            }
        }

        checkAdminAccess();

        document.getElementById('image').addEventListener('change', (event) => {
            const file = event.target.files[0];
            const preview = document.getElementById('imagePreview');

            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                preview.style.display = 'none';
            }
        });

        document.getElementById('createProductForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('name', document.getElementById('name').value);
            formData.append('price', document.getElementById('price').value);
            formData.append('description', document.getElementById('description').value);
            formData.append('stock', document.getElementById('stock').value);
            formData.append('image', document.getElementById('image').files[0]);
            formData.append('categoryId', document.getElementById('categoryId').value);

            try {
                const response = await fetch('https://project-pkk-production.up.railway.app/products', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                    },
                    body: formData
                });
                const data = await response.json();
                alert(data.message);
                if (response.ok) {
                    window.location.href = 'dashboard.html';
                }
            } catch (error) {
                console.error('Error creating product:', error);
            }
        });

        async function fetchCategories() {
            try {
                const response = await fetch('https://project-pkk-production.up.railway.app/categories');
                const data = await response.json();

                const categorySelect = document.getElementById('categoryId');
                data.data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        }

        fetchCategories();