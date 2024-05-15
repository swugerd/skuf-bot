import {
  AudioPlayerStatus,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from '@discordjs/voice';
import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import ytdl from 'ytdl-core';
import { client } from '../index';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Start to play video')
  .addStringOption((option) =>
    option.setName('url').setDescription('YouTube video URL').setRequired(true),
  );

export async function execute(interaction: CommandInteraction) {
  const guild = client.guilds.cache.get(interaction.guildId || '');
  const member = guild?.members.cache.get(interaction.member?.user.id || '');
  const voiceChannel = member?.voice.channel;

  if (!voiceChannel) {
    await interaction.reply('You need to be in a voice channel to play music!');
    return;
  }

  const url = interaction.options.get('url')?.value;

  if (!url) {
    await interaction.reply('Please provide a valid YouTube link.');
    return;
  }

  try {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const stream = ytdl(url as string, {
      filter: 'audioonly',
    });

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });

    const player = createAudioPlayer();

    player.play(resource);

    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    await interaction.reply(`Now playing: ${url}`);
  } catch (error) {
    console.error(error);
    await interaction.reply('An error occurred while playing the video.');
  }
}
