import { AudioPlayerStatus } from '@discordjs/voice';
import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { PlayerManager } from '../PlayerManager';
import { client } from '../index';

export const data = new SlashCommandBuilder()
  .setName('pause')
  .setDescription('Pause the current video');

export async function execute(interaction: CommandInteraction) {
  const guild = client.guilds.cache.get(interaction.guildId || '');
  const player = PlayerManager.getPlayerInstance();

  if (player?.state.status === AudioPlayerStatus.Idle) {
    await interaction.reply('I am not currently playing any music.');
    return;
  }

  if (player?.state.status === AudioPlayerStatus.Playing) {
    player.pause(true);
    await interaction.reply('Video paused.');
  } else {
    await interaction.reply('Video is already paused.');
  }
}
