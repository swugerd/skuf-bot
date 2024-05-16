import { createAudioPlayer, getVoiceConnection } from '@discordjs/voice';
import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { client } from '../index';
import { playNextSong, queue } from './play';

export const data = new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Skip the current video');

export async function execute(interaction: CommandInteraction) {
  const guild = client.guilds.cache.get(interaction.guildId || '');
  const member = guild?.members.cache.get(interaction.member?.user.id || '');
  const voiceChannel = member?.voice.channel;

  if (!voiceChannel) {
    await interaction.channel?.send('I am not currently playing any music.');
    return;
  }

  const player = createAudioPlayer();

  if (!player) {
    await interaction.channel?.send('I am not currently playing any music.');
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
    await interaction.channel?.send('Video queue ended');
    return;
  }

  if (guild && queue.get(guild.id).length > 0) {
    playNextSong(guild, voiceChannel, interaction);
  } else {
    await interaction.channel?.send('Skipped the current video.');
  }
}
