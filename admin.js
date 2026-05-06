const adminUser = document.getElementById('adminUser');
const adminPass = document.getElementById('adminPass');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminPanel = document.getElementById('adminPanel');
const adminOrderList = document.getElementById('adminOrderList');

adminLoginBtn.onclick = () => {
    if (adminUser.value === 'lutfi' && adminPass.value === 'lutfi12') {
        document.querySelector('.container').classList.add('hidden');
        adminPanel.classList.remove('hidden');
        loadAllOrders();
        // Real-time listener
        db.collection('orders').onSnapshot(() => loadAllOrders());
    } else {
        alert('Username atau password salah!');
    }
};

async function loadAllOrders() {
    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
    const orders = [];
    snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
    
    adminOrderList.innerHTML = orders.map(order => `
        <div class="order-card">
            <p><strong>${order.productName}</strong> - ${order.userEmail}</p>
            <p>Rp ${order.price?.toLocaleString()}</p>
            <p>Alamat: ${order.alamat}</p>
            ${order.paymentProof ? `<img src="${order.paymentProof}" width="150" style="border-radius:8px;">` : ''}
            <select id="status-${order.id}" onchange="updateStatus('${order.id}', this.value)">
                <option value="menunggu_konfirmasi" ${order.status === 'menunggu_konfirmasi' ? 'selected' : ''}>Menunggu Konfirmasi</option>
                <option value="dikemas" ${order.status === 'dikemas' ? 'selected' : ''}>Dikemas</option>
                <option value="dikirim" ${order.status === 'dikirim' ? 'selected' : ''}>Dikirim</option>
                <option value="selesai" ${order.status === 'selesai' ? 'selected' : ''}>Selesai</option>
            </select>
        </div>
    `).join('');
}

window.updateStatus = async (orderId, newStatus) => {
    await db.collection('orders').doc(orderId).update({ status: newStatus });
    alert('Status diperbarui!');
};

document.getElementById('addProductBtn').onclick = async () => {
    const name = document.getElementById('productName').value;
    const author = document.getElementById('productAuthor').value;
    const price = parseInt(document.getElementById('productPrice').value);
    const image = document.getElementById('productImage').value;
    
    await db.collection('products').add({ name, author, price, image });
    alert('Produk ditambahkan!');
    document.getElementById('productName').value = '';
    document.getElementById('productAuthor').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productImage').value = '';
};

document.getElementById('logoutAdminBtn').onclick = () => {
    location.reload();
};