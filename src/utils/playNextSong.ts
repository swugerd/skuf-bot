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
  VoiceBasedChannel,
} from 'discord.js';
import internal from 'stream';
import ytdl from 'ytdl-core';
import { PlayerManager } from '../PlayerManager';
import { queue } from '../commands/play';

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
      queue.get(guild?.id).shift();

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
