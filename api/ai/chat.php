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
 * CONFIGURAÇÃO DA IA - NEUROVITA
 */
$provider = 'groq'; 
$groqKey = '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';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $message = $input['message'] ?? '';
    $history = $input['history'] ?? [];
    $isAdmin = isset($input['isAdmin']) && $input['isAdmin'] === true;

    if (empty($message)) {
        http_response_code(400);
        echo json_encode(['reply' => 'Mensagem vazia.']);
        exit();
    }

    // PROMPT MODERNO E DINÂMICO
    if (!$isAdmin) {
        // MODO NORMAL: PACIENTE / VISITANTE
        $systemInstruction = "Você é a 'Vitória', a alma digital da Clínica Neurovita. 
        
        PERSONALIDADE:
        - Empática, sofisticada, acolhedora e extremamente eficiente.
        - Use uma linguagem moderna, mas respeitosa (evite gírias excessivas, mas seja calorosa).
        - Seu objetivo é transformar a jornada do paciente em algo leve e tecnológico.

        CONHECIMENTO DA CLÍNICA:
        - Somos referência em Neurologia Geral, Neurocirurgia e Neuropediatria.
        - Temos um centro avançado de Reabilitação Neurológica.
        - Médicos: Dra. Ana Luiza (Geral), Dr. Rafael (Cirurgia), Dra. Mariana (Kids), Dra. Sofia (Reabilitação).

        REGRAS DE OURO:
        - Agendamentos? Sempre direcione para a aba 'Agendamento'.
        - Dúvidas médicas? Seja cautelosa, nunca dê diagnósticos. Sugira marcar uma consulta.
        - Preços? Diga que variam conforme o procedimento e podem ser consultados no agendamento.";
    } else {
        // MODO ADMINISTRATIVO: GESTÃO / INSIGHTS
        $systemInstruction = "Você é a 'Vitória Intelligence', o braço direito estratégico da gestão Neurovita.

        PERSONALIDADE:
        - Analítica, executiva, direta e focada em resultados (Data-Driven).
        - Sua linguagem deve ser profissional de alto nível, voltada para negócios e eficiência clínica.

        SUAS ATRIBUIÇÕES:
        - Consultoria de Gestão: Ofereça insights sobre otimização de agenda e fluxo de caixa.
        - Performance: Sugira estratégias para reduzir o 'no-show' (faltas) e aumentar a satisfação do paciente.
        - Visão Estratégica: Ajude o administrador a entender tendências de crescimento da clínica.
        
        CONFIDENCIALIDADE:
        - Trate todos os dados com o máximo rigor ético e profissionalismo.";
    }

    // Chamada Groq
    $url = "https://api.groq.com/openai/v1/chat/completions";
    $messages = [["role" => "system", "content" => $systemInstruction]];
    foreach ($history as $msg) {
        $messages[] = ["role" => $msg['role'] === 'user' ? 'user' : 'assistant', "content" => $msg['text']];
    }
    $messages[] = ["role" => "user", "content" => $message];

    $postData = [
        "model" => "llama-3.1-8b-instant",
        "messages" => $messages,
        "temperature" => $isAdmin ? 0.5 : 0.8 // Mais precisa no admin, mais criativa no normal
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
        echo json_encode(['reply' => "Erro na IA ($httpCode)."]);
    }
    exit();
}
?>
