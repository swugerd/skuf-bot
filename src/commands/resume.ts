import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';

import { PlayerManager } from '../PlayerManager';

export const data = new SlashCommandBuilder()
  .setName('resume')
  .setDescription('Продолжить воспроизведение видео');

export async function execute(interaction: CommandInteraction) {
  const player = PlayerManager.getPlayerInstance;

  if (player?.state.status === AudioPlayerStatus.Idle) {
    if (!interaction.replied) {
      await interaction.reply('Скуф не проигрывает музыку');
    }
    return;
  }

  if (player?.state.status === AudioPlayerStatus.Paused) {
    player.unpause();
    if (!interaction.replied) {
      await interaction.reply('Скуф продолжает воспроизведение');
    }
  } else {
    if (!interaction.replied) {
      await interaction.reply('Видео уже проигрывается');
    }
  }
}
