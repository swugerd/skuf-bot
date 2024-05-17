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
import internal from 'stream';
import ytdl from 'ytdl-core';
import { PlayerManager } from '../PlayerManager';
import { client } from '../index';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Начать воспроизведение видео')
  .addStringOption((option) =>
    option
      .setName('url')
      .setDescription('Ссылка на youtube видео')
      .setRequired(true),
  );

export const queue = new Map();

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

  const url = interaction.options.get('url')?.value;
  const validYtUrl = new RegExp(
    '(youtu.*be.*)/(watch?v=|embed/|v|shorts|)(.*?((?=[&#?])|$))',
  );

  if (url && !validYtUrl.test(url.toString())) {
    if (!interaction.replied) {
      await interaction.reply('Скуф принимает только ссылки из ютуба');
    }
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
      if (!interaction.replied) {
        await interaction.reply(`Добавлено в очередь: ${url}`);
      }
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

    let stream: internal.Readable | null = null;

    const videoData = await ytdl.getBasicInfo(url);

    const liveBroadcastDetails = videoData.videoDetails.liveBroadcastDetails;

    if (liveBroadcastDetails && liveBroadcastDetails.isLiveNow) {
      stream = ytdl(url, {
        highWaterMark: 1 << 25,
        liveBuffer: 4900,
        quality: [91, 92, 93, 94, 95],
      });
    } else {
      stream = ytdl(url, {
        filter: 'audioonly',
        highWaterMark: 1 << 62,
        liveBuffer: 1 << 62,
        dlChunkSize: 0,
        quality: 'lowestaudio',
      });
    }

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });

    const player = createAudioPlayer();

    player.play(resource);

    connection.subscribe(player);

    PlayerManager.setPlayerInstance = player;

    player.on(AudioPlayerStatus.Idle, () => {
      if (queue.get(guild.id).length > 0) {
        playNextSong(guild, voiceChannel, interaction);
      } else {
        connection.destroy();
      }
    });

    if (!interaction.replied) {
      await interaction.reply(`Сейчас играет: ${url}`);
    }
  } catch (error) {
    console.error(error);
    await interaction.reply('Ошибка воспроизведения видео');
  }
}
