const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

client.commands = new Map();

// Load command files
fs.readdirSync('./COMMANDS/').forEach(file => {
  try {
    const command = require(`./COMMANDS/${file}`);
    if (!command.data || !command.data.name) {
      console.error(`[WARNING] The command at ${file} is missing a required "data" or "data.name" property.`);
    } else {
      client.commands.set(command.data.name, command);
      console.log(`[INFO] Loaded command: ${command.data.name}`);
    }
  } catch (error) {
    console.error(`[ERROR] Failed to load command in ${file}:`, error);
  }
});

client.once('ready', async () => {
  console.log(`[BOOT]: Booted client ${client.user.tag}!`);
  client.user.setStatus('online');

  const statuses = [`applications you sent...`, `with Gazarino`];
  setInterval(() => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    client.user.setActivity(status, { type: "WATCHING" });
  }, 25000);

  // Register slash commands
  const rest = new REST({ version: '10' }).setToken(config.TOKEN);
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: [...client.commands.values()].map(cmd => cmd.data.toJSON()) },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

client.login(config.TOKEN);
