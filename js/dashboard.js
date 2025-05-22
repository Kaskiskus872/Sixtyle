        const api_baseUrl = 'https://project-pkk-production.up.railway.app';
        // const api_baseUrl = 'http://localhost:3000';        // Check if user is admin
        async function checkAdminAccess() {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                alert('No token found. Please log in.');
                window.location.href = 'login.html';
                return;
            }

            try {
                const response = await fetch(`${api_baseUrl}/auth/verify`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API Error Response:', errorData);
                    throw new Error(`API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
                }

                const data = await response.json();

                if (data.role !== 'admin') {
                    alert('Access denied. Admins only.');
                    window.location.href = 'login.html';
                }
            } catch (error) {
                console.error('Error verifying admin access:', error);
                alert('An error occurred. Please try again.');
                window.location.href = 'login.html';
            }
        }

        // Logout functionality
        document.getElementById('logout').addEventListener('click', () => {
            localStorage.removeItem('jwtToken');
            alert('You have been logged out.');
            window.location.href = 'login.html';
        });

        // Add product button
        document.getElementById('addProductButton').addEventListener('click', () => {
            window.location.href = 'createProduk.html';
        });

        // Add new user button
        document.getElementById('newUserButton').addEventListener('click', () => {
            window.location.href = 'createUserAdmin.html';
        });

        // Fetch and display products
        async function fetchProducts() {
            try {
                const response = await fetch(`${api_baseUrl}/products`);
                const data = await response.json();

                const productTableBody = document.getElementById('productTableBody');
                productTableBody.innerHTML = '';

                if (data.data.length === 0) {
                    productTableBody.innerHTML = `
                        <tr>
                            <td colspan="8" class="empty-state">
                                <i class="fas fa-box-open"></i>
                                <h3>No Products Found</h3>
                                <p>Start by adding your first product to the store.</p>
                            </td>
                        </tr>
                    `;
                    document.getElementById('totalProducts').textContent = '0';
                    return;
                }

                // Update total products count
                document.getElementById('totalProducts').textContent = data.data.length;

                data.data.forEach(product => {
                    const row = document.createElement('tr');
                    
                    // Determine stock status
                    let stockClass = 'high';
                    if (product.stock < 10) stockClass = 'low';
                    else if (product.stock < 50) stockClass = 'medium';

                    // Truncate description if too long
                    const description = product.description.length > 50 
                        ? product.description.substring(0, 50) + '...' 
                        : product.description;

                    row.innerHTML = `
                        <td><strong>#${product.id}</strong></td>
                        <td>
                            <img src="${product.imageUrl || 'https://via.placeholder.com/50'}" 
                                 alt="${product.name}" 
                                 onerror="this.src='https://via.placeholder.com/50'">
                        </td>
                        <td><strong>${product.name}</strong></td>
                        <td class="price">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</td>
                        <td title="${product.description}">${description}</td>
                        <td class="stock ${stockClass}"><strong>${product.stock}</strong></td>
                        <td>${product.Category ? product.Category.name : 'N/A'}</td>
                        <td class="action-buttons">
                            <button class="edit" onclick="editProduct(${product.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="delete" onclick="deleteProduct(${product.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    `;

                    productTableBody.appendChild(row);
                });
            } catch (error) {
                console.error('Error fetching products:', error);
                const productTableBody = document.getElementById('productTableBody');
                productTableBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="empty-state">
                            <i class="fas fa-exclamation-triangle"></i>
                            <h3>Error Loading Products</h3>
                            <p>Please refresh the page to try again.</p>
                        </td>
                    </tr>
                `;
            }
        }

        // Fetch and display total users
        async function fetchTotalUsers() {
            try {
                const response = await fetch(`${api_baseUrl}/auth/users`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                });
                const data = await response.json();
                if (Array.isArray(data.data)) {
                    document.querySelector('.stat-card.users h3').textContent = data.data.length;
                } else {
                    document.querySelector('.stat-card.users h3').textContent = '0';
                }
            } catch (error) {
                document.querySelector('.stat-card.users h3').textContent = '0';
            }
        }

        // Fetch and display all users in table
        async function fetchUserTable() {
            try {
                const response = await fetch(`${api_baseUrl}/auth/users`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                });
                const data = await response.json();
                const userTableBody = document.getElementById('userTableBody');
                userTableBody.innerHTML = '';
                if (!Array.isArray(data.data) || data.data.length === 0) {
                    userTableBody.innerHTML = `
                        <tr>
                            <td colspan="4" class="empty-state">
                                <i class='fas fa-user-slash'></i>
                                <h3>No Users Found</h3>
                            </td>
                        </tr>
                    `;
                    return;
                }
                data.data.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><strong>#${user.id}</strong></td>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td class="action-buttons">
                            <button class="edit" onclick="editUser(${user.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="delete" onclick="deleteUser(${user.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    `;
                    userTableBody.appendChild(row);
                });
            } catch (error) {
                const userTableBody = document.getElementById('userTableBody');
                userTableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="empty-state">
                            <i class='fas fa-exclamation-triangle'></i>
                            <h3>Error Loading Users</h3>
                        </td>
                    </tr>
                `;
            }
        }

        // Logout functionality
        document.getElementById('logout').addEventListener('click', () => {
            localStorage.removeItem('jwtToken');
            alert('You have been logged out.');
            window.location.href = 'login.html';
        });

        // Add product button
        document.getElementById('addProductButton').addEventListener('click', () => {
            window.location.href = 'createProduk.html';
        });

        // Delete product function
        async function deleteProduct(productId) {
            if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

            try {
                const response = await fetch(`${api_baseUrl}/products/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                });

                const data = await response.json();
                
                if (response.ok) {
                    alert('Product deleted successfully!');
                    fetchProducts(); // Refresh the product list
                } else {
                    alert(data.message || 'Error deleting product');
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('An error occurred while deleting the product.');
            }
        }

        // Edit product function
        function editProduct(productId) {
            window.location.href = `editProduct.html?id=${productId}`;
        }

        // Delete user function
        async function deleteUser(userId) {
            if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

            try {
                const response = await fetch(`${api_baseUrl}/auth/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    alert('User deleted successfully!');
                    fetchUserTable(); // Refresh the user list
                } else {
                    alert(data.message || 'Error deleting user');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('An error occurred while deleting the user.');
            }
        }

        // Edit user function
        function editUser(userId) {
            window.location.href = `editUserAdmin.html?id=${userId}`;
        }

        // Initialize dashboard
        async function initDashboard() {
            await checkAdminAccess();
            await fetchProducts();
            await fetchTotalUsers();
            await fetchUserTable();
        }

        // Start the dashboard
        initDashboard();
