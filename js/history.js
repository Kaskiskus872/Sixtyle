const api_baseUrl = 'https://project-pkk-production.up.railway.app';
    const token = localStorage.getItem('jwtToken');
    const ordersContainer = document.getElementById('orders-container');
    const paymentModal = document.getElementById('paymentModal');
    const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');
    const processPaymentBtn = document.getElementById('processPaymentBtn');
    const paymentNota = document.getElementById('paymentNota');
    let currentOrderId = null;

    // Redirect to login if no token
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Silakan login terlebih dahulu',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'bg-blue-600 hover:bg-blue-700'
        }
      }).then(() => {
        window.location.href = 'login.html';
      });
    }

    // Decode token untuk mendapatkan userId
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.id;

    // Event listeners
    document.getElementById('backToHomeBtn').onclick = function() {
      window.location.href = 'index.html';
    };

    cancelPaymentBtn.onclick = function() {
      paymentModal.classList.add('hidden');
      currentOrderId = null;
    };

    processPaymentBtn.onclick = function() {
      const selectedPayment = document.querySelector('input[name="payment"]:checked');
      
      if (!selectedPayment) {
        Swal.fire({
          icon: 'warning',
          title: 'Pilih metode pembayaran',
          text: 'Silakan pilih metode pembayaran terlebih dahulu',
          confirmButtonText: 'OK'
        });
        return;
      }
      
      const paymentMethod = selectedPayment.value;
      payOrder(currentOrderId, paymentMethod);
      paymentModal.classList.add('hidden');
    };

    // Close modal when clicking outside
    window.onclick = function(event) {
      if (event.target === paymentModal) {
        paymentModal.classList.add('hidden');
        currentOrderId = null;
      }
    };

    async function fetchOrders() {
      try {
        const res = await fetch(`${api_baseUrl}/orders/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const orders = await res.json();
        
        // Fetch all products (untuk jaga-jaga jika Product di OrderItems null)
        const productsRes = await fetch(`${api_baseUrl}/products`);
        const productsData = await productsRes.json();
        const allProducts = productsData.data || [];
        
        // Simpan ke global
        window._orders = orders;
        window._allProducts = allProducts;
        
        displayOrders(orders, allProducts);
      } catch (err) {
        console.error('Error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Gagal mengambil data pesanan',
          confirmButtonText: 'OK'
        });
      }
    }

    function displayOrders(orders, allProducts) {
      // Bersihkan container
      ordersContainer.innerHTML = '';
      
      // Pisahkan order pending & success
      const pendingOrders = orders.filter(o => o.status === 'pending');
      const successOrders = orders.filter(o => o.status === 'success');
      
      // Section Pending
      if (pendingOrders.length > 0) {
        const pendingSection = document.createElement('div');
        pendingSection.className = 'mb-10';
        pendingSection.innerHTML = `
          <h2 class="text-2xl font-bold text-gray-700 mb-4">Pesanan Menunggu Pembayaran</h2>
        `;
        
        pendingOrders.forEach((order, index) => {
          const orderEl = createOrderElement(order, index, allProducts, true);
          pendingSection.appendChild(orderEl);
        });
        
        ordersContainer.appendChild(pendingSection);
      }
      
      // Section Success
      if (successOrders.length > 0) {
        const successSection = document.createElement('div');
        successSection.className = 'mb-6';
        successSection.innerHTML = `
          <h2 class="text-2xl font-bold text-gray-700 mb-4">Pesanan Selesai</h2>
        `;
        
        successOrders.forEach((order, index) => {
          const orderEl = createOrderElement(order, index, allProducts, false);
          successSection.appendChild(orderEl);
        });
        
        ordersContainer.appendChild(successSection);
      }
      
      // If no orders
      if (pendingOrders.length === 0 && successOrders.length === 0) {
        ordersContainer.innerHTML = `
          <div class="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p class="mt-4 text-xl font-medium text-gray-500">Belum ada pesanan</p>
            <p class="mt-2 text-gray-500">Pesanan Anda akan muncul di sini</p>
          </div>
        `;
      }
    }

    function createOrderElement(order, index, allProducts, isPending) {
      const orderEl = document.createElement('div');
      orderEl.className = 'bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-6 shadow-sm';
      
      // Order header
      const orderHeader = document.createElement('div');
      orderHeader.className = 'bg-gray-100 px-4 py-3 flex justify-between items-center';
      orderHeader.innerHTML = `
        <div class="flex items-center">
          <span class="font-semibold text-gray-800">Order #${index + 1}</span>
        </div>
        <div class="flex items-center">
          <span class="px-3 py-1 rounded-full text-sm ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
            ${order.status === 'pending' ? 'Menunggu Pembayaran' : 'Selesai'}
          </span>
        </div>
      `;
      orderEl.appendChild(orderHeader);
      
      // Products list
      const productsList = document.createElement('div');
      productsList.className = 'px-4 py-4';
      
      // Add products to list
      order.OrderItems.forEach(item => {
        let product = item.Product;
        if (!product) {
          product = allProducts.find(p => p.id === item.ProductId) || {};
        }
        
        const productElement = document.createElement('div');
        productElement.className = 'flex items-center border-b border-gray-100 py-3 last:border-0';
        productElement.innerHTML = `
          <div class="h-16 w-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            <img src="${product.imageUrl || 'https://via.placeholder.com/100'}" 
                alt="${product.name || ''}" 
                class="w-full h-full object-cover"
                onerror="this.onerror=null;this.src='https://via.placeholder.com/100';">
          </div>
          <div class="ml-4 flex-1">
            <h3 class="font-medium text-gray-800">${product.name || 'Produk tidak tersedia'}</h3>
            <div class="flex mt-1">
              <p class="text-sm text-gray-600">${item.quantity} x Rp${item.price.toLocaleString()}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-medium text-gray-800">Rp${(item.price * item.quantity).toLocaleString()}</p>
          </div>
        `;
        
        productsList.appendChild(productElement);
      });
      
      orderEl.appendChild(productsList);
      
      // Order summary
      const orderSummary = document.createElement('div');
      orderSummary.className = 'bg-gray-50 px-4 py-4 border-t border-gray-200';
      
      // Add total price and buttons for pending orders
      if (isPending) {
        orderSummary.innerHTML = `
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div class="mb-4 sm:mb-0">
              <p class="font-bold text-lg text-gray-800">Total: Rp${order.totalPrice.toLocaleString()}</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-2">
              <button class="cancel-btn px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                data-order-id="${order.id}">
                Batalkan
              </button>
              <button class="pay-btn px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                data-order-id="${order.id}">
                Bayar
              </button>
            </div>
          </div>
        `;
      } else {
        orderSummary.innerHTML = `
          <div class="flex justify-between items-center gap-2">
            <p class="font-bold text-lg text-gray-800">Total: Rp${order.totalPrice.toLocaleString()}</p>
            <span class="text-green-600 font-medium">Pembayaran Berhasil</span>
            <button class="delete-history-btn px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors" data-order-id="${order.id}">
              Hapus Riwayat
            </button>
          </div>
        `;
      }
      
      orderEl.appendChild(orderSummary);
      
      // Add event listeners to the buttons if pending order
      if (isPending) {
        setTimeout(() => {
          const cancelBtn = orderEl.querySelector('.cancel-btn');
          const payBtn = orderEl.querySelector('.pay-btn');
          
          cancelBtn.addEventListener('click', () => {
            cancelOrder(order.id);
          });
          
          payBtn.addEventListener('click', () => {
            openPaymentModal(order.id);
          });
        }, 0);
      } else {
        // Event listener untuk tombol hapus riwayat pada order success
        setTimeout(() => {
          const deleteBtn = orderEl.querySelector('.delete-history-btn');
          if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
              deleteOrderHistory(order.id);
            });
          }
        }, 0);
      }
      
      return orderEl;
    }

    function openPaymentModal(orderId) {
      currentOrderId = orderId;
      // Reset selected payment method
      const radioInputs = document.querySelectorAll('input[name="payment"]');
      radioInputs.forEach(input => {
        input.checked = false;
      });

      // Cari order yang dipilih dari data yang sudah ditampilkan
      // Ambil data orders dari cache terakhir (fetchOrders)
      // Untuk itu, simpan orders dan allProducts di variabel global saat fetchOrders
      const order = window._orders?.find(o => o.id === orderId);
      const allProducts = window._allProducts || [];
      const paymentNota = document.getElementById('paymentNota');

      if (order && paymentNota) {
        let notaHTML = '<div class="font-semibold mb-2 text-gray-700">Detail Pesanan</div>';
        notaHTML += '<ul class="mb-2">';
        order.OrderItems.forEach(item => {
          let product = item.Product || allProducts.find(p => p.id === item.ProductId) || {};
          notaHTML += `<li class="flex justify-between text-sm mb-1"><span>${product.name || 'Produk tidak tersedia'}</span> <span>${item.quantity} x Rp${item.price.toLocaleString()}</span></li>`;
        });
        notaHTML += '</ul>';
        notaHTML += `<div class="font-bold text-right text-gray-800">Total: Rp${order.totalPrice.toLocaleString()}</div>`;
        paymentNota.innerHTML = notaHTML;
        paymentNota.classList.remove('hidden');
      } else if (paymentNota) {
        paymentNota.innerHTML = '';
        paymentNota.classList.add('hidden');
      }

      // Show modal
      paymentModal.classList.remove('hidden');
    }

    async function cancelOrder(orderId) {
      Swal.fire({
        title: 'Batalkan Pesanan?',
        text: 'Anda yakin ingin membatalkan pesanan ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Batalkan',
        cancelButtonText: 'Tidak',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await fetch(`${api_baseUrl}/orders/${orderId}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
              Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Pesanan berhasil dibatalkan',
                confirmButtonText: 'OK'
              });
              fetchOrders(); // Refresh tampilan
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: 'Gagal membatalkan pesanan',
                confirmButtonText: 'OK'
              });
            }
          } catch (err) {
            console.error('Error:', err);
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: 'Gagal membatalkan pesanan',
              confirmButtonText: 'OK'
            });
          }
        }
      });
    }

    async function payOrder(orderId, paymentMethod) {
      try {
        // Simulasi proses pembayaran
        Swal.fire({
          title: 'Memproses Pembayaran',
          text: `Menggunakan metode pembayaran ${paymentMethod.toUpperCase()}`,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
          timer: 2000,
          timerProgressBar: true
        }).then(async () => {
          // Setelah simulasi, update status pesanan
          const res = await fetch(`${api_baseUrl}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'success' })
          });

          if (res.ok) {
            Swal.fire({
              icon: 'success',
              title: 'Pembayaran Berhasil',
              text: 'Terima kasih atas pesanan Anda',
              confirmButtonText: 'OK'
            });
            fetchOrders(); // Refresh tampilan
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: 'Gagal memproses pembayaran',
              confirmButtonText: 'OK'
            });
          }
        });
      } catch (err) {
        console.error('Error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Gagal memproses pembayaran',
          confirmButtonText: 'OK'
        });
      }
    }

    // Make payment option label/divs clickable to select the radio button
    document.querySelectorAll('.payment-option').forEach(option => {
      option.addEventListener('click', function() {
        const radio = this.querySelector('input[type="radio"]');
        radio.checked = true;
      });
    });

    // Tambahkan fungsi untuk hapus riwayat order success
    async function deleteOrderHistory(orderId) {
      Swal.fire({
        title: 'Hapus Riwayat?',
        text: 'Anda yakin ingin menghapus riwayat pesanan ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await fetch(`${api_baseUrl}/orders/${orderId}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Riwayat pesanan berhasil dihapus',
                confirmButtonText: 'OK'
              });
              fetchOrders();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: 'Gagal menghapus riwayat pesanan',
                confirmButtonText: 'OK'
              });
            }
          } catch (err) {
            console.error('Error:', err);
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: 'Gagal menghapus riwayat pesanan',
              confirmButtonText: 'OK'
            });
          }
        }
      });
    }

    // Initialize the page
    fetchOrders();