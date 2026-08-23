import { _decorator, Component, Animation, input, Input } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property
    jumpHeight: number = 220;

    @property
    jumpDuration: number = 0.7;

    private animation: Animation | null = null;

    private isRunning: boolean = false;
    private isJumping: boolean = false;

    private groundY: number = 0;
    private jumpTime: number = 0;

    start() {

        this.animation = this.getComponent(Animation);

        if (!this.animation) {
            console.error('Player: Animation component not found!');
            return;
        }

        this.groundY = this.node.position.y;

        this.animation.play('MainCharacter_Idle');

        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);

        this.animation.on(
            Animation.EventType.FINISHED,
            this.onAnimationFinished,
            this
        );
    }

    update(deltaTime: number) {

        if (!this.isJumping) {
            return;
        }

        this.jumpTime += deltaTime;

        const progress = this.jumpTime / this.jumpDuration;

        if (progress >= 1) {

            this.isJumping = false;
            this.jumpTime = 0;

            this.node.setPosition(
                this.node.position.x,
                this.groundY,
                this.node.position.z
            );

            if (this.animation) {
                this.animation.play('MainCharacter_Run');
            }

            console.log('LAND');

            return;
        }

        // Парабола: 0 → 1 → 0
        const height =
            4 * this.jumpHeight * progress * (1 - progress);

        this.node.setPosition(
            this.node.position.x,
            this.groundY + height,
            this.node.position.z
        );
    }

    private onMouseDown() {

        if (this.isJumping) {
            return;
        }

        if (!this.isRunning) {

            this.isRunning = true;

            if (this.animation) {
                this.animation.play('MainCharacter_Run');
            }

            console.log('PLAYER: RUN');

            return;
        }

        this.jump();
    }

    private jump() {

        if (this.isJumping) {
            return;
        }

        this.isJumping = true;
        this.jumpTime = 0;

        if (this.animation) {
            this.animation.play('MainCharacter_Jump');
        }

        console.log('PLAYER: JUMP');
    }

    private onAnimationFinished() {

        // Для прыжка ничего здесь не делаем.
        // Прыжком теперь управляет update().
    }

    onDestroy() {

        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);

        if (this.animation) {
            this.animation.off(
                Animation.EventType.FINISHED,
                this.onAnimationFinished,
                this
            );
        }
    }
}