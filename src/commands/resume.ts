import { AudioPlayerStatus } from '@discordjs/voice';
import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { PlayerManager } from '../PlayerManager';

export const data = new SlashCommandBuilder()
  .setName('resume')
  .setDescription('Resume the current video');

export async function execute(interaction: CommandInteraction) {
  const player = PlayerManager.getPlayerInstance();

  if (player?.state.status === AudioPlayerStatus.Idle) {
    await interaction.reply('I am not currently playing any music.');
    return;
  }

  if (player?.state.status === AudioPlayerStatus.Paused) {
    player.unpause();
    await interaction.reply('Video resumed.');
  } else {
    await interaction.reply('Video is playing now.');
  }
}
