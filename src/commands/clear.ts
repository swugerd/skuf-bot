import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { PlayerManager } from '../PlayerManager';
import { client } from '../index';
import { queue } from './play';

export const data = new SlashCommandBuilder()
  .setName('clear')
  .setDescription('Очистить очередь');

export async function execute(interaction: CommandInteraction) {
  const guild = client.guilds.cache.get(interaction.guildId || '');
  const player = PlayerManager.getPlayerInstance;

  if (guild) {
    if (queue.has(guild.id) && queue.get(guild.id).length) {
      queue.set(guild.id, []);
      player?.stop();
      if (!interaction.replied) {
        await interaction.reply('Скуф очистил очередь');
      }
    } else {
      if (!interaction.replied) {
        await interaction.reply('Скуф не нашел очередь');
      }
    }
  }
}
