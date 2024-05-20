import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { client } from '../index';
import { playNextSong } from '../utils/playNextSong';

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
