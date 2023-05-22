require('dotenv/config');
const { Client, GatewayIntentBits} = require('discord.js');
const { Configuration, OpenAIApi} = require('openai');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});
  
client.on('ready', () => {
    console.log('Bot is online!')
});

const configuration = new Configuration({
    apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !==process.env.CHANNEL_ID) return;
    if (message.content.startsWith("!")) return;

    let conversationLog = [{ 
        role: 'system', content: 'You are a friendly chatbot who assists anyone with their needs.'
    }];
    
    try {
        await message.channel.sendTyping();

        let prevMessages = await message.channel.messages.fetch({limit: 15});
        prevMessages.reverse();

        prevMessages.forEach((msg) => {
            if (message.content.startsWith(("!"))) return;
            if (msg.author.id !== client.user.id && message.author.bot) return;
            if (msg.author.id !== message.author.id) return;
            
            conversationLog.push({
                role: 'user',
                content: msg.content,
            }); 
        });

        const result = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: conversationLog,
        }) 
        .catch((error) => {
            console.log(`OpenAI ERR: ${error}`);
        });

        message.reply(result.data.choices[0].messages);
    } catch (error) {
        console.log(`Error: ${error}`);
    }
});

client.login(process.env.TOKEN)