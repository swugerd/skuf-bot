import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';

import { PlayerManager } from '../PlayerManager';

export const data = new SlashCommandBuilder()
  .setName('pause')
  .setDescription('Поставить паузу');

export async function execute(interaction: CommandInteraction) {
  const player = PlayerManager.getPlayerInstance;

  if (player?.state.status === AudioPlayerStatus.Idle) {
    if (!interaction.replied) {
      await interaction.reply('Скуф не проигрывает музыку');
    }
    return;
  }

  if (player?.state.status === AudioPlayerStatus.Playing) {
    player.pause(true);
    if (!interaction.replied) {
      await interaction.reply('Скуф поставил паузу');
    }
  } else {
    if (!interaction.replied) {
      await interaction.reply('Видео уже на паузе');
    }
  }
}
