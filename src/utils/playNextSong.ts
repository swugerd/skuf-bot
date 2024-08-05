import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  StreamType,
} from '@discordjs/voice';
import ytdl from '@distube/ytdl-core';
import {
  CacheType,
  CommandInteraction,
  Guild,
  VoiceBasedChannel,
} from 'discord.js';
import { Readable } from 'stream';
import { PlayerManager } from '../PlayerManager';
import { TimeoutManager } from '../TimeoutManager';
import { queue } from '../commands/play';
import { TIMEOUT_DELAY_IN_MINUTES } from '../constants';

export async function playNextSong(
  guild: Guild,
  voiceChannel: VoiceBasedChannel,
  interaction: CommandInteraction<CacheType>,
) {
  const queueList = queue.get(guild.id);

  const url = queueList[0];

  try {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    let stream: Readable | null = null;
    const videoData = await ytdl.getBasicInfo(url);

    const liveBroadcastDetails = videoData.videoDetails.liveBroadcastDetails;

    if (liveBroadcastDetails && liveBroadcastDetails.isLiveNow) {
      stream = ytdl(url, {
        highWaterMark: 1 << 25,
        liveBuffer: 4900,
        quality: 'highestaudio',
      });
    } else {
      stream = ytdl(url, {
        filter: 'audioonly',
        highWaterMark: 1 << 25,
        quality: 'highestaudio',
      });
    }

    stream.on('error', (error) => {
      console.error('Stream error:', error);
      queue.set(guild.id, []);
      player.stop();
    });

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });

    const player = createAudioPlayer();

    player.play(resource);

    connection.subscribe(player);

    PlayerManager.setPlayerInstance = player;

    player.on(AudioPlayerStatus.Idle, () => {
      queueList.shift();

      if (queueList.length > 0) {
        playNextSong(guild, voiceChannel, interaction);
      } else {
        TimeoutManager.setTimeoutInstance = setTimeout(() => {
          connection.destroy();
        }, TIMEOUT_DELAY_IN_MINUTES * 60000);
      }
    });

    player.on(AudioPlayerStatus.Playing, () => {
      const timeoutInstance = TimeoutManager.getTimeoutInstance;
      if (timeoutInstance) {
        clearTimeout(timeoutInstance);
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
