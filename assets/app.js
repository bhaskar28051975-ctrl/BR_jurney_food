/* Shared JS for BR_jurney_food
   - Uses localStorage key: br_orders
   - WhatsApp number: 919154095125 (country code)
*/

const ORDER_KEY = 'br_orders';
const WHATSAPP_NUMBER = '919154095125';
const PRICE = 60;

/* ---------- Helpers ---------- */

function readOrders(){
  const raw = localStorage.getItem(ORDER_KEY);
  return raw ? JSON.parse(raw) : [];
}
function writeOrders(arr){
  localStorage.setItem(ORDER_KEY, JSON.stringify(arr));
}
function genOrderId(){
  return 'BR' + Date.now();
}

/* ---------- Index page functions (modal, totals, confirm) ---------- */

function renderTotalsOnIndex() {
  const q1 = Number(document.getElementById('qty1')?.value || 0);
  const q2 = Number(document.getElementById('qty2')?.value || 0);
  const t1 = q1 * PRICE;
  const t2 = q2 * PRICE;
  const grand = t1 + t2;
  const elT1 = document.getElementById('t1');
  const elT2 = document.getElementById('t2');
  const elG = document.getElementById('grandTotal');
  if(elT1) elT1.innerText = t1;
  if(elT2) elT2.innerText = t2;
  if(elG) elG.innerText = grand;
}

/* Modal open/close for index */
function openSummaryModal(){
  renderTotalsOnIndex();
  const q1 = Number(document.getElementById('qty1')?.value || 0);
  const q2 = Number(document.getElementById('qty2')?.value || 0);
  const t1 = q1 * PRICE;
  const t2 = q2 * PRICE;
  const grand = t1 + t2;
  const address = document.getElementById('address')?.value || '';
  const name = document.getElementById('customerName')?.value || '-';
  const phone = document.getElementById('phone')?.value || '-';

  document.getElementById('m_qty1').innerText = q1;
  document.getElementById('m_t1').innerText = '₹' + t1;
  document.getElementById('m_qty2').innerText = q2;
  document.getElementById('m_t2').innerText = '₹' + t2;
  document.getElementById('m_grand').innerText = '₹' + grand;
  document.getElementById('m_address').innerText = address;
  document.getElementById('m_customer').innerText = name + ' • ' + phone;

  const bd = document.getElementById('backdrop');
  bd.style.opacity = '1'; bd.style.visibility = 'visible';
  bd.setAttribute('aria-hidden','false');
}
function closeSummaryModal(){
  const bd = document.getElementById('backdrop');
  bd.style.opacity = '0'; bd.style.visibility = 'hidden';
  bd.setAttribute('aria-hidden','true');
}

/* Confirm order from modal */
function confirmOrderFromModal(){
  const q1 = Number(document.getElementById('qty1')?.value || 0);
  const q2 = Number(document.getElementById('qty2')?.value || 0);
  const t1 = q1 * PRICE;
  const t2 = q2 * PRICE;
  const grand = t1 + t2;
  const address = document.getElementById('address')?.value || '';
  const name = (document.getElementById('customerName')?.value || '').trim();
  const phone = (document.getElementById('phone')?.value || '').trim();

  if(!name || !phone){
    alert('Please enter name and phone number before confirming.');
    return;
  }

  const order = {
    id: genOrderId(),
    createdAt: new Date().toISOString(),
    name, phone, address,
    items: [
      { sku:'banner1', qty:q1, total:t1 },
      { sku:'banner2', qty:q2, total:t2 }
    ],
    grandTotal: grand,
    status: 'Pending'
  };

  const arr = readOrders();
  arr.unshift(order); // newest first
  writeOrders(arr);

  // Prepare WhatsApp message
  const message = encodeURIComponent(
    `BR JOURNEY FOOD ORDER\n\nCustomer Name: ${name}\nPhone: ${phone}\nDelivery Address: ${address}\n\nBanner 1 Qty: ${q1} | Total: ₹${t1}\nBanner 2 Qty: ${q2} | Total: ₹${t2}\n\nGRAND TOTAL: ₹${grand}\n\nOrder ID: ${order.id}\nThank you!`
  );

  const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(wa, '_blank');

  closeSummaryModal();
  alert('Order saved and WhatsApp opened. Order ID: ' + order.id);
  setTimeout(()=> location.reload(), 1200);
}

/* ---------- Track page functions ---------- */

function findOrdersByPhone(phone, targetElement){
  const arr = readOrders();
  const matches = arr.filter(o => o.phone === phone);
  if(matches.length === 0){
    targetElement.innerHTML = '<div style="color:#66798f">No orders found for this phone number.</div>';
    return;
  }
  // render
  targetElement.innerHTML = '';
  matches.forEach(o => {
    const div = document.createElement('div');
    div.className = 'card';
    div.style.marginTop = '12px';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><strong>Order ID:</strong> ${o.id}</div>
        <div style="font-weight:800;color:var(--primary)">${o.status}</div>
      </div>
      <div style="margin-top:6px;color:#66798f;font-size:13px">Placed: ${new Date(o.createdAt).toLocaleString()}</div>
      <div style="margin-top:8px"><strong>Grand Total:</strong> ₹${o.grandTotal}</div>
      <div style="margin-top:8px"><strong>Address:</strong> ${o.address}</div>
      <div style="margin-top:8px"><strong>Items:</strong><ul>${o.items.map(i=>`<li>${i.sku} — Qty:${i.qty} — ₹${i.total}</li>`).join('')}</ul></div>
    `;
    targetElement.appendChild(div);
  });
}

/* ---------- Admin functions ---------- */

function adminLoadOrders(areaElement){
  const arr = readOrders();
  areaElement.innerHTML = '';
  if(arr.length === 0){
    areaElement.innerHTML = '<div class="card">No orders yet.</div>';
    return;
  }
  arr.forEach(o => {
    const wrapper = document.createElement('div');
    wrapper.className = 'card';
    wrapper.style.marginBottom = '12px';
    wrapper.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
        <div style="flex:1">
          <div><strong>Order ID:</strong> ${o.id}</div>
          <div style="color:#66798f;font-size:13px">Placed: ${new Date(o.createdAt).toLocaleString()}</div>
          <div style="margin-top:8px"><strong>Customer:</strong> ${o.name} • ${o.phone}</div>
          <div style="margin-top:6px"><strong>Address:</strong> ${o.address}</div>
          <div style="margin-top:8px"><strong>Items:</strong><ul>${o.items.map(i=>`<li>${i.sku} — Qty:${i.qty} — ₹${i.total}</li>`).join('')}</ul></div>
        </div>
        <div style="width:220px;text-align:right">
          <div style="font-size:18px;font-weight:900;margin-bottom:10px">₹${o.grandTotal}</div>
          <div style="margin-bottom:10px">
            <select id="status-${o.id}">
              <option ${o.status==='Pending'?'selected':''}>Pending</option>
              <option ${o.status==='Preparing'?'selected':''}>Preparing</option>
              <option ${o.status==='Dispatched'?'selected':''}>Dispatched</option>
              <option ${o.status==='Delivered'?'selected':''}>Delivered</option>
            </select>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            <button onclick="adminUpdateStatus('${o.id}')" style="padding:8px 10px;border-radius:8px;background:#0b8b3a;color:#fff;border:none;font-weight:800;cursor:pointer">Update</button>
            <button onclick="adminDeleteOrder('${o.id}')" style="padding:8px 10px;border-radius:8px;background:#e23b3b;color:#fff;border:none;font-weight:800;cursor:pointer">Delete</button>
          </div>
        </div>
      </div>
    `;
    areaElement.appendChild(wrapper);
  });
}

function adminUpdateStatus(orderId){
  const sel = document.getElementById('status-'+orderId);
  if(!sel) return alert('Status control not found');
  const newStatus = sel.value;
  const arr = readOrders();
  const idx = arr.findIndex(x=>x.id === orderId);
  if(idx === -1) return alert('Order not found');
  arr[idx].status = newStatus;
  writeOrders(arr);
  alert('Status updated to ' + newStatus);
  // refresh admin area if exists
  const area = document.getElementById('ordersArea');
  if(area) adminLoadOrders(area);
}

function adminDeleteOrder(orderId){
  if(!confirm('Delete order ' + orderId + '? This cannot be undone.')) return;
  let arr = readOrders();
  arr = arr.filter(x => x.id !== orderId);
  writeOrders(arr);
  alert('Order deleted.');
  const area = document.getElementById('ordersArea');
  if(area) adminLoadOrders(area);
}

/* ---------- Auto init for pages ---------- */
document.addEventListener('DOMContentLoaded', function(){
  // index page init (if elements exist)
  if(document.getElementById('qty1')) renderTotalsOnIndex();

  // track page init
  const trackBtn = document.getElementById('trackFindBtn');
  if(trackBtn){
    trackBtn.addEventListener('click', function(){
      const phone = document.getElementById('trackPhone').value.trim();
      const out = document.getElementById('trackResults');
      out.innerHTML = '';
      if(!phone){ out.innerHTML = '<div style="color:#66798f">Please enter phone number.</div>'; return; }
      findOrdersByPhone(phone, out);
    });
  }

  // admin page init
  const adminArea = document.getElementById('ordersArea');
  if(adminArea) adminLoadOrders(adminArea);
});
