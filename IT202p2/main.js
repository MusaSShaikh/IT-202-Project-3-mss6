// main.js
document.addEventListener("DOMContentLoaded", () => {
  // Toggle password visibility
  const toggle = document.getElementById("togglePwd");
  const pwd = document.getElementById("password");
  if (toggle && pwd) toggle.addEventListener("click", () => {
    pwd.type = pwd.type === "password" ? "text" : "password";
  });

  // UI elements
  const loginForm = document.getElementById("loginForm");
  const app = document.getElementById("app");
  const loggedAs = document.getElementById("loggedAs");
  const flash = document.getElementById("flash");
  const tabBar = document.getElementById("tabBar");
  const panels = {
    search: document.getElementById("panel-search"),
    book: document.getElementById("panel-book"),
    cancel: document.getElementById("panel-cancel"),
    request: document.getElementById("panel-request"),
    update: document.getElementById("panel-update"),
    create: document.getElementById("panel-create"),
  };

  let currentTab = "search";

  // Tab switching
tabBar.addEventListener("click", (e) => {
  const tab = e.target.closest(".tab");
  if (!tab) return;
  const name = tab.dataset.tab;
  if (name) showTab(name);
});


  function showTab(name) {
    currentTab = name;
    document.querySelectorAll(".tab").forEach((t) =>
      t.classList.toggle("active", t.dataset.tab === name)
    );
    Object.keys(panels).forEach((k) => {
      panels[k].classList.toggle("active", k === name);
    });
    if (name === "search") loadSearchTable();
  }

  // Helpers
  function showFlash(msg) {
    flash.textContent = msg;
    flash.style.display = "block";
    setTimeout(() => (flash.style.display = "none"), 5000);
  }

  function apiPost(data) {
    return fetch("process.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(data),
    }).then((r) => r.json());
  }

  // Login flow (AJAX verify)
  loginForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const fname = document.getElementById("fname").value.trim();
    const lname = document.getElementById("lname").value.trim();
    const password = document.getElementById("password").value;
    const idnum = document.getElementById("idnum").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const confirmEmail = document.getElementById("confirmEmail").checked ? "1" : "0";
    const transaction = document.getElementById("transaction").value;

    // Validations
    if (!/^[A-Za-z]+$/.test(fname)) { alert("Enter a valid first name."); document.getElementById("fname").focus(); return; }
    if (!/^[A-Za-z]+$/.test(lname)) { alert("Enter a valid last name."); document.getElementById("lname").focus(); return; }
    // Must start with special char, include uppercase and digit, and be max 5 chars after leading special
    if (!/^[^A-Za-z0-9](?=.*[A-Z])(?=.*\d)[A-Za-z0-9@#$%^&*!]{0,4}$/.test(password)) { alert("Invalid password. Must start with special char, include uppercase and digit, and be max 5 chars after leading special."); document.getElementById("password").focus(); return; }
    if (!/^\d{4}$/.test(idnum)) { alert("Caterer ID must be exactly 4 digits."); document.getElementById("idnum").focus(); return; }
    if (!/^\d{3}[- ]\d{3}[- ]\d{4}(?: ext \d+)?$/.test(phone)) { alert("Phone must match format 555-555-5555 ext 555."); document.getElementById("phone").focus(); return; }
    if (confirmEmail === "1" && !/^[\w.-]+@[A-Za-z]+\.[A-Za-z]{1,3}$/.test(email)) { alert("Enter a valid email."); document.getElementById("email").focus(); return; }

    try {
      const resp = await apiPost({
        action: "verify",
        fname, lname, password, idnum, phone, email, confirmEmail, transaction
      });
      if (!resp || !resp.success) {
        alert(resp && resp.message ? resp.message : "Verification failed");
        return;
      }
      // login success
      loginForm.style.display = "none";
      app.style.display = "block";
      loggedAs.textContent = `Logged in as: ${resp.caterer_name} (ID: ${resp.caterer_id})`;
      showFlash(`Welcome ${resp.caterer_name}. Transaction: ${resp.transaction}`);
      const t = resp.transaction || "search";
      showTab(t);
    } catch (err) {
      alert("Network error: " + err);
    }
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => location.reload());

  // Load search table
  async function loadSearchTable() {
    try {
      const resp = await apiPost({ action: "search" });
      const container = document.getElementById("searchPanel");
      if (!resp || !resp.success) {
        container.innerHTML = `<div class="msg">${resp && resp.message ? resp.message : "Failed to load records."}</div>`;
        return;
      }
      container.innerHTML = resp.html;
    } catch (err) {
      document.getElementById("searchPanel").innerHTML = `<div class="msg">Network or server error: ${err}</div>`;
    }
  }

  // BOOK flow
  document.getElementById("bookVerifyBtn").addEventListener("click", async () => {
    const id = document.getElementById("book_client_id").value.trim();
    if (!/^\d+$/.test(id)) { alert("Enter a numeric Client ID."); return; }
    try {
      const resp = await apiPost({ action: "book_check_client", client_id: id });
      if (resp.success) {
        document.getElementById("book_client_id_confirm").value = id;
        document.getElementById("bookFormWrap").style.display = "block";
        showFlash(`Client verified: ${resp.client_name}`);
      } else {
        const proceedReenter = confirm(`${id} does not exist. Click OK to re-enter client ID or Cancel to create a new client account.`);
        if (proceedReenter) {
          document.getElementById("book_client_id").focus();
        } else {
          showTab("create");
        }
      }
    } catch (err) { alert("Network error: " + err); }
  });

  document.getElementById("bookSubmitBtn").addEventListener("click", async () => {
    const client_id = document.getElementById("book_client_id_confirm").value.trim();
    const event_date = document.getElementById("book_event_date").value;
    const food_order = document.getElementById("book_food_order").value.trim();
    if (!/^\d+$/.test(client_id)) { alert("Client ID missing or invalid."); return; }
    if (!event_date) { alert("Select event date."); return; }
    if (!food_order) { alert("Enter food order."); return; }
    if (!confirm("Do you want to continue booking the catering event? OK to proceed, Cancel to abort.")) return;
    try {
      const resp = await apiPost({ action: "book_complete", client_id, event_date, food_order });
      if (resp.success) {
        alert(`Catering event has been booked. Catering ID: ${resp.catering_id}`);
        showFlash(`Catering booked. Catering ID: ${resp.catering_id}`);
        document.getElementById("book_client_id").value = "";
        document.getElementById("bookFormWrap").style.display = "none";
        loadSearchTable();
        showTab("book");
      } else alert(resp.message || "Booking failed.");
    } catch (err) { alert("Network error: " + err); }
  });

  // CANCEL flow
  document.getElementById("cancelCheckBtn").addEventListener("click", async () => {
    const cid = document.getElementById("cancel_catering_id").value.trim();
    if (!/^\d+$/.test(cid)) { alert("Enter numeric Catering ID."); return; }
    try {
      const resp = await apiPost({ action: "cancel_check", catering_id: cid });
      if (!resp.success) { alert(resp.message || "Booking not found."); return; }
      const ok = confirm(`Confirm canceling booking for Caterer ID ${resp.caterer_id}, Client ID ${resp.client_id}, Catering ID ${cid}?`);
      if (ok) {
        const r2 = await apiPost({ action: "cancel_confirm", catering_id: cid });
        if (r2.success) {
          alert(`Catering event exists and has been cancelled. Caterer ID: ${resp.caterer_id}, Client ID: ${resp.client_id}, Catering ID: ${cid}`);
          showFlash(`Booking cancelled for Catering ID ${cid}`);
          loadSearchTable();
          showTab("cancel");
        } else alert(r2.message || "Cancel failed.");
      } else alert("Cancellation aborted.");
    } catch (err) { alert("Network error: " + err); }
  });

  // REQUEST submit
  document.getElementById("requestSubmitBtn").addEventListener("click", async () => {
    const cid = document.getElementById("request_catering_id").value.trim();
    const type = document.getElementById("supply_type").value.trim();
    const qty = document.getElementById("supply_qty").value.trim();
    if (!/^\d+$/.test(cid)) { alert("Enter numeric Catering ID."); return; }
    if (!type) { alert("Enter supply type."); return; }
    if (!/^\d+$/.test(qty) || parseInt(qty) < 1) { alert("Enter a positive quantity."); return; }
    if (!confirm("Confirm you want to request the additional services?")) return;
    try {
      const resp = await apiPost({ action: "request_submit", catering_id: cid, supply_type: type, quantity: qty });
      if (resp.success) {
        alert("Additional services were added to the catering event booking.");
        showFlash("Additional services requested.");
        loadSearchTable();
        showTab("request");
      } else alert(resp.message || "Request failed.");
    } catch (err) { alert("Network error: " + err); }
  });

  // UPDATE submit
  document.getElementById("updateSubmitBtn").addEventListener("click", async () => {
    const cid = document.getElementById("update_catering_id").value.trim();
    const type = document.getElementById("update_supply_type").value.trim();
    const qty = document.getElementById("update_supply_qty").value.trim();
    if (!/^\d+$/.test(cid)) { alert("Enter numeric Catering ID."); return; }
    if (!type) { alert("Enter supply type."); return; }
    if (!/^\d+$/.test(qty) || parseInt(qty) < 1) { alert("Enter a positive quantity."); return; }
    const ok = confirm("Are you sure you wish to update the client's additional services?");
    if (!ok) return;
    try {
      const resp = await apiPost({ action: "update_submit", catering_id: cid, supply_type: type, quantity: qty });
      if (resp.success) {
        alert("Additional services record was updated.");
        showFlash("Additional services updated.");
        loadSearchTable();
        showTab("update");
      } else alert(resp.message || "Update failed.");
    } catch (err) { alert("Network error: " + err); }
  });

  // CREATE client
  document.getElementById("createClientBtn").addEventListener("click", async () => {
    const fname = document.getElementById("create_fname").value.trim();
    const lname = document.getElementById("create_lname").value.trim();
    const cid = document.getElementById("create_client_id").value.trim();
    if (!/^[A-Za-z]+$/.test(fname)) { alert("Enter valid client first name."); return; }
    if (!/^[A-Za-z]+$/.test(lname)) { alert("Enter valid client last name."); return; }
    if (!/^\d{4}$/.test(cid)) { alert("Client ID must be 4 digits."); return; }
    try {
      const resp = await apiPost({ action: "create_client_check", client_id: cid, fname, lname });
      if (resp.success) {
        alert("New Client Account created. Now enter personal information.");
        showFlash("Client created. Now enter personal information.");
        document.getElementById("createInfoWrap").style.display = "block";
      } else alert(resp.message || "Create failed.");
    } catch (err) { alert("Network error: " + err); }
  });

  document.getElementById("createClientInfoBtn").addEventListener("click", async () => {
    const cid = document.getElementById("create_client_id").value.trim();
    const sn = document.getElementById("ci_street_number").value.trim();
    const sname = document.getElementById("ci_street_name").value.trim();
    const city = document.getElementById("ci_city").value.trim();
    const state = document.getElementById("ci_state").value.trim();
    const zip = document.getElementById("ci_zip").value.trim();
    const phone = document.getElementById("ci_phone").value.trim();
    if (!sn || !sname || !city || !state || !zip) { alert("Fill all address fields."); return; }
    if (!/^[A-Za-z]{2}$/.test(state)) { alert("State must be two letters."); return; }
    if (!/^\d{3}[- ]\d{3}[- ]\d{4}(?: ext \d+)?$/.test(phone)) { alert("Phone must match format 555-555-5555 ext 555."); return; }
    try {
      const resp = await apiPost({
        action: "create_client_info",
        client_id: cid,
        street_number: sn,
        street_name: sname,
        city, state, zip, phone
      });
      if (resp.success) {
        alert("New Client Information Record created.");
        showFlash("Client personal info created.");
        document.getElementById("createInfoWrap").style.display = "none";
        loadSearchTable();
        showTab("create");
      } else alert(resp.message || "Create client info failed.");
    } catch (err) { alert("Network error: " + err); }
  });
});
