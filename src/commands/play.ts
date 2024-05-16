import {
  AudioPlayerStatus,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from '@discordjs/voice';
import {
  CacheType,
  CommandInteraction,
  Guild,
  SlashCommandBuilder,
  VoiceBasedChannel,
} from 'discord.js';
import ytdl from 'ytdl-core';
import { PlayerManager } from '../PlayerManager';
import { client } from '../index';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Start to play video')
  .addStringOption((option) =>
    option.setName('url').setDescription('YouTube video URL').setRequired(true),
  );

export const queue = new Map();

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

  if (guild) {
    if (!queue.has(guild.id)) {
      queue.set(guild.id, []);
    }

    queue.get(guild.id).push(url);

    if (queue.get(guild.id).length === 1) {
      playNextSong(guild, voiceChannel, interaction);
    } else {
      await interaction.reply(`Added to queue: ${url}`);
    }
  }
}

export async function playNextSong(
  guild: Guild,
  voiceChannel: VoiceBasedChannel,
  interaction: CommandInteraction<CacheType>,
) {
  const url = queue.get(guild.id)[0];

  try {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const stream = ytdl(url, {
      filter: 'audioonly',
    });

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });

    const player = createAudioPlayer();

    player.play(resource);

    connection.subscribe(player);

    PlayerManager.setPlayerInstance(player);

    player.on(AudioPlayerStatus.Idle, () => {
      queue.get(guild.id).shift();
      if (queue.get(guild.id).length > 0) {
        playNextSong(guild, voiceChannel, interaction);
      } else {
        connection.destroy();
      }
    });

    await interaction.reply(`Now playing: ${url}`);
  } catch (error) {
    console.error(error);
    await interaction.reply('An error occurred while playing the video.');
  }
}
