import { ActionAddScore, ActionTakeLife, GameDispatch, GameState } from './GameContext';
import Align from './systems/Align';
import SoundSystem from './systems/SoundSystem';

export default class GameScene extends Phaser.Scene {
  private _sounds!: SoundSystem;
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  fruit: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined;
  gameWidth!: number; gameHeight!: number;
  deadline!: Phaser.GameObjects.Rectangle;

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

    // player & movements

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.player! = this.physics.add.sprite(0, 750, 'GameAtlas').setScale(1.5);
    this.player!.setBounce(0.1);
    this.player!.setCollideWorldBounds(true);
    this.player!.body.setGravityY(600)

    // invisible line - collision with fruit

    this.gameWidth = this.sys.game.canvas.width;
    this.gameHeight = this.sys.game.canvas.height;
    this.deadline = this.add.rectangle(0, this.gameHeight-1, this.gameWidth*2, 2, 0x6666ff);
    this.physics.add.existing(this.deadline);
    
    // initialize sounds

    this._sounds = new SoundSystem(this.game, 'sounds');

    this.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
    this.resize();
    // add animations to player

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

    this.player!.play('player_idle');
    
    // spawn first fruit
    this.spawnFruit();
    // this.gameOver('Game Over.');
  }

  resize() {}

  update() {
    // set movement direction
    if(this.cursors?.right.isDown) {
      this.player!.play('player_move_right', true);
      this.player.setVelocityX(330);
    }
    else if(this.cursors?.left.isDown) {
      this.player!.play('player_move_left', true);
      this.player.setVelocityX(-330);
    }
    else {
      this.player!.play('player_idle', true);
      this.player.setVelocityX(0);
    }
  }

  spawnFruit() {
    setTimeout(() => {
    // spawn fruit

    var fruitSpawnX = Phaser.Math.FloatBetween(0, this.gameWidth);
    const fruitTable = ['Apple', 'Avocado', 'Bread', 'Brownie', 'Cheese', 'Cookie', 'MelonHoneydew', 'MelonWater', 'Peach', 'PieLemon', 'Lemon', 'Onion'];
    const fruitName = Math.floor(Math.random() * fruitTable.length);

    this.fruit = this.physics.add.sprite(fruitSpawnX,50,'GameAtlas', 'fruits/'+fruitTable[fruitName]+'.png').setScale(2).setGravityY(20).setCollideWorldBounds(true);

    // colliders

    this.physics.add.collider(this.player, this.fruit, this.hitPlayer, function(){}, {element: this.player, fruit: this.fruit});
    this.physics.add.collider(this.deadline, this.fruit, this.hitGround, function(){}, {element: this.deadline, fruit: this.fruit});
    }, 10);

    // spawn again

    setTimeout(() => {
      this.spawnFruit();
    }, 3000);
  }

  // score & life functions 

  addScore(data: {dispatch: GameDispatch, state: GameState}, score: number){
    if (data && score) {
      data.dispatch(new ActionAddScore(score));
    }
  }

  takeLife(data: {dispatch: GameDispatch, state: GameState}){
    if (data) {
      data.dispatch(new ActionTakeLife());
    }
  }
  
  // features that remove objects that have collided with the player or the ground

  hitPlayer(element: any, fruit: any) {
    if (element && fruit) {
      fruit.setActive(false).setVisible(false);
      fruit.destroy();

      // add score
    }
  }
  
  hitGround(element: any, fruit: any) {
      if (element && fruit) {
        console.log('failed.');
        fruit.setActive(false).setVisible(false);
        fruit.destroy();

        // take life
      }
  }

  // the function is called after taking 3 lifes
  
  gameOver(text: string) {
      let gameOverText = this.add.text(this.gameWidth*0.5, this.gameHeight*0.5, text.toString(), {fontFamily: 'minecraftia', fontSize: 32, color: 'black'});
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
