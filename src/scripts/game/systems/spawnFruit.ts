export default class Fruit extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number) {
        const fruitTable = ['Apple', 'Avocado', 'Bread', 'Brownie', 'Cheese', 'Cookie', 'MelonHoneydew', 'MelonWater', 'Peach', 'PieLemon', 'Lemon', 'Onion'];
        const fruitName = Math.floor(Math.random() * fruitTable.length);

        super(scene, x, 50, 'GameAtlas', 'fruits/'+fruitTable[fruitName]+'.png'); 
        this.setScale(2);
        scene.add.existing(this);
        scene.physics.world.enableBody(this);
        this.setCollideWorldBounds(true);
    }
}
