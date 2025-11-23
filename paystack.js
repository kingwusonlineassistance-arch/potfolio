function validateInputs() {
  const email = document.getElementById("email").value;
  const receiverPhone = document.getElementById("phone").value;
  const senderPhone = document.getElementById("senderPhone").value;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^233[0-9]{9}$/;

  if (!emailPattern.test(email)) {
    showAlert("Invalid Email", "Please enter a valid email address.");
    return false;
  }

  if (!phonePattern.test(receiverPhone)) {
    showAlert("Invalid Phone Number", "Use format 233XXXXXXXXX for Ghanaian numbers.");
    return false;
  }
  
  if (!phonePattern.test(senderPhone)) {
    showAlert("Invalid Sender Phone Number", "Use format 233XXXXXXXXX for Ghanaian numbers.");
    return false;
  }

  return true;
}

function showAlert(title, text) {
  Swal.fire({
    icon: "warning",
    title: title,
    text: text,
    showClass: { popup: 'animate__animated animate__fadeInDown' },
    hideClass: { popup: 'animate__animated animate__fadeOutUp' }
  });
}

function payNow() {
  if (!validateInputs()) return; // Validate inputs before proceeding

  const email = document.getElementById("email").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const network = document.getElementById("network").value;
  const size = document.getElementById("bundleSize").value;
  const receiverPhone = document.getElementById("phone").value;
  const senderPhone = document.getElementById("senderPhone").value;

  const finalAmount = Math.round(amount * 1.02 * 100);

  PaystackPop.setup({
    key:"pk_live_ddf8670224e5fd82618ef872c2be73b5502ffc2a  ", // Replace with your real key in production
    email: email,
    amount: finalAmount,
    currency: "GHS",
    label: "KingWus Bundle",
    metadata: {
      custom_fields: [
        { display_name: "Network", variable_name: "network", value: network },
        { display_name: "Receiver Phone", variable_name: "phone", value: receiverPhone },
        { display_name: "Your Phone", variable_name: "sender_phone", value: senderPhone },
        { display_name: "Bundle", variable_name: "bundle_size", value: size }
      ]
    },
    callback: function (response) {
      Swal.fire({
        icon: "success",
        title: "🎉 Payment Successful!",
        html: `
          <p><strong>Reference:</strong> ${response.reference}</p>
          <p>✅ ${size} on ${network} for ${receiverPhone}</p>`,
        confirmButtonText: "OK",
        showClass: { popup: 'animate__animated animate__fadeInDown' },
        hideClass: { popup: 'animate__animated animate__fadeOutUp' }
      }).then(() => {
        Swal.fire({
          icon: "info",
          title: "📡 Processing...",
          text: "Data bundle is being delivered. Please wait.",
          timer: 4000,
          showConfirmButton: false,
          showClass: { popup: 'animate__animated animate__fadeIn' },
          hideClass: { popup: 'animate__animated animate__fadeOut' }
        });
      });
    },
    onClose: function () {
      Swal.fire({
        icon: "info",
        title: "Cancelled",
        text: "Payment was cancelled.",
        showClass: { popup: 'animate__animated animate__fadeInDown' },
        hideClass: { popup: 'animate__animated animate__fadeOutUp' }
      });
    }
  }).openIframe();
}
