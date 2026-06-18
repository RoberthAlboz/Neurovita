<?php
// Permitir CORS e JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * CONFIGURAÇÃO DA IA (ESCOLHA UMA OPÇÃO)
 */
$provider = 'groq'; // Opções: 'gemini' ou 'groq'

// CHAVES (Substitua pela sua)
// Para ativar a IA, descomente e preencha uma das chaves abaixo:
$geminiKey = ''; // 'AQ.Ab8RN6Lef8nIWoK17IpgDMipOVjYSg7QJmwZ028P-LjGy6KZWg' 
$groqKey = ''; // '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' // Obtenha grátis em: https://console.groq.com/keys

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $message = $input['message'] ?? '';
    $history = $input['history'] ?? [];

    if (empty($message)) {
        http_response_code(400);
        echo json_encode(['reply' => 'Mensagem vazia.']);
        exit();
    }

    // Contexto da Recepção Neurovita
    $isAdmin = isset($input['isAdmin']) && $input['isAdmin'] === true;
    
    $systemInstruction = "Você é a 'Vitória', a assistente virtual inteligente da Clínica Neurovita. Seu tom deve ser profissional, acolhedor e altamente eficiente.

CONTEXTO DA CLÍNICA:
- Especialidades: Neurologia Geral, Neurocirurgia e Neuropediatria.
- Reabilitação: Temos uma seção exclusiva de Reabilitação Neurológica com foco em fisioterapia neurofuncional.
- Agendamento: Sempre oriente o usuário a realizar agendamentos diretamente pela aba 'Agendamento' no menu superior.
- Profissionais Atuais: Dra. Ana Luiza Martins (Neurologia Geral), Dr. Rafael Monteiro (Neurocirurgia), Dra. Mariana Costa (Neuropediatria) e Dra. Sofia Navarro (Reabilitação).

DIRETRIZES DE RESPOSTA:
- Seja breve e direta.
- Nunca invente especialidades ou médicos que não constam na lista acima.
- Se o usuário perguntar sobre preços, informe que os valores aparecem na tela de agendamento após selecionar o tipo de serviço.";

    if ($isAdmin) {
        $systemInstruction .= "\n\nMODO ADMINISTRATIVO ATIVADO:
- Você agora atua como consultora de gestão da clínica.
- Forneça insights sobre o fluxo de pacientes, performance financeira e eficiência operacional.
- Você pode analisar dados de faturamento (quando fornecidos no contexto) e sugerir estratégias para reduzir faltas ou otimizar a agenda.
- Mantenha a confidencialidade e o tom executivo.";
    }

    if ($provider === 'groq') {
        if (empty($groqKey)) {
            echo json_encode(['reply' => "Olá! Sou a Vitória. Por favor, configure sua chave gratuita do Groq no arquivo api/ai/chat.php para conversarmos!"]);
            exit();
        }
        
        $url = "https://api.groq.com/openai/v1/chat/completions";
        $messages = [["role" => "system", "content" => $systemInstruction]];
        foreach ($history as $msg) {
            $messages[] = ["role" => $msg['role'] === 'user' ? 'user' : 'assistant', "content" => $msg['text']];
        }
        $messages[] = ["role" => "user", "content" => $message];

        $postData = [
            "model" => "llama-3.1-8b-instant",
            "messages" => $messages,
            "temperature" => 0.7
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $groqKey
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200) {
            $result = json_decode($response, true);
            $aiText = $result['choices'][0]['message']['content'] ?? "Erro ao processar.";
            echo json_encode(['reply' => $aiText]);
        } else {
            echo json_encode(['reply' => "Erro Groq ($httpCode): " . $response]);
        }
        exit();
    } else {
        // Lógica Gemini (Padrão)
        if (empty($geminiKey) || $geminiKey === 'SUA_CHAVE_AQUI') {
            echo json_encode(['reply' => "Olá! Por favor, configure sua chave do Gemini ou Groq no arquivo api/ai/chat.php."]);
            exit();
        }

        $contents = [];
        foreach ($history as $msg) {
            $contents[] = ['role' => $msg['role'] === 'user' ? 'user' : 'model', 'parts' => [['text' => $msg['text']]]];
        }
        $contents[] = ['role' => 'user', 'parts' => [['text' => "INSTRUÇÃO: " . $systemInstruction . "\n\nPERGUNTA: " . $message]]];

        // Ajustado para v1beta que é mais comum para gemini-1.5-flash ou endpoint v1 correto
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $geminiKey;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['contents' => $contents]));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200) {
            $result = json_decode($response, true);
            $aiText = $result['candidates'][0]['content']['parts'][0]['text'] ?? "Erro ao processar.";
            echo json_encode(['reply' => $aiText]);
        } else {
            echo json_encode(['reply' => "Erro Gemini ($httpCode). Motivo: " . (json_decode($response, true)['error']['message'] ?? 'Desconhecido')]);
        }
        exit();
    }
}
?>
