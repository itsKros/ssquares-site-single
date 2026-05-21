<?php
/**
 * contact.php � Ssquares Tech Contact Form Handler
 * Sends email via Gmail API using OAuth2 + cURL
 * Verifies reCAPTCHA v2 via cURL
 */

require __DIR__ . '/config.php';

// -- CORS ----------------------------------------------------------
$corsOrigin = env('CORS_ORIGIN', 'https://www.ssquares.co.in');
header("Access-Control-Allow-Origin: $corsOrigin");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// -- CONFIG (loaded from .env via config.php) ----------------------
define('RECAPTCHA_SECRET',    env('RECAPTCHA_SECRET'));
define('CLIENT_ID',           env('GMAIL_CLIENT_ID'));
define('CLIENT_SECRET',       env('GMAIL_CLIENT_SECRET'));
define('GMAIL_REFRESH_TOKEN', env('GMAIL_REFRESH_TOKEN'));
define('GMAIL_FROM',          env('GMAIL_FROM'));
define('TO_EMAIL',            env('TO_EMAIL'));

// -- GET = health check --------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(["success" => true, "message" => "Contact API is alive."]);
    exit();
}

// -- POST only -----------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
    exit();
}

// -- Parse body ----------------------------------------------------
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid request body."]);
    exit();
}

// -- Sanitise & validate -------------------------------------------
$name      = isset($data['name'])           ? trim(strip_tags($data['name']))    : '';
$email     = isset($data['email'])          ? trim(strip_tags($data['email']))   : '';
$message   = isset($data['message'])        ? trim(strip_tags($data['message'])) : '';
$recaptcha = isset($data['recaptchaToken']) ? trim($data['recaptchaToken'])      : '';
$remoteip  = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR']           : '';

if (!$name || !$email || !$message || !$recaptcha) {
    http_response_code(422);
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(["success" => false, "message" => "Invalid email address."]);
    exit();
}

if (strlen($name) > 100 || strlen($email) > 150 || strlen($message) > 3000) {
    http_response_code(422);
    echo json_encode(["success" => false, "message" => "Input too long."]);
    exit();
}

// -- Verify reCAPTCHA via cURL -------------------------------------
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => 'https://www.google.com/recaptcha/api/siteverify',
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => http_build_query([
        'secret'   => RECAPTCHA_SECRET,
        'response' => $recaptcha,
        'remoteip' => $remoteip,
    ]),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 10,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$rc_response = curl_exec($ch);
$rc_error    = curl_error($ch);
curl_close($ch);

if (!$rc_error && $rc_response !== false) {
    $rc_data = json_decode($rc_response, true);
    if (!$rc_data || !$rc_data['success']) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "reCAPTCHA check failed. Please try again."]);
        exit();
    }
} else {
    error_log("reCAPTCHA cURL error: " . $rc_error);
}

// -- Step 1: Get fresh access token using refresh token ------------
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => 'https://oauth2.googleapis.com/token',
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => http_build_query([
        'client_id'     => CLIENT_ID,
        'client_secret' => CLIENT_SECRET,
        'refresh_token' => GMAIL_REFRESH_TOKEN,
        'grant_type'    => 'refresh_token',
    ]),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$token_response = curl_exec($ch);
$token_error    = curl_error($ch);
curl_close($ch);

if ($token_error || !$token_response) {
    error_log("OAuth token error: " . $token_error);
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Authentication error. Please try again later."]);
    exit();
}

$token_data   = json_decode($token_response, true);
$access_token = isset($token_data['access_token']) ? $token_data['access_token'] : null;

if (!$access_token) {
    error_log("No access token received: " . $token_response);
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Authentication error. Please try again later."]);
    exit();
}

// -- Step 2: Build RFC 2822 email, base64url encoded ---------------
$html_body = "
<html>
<body style='font-family:Arial,sans-serif;color:#231f20;line-height:1.6;max-width:600px'>
  <h2 style='margin-bottom:8px'>New message from Ssquares website</h2>
  <hr style='border:none;border-top:1px solid #eee;margin-bottom:20px'>
  <p><strong>Name:</strong> " . htmlspecialchars($name) . "</p>
  <p><strong>Email:</strong> <a href='mailto:" . htmlspecialchars($email) . "'>" . htmlspecialchars($email) . "</a></p>
  <p><strong>Message:</strong></p>
  <div style='background:#f5f0eb;padding:16px;border-left:3px solid #747efe;margin-top:8px'>
    " . nl2br(htmlspecialchars($message)) . "
  </div>
  <hr style='border:none;border-top:1px solid #eee;margin-top:28px'>
  <p style='font-size:12px;color:#999'>Sent via ssquares.co.in contact form</p>
</body>
</html>
";

$boundary   = md5(time());
$raw_email  = "From: Ssquares Website <" . GMAIL_FROM . ">\r\n";
$raw_email .= "To: " . TO_EMAIL . "\r\n";
$raw_email .= "Reply-To: $name <$email>\r\n";
$raw_email .= "Subject: New Contact Form Submission - $name\r\n";
$raw_email .= "MIME-Version: 1.0\r\n";
$raw_email .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n\r\n";
$raw_email .= "--$boundary\r\n";
$raw_email .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
$raw_email .= "Name: $name\nEmail: $email\nMessage:\n$message\r\n\r\n";
$raw_email .= "--$boundary\r\n";
$raw_email .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
$raw_email .= $html_body . "\r\n\r\n";
$raw_email .= "--$boundary--";

// Gmail API requires base64url (not standard base64)
$encoded = rtrim(strtr(base64_encode($raw_email), '+/', '-_'), '=');

// -- Step 3: Send via Gmail API ------------------------------------
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode(['raw' => $encoded]),
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $access_token,
        'Content-Type: application/json',
    ],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 20,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$send_response = curl_exec($ch);
$send_error    = curl_error($ch);
$http_status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($send_error) {
    error_log("Gmail send error: " . $send_error);
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to send. Please try again later."]);
    exit();
}

$send_data = json_decode($send_response, true);

if ($http_status === 200 && isset($send_data['id'])) {
    echo json_encode(["success" => true, "message" => "Message sent successfully."]);
} else {
    error_log("Gmail API error: " . $send_response);
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to send. Please try again later.",
        "debug"   => $send_data // remove this line after confirming it works
    ]);
}