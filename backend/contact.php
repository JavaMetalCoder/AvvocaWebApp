<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$to_email = "avvocatopasqualegranata@gmail.com";
$from_email = "noreply@avvoca.net";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Metodo non consentito']);
    exit;
}

function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}
function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}
$nome = sanitize_input($_POST['nome'] ?? '');
$email = sanitize_input($_POST['email'] ?? '');
$descrizione = sanitize_input($_POST['descrizione'] ?? '');

$errors = [];
if (empty($nome) || strlen($nome) < 2) { $errors[] = 'Nome non valido'; }
if (empty($email) || !validate_email($email)) { $errors[] = 'Email non valida'; }
if (empty($descrizione) || strlen($descrizione) < 10) { $errors[] = 'Descrizione troppo breve (minimo 10 caratteri)'; }

if (!empty($errors)) {
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

$subject = "Nuova richiesta dal sito Avvocato Pasquale Granata";
$email_body = "
Nuova richiesta dal sito:
Nome: $nome
Email: $email
Messaggio: $descrizione
";
$headers = "From: $from_email\r\nReply-To: $email\r\n";

$mail_sent = mail($to_email, $subject, $email_body, $headers);

if ($mail_sent) {
    echo json_encode(['success' => true, 'message' => 'Richiesta inviata con successo!']);
} else {
    echo json_encode(['success' => false, 'error' => 'Errore nell\'invio. Riprova più tardi.']);
}
?>
