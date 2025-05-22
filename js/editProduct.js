        const api_baseUrl = 'https://project-pkk-production.up.railway.app';
        // Check if user is admin
        async function checkAdminAccess() {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                alert('Access denied. Please log in as admin.');
                window.location.href = 'login.html';
                return;
            }

            try {
                const response = await fetch(`https://project-pkk-production.up.railway.app/auth/verify`, {
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

        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        async function fetchCategoriesAndProductDetails() {
            try {
                const [categoriesResponse, productResponse] = await Promise.all([
                    fetch('https://project-pkk-production.up.railway.app/categories'),
                    fetch(`https://project-pkk-production.up.railway.app/products/${productId}`)
                ]);

                const categoriesData = await categoriesResponse.json();
                const productData = await productResponse.json();

                const categorySelect = document.getElementById('categoryId');
                categoriesData.data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });

                if (productResponse.ok) {
                    document.getElementById('name').value = productData.data.name;
                    document.getElementById('price').value = productData.data.price;
                    document.getElementById('description').value = productData.data.description;
                    document.getElementById('stock').value = productData.data.stock;
                    document.getElementById('categoryId').value = productData.data.CategoryId || '';

                    const preview = document.getElementById('imagePreview');
                    preview.src = productData.data.imageUrl;
                    preview.style.display = 'block';
                } else {
                    alert('Failed to fetch product details.');
                }
            } catch (error) {
                console.error('Error fetching categories or product details:', error);
            }
        }

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

        document.getElementById('editProductForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('name', document.getElementById('name').value);
            formData.append('price', document.getElementById('price').value);
            formData.append('description', document.getElementById('description').value);
            formData.append('stock', document.getElementById('stock').value);
            formData.append('categoryId', document.getElementById('categoryId').value);
            if (document.getElementById('image').files[0]) {
                formData.append('image', document.getElementById('image').files[0]);
            }

            try {
                const response = await fetch(`https://project-pkk-production.up.railway.app/products/${productId}`, {
                    method: 'PUT',
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
                console.error('Error updating product:', error);
            }
        });

        fetchCategoriesAndProductDetails();