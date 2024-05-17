import { AudioPlayer } from '@discordjs/voice';

let playerInstance: AudioPlayer | null = null;

export class PlayerManager {
  static set setPlayerInstance(player: AudioPlayer) {
    playerInstance = player;
  }

  static get getPlayerInstance() {
    return playerInstance;
  }
}
