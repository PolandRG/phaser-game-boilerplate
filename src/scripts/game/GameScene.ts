import { ActionAddScore, ActionTakeLife, GameDispatch, GameState } from './GameContext';
import Align from './systems/Align';
import SoundSystem from './systems/SoundSystem';
import Fruit from './systems/spawnFruit';
import Player from './systems/spawnPlayer';

export default class GameScene extends Phaser.Scene {
  private _sounds!: SoundSystem;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  deadline!: Phaser.GameObjects.Rectangle;
  private _player!: Player;
  _fruit!: Fruit; _fruits!: Phaser.Physics.Arcade.Group;
  _data!: { dispatch: GameDispatch; state: GameState; };


  preload() {
    Align.init(this);

    // load atlasses
    this.load.atlas('GameAtlas', 'atlas/game.webp', 'atlas/game.json');

    // load bitmap fonts
    this.load.bitmapFont('arial', 'fonts/arial.png', 'fonts/arial.fnt');
    this.load.bitmapFont('arial-stroke', 'fonts/arial-stroke.png', 'fonts/arial-stroke.fnt');

    // load settings
    this.load.json('default-settings', 'settings.json');

    // load sounds
    this.load.audioSprite('sounds', 'audio/sounds.json', 'audio/sounds.mp3');
  }

  create(data: {dispatch: GameDispatch, state: GameState}) {
    // TODO: here create elements

    // example way to add points on UI
    //setTimeout(() => {
    // data.dispatch(new ActionAddScore(10));
    // data.dispatch(new ActionTakeLife());
    //}, 1500);

    // player movements
    this.cursors = this.input.keyboard?.createCursorKeys();

    // player & animations
    this._player = this.physics.add.existing(new Player(this, 100, 750, 'knight/knight iso char_idle_0.png'));

    this.anims.create({
      key: 'player_idle',
      frames: this.anims.generateFrameNames('GameAtlas', {
          start: 0,
          end: 3,
          zeroPad: 1,
          prefix: 'knight/knight iso char_idle_',
          suffix: '.png'
      }),
      frameRate: 2,
      repeat: -1
    });

    this.anims.create({
      key: 'player_move_left',
      frames: this.anims.generateFrameNames('GameAtlas', {
          start: 0,
          end: 5,
          zeroPad: 1,
          prefix: 'knight/knight iso char_run left_',
          suffix: '.png'
      }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'player_move_right',
      frames: this.anims.generateFrameNames('GameAtlas', {
          start: 0,
          end: 5,
          zeroPad: 1,
          prefix: 'knight/knight iso char_run right_',
          suffix: '.png'
      }),
      frameRate: 6,
      repeat: -1
    });

    // set default animation

    this._player.play('player_idle');

    // invisible line - collision with fruit

    this.deadline = this.add.rectangle(0, Align.height-1, Align.width*2, 2, 0x6666ff).setAlpha(0);
    this.physics.add.existing(this.deadline);
    
    // initialize sounds

    this._sounds = new SoundSystem(this.game, 'sounds');
    this._data = data;

    this.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
    this.resize();

    this._fruits = this.physics.add.group();

    // spawn first fruit
    this.spawnFruit();
    // this.gameOver('Game Over.');
  }

  resize() {}

  update() {
    // set movement direction
    if(this.cursors?.right.isDown) {
      this._player.moveRight();
    }
    else if(this.cursors?.left.isDown) {
      this._player.moveLeft();
    }
    else {
      this._player.idle();
    }
    //this._fruits.angle(+0.5)
    this.deadline.y = Align.height-1;
  }

  // spawn fruits

  updateGameState() {
    this._sounds.play('collect');      
  }

  spawnFruit() {
    let score = 0
    if (score>1500) {
      score = 1500;
    }
    var fruitSpawnX = Phaser.Math.FloatBetween(0, Align.width);
    var randomValue = Phaser.Math.FloatBetween(0, 100);
    if(fruitSpawnX<Align.width*0.025) {fruitSpawnX=fruitSpawnX+randomValue};
    if(Align.width*0.975<fruitSpawnX) {fruitSpawnX=fruitSpawnX-randomValue};
    const fruit = this.physics.add.existing(new Fruit(this, fruitSpawnX));

    this._fruits.add(fruit);
    
    this.physics.add.collider(this.deadline, fruit, () =>{
      this.hitGround(this.deadline, fruit)
      this._sounds.play('fail');
    }, function(){}, {element: this.deadline, fruit: fruit});

    this.physics.add.collider(this._player, fruit, () =>{
      this.hitPlayer(this._player, fruit)
      this._sounds.play('collect');
    }, function(){}, {element: this.deadline, fruit: fruit});

    fruit.setGravityY(20);

    this._sounds.play('btn');
    setTimeout(() => {
      this.spawnFruit();
    },3000-score)
  }

  // features that remove objects that have collided with the player or the ground

  hitPlayer(element: any, fruit: any) {
    if (element && fruit) {
      this._data.dispatch(new ActionAddScore(1));
      fruit.setActive(false).setVisible(false);
      fruit.destroy();
      // add score
    }
  }
  
  hitGround(element: any, fruit: any) {
      if (element && fruit) {
        fruit.setTint(0x666666);
        fruit.disableBody().setActive(false);
        setTimeout(()=> {
          this._data.dispatch(new ActionTakeLife);
          fruit.setVisible(false);
          fruit.destroy();
        }, 2000)
      }
  }

  // the function is called after taking 3 lifes
  
  gameOver(text: string) {
      let gameOverText = this.add.text(Align.width*0.5, Align.height*0.5, text.toString(), {fontFamily: 'minecraftia', fontSize: 32, color: 'black'});
      setTimeout(() => {
        if (gameOverText) {
        this.game.pause();
        console.log(text.toString());}
    }, 50);
  }

  get sounds() {
    return this._sounds;
  }

}

