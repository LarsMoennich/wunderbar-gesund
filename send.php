<?php
declare(strict_types=1);

$recipient = 'lars@wunderbar-gesund.de';
$subject = 'Neue Anfrage ueber wunderbar-gesund.de';

function clean_input(string $value): string
{
    $value = trim($value);
    $value = str_replace(["\r", "\n"], ' ', $value);
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function redirect_with_status(string $status): void
{
    header('Location: /?kontakt=' . rawurlencode($status) . '#kontakt');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_with_status('error');
}

if (!empty($_POST['website'] ?? '')) {
    redirect_with_status('ok');
}

$name = clean_input((string)($_POST['name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$phone = clean_input((string)($_POST['phone'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

if (
    $name === ''
    || $message === ''
    || strpos($email, "\r") !== false
    || strpos($email, "\n") !== false
    || !filter_var($email, FILTER_VALIDATE_EMAIL)
) {
    redirect_with_status('error');
}

$safeEmail = filter_var($email, FILTER_SANITIZE_EMAIL);
$safeMessage = trim($message);

$body = implode("\n", [
    'Neue Anfrage ueber wunderbar-gesund.de',
    '',
    'Name: ' . html_entity_decode($name, ENT_QUOTES, 'UTF-8'),
    'E-Mail: ' . $safeEmail,
    'Telefon: ' . ($phone !== '' ? html_entity_decode($phone, ENT_QUOTES, 'UTF-8') : 'nicht angegeben'),
    '',
    'Nachricht:',
    $safeMessage,
]);

$headers = [
    'From: wunderbar gesund <noreply@wunderbar-gesund.de>',
    'Reply-To: ' . $safeEmail,
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];

$sent = mail($recipient, $subject, $body, implode("\r\n", $headers));

redirect_with_status($sent ? 'ok' : 'error');
