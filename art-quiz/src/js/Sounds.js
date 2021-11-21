export default class Sounds {
  static DEFAULT_VALUES = {
    defaultEffectsVolume: 50,
    defaultMusicVolume: 30,
  };

  static effectsFiles = {
    answerCorrect: './assets/sounds/answer_correct.mp3',
    answerWrong: './assets/sounds/answer_wrong.mp3',
    roundEnd: './assets/sounds/round_end.mp3',
  };

  static musicFiles = {
    music: 'https://raw.githubusercontent.com/alexpataman/art-quiz-data/main/sounds/music/main.mp3',
  };

  constructor() {
    this.instances = {
      effects: {},
      music: {},
    };
    this.preload('effects', Sounds.effectsFiles);
    this.preload('music', Sounds.musicFiles);
  }

  // eslint-disable-next-line class-methods-use-this
  getDefaultValue(key) {
    return Sounds.DEFAULT_VALUES[key];
  }

  preload(type, files) {
    Object.keys(files).forEach((key) => {
      const audio = new Audio();
      audio.src = files[key];
      this.instances[type][key] = audio;
    });
  }

  setVolume(type, value) {
    const newValue = value / 100;
    Object.values(this.instances[type]).forEach((el) => {
      // eslint-disable-next-line no-param-reassign
      el.volume = newValue;
    });
  }

  playEffect(key) {
    this.instances.effects[key].play();
  }

  playMusic(key = 'music') {
    this.instances.music[key].play();
    this.instances.music[key].loop = true;
  }

  stopMusic(key = 'music') {
    this.instances.music[key].pause();
  }
}
