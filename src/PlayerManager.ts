import { AudioPlayer } from '@discordjs/voice';

let playerInstance: AudioPlayer | null = null;

export class PlayerManager {
  static setPlayerInstance(player: AudioPlayer) {
    playerInstance = player;
  }

  static getPlayerInstance() {
    return playerInstance;
  }
}
