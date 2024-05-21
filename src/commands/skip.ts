import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { PlayerManager } from '../PlayerManager';
import { client } from '../index';
import { playNextSong } from '../utils/playNextSong';
import { queue } from './play';

export const data = new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Пропустить видео');

export async function execute(interaction: CommandInteraction) {
  const guild = client.guilds.cache.get(interaction.guildId || '');
  const member = guild?.members.cache.get(interaction.member?.user.id || '');
  const voiceChannel = member?.voice.channel;

  if (!voiceChannel) {
    if (!interaction.replied) {
      await interaction.reply('Скуф не будет слушать музыку без тебя');
    }
    return;
  }

  const player = PlayerManager.getPlayerInstance;

  if (!player) {
    if (!interaction.replied) {
      await interaction.reply('Скуф не проигрывает музыку');
    }
    return;
  }

  player.stop();

  if (guild && queue.get(guild.id).length - 1 > 0) {
    playNextSong(guild, voiceChannel, interaction);
  } else {
    if (!interaction.replied) {
      await interaction.reply('Последнее видео из очереди пропущено');
    }
  }
}
