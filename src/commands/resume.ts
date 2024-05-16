import { AudioPlayerStatus } from '@discordjs/voice';
import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { PlayerManager } from '../PlayerManager';

export const data = new SlashCommandBuilder()
  .setName('resume')
  .setDescription('Продолжить воспроизведение видео');

export async function execute(interaction: CommandInteraction) {
  const player = PlayerManager.getPlayerInstance();

  if (player?.state.status === AudioPlayerStatus.Idle) {
    await interaction.reply('Скуф не проигрывает музыку');
    return;
  }

  if (player?.state.status === AudioPlayerStatus.Paused) {
    player.unpause();
    await interaction.reply('Скуф продолжает воспроизведение');
  } else {
    await interaction.reply('Видео уже проигрывается');
  }
}
