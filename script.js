// Data global
let currentUser = null;
let cart = [];
let products = [];

// DOM Elements
const splashScreen = document.getElementById('splashScreen');
const loginPage = document.getElementById('loginPage');
const mainApp = document.getElementById('mainApp');
const productListDiv = document.getElementById('productList');
const orderListDiv = document.getElementById('orderList');
const cartCountSpan = document.getElementById('cartCount');
const checkoutModal = document.getElementById('checkoutModal');

// Hapus splash screen setelah 3 detik
setTimeout(() => {
    splashScreen.style.display = 'none';
}, 3000);

// Login dengan Google
document.getElementById('googleLogin').onclick = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        currentUser = result.user;
        checkIfAdmin();
    } catch (error) {
        alert('Login gagal: ' + error.message);
    }
};

// Register
document.getElementById('registerBtn').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        alert('Akun berhasil dibuat! Silakan login.');
    } catch (error) {
        alert(error.message);
    }
};

// Login email
document.getElementById('loginBtn').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        currentUser = result.user;
        checkIfAdmin();
    } catch (error) {
        alert('Login gagal: ' + error.message);
    }
};

function checkIfAdmin() {
    if (currentUser.email === 'lutfi@gmail.com') {
        window.location.href = 'admin.html';
    } else {
        loginPage.classList.add('hidden');
        mainApp.classList.remove('hidden');
        loadProducts();
        loadOrders();
    }
}

// Load produk dari Firestore
async function loadProducts() {
    const snapshot = await db.collection('products').get();
    products = [];
    snapshot.forEach(doc => {
        products.push({ id: doc.id, ...doc.data() });
    });
    displayProducts();
}

function displayProducts() {
    productListDiv.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image || 'https://via.placeholder.com/150'}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.author || ''}</p>
            <p class="price">Rp ${product.price.toLocaleString()}</p>
            <button onclick="addToCart('${product.id}')">🛒 Beli</button>
        </div>
    `).join('');
}

window.addToCart = async (productId) => {
    const product = products.find(p => p.id === productId);
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    cartCountSpan.innerText = cart.length;
    
    // Tampilkan modal checkout langsung
    document.getElementById('totalAmount').innerText = product.price.toLocaleString();
    checkoutModal.classList.remove('hidden');
    
    window.currentProduct = product;
};

// Konfirmasi pembayaran
document.getElementById('confirmPaymentBtn').onclick = async () => {
    const alamat = document.getElementById('alamat').value;
    const fileInput = document.getElementById('paymentProof');
    const file = fileInput.files[0];
    
    if (!alamat || !file) {
        alert('Isi alamat dan upload bukti transfer!');
        return;
    }
    
    const total = window.currentProduct.price;
    const orderData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        productId: window.currentProduct.id,
        productName: window.currentProduct.name,
        price: total,
        alamat: alamat,
        status: 'menunggu_konfirmasi',
        createdAt: new Date().toISOString()
    };
    
    // Simpan order ke Firestore
    const orderRef = await db.collection('orders').add(orderData);
    
    // Upload bukti bayar ke Storage
    const storageRef = storage.ref(`payments/${orderRef.id}_${file.name}`);
    await storageRef.put(file);
    const downloadURL = await storageRef.getDownloadURL();
    
    await db.collection('orders').doc(orderRef.id).update({
        paymentProof: downloadURL
    });
    
    alert('Pembayaran terkirim! Admin akan konfirmasi.');
    checkoutModal.classList.add('hidden');
    cart = [];
    localStorage.removeItem('cart');
    cartCountSpan.innerText = '0';
    loadOrders();
};

// Load pesanan user
async function loadOrders() {
    const snapshot = await db.collection('orders')
        .where('userId', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .get();
    
    const orders = [];
    snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
    
    orderListDiv.innerHTML = orders.map(order => `
        <div class="order-card">
            <p><strong>${order.productName}</strong></p>
            <p>Total: Rp ${order.price.toLocaleString()}</p>
            <p>Alamat: ${order.alamat}</p>
            <p>Status: <span class="order-status status-${order.status}">${order.status}</span></p>
            ${order.paymentProof ? `<img src="${order.paymentProof}" width="100" style="margin-top:8px; border-radius:8px;">` : ''}
        </div>
    `).join('');
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(tabContent => {
            tabContent.classList.add('hidden');
        });
        document.getElementById(`${tab}Tab`).classList.remove('hidden');
        
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        if (tab === 'orders') loadOrders();
    };
});

document.getElementById('logoutBtn').onclick = () => {
    auth.signOut();
    location.reload();
};

// Cart icon
document.getElementById('cartIcon').onclick = () => {
    if (cart.length === 0) alert('Keranjang kosong');
    else {
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        document.getElementById('totalAmount').innerText = total.toLocaleString();
        window.currentProduct = cart[0];
        checkoutModal.classList.remove('hidden');
    }
};

// Close modal
document.querySelector('.close').onclick = () => {
    checkoutModal.classList.add('hidden');
};

// Load cart from localStorage
const savedCart = localStorage.getItem('cart');
if (savedCart) {
    cart = JSON.parse(savedCart);
    cartCountSpan.innerText = cart.length;
}