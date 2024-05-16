import { getVoiceConnection } from '@discordjs/voice';
import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { PlayerManager } from '../PlayerManager';
import { client } from '../index';
import { playNextSong, queue } from './play';

export const data = new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Пропустить видео');

export async function execute(interaction: CommandInteraction) {
  const guild = client.guilds.cache.get(interaction.guildId || '');
  const member = guild?.members.cache.get(interaction.member?.user.id || '');
  const voiceChannel = member?.voice.channel;

  if (!voiceChannel) {
    await interaction.reply('Скуф не будет слушать музыку без тебя');
    return;
  }

  const player = PlayerManager.getPlayerInstance();

  if (!player) {
    await interaction.reply('Скуф не проигрывает музыку');
    return;
  }

  player.stop();

  queue.get(guild?.id).shift();

  if (queue.get(guild?.id).length === 0) {
    player.stop();
    const connection = getVoiceConnection(guild?.id || '');
    if (connection) {
      connection.destroy();
    }
    await interaction.reply('Последнее видео из очереди пропущено');
    return;
  }

  if (guild && queue.get(guild.id).length > 0) {
    playNextSong(guild, voiceChannel, interaction);
  } else {
    await interaction.reply('Видео пропущено');
  }
}
