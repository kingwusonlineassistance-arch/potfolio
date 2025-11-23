<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit;
}

// DB Connection
$host = "localhost";
$user = "root"; 
$pass = ""; 
$db   = "modern_app";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

// Fetch logged-in user
$user_id = $_SESSION['user_id'];
$userQuery = $conn->query("SELECT * FROM users WHERE id='$user_id'");
$user = $userQuery->fetch_assoc();

// Wallet addresses
$usdtAddress = "TYOUR_USDT_ADDRESS"; // Replace with actual USDT address
$trxAddress = "TYOUR_TRX_ADDRESS";   // Replace with actual TRX address

// Handle deposit submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['method'])) {
    $method = $_POST['method'];
    $currency = $_POST['currency'];
    $amount = floatval($_POST['amount']);
    $network = $_POST['network'] ?? null;
    $mobile_number = $_POST['mobile_number'] ?? null;
    $proofFile = null;

    // Handle file upload
    if (isset($_FILES['proof']) && $_FILES['proof']['error'] === 0) {
        $ext = pathinfo($_FILES['proof']['name'], PATHINFO_EXTENSION);
        $filename = "proof_" . time() . "." . $ext;
        $targetDir = "uploads/";
        if (!is_dir($targetDir)) mkdir($targetDir, 0777, true);
        $targetFile = $targetDir . $filename;
        if (move_uploaded_file($_FILES['proof']['tmp_name'], $targetFile)) {
            $proofFile = $filename;
        }
    }

    // Insert deposit
    $stmt = $conn->prepare("INSERT INTO user_deposits (user_id, method, amount, currency, network, mobile_number, proof) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isdssss", $user_id, $method, $amount, $currency, $network, $mobile_number, $proofFile);
    $stmt->execute();
    $stmt->close();
}

// Fetch user's deposit history
$historyQuery = $conn->query("SELECT * FROM user_deposits WHERE user_id='$user_id' ORDER BY created_at DESC");

// Fetch all user transactions for admin tracking
$allTransactions = $conn->query("SELECT d.*, u.phone FROM user_deposits d JOIN users u ON d.user_id=u.id ORDER BY d.created_at DESC");
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Deposit Funds - ModernApp</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
:root {
  --primary: #6366f1;
  --secondary: #ec4899;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --dark: #1f2937;
  --light: #f9fafb;
}
body {font-family: 'Inter', system-ui, sans-serif; background: #f3f6fb; color: var(--dark); min-height:100vh;}
.deposit-container {max-width: 950px; margin:40px auto; background:white; border-radius:16px; padding:30px; box-shadow:0 8px 32px rgba(0,0,0,0.08);}
.payment-method {border:2px solid #e5e7eb; border-radius:12px; padding:20px; margin-bottom:20px; cursor:pointer; transition:all 0.3s ease;}
.payment-method.selected {border-color:var(--primary); background: rgba(99,102,241,0.05);}
.payment-method:hover {box-shadow:0 4px 12px rgba(0,0,0,0.1);}
.payment-icon {font-size:2rem; margin-bottom:10px;}
.usdt-icon {color:#26a17b;}
.trx-icon {color:#e22332;}
.mobile-icon {color:#10b981;}
.form-control {border-radius:8px; padding:12px 15px; border:1px solid #e5e7eb; margin-bottom:15px;}
.btn-primary {background:var(--primary); border:none; border-radius:8px; padding:12px 25px; font-weight:600;}
.qr-code {width:150px; height:150px; margin:20px auto; display:block;}
.transaction-details {background:#f9fafb; border-radius:12px; padding:20px; margin-top:30px;}
.file-upload {border:2px dashed #e5e7eb; border-radius:8px; padding:20px; text-align:center; cursor:pointer; transition:all 0.3s; margin-bottom:20px;}
.file-upload:hover {border-color:var(--primary); background: rgba(99,102,241,0.05);}
.file-preview {display:none; margin-top:15px; text-align:center;}
.file-preview img {max-width:100%; max-height:200px; border-radius:8px;}
#proofUpload {display:none;}
@media (max-width: 768px) {
  .deposit-container {margin:20px; padding:20px;}
  .payment-method {padding:15px;}
}
</style>
</head>
<body>

<div class="container">
  <div class="deposit-container">
    <div class="text-center mb-4">
      <i class="fas fa-money-bill-wave fa-3x text-success mb-3"></i>
      <h2>Deposit Funds</h2>
      <p class="text-muted">Select a payment method and follow the instructions</p>
    </div>

    <div class="row">
      <div class="col-md-6">
        <!-- Payment Methods -->
        <div class="payment-method" id="usdt-method" onclick="selectMethod('usdt')">
          <div class="text-center">
            <i class="fas fa-coins usdt-icon payment-icon"></i>
            <h4>USDT (TRC20)</h4>
            <p class="text-muted">Deposit with USDT on TRON network</p>
          </div>
        </div>

        <div class="payment-method" id="trx-method" onclick="selectMethod('trx')">
          <div class="text-center">
            <i class="fab fa-old-republic trx-icon payment-icon"></i>
            <h4>TRX</h4>
            <p class="text-muted">Deposit with TRON coins</p>
          </div>
        </div>

        <div class="payment-method" id="mobile-method" onclick="selectMethod('mobile')">
          <div class="text-center">
            <i class="fas fa-mobile-alt mobile-icon payment-icon"></i>
            <h4>Mobile Money</h4>
            <p class="text-muted">Deposit with MTN, Vodafone, or AirtelTigo</p>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <form id="depositForm" method="POST" enctype="multipart/form-data">
          <input type="hidden" name="method" id="form-method">
          <input type="hidden" name="currency" id="form-currency">
          <input type="hidden" name="network" id="form-network">
          <input type="hidden" name="mobile_number" id="form-mobile-number">

          <div id="form-container">
            <div class="text-center py-5" id="select-msg">
              <p class="text-muted">Select a payment method to continue</p>
            </div>

            <!-- USDT -->
            <div id="usdt-form" style="display:none;">
              <h4>USDT Deposit</h4>
              <div class="text-center">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=<?php echo urlencode($usdtAddress); ?>" class="qr-code">
                <p><strong>USDT Address:</strong></p>
                <div class="input-group mb-3">
                  <input type="text" class="form-control" id="usdt-address" value="<?php echo $usdtAddress; ?>" readonly>
                  <button type="button" class="btn btn-outline-secondary" onclick="copyToClipboard('usdt-address')">
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
              <input type="number" class="form-control" name="amount" id="usdt-amount" placeholder="Amount USD" min="10" step="0.01" required>
            </div>

            <!-- TRX -->
            <div id="trx-form" style="display:none;">
              <h4>TRX Deposit</h4>
              <div class="text-center">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=<?php echo urlencode($trxAddress); ?>" class="qr-code">
                <p><strong>TRX Address:</strong></p>
                <div class="input-group mb-3">
                  <input type="text" class="form-control" id="trx-address" value="<?php echo $trxAddress; ?>" readonly>
                  <button type="button" class="btn btn-outline-secondary" onclick="copyToClipboard('trx-address')">
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
              <input type="number" class="form-control" name="amount" id="trx-amount" placeholder="Amount TRX" min="100" step="1" required>
            </div>

            <!-- Mobile -->
            <div id="mobile-form" style="display:none;">
              <h4>Mobile Money Deposit</h4>
              <select class="form-select mb-3" id="mobile-network" required>
                <option value="" disabled selected>Select network</option>
                <option value="MTN">MTN Mobile Money</option>
                <option value="VODAFONE">Vodafone Cash</option>
                <option value="AIRTELTIGO">AirtelTigo Money</option>
              </select>
              <input type="tel" class="form-control mb-3" id="mobile-number" placeholder="Mobile Number" required>
              <input type="number" class="form-control mb-3" name="amount" id="mobile-amount" placeholder="Amount GHS" min="10" step="0.01" required>
            </div>

            <div class="file-upload" onclick="document.getElementById('proofUpload').click()">
              <input type="file" name="proof" id="proofUpload" accept="image/*" onchange="previewImage(event)">
              <i class="fas fa-cloud-upload-alt fa-2x mb-2"></i>
              <p>Click to upload proof</p>
            </div>
            <div class="file-preview" id="imagePreview">
              <img id="previewImage" src="#" alt="Preview">
            </div>

            <button type="submit" class="btn btn-primary w-100 mt-2">Submit Deposit</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Deposit History -->
    <div class="transaction-details mt-5">
      <h4 class="mb-3">Your Deposit History</h4>
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Method</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Network</th>
            <th>Mobile Number</th>
            <th>Status</th>
            <th>Proof</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
        <?php
        if($historyQuery->num_rows > 0){
            $i = 1;
            while($row = $historyQuery->fetch_assoc()){
                echo "<tr>";
                echo "<td>".$i++."</td>";
                echo "<td>".$row['method']."</td>";
                echo "<td>".$row['amount']."</td>";
                echo "<td>".$row['currency']."</td>";
                echo "<td>".($row['network'] ?? '-')."</td>";
                echo "<td>".($row['mobile_number'] ?? '-')."</td>";
                echo "<td>".$row['status']."</td>";
                echo "<td>".($row['proof'] ? "<a href='uploads/".$row['proof']."' target='_blank'>View</a>" : "-")."</td>";
                echo "<td>".$row['created_at']."</td>";
                echo "</tr>";
            }
        } else {
            echo "<tr><td colspan='9' class='text-center'>No deposits yet</td></tr>";
        }
        ?>
        </tbody>
      </table>
    </div>

    <!-- All Users Transactions -->
    <div class="transaction-details mt-5">
      <h4 class="mb-3">All Users Transactions (Admin)</h4>
      <table class="table table-bordered table-sm table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>User Phone</th>
            <th>Method</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Network</th>
            <th>Mobile Number</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
        <?php
        if($allTransactions->num_rows > 0){
            $i = 1;
            while($row = $allTransactions->fetch_assoc()){
                echo "<tr>";
                echo "<td>".$i++."</td>";
                echo "<td>".$row['phone']."</td>";
                echo "<td>".$row['method']."</td>";
                echo "<td>".$row['amount']."</td>";
                echo "<td>".$row['currency']."</td>";
                echo "<td>".($row['network'] ?? '-')."</td>";
                echo "<td>".($row['mobile_number'] ?? '-')."</td>";
                echo "<td>".$row['status']."</td>";
                echo "<td>".$row['created_at']."</td>";
                echo "</tr>";
            }
        } else {
            echo "<tr><td colspan='9' class='text-center'>No transactions yet</td></tr>";
        }
        ?>
        </tbody>
      </table>
    </div>

  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script>
let selectedMethod = '';

function selectMethod(method){
    selectedMethod = method;
    document.getElementById('form-method').value = method;

    document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('selected'));
    document.getElementById(method + '-method').classList.add('selected');

    document.getElementById('usdt-form').style.display='none';
    document.getElementById('trx-form').style.display='none';
    document.getElementById('mobile-form').style.display='none';
    document.getElementById('select-msg').style.display='none';

    if(method=='usdt'){ document.getElementById('usdt-form').style.display='block'; document.getElementById('form-currency').value='USD'; }
    if(method=='trx'){ document.getElementById('trx-form').style.display='block'; document.getElementById('form-currency').value='TRX'; }
    if(method=='mobile'){ 
        document.getElementById('mobile-form').style.display='block'; 
        document.getElementById('form-currency').value='GHS';
        document.getElementById('form-network').value = '';
        document.getElementById('form-mobile-number').value = '';
    }
}

function copyToClipboard(id){
    const input = document.getElementById(id);
    input.select(); input.setSelectionRange(0,99999);
    navigator.clipboard.writeText(input.value);
    alert("Copied to clipboard!");
}

function previewImage(event){
    const file = event.target.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = function(e){
            document.getElementById('previewImage').src = e.target.result;
            document.getElementById('imagePreview').style.display='block';
        }
        reader.readAsDataURL(file);
    }
}

// Update hidden fields for mobile form
document.getElementById('mobile-network').addEventListener('change', function() {
    document.getElementById('form-network').value = this.value;
});
document.getElementById('mobile-number').addEventListener('input', function() {
    document.getElementById('form-mobile-number').value = this.value;
});
</script>
</body>
</html>
