require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const featureStatus = {
  gpt: true,
  gemini: true,
  perplexity: true
};

let autoRespondSettings = {};

const userDataFolder = path.join(__dirname, 'userData');

const commands = [
  new SlashCommandBuilder()
    .setName('gpt')
    .setDescription('GPT-3.5に質問する')
    .addStringOption(option => 
      option.setName('prompt')
        .setDescription('GPTへの質問内容')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('gemini')
    .setDescription('Geminiに質問する')
    .addStringOption(option => 
      option.setName('prompt')
        .setDescription('Geminiへの質問内容')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('perplexity')
    .setDescription('Perplexityに質問する')
    .addStringOption(option => 
      option.setName('prompt')
        .setDescription('Perplexityへの質問内容')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('toggle')
    .setDescription('機能のオン/オフを切り替える')
    .addStringOption(option =>
      option.setName('feature')
        .setDescription('切り替える機能')
        .setRequired(true)
        .addChoices(
          { name: 'GPT', value: 'gpt' },
          { name: 'Gemini', value: 'gemini' },
          { name: 'Perplexity', value: 'perplexity' }
        )),
  new SlashCommandBuilder()
    .setName('set_auto_respond')
    .setDescription('自動応答の設定を行う')
    .addChannelOption(option => 
      option.setName('channel')
        .setDescription('自動応答を行うチャンネルを選択する')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('ai')
        .setDescription('使用するAIを選択する')
        .setRequired(true)
        .addChoices(
          { name: 'GPT', value: 'gpt' },
          { name: 'Gemini', value: 'gemini' },
          { name: 'Perplexity', value: 'perplexity' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder()
    .setName('clear_history')
    .setDescription('会話履歴を削除する')
    .addStringOption(option =>
      option.setName('ai')
        .setDescription('削除するAIの履歴を選択する')
        .setRequired(true)
        .addChoices(
          { name: 'GPT', value: 'gpt' },
          { name: 'Gemini', value: 'gemini' },
          { name: 'Perplexity', value: 'perplexity' },
          { name: 'All', value: 'all' }
        ))
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function ensureUserFolder(userId) {
  const userFolder = path.join(userDataFolder, userId);
  await fs.mkdir(userFolder, { recursive: true });
  return userFolder;
}

async function loadConversationHistory(userId, aiType) {
  const userFolder = await ensureUserFolder(userId);
  const filePath = path.join(userFolder, `${aiType}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error('Error reading conversation history:', error);
    return [];
  }
}

async function saveConversationHistory(userId, aiType, history) {
  const userFolder = await ensureUserFolder(userId);
  const filePath = path.join(userFolder, `${aiType}.json`);
  await fs.writeFile(filePath, JSON.stringify(history, null, 2));
}

async function updateConversationHistory(userId, aiType, prompt, response) {
  const history = await loadConversationHistory(userId, aiType);
  history.push({ prompt, response });
  await saveConversationHistory(userId, aiType, history);
}

function catify(text) {
  return text.replace(/。/g, 'にゃ。').replace(/！/g, 'にゃ！').replace(/\?/g, 'にゃ？') + 'にゃ';
}

async function getGPTResponse(userId, prompt) {
  const history = await loadConversationHistory(userId, 'gpt');
  const messages = [
    { role: "system", content: "あなたは猫語で話す賢いアシスタントです。" },
    ...history.flatMap(h => [
      { role: "user", content: h.prompt },
      { role: "assistant", content: h.response }
    ]),
    { role: "user", content: prompt }
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages
  });

  const aiResponse = response.choices[0].message.content;
  await updateConversationHistory(userId, 'gpt', prompt, aiResponse);
  return aiResponse;
}

async function getGeminiResponse(userId, prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: "あなたは猫語で話す賢いアシスタントです。以下の質問に答えてください：" + prompt }] }
    ]
  });
  const aiResponse = result.response.text();
  await updateConversationHistory(userId, 'gemini', prompt, aiResponse);
  return aiResponse;
}

async function getPerplexityResponse(userId, prompt) {
  const history = await loadConversationHistory(userId, 'perplexity');
  const messages = [
    { role: 'system', content: 'あなたは猫語で話す賢いアシスタントです。' },
    ...history.flatMap(h => [
      { role: 'user', content: h.prompt },
      { role: 'assistant', content: h.response }
    ]),
    { role: 'user', content: prompt }
  ];

  const response = await axios.post('https://api.perplexity.ai/chat/completions', {
    model: 'llama-3.1-sonar-huge-128k-online',
    messages: messages
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  const aiResponse = response.data.choices[0].message.content;
  await updateConversationHistory(userId, 'perplexity', prompt, aiResponse);
  return aiResponse;
}

async function clearHistory(userId, aiType) {
  const userFolder = await ensureUserFolder(userId);
  const filePath = path.join(userFolder, `${aiType}.json`);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error deleting history:', error);
    }
  }
}

async function clearAllHistory(userId) {
  const userFolder = await ensureUserFolder(userId);
  try {
    const files = await fs.readdir(userFolder);
    for (const file of files) {
      await fs.unlink(path.join(userFolder, file));
    }
  } catch (error) {
    console.error('Error deleting all history:', error);
  }
}

client.once('ready', async () => {
  console.log('ボットが起動しました');

  try {
    console.log('スラッシュコマンドを登録中...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    console.log('スラッシュコマンドの登録が完了しました');
  } catch (error) {
    console.error('スラッシュコマンドの処理中にエラーが発生しました:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  const userId = interaction.user.id;

  if (commandName === 'gpt' || commandName === 'gemini' || commandName === 'perplexity') {
    if (!featureStatus[commandName]) {
      await interaction.reply(catify(`${commandName}機能は現在無効化されています。`));
      return;
    }
    await interaction.deferReply();
    const prompt = interaction.options.getString('prompt');
    try {
      let response;
      if (commandName === 'gpt') {
        response = await getGPTResponse(userId, prompt);
      } else if (commandName === 'gemini') {
        response = await getGeminiResponse(userId, prompt);
      } else if (commandName === 'perplexity') {
        response = await getPerplexityResponse(userId, prompt);
      }
      const sentMessage = await interaction.editReply(catify(response));
      await sentMessage.react('🔄');
      await sentMessage.react('🗑️');

      const filter = (reaction, user) => {
        return ['🔄', '🗑️'].includes(reaction.emoji.name) && user.id === interaction.user.id;
      };

      const collector = sentMessage.createReactionCollector({ filter, time: 60000 });

      collector.on('collect', async (reaction, user) => {
        if (reaction.emoji.name === '🔄') {
          await interaction.editReply('再生成中...');
          let newResponse;
          if (commandName === 'gpt') {
            newResponse = await getGPTResponse(userId, prompt);
          } else if (commandName === 'gemini') {
            newResponse = await getGeminiResponse(userId, prompt);
          } else if (commandName === 'perplexity') {
            newResponse = await getPerplexityResponse(userId, prompt);
          }
          await interaction.editReply(catify(newResponse));
        } else if (reaction.emoji.name === '🗑️') {
          await interaction.deleteReply();
        }
      });

    } catch (error) {
      console.error(`${commandName}エラー:`, error);
      await interaction.editReply(catify(`${commandName}からの応答中にエラーが発生しました。`));
    }
  } else if (commandName === 'toggle') {
    const feature = interaction.options.getString('feature');
    featureStatus[feature] = !featureStatus[feature];
    await interaction.reply(catify(`${feature}機能が${featureStatus[feature] ? '有効' : '無効'}になりました。`));
  } else if (commandName === 'set_auto_respond') {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({ content: '管理者権限が必要です！', ephemeral: true });
      return;
    }
    
    const channel = interaction.options.getChannel('channel');
    const ai = interaction.options.getString('ai');
    
    autoRespondSettings[channel.id] = ai;
    
    await interaction.reply(catify(`${channel.name}チャンネルで${ai}を使用した自動応答を設定しました！`));
  } else if (commandName === 'clear_history') {
    const ai = interaction.options.getString('ai');
    
    if (ai === 'all') {
      await clearAllHistory(userId);
      await interaction.reply(catify('全てのAIの会話履歴を削除しました！'));
    } else {
      await clearHistory(userId, ai);
      await interaction.reply(catify(`${ai}の会話履歴を削除しました！`));
    }
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const channelId = message.channel.id;
  if (autoRespondSettings[channelId]) {
    const ai = autoRespondSettings[channelId];
    const prompt = message.content;
    
    let response;
    if (ai === 'gpt') {
      response = await getGPTResponse(message.author.id, prompt);
    } else if (ai === 'gemini') {
      response = await getGeminiResponse(message.author.id, prompt);
    } else if (ai === 'perplexity') {
      response = await getPerplexityResponse(message.author.id, prompt);
    }
    
    await message.reply(catify(response));
  }
});

client.login(process.env.DISCORD_TOKEN);
