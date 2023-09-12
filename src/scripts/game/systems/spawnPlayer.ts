export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, frame: string) {
        super(scene, x, y, 'GameAtlas', frame); 
        scene.add.existing(this);
        this.setScale(1.5);
        scene.physics.world.enableBody(this);
        this.setBounce(0.1);
        this.setGravityY(600);
        this.setCollideWorldBounds(true);
    }

    moveRight() {
        this.setVelocityX(300);
        this.anims.play('player_move_right', true);
    }
    
    moveLeft() {
        this.setVelocityX(-300);
        this.anims.play('player_move_left', true);
    }

    idle() {
        this.setVelocityX(0);
        this.anims.play('player_idle', true);
    }
}
