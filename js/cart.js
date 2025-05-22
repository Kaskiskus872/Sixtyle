const api_baseUrl = 'https://project-pkk-production.up.railway.app';
  const token = localStorage.getItem('jwtToken');

  const cartList = document.getElementById('cartList');
  const totalItems = document.getElementById('totalItems');
  const totalPrice = document.getElementById('totalPrice');
  const selectAllCheckbox = document.getElementById('selectAll');

  // Tambahkan import SweetAlert2 jika belum ada
  document.write('<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>');

  if (!token) {
    Swal.fire({
      icon: 'warning',
      title: 'Silakan login terlebih dahulu',
      confirmButtonText: 'OK'
    }).then(() => {
      window.location.href = 'login.html';
    });
  }

  let cartData = []; // untuk menyimpan data cart asli

  async function fetchCartItems() {
    // Simpan id item yang dicentang sebelum render ulang
    const checkedIds = Array.from(document.querySelectorAll('.item-check:checked')).map(cb => parseInt(cb.dataset.id));
    try {
      const res = await fetch(`${api_baseUrl}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { data } = await res.json();

      cartData = data || [];
      cartList.innerHTML = '';

      if (cartData.length === 0) {
        cartList.innerHTML = '<p>Keranjang kamu kosong.</p>';
        updateTotals();
        return;
      }

      // Sort cartData by id ASC agar urutan produk tetap
      cartData.sort((a, b) => a.id - b.id);
      cartData.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';

        cartItem.innerHTML = `
          <input type="checkbox" class="item-check" data-id="${item.id}" />
          <img src="${item.Product.imageUrl || 'https://via.placeholder.com/100'}" alt="${item.Product.name}" />
          <div class="item-details">
            <h3>${item.Product.name}</h3>
            <p>Harga: Rp${item.Product.price.toLocaleString()}</p>
            <div class="quantity-control">
              <button onclick="updateCartItem(${item.id}, ${item.quantity - 1})">-</button>
              <span>${item.quantity}</span>
              <button onclick="updateCartItem(${item.id}, ${item.quantity + 1})">+</button>
            </div>
          </div>
        `;

        cartList.appendChild(cartItem);
      });

      // Setelah render selesai, set kembali checkbox yang sebelumnya dicentang
      document.querySelectorAll('.item-check').forEach(cb => {
        if (checkedIds.includes(parseInt(cb.dataset.id))) {
          cb.checked = true;
        }
        cb.addEventListener('change', updateTotals);
      });

    } catch (err) {
      console.error('Error:', err);
    }
  }

  function updateTotals() {
    const checkedBoxes = document.querySelectorAll('.item-check:checked');
    let totalQty = 0;
    let totalHarga = 0;

    checkedBoxes.forEach(cb => {
      const id = parseInt(cb.dataset.id);
      const item = cartData.find(i => i.id === id);
      if (item) {
        totalQty += item.quantity;
        totalHarga += item.quantity * item.Product.price;
      }
    });

    totalItems.textContent = totalQty;
    totalPrice.textContent = `Rp${totalHarga.toLocaleString()}`;
  }

  async function updateCartItem(cartItemId, quantity) {
    if (quantity < 1) return;
    try {
      const res = await fetch(`${api_baseUrl}/cart/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });

      if (res.ok) {
        await fetchCartItems();
        updateTotals();
      } else {
        Swal.fire('Gagal', 'Gagal update jumlah barang', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  }

  // checkbox "pilih semua"
  selectAllCheckbox.addEventListener('change', function () {
    const allChecks = document.querySelectorAll('.item-check');
    allChecks.forEach(c => {
      c.checked = this.checked;
    });
    updateTotals();
  });

  async function updateCartItem(cartItemId, quantity) {
    if (quantity < 1) {
    Swal.fire({
      title: 'Hapus barang dari keranjang?',
      text: 'Apakah Anda yakin ingin menghapus barang ini dari keranjang?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        removeCartItem(cartItemId);
      }
    });
    return;
  }

    try {
        const res = await fetch(`${api_baseUrl}/cart/${cartItemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ quantity })
        });

        if (res.ok) {
            await fetchCartItems();
            updateTotals();
        } else {
            Swal.fire('Gagal', 'Gagal update jumlah barang', 'error');
        }
    } catch (err) {
        console.error(err);
    }
}

async function removeCartItem(cartItemId, showAlert = true) {
    try {
        const response = await fetch(`${api_baseUrl}/cart/${cartItemId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            if (showAlert) {
                Swal.fire('Sukses', 'Barang dihapus dari keranjang.', 'success');
            }
            fetchCartItems();
            updateTotals();
        } else {
            Swal.fire('Gagal', 'Gagal menghapus barang.', 'error');
        }
    } catch (error) {
        console.error('Error saat menghapus item:', error);
    }
}

// Tambahkan tombol checkout di bawah daftar cart di HTML:
// <button id="checkoutBtn">Checkout</button>

// Event listener untuk tombol checkout
const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', async function() {
    // Ambil produk yang dicentang
    const checkedBoxes = document.querySelectorAll('.item-check:checked');
    if (checkedBoxes.length === 0) {
      Swal.fire('Pilih produk!', 'Pilih produk yang ingin dibeli!', 'warning');
      return;
    }

    // Ambil data produk yang dicentang
    const items = [];
    let total = 0;
    checkedBoxes.forEach(cb => {
      const id = parseInt(cb.dataset.id);
      const item = cartData.find(i => i.id === id);
      if (item) {
        items.push({
          productId: item.Product.id,
          quantity: item.quantity,
          price: item.Product.price
        });
        total += item.quantity * item.Product.price;
      }
    });

    // Kirim order ke backend
    try {
      const res = await fetch(`${api_baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items, total })
      });
      if (res.ok) {
        Swal.fire('Sukses', 'Order berhasil dibuat!', 'success');
        // Hapus item yang dicentang dari cart tanpa popup
        for (const cb of checkedBoxes) {
          const id = parseInt(cb.dataset.id);
          await removeCartItem(id, false);
        }
        fetchCartItems(); // Refresh cart
      } else {
        const err = await res.json();
        Swal.fire('Gagal', 'Gagal checkout: ' + (err.error || ''), 'error');
      }
    } catch (e) {
      Swal.fire('Gagal', 'Gagal checkout!', 'error');
    }
  });
}

document.getElementById('backToHomeBtn').onclick = function() {
  window.location.href = 'index.html';
};

  fetchCartItems();