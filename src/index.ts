import { getVoiceConnection } from '@discordjs/voice';
import { Client, IntentsBitField } from 'discord.js';
import { PlayerManager } from './PlayerManager';
import { commands } from './commands';
import { queue } from './commands/play';
import { config } from './config';
import { deployCommands } from './deploy-commands';

export const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

client.once('ready', () => {
  console.log('Bot started');
});

client.on('guildCreate', async (guild) => {
  await deployCommands({ guildId: guild.id });
});

client.on('voiceStateUpdate', (_, newState) => {
  if (!newState.channel?.members.size) {
    const connection = getVoiceConnection(newState.guild.id);

    const player = PlayerManager.getPlayerInstance;

    player?.stop();

    if (queue.has(newState.guild.id) && queue.get(newState.guild.id).length) {
      queue.set(newState.guild.id, []);
    }

    connection?.destroy();
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const { commandName } = interaction;

  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});

client.login(config.BOT_TOKEN);
