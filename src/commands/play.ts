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
    await interaction.reply('Скуф не будет слушать музыку без тебя');
    return;
  }

  const url = interaction.options.get('url')?.value;
  const validYtUrl = new RegExp(
    '(youtu.*be.*)/(watch?v=|embed/|v|shorts|)(.*?((?=[&#?])|$))',
  );

  if (url && !validYtUrl.test(url.toString())) {
    await interaction.reply('Скуф принимает только ссылки из ютуба');
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
      await interaction.reply(`Добавлено в очередь: ${url}`);
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

    await interaction.reply(`Сейчас играет: ${url}`);
  } catch (error) {
    console.error(error);
    await interaction.reply('Ошибка воспроизведения видео');
  }
}
