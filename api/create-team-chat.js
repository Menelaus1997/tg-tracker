export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectName, projectId, members } = req.body;

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const GROUP_ID = process.env.TELEGRAM_GROUP_ID;

  if (!BOT_TOKEN || !GROUP_ID) {
    return res.status(500).json({ 
      success: false, 
      error: 'Не налаштовані змінні TELEGRAM_BOT_TOKEN або TELEGRAM_GROUP_ID у Vercel.' 
    });
  }

  try {
    const linkName = `${projectName} (${projectId})`;

    // Створюємо посилання-запрошення через Telegram Bot API
    const tgResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createChatInviteLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: GROUP_ID,
        name: linkName,
        creates_join_request: false
      })
    });

    const tgData = await tgResponse.json();

    if (!tgData.ok) {
      return res.status(400).json({ success: false, error: tgData.description });
    }

    const inviteLink = tgData.result.invite_link;

    const textList = (members || [])
      .map((m) => `• ${m.fullName} (${m.role}): ${m.telegramUsername ? `@${m.telegramUsername}` : 'без ТГ'}`)
      .join('\n');

    const fullMessage = `📌 *Проект:* ${projectName} (${projectId})\n\n` +
      `👥 *Склад команди:*\n${textList}\n\n` +
      `🔗 *Приєднатися до чату:* ${inviteLink}`;

    return res.status(200).json({
      success: true,
      inviteLink: inviteLink,
      messageText: fullMessage
    });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
