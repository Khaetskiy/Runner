import { _decorator, Component, Animation } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('MummyController')
export class MummyController extends Component {

    @property
    speed: number = 300;

    private animation: Animation | null = null;

    start() {

        this.animation = this.getComponent(Animation);

        if (this.animation) {
            this.animation.play('Mummy_Walk');
        }
    }

    update(deltaTime: number) {

        this.node.setPosition(
            this.node.position.x - this.speed * deltaTime,
            this.node.position.y,
            this.node.position.z
        );
    }
}