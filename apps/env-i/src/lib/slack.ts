export async function sendToSlack(webhookUrl: string, message: { text?: string; blocks?: any[] }) {
  if (!webhookUrl) return;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error('Slack Webhook Error:', response.statusText);
      throw new Error(`Slack API error: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to send Slack message:', error);
    // Silent fail to not break app flow, but log it
  }
}

export function formatCriticalStockMessage(productName: string, currentStock: number, minStock: number, productUrl: string) {
    return {
        blocks: [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "🚨 Kritik Stok Uyarısı",
                    "emoji": true
                }
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": `*Ürün:*\n${productName}`
                    },
                    {
                        "type": "mrkdwn",
                        "text": `*Mevcut Stok:*\n${currentStock} Adet`
                    }
                ]
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": `*Minimum Limit:*\n${minStock} Adet`
                    },
                    {
                        "type": "mrkdwn",
                        "text": "*Durum:*\nAcil Sipariş Gerekli"
                    }
                ]
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Ürüne Git",
                            "emoji": true
                        },
                        "url": productUrl,
                        "style": "danger"
                    }
                ]
            }
        ]
    };
}
