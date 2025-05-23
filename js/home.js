const api_baseUrl = 'https://project-pkk-production.up.railway.app'; // Ganti dengan URL API lo
// const api_baseUrl = 'http://localhost:3000'; // Ganti dengan URL API lo
let allProducts = [];
let filteredProducts = [];

// --- FILTER & SEARCH ---
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

categoryFilter.addEventListener('change', function() {
    applyFilterAndSearch();
    // Scroll ke bagian All Products
    const allProductsSection = document.querySelector('.all-products');
    if (allProductsSection) {
        allProductsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});
searchBtn.addEventListener('click', function() {
    applyFilterAndSearch();
    // Scroll ke bagian All Products
    const allProductsSection = document.querySelector('.all-products');
    if (allProductsSection) {
        allProductsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});
searchInput.addEventListener('input', function(e) {
    if (e.target.value === '') applyFilterAndSearch();
});
searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        applyFilterAndSearch();
        // Scroll ke bagian All Products
        const allProductsSection = document.querySelector('.all-products');
        if (allProductsSection) {
            allProductsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
});

function applyFilterAndSearch() {
    let category = categoryFilter.value.toLowerCase();
    let search = searchInput.value.trim().toLowerCase();
    filteredProducts = allProducts.filter(product => {
        let prodCat = (product.Category && product.Category.name) ? product.Category.name.toLowerCase() : '';
        let matchCategory = category === 'semua' || prodCat === category;
        let matchSearch = product.name.toLowerCase().includes(search) || (product.description && product.description.toLowerCase().includes(search));
        return matchCategory && matchSearch;
    });
    renderAllProducts(filteredProducts);
}

function renderAllProducts(products) {
    const allList = document.querySelector('.product-list.all');
    allList.innerHTML = '';
    if (!products.length) {
        allList.innerHTML = '<p>Tidak ada produk ditemukan.</p>';
        return;
    }
    products.forEach(product => {
        const card = createProductCard(product);
        allList.appendChild(card);
    });
}

function createProductCard(product) {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide product-item';

        // Batasi deskripsi maksimal 25 karakter, tambahkan ... jika lebih
        let shortDesc = product.description;
        if (shortDesc.length > 30) {
            shortDesc = shortDesc.substring(0, 25) + '...';
        }
        slide.innerHTML = `
            <img src="${product.imageUrl || 'https://via.placeholder.com/250'}" alt="${product.name}" />
            <h3>${product.name}</h3>
            <p>${shortDesc}</p>
        `;

        // Klik seluruh card -> munculin modal
        slide.addEventListener('click', () => {
            showProductModalById(product.id);
        });

        return slide;
        }


        function addPopupListeners() {
        document.querySelectorAll('.buy-button').forEach(button => {
            button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            showProductModalById(id);
            });
        });
        }

        function showProductModalById(id) {
        console.log('Modal Triggered for ID:', id); // <== Tambahin ini
        const product = allProducts.find(p => p.id == id);
        const modal = document.getElementById("productModal");
        document.getElementById("modalImage").src = product.imageUrl || 'https://via.placeholder.com/250';
        document.getElementById("modalTitle").textContent = product.name;
        document.getElementById("modalDescription").textContent = product.description;
        const formattedPrice = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(product.price);
        document.getElementById("modalPrice").textContent = formattedPrice;


        // Tombol di dalam modal: "Beli" dan "Keranjang"
        document.getElementById("modalBuyBtn").onclick = () => {
            if (!isLoggedIn) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Oops...',
                    text: 'Silakan login dulu untuk membeli produk.',
                    confirmButtonText: 'OK'
                });
                return;
            }
            Swal.fire({
                title: 'Masukkan jumlah produk',
                input: 'number',
                inputPlaceholder: 'Contoh: 1',
                showCancelButton: true,
                confirmButtonText: 'Beli',
                cancelButtonText: 'Batal',
                inputAttributes: {
                    min: 1,
                    step: 1
                },
                inputValidator: (value) => {
                    if (!value || isNaN(value) || value <= 0) {
                        return 'Masukkan jumlah yang valid!';
                    }
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const quantity = parseInt(result.value);
                    try {
                        // Buat order baru langsung (status: pending, 1 produk)
                        const orderRes = await fetch(`${api_baseUrl}/orders`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                items: [{ productId: product.id, quantity, price: product.price }],
                                total: product.price * quantity
                            })
                        });
                        const orderData = await orderRes.json();
                        if (orderRes.ok) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Berhasil!',
                                text: 'Pesanan berhasil dibuat. Silakan cek di halaman history.',
                                confirmButtonText: 'OK'
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Gagal',
                                text: orderData.error || 'Gagal membuat pesanan',
                                confirmButtonText: 'OK'
                            });
                        }
                    } catch (err) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal',
                            text: 'Terjadi kesalahan saat membuat pesanan',
                            confirmButtonText: 'OK'
                        });
                    }
                }
            });
        };

document.getElementById("modalCartBtn").onclick = () => {
  if (!isLoggedIn) {
    Swal.fire({
      icon: 'warning',
      title: 'Oops...',
      text: 'Silakan login dulu untuk menambahkan ke keranjang.',
      confirmButtonText: 'OK'
    });
    return;
  }

  Swal.fire({
    title: 'Masukkan jumlah produk',
    input: 'number',
    inputPlaceholder: 'Contoh: 2',
    showCancelButton: true,
    confirmButtonText: 'Tambah',
    cancelButtonText: 'Batal',
    inputAttributes: {
      min: 1,
      step: 1
    },
    inputValidator: (value) => {
      if (!value || isNaN(value) || value <= 0) {
        return 'Masukkan jumlah yang valid!';
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const quantity = parseInt(result.value);
      addToCart(product.id, quantity);
    }
  });
};


        // Tambahkan tampilan rating dan feedback
        const modalImage = document.querySelector('.popup-image');
        // Hapus elemen rating lama jika ada
        const oldRatingSection = document.getElementById('ratingSection');
        if (oldRatingSection) oldRatingSection.remove();

        // Buat section baru untuk rating & feedback
        const ratingSection = document.createElement('div');
        ratingSection.id = 'ratingSection';
        ratingSection.style.marginTop = '32px';
        ratingSection.style.gridColumn = '1 / -1'; // full width jika pakai grid
        ratingSection.innerHTML = `
            <h4>Ulasan Produk</h4>
            <div id="ratingsList">Memuat ulasan...</div>
            <div id="addRatingForm" style="margin-top:16px;${isLoggedIn ? '' : 'display:none;'}">
                <label>Beri Rating:</label>
                <div id="starInput">
                    ${[1,2,3,4,5].map(i => `<span class="star" data-value="${i}">&#9734;</span>`).join('')}
                </div>
                <textarea id="feedbackInput" rows="2" placeholder="Tulis ulasan..." style="width:100%;margin-top:8px;"></textarea>
                <button id="submitRatingBtn" style="margin-top:8px;">Kirim Ulasan</button>
            </div>
            <div id="loginToRate" style="${isLoggedIn ? 'display:none;' : ''}color:#888;margin-top:8px;">Login untuk memberi ulasan.</div>
        `;
        // Sisipkan ratingSection SETELAH .popup-body (bukan di dalamnya)
        const popupBody = document.querySelector('.popup-body');
        popupBody.parentNode.insertBefore(ratingSection, popupBody.nextSibling);

        // Fetch dan tampilkan rating
        fetch(`${api_baseUrl}/ratings/${product.id}`)
            .then(res => res.json())
            .then(ratings => {
                const ratingsList = document.getElementById('ratingsList');
                if (!ratings || !ratings.length) {
                    ratingsList.innerHTML = '<em>Belum ada ulasan.</em>';
                } else {
                    // Ambil userId & role dari token jika login
                    let userId = null, userRole = null;
                    if (isLoggedIn) {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        userId = payload.id;
                        userRole = payload.role;
                    }
                    ratingsList.innerHTML = ratings.map(r => {
                        // Tampilkan tombol hapus jika: admin, atau userId == r.userId
                        const canDelete = isLoggedIn && (userRole === 'admin' || r.userId === userId);
                        return `
                        <div style="border-bottom:1px solid #eee;padding:6px 0;position:relative;">
                            <b>${r.user?.username || 'User'}</b> - 
                            <span style="color:gold;">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span><br/>
                            <span>${r.feedback}</span>
                            ${canDelete ? `<button class="delete-rating-btn" data-rating-id="${r.id}" style="position:absolute;right:0;top:0;background:#e53e3e;color:#fff;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;">Hapus</button>` : ''}
                        </div>
                        `;
                    }).join('');

                    // Event listener tombol hapus rating
                    document.querySelectorAll('.delete-rating-btn').forEach(btn => {
                        btn.addEventListener('click', async function() {
                            const ratingId = this.getAttribute('data-rating-id');
                            Swal.fire({
                                title: 'Hapus Ulasan?',
                                text: 'Anda yakin ingin menghapus ulasan ini?',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonText: 'Ya, Hapus',
                                cancelButtonText: 'Batal',
                                confirmButtonColor: '#d33',
                                cancelButtonColor: '#3085d6',
                            }).then(async (result) => {
                                if (result.isConfirmed) {
                                    try {
                                        const res = await fetch(`${api_baseUrl}/ratings/delete/${ratingId}`, {
                                            method: 'DELETE',
                                            headers: { Authorization: `Bearer ${token}` }
                                        });
                                        if (res.ok) {
                                            Swal.fire({
                                                icon: 'success',
                                                title: 'Berhasil',
                                                text: 'Ulasan berhasil dihapus',
                                                confirmButtonText: 'OK'
                                            });
                                            showProductModalById(product.id); // Refresh ulasan
                                        } else {
                                            Swal.fire({
                                                icon: 'error',
                                                title: 'Gagal',
                                                text: 'Gagal menghapus ulasan',
                                                confirmButtonText: 'OK'
                                            });
                                        }
                                    } catch (err) {
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Gagal',
                                            text: 'Gagal menghapus ulasan',
                                            confirmButtonText: 'OK'
                                        });
                                    }
                                }
                            });
                        });
                    });
                }
            });

        // Star rating input interaksi
        if (isLoggedIn) {
            let selectedRating = 0;
            document.querySelectorAll('#starInput .star').forEach(star => {
                star.addEventListener('mouseover', function() {
                    const val = +this.getAttribute('data-value');
                    document.querySelectorAll('#starInput .star').forEach((s, i) => {
                        s.innerHTML = i < val ? '&#9733;' : '&#9734;';
                    });
                });
                star.addEventListener('mouseout', function() {
                    document.querySelectorAll('#starInput .star').forEach((s, i) => {
                        s.innerHTML = i < selectedRating ? '&#9733;' : '&#9734;';
                    });
                });
                star.addEventListener('click', function() {
                    selectedRating = +this.getAttribute('data-value');
                    document.querySelectorAll('#starInput .star').forEach((s, i) => {
                        s.innerHTML = i < selectedRating ? '&#9733;' : '&#9734;';
                    });
                });
            });
            document.getElementById('submitRatingBtn').onclick = async function() {
                const feedback = document.getElementById('feedbackInput').value.trim();
                if (!selectedRating) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Peringatan',
                        text: 'Pilih rating bintang!',
                        confirmButtonText: 'OK'
                    });
                    return;
                }
                if (!feedback) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Peringatan',
                        text: 'Tulis ulasan terlebih dahulu!',
                        confirmButtonText: 'OK'
                    });
                    return;
                }
                try {
                    const res = await fetch(`${api_baseUrl}/ratings/${product.id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ rating: selectedRating, feedback })
                    });
                    if (res.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Berhasil!',
                            text: 'Ulasan berhasil dikirim!',
                            confirmButtonText: 'OK'
                        });
                        showProductModalById(product.id); // Refresh ulasan
                    } else {
                        const err = await res.json();
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal',
                            text: 'Gagal mengirim ulasan: ' + (err.message || ''),
                            confirmButtonText: 'OK'
                        });
                    }
                } catch (e) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Gagal mengirim ulasan!',
                        confirmButtonText: 'OK'
                    });
                }
            }
        }

        document.getElementById("productModal").style.display = "flex";
        }

    document.querySelector(".close-button").addEventListener("click", () => {
    document.getElementById("productModal").style.display = "none";
    });

    function addCartButtonsListener() {
    document.querySelectorAll('.cart-button').forEach(button => {
        button.addEventListener('click', (e) => {
        if (!isLoggedIn) {
            Swal.fire({
                icon: 'warning',
                title: 'Peringatan',
                text: 'Silakan login terlebih dahulu untuk menambahkan ke keranjang.',
                confirmButtonText: 'OK'
            });
            return;
        }

        const productId = e.target.getAttribute('data-id');
        Swal.fire({
            title: 'Masukkan jumlah',
            input: 'number',
            inputLabel: 'Jumlah produk yang ingin ditambahkan ke keranjang:',
            inputPlaceholder: 'Masukkan angka',
            showCancelButton: true,
            confirmButtonText: 'Tambahkan',
            cancelButtonText: 'Batal',
            inputAttributes: {
                min: 1
            },
            inputValidator: (value) => {
                if (!value || isNaN(value)) {
                    return 'Harap masukkan jumlah yang valid!';
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                addToCart(productId, parseInt(result.value));
            }
        });
        });
    });
    }

    async function addToCart(productId, quantity) {
    try {
        const response = await fetch(`${api_baseUrl}/cart`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
        });

        if (response.ok) {
        Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Produk berhasil ditambahkan ke keranjang.',
        confirmButtonText: 'OK',
        timer: 2000,
        timerProgressBar: true
        });
        } else {
        Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: 'Gagal menambahkan produk ke keranjang.',
            confirmButtonText: 'OK'
        });
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Terjadi kesalahan saat menambahkan ke keranjang',
            confirmButtonText: 'OK'
        });
    }
    }

    function initSwiper(selector, direction = 'right') {
        return new Swiper(selector, {
            slidesPerView: 4,
            spaceBetween: 10,
            loop: true,
            speed: 2000,
            allowTouchMove: false,
            navigation: {
                nextEl: selector + ' .swiper-button-next',
                prevEl: selector + ' .swiper-button-prev',
            },
            pagination: {
                el: selector + ' .swiper-pagination',
                clickable: true,
            },
            autoplay: {
                delay: 1, // 1ms supaya jalan terus
                disableOnInteraction: false,
                reverseDirection: direction === 'left',
                pauseOnMouseEnter: false,
            },
        });
    }

    async function fetchProducts() {
    try {
        const response = await fetch(`${api_baseUrl}/products`);
        const data = await response.json();

        if (!data.data || data.data.length === 0) {
        document.querySelector('.product-list.latest').innerHTML = '<p>No products found.</p>';
        document.querySelector('.product-list.best-seller').innerHTML = '<p>No products found.</p>';
        document.querySelector('.product-list.all').innerHTML = '<p>No products found.</p>';
        return;
        }

        allProducts = data.data;

        // Sort latest by createdAt DESC (paling baru di depan)
        const latestProducts = [...allProducts]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 4);

        // Fetch ratings for best seller sort
        const ratingsRes = await fetch(`${api_baseUrl}/ratings/all`);
        const ratingsData = await ratingsRes.json();
        // ratingsData: array of { productId, avgRating }
        // Gabungkan avgRating ke allProducts
        const productsWithRating = allProducts.map(p => {
            const ratingObj = ratingsData.find(r => r.productId === p.id);
            return { ...p, avgRating: ratingObj ? ratingObj.avgRating : 0 };
        });
        // Sort best seller by avgRating DESC, hanya produk yang punya ulasan
        const bestSellerProducts = [...productsWithRating]
            .filter(p => p.avgRating > 3)
            .sort((a, b) => b.avgRating - a.avgRating)
            .slice(0, 4);

        // Render latest
        document.querySelector('.product-list.latest').innerHTML = '';
        latestProducts.forEach(product => {
            const card = createProductCard(product);
            document.querySelector('.product-list.latest').appendChild(card);
        });

        // Render best seller
        document.querySelector('.product-list.best-seller').innerHTML = '';
        bestSellerProducts.forEach(product => {
            const card = createProductCard(product);
            document.querySelector('.product-list.best-seller').appendChild(card);
        });

        // Render all
        document.querySelector('.product-list.all').innerHTML = '';
        filteredProducts = allProducts; // default
        renderAllProducts(filteredProducts);

        addCartButtonsListener();
        addPopupListeners();
        // Destroy Swiper instance jika sudah ada (untuk mencegah duplikasi)
        if (window.latestSwiper) window.latestSwiper.destroy(true, true);
        if (window.bestSellerSwiper) window.bestSellerSwiper.destroy(true, true);
        window.latestSwiper = initSwiper('.latest-swiper', 'right'); // otomatis ke kanan
        window.bestSellerSwiper = initSwiper('.best-seller-swiper', 'left'); // otomatis ke kiri
    } catch (error) {
        console.error('Error fetching products:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Gagal memuat produk',
            confirmButtonText: 'OK'
        });
    }
    }

    const token = localStorage.getItem('jwtToken');
    const isLoggedIn = !!token;

    if (isLoggedIn) {
    document.getElementById('logout').style.display = 'inline';
    document.getElementById('loginLink').style.display = 'none';
    document.getElementById('cartLink').style.display = 'inline';
    document.getElementById('historyLink').style.display = 'inline';

    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role === 'admin') {
        document.getElementById('dashboardLink').style.display = 'inline';
    }
    } else {
    // Tampilkan login kalau belum login
    document.getElementById('loginLink').style.display = 'inline';
    document.getElementById('logout').style.display = 'none';
    document.getElementById('cartLink').style.display = 'none';
    document.getElementById('dashboardLink').style.display = 'none';
    }


    // === LOGOUT FUNCTION ===
    document.getElementById('logout').addEventListener('click', function () {
    localStorage.removeItem('jwtToken');
      Swal.fire({
      icon: 'success',
      title: 'berhasil logout!',
      confirmButtonText: 'OK'
    }).then(() => {
      window.location.href = 'login.html';
    });
    });

        // Add scroll event for navbar
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                document.querySelector('.navbar').classList.add('scrolled');
            } else {
                document.querySelector('.navbar').classList.remove('scrolled');
            }
        });

        // Function to update product cards with price and better structure
        function createProductCard(product) {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide product-item';

            // Limit description to max 30 characters, add ... if longer
            let shortDesc = product.description || '';
            if (shortDesc.length > 30) {
                shortDesc = shortDesc.substring(0, 25) + '...';
            }

            // Format price with IDR currency
            const formattedPrice = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
            }).format(product.price || 0);

            slide.innerHTML = `
                <img src="${product.imageUrl || 'https://via.placeholder.com/250'}" alt="${product.name}" />
                <div class="product-content">
                    <h3>${product.name}</h3>
                    <p>${shortDesc}</p>
                    <div class="price">${formattedPrice}</div>
                </div>
            `;

            // Click entire card to show modal
            slide.addEventListener('click', () => {
                showProductModalById(product.id);
            });

            return slide;
        }
    
    
    fetchProducts();