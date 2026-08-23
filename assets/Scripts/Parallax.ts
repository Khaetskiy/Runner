import {
    _decorator,
    Component,
    Node,
    input,
    Input,
    UITransform,
    view
} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ParallaxLayer')
export class ParallaxLayer extends Component {

    @property
    speed: number = 100;

    // Двигаться ли этому слою с начала игры
    // Оставляем false — запуск будет по клику.
    private isMoving: boolean = false;

    // Все созданные копии картинки
    private copies: Node[] = [];

    // Ширина исходной картинки
    private spriteWidth: number = 0;

    start() {

        // Получаем ширину исходного спрайта
        const transform = this.getComponent(UITransform);

        if (!transform) {
            console.error(
                'ParallaxLayer: у объекта нет UITransform!'
            );
            return;
        }

        this.spriteWidth = transform.contentSize.width;

        if (this.spriteWidth <= 0) {
            console.error(
                'ParallaxLayer: ширина спрайта равна 0!'
            );
            return;
        }

        // Создаём бесконечную ленту
        this.createCopies();

        // Ждём первый клик
        input.on(
            Input.EventType.MOUSE_DOWN,
            this.startMovement,
            this
        );
    }

    private createCopies() {

        // Ширина видимой области сцены
        const sceneWidth = view.getVisibleSize().width;

        // Сколько картинок нужно,
        // чтобы гарантированно закрыть экран.
        const count = Math.ceil(sceneWidth / this.spriteWidth) + 2;

        // Исходная картинка
        this.copies.push(this.node);

        // Создаём остальные копии
        for (let i = 1; i < count; i++) {

            const copy = new Node(
                this.node.name + '_Copy_' + i
            );

            // Копируем компоненты исходного объекта
            const sourceTransform =
                this.node.getComponent(UITransform);

            if (sourceTransform) {

                const newTransform =
                    copy.addComponent(UITransform);

                newTransform.setContentSize(
                    sourceTransform.contentSize
                );

                newTransform.setAnchorPoint(
                    sourceTransform.anchorPoint
                );
            }

            // Копируем Sprite
            const sourceSprite =
                this.node.getComponent('cc.Sprite') as any;

            if (sourceSprite) {

                const newSprite =
                    copy.addComponent('cc.Sprite') as any;

                newSprite.spriteFrame =
                    sourceSprite.spriteFrame;

                newSprite.sizeMode =
                    sourceSprite.sizeMode;
            }

            // Копия становится дочерним объектом того же родителя
            this.node.parent!.addChild(copy);

            // Ставим её сразу после предыдущей
            copy.setPosition(
                this.copies[i - 1].position.x +
                this.spriteWidth,
                this.node.position.y,
                this.node.position.z
            );

            this.copies.push(copy);
        }
    }

    update(deltaTime: number) {

        if (!this.isMoving) {
            return;
        }

        const move =
            this.speed * deltaTime;

        // Двигаем все картинки влево
        for (const copy of this.copies) {

            copy.setPosition(
                copy.position.x - move,
                copy.position.y,
                copy.position.z
            );
        }

        // Проверяем, не ушла ли картинка полностью за левый край
        this.recycleCopies();
    }

    private recycleCopies() {

        if (this.copies.length === 0) {
            return;
        }

        // Берём самую левую картинку
        const first = this.copies[0];

        // Левая граница экрана
        const leftEdge =
            -view.getVisibleSize().width / 2;

        // Правая граница этой картинки
        const rightEdge =
            first.position.x + this.spriteWidth / 2;

        // Если картинка полностью ушла за левый край
        if (rightEdge <= leftEdge) {

            // Убираем её из начала массива
            this.copies.shift();

            // Находим последнюю картинку
            const last =
                this.copies[this.copies.length - 1];

            // Ставим первую сразу после последней
            first.setPosition(
                last.position.x + this.spriteWidth,
                first.position.y,
                first.position.z
            );

            // Добавляем её в конец
            this.copies.push(first);
        }
    }

    private startMovement() {

        // Первый клик запускает движение
        this.isMoving = true;
    }

    onDestroy() {

        input.off(
            Input.EventType.MOUSE_DOWN,
            this.startMovement,
            this
        );
    }
}