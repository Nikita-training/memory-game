class Game {
    constructor() {
        this.firstCard = null
        this.moves = null
        this.moveCounter = 0
        this.progress = null
        this.progressCounter = 0
        this.gameField = null
        this.timeout = false
        this.cards = null
        this.timer = null
        this.overlay = null
        this.modalContainer = null
    }

    async initGame() {
        this.cards = await this.loadCards()
        Object.assign(this, this.pageRenderer())
        this.newGame()
    }

    async loadCards() {
        const response = await fetch('./cards.json')
        return response.json()
    }

    pageRenderer() {
        const container = document.createElement('div')
        container.className = 'main-container'

        // header
        const header = document.createElement('header')

        const startBtn = document.createElement('button')
        startBtn.textContent = 'Start game'
        startBtn.className = 'start-btn'

        const leaderBtn = document.createElement('button')
        leaderBtn.textContent = 'Leaderboard'
        leaderBtn.className = 'leader-btn'

        header.append(startBtn, leaderBtn)

        // caption
        const h1 = document.createElement('h1')
        h1.textContent = 'Memory Game'

        // game
        const gameContainer = document.createElement('div')
        gameContainer.className = 'game-container'

        const statsContainer = document.createElement('div')
        statsContainer.className = 'stats-container'

        const moves = document.createElement('span')
        moves.className = 'moves'
        moves.textContent = 'Количество ходов: 0'

        const progress = document.createElement('span')
        progress.className = 'progress'
        progress.textContent = `Текущий прогресс 0 / ${this.cards.length}`

        statsContainer.append(moves, progress)

        const gameField = document.createElement('div')
        gameField.className = 'game-field'

        gameContainer.append(statsContainer, gameField)
        container.append(header, h1, gameContainer)

        // overlay + modal container
        const overlay = document.createElement('div')
        overlay.className = 'modal-overlay'

        const modalContainer = document.createElement('div')
        modalContainer.className = 'modal'

        overlay.append(modalContainer)
        document.body.append(container, overlay)

        // handlers
        startBtn.addEventListener('click', () => this.newGame())

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal()
        })

        return { moves, progress, gameField, overlay, modalContainer }
    }

    openModal(content) {
        this.modalContainer.replaceChildren(content)
        this.overlay.classList.add('visible')
    }

    closeModal() {
        this.overlay.classList.remove('visible')
    }

    showWinModal() {
        const modal = document.createElement('div')
        modal.className = 'modal-win'

        const title = document.createElement('h2')
        title.textContent = '🎉 Победа!'

        const message = document.createElement('p')
        message.textContent = `Вы нашли все пары за ${this.moveCounter} ходов.`

        const actions = document.createElement('div')
        actions.className = 'modal-actions'

        const newGameBtn = document.createElement('button')
        newGameBtn.className = 'modal-new-game'
        newGameBtn.textContent = 'Новая игра'
        newGameBtn.addEventListener('click', () => {
            this.closeModal()
            this.newGame()
        });

        const closeBtn = document.createElement('button')
        closeBtn.className = 'modal-close'
        closeBtn.textContent = 'Закрыть'
        closeBtn.addEventListener('click', () => this.closeModal())

        actions.append(newGameBtn, closeBtn)
        modal.append(title, message, actions)

        this.openModal(modal)
    }

    newGame() {
        if (this.timer !== null) {
            clearTimeout(this.timer)
            this.timer = null
        }
        this.timeout = false
        this.firstCard = null
        this.moveCounter = 0
        this.moves.textContent = `Количество ходов: ${this.moveCounter}`
        this.progressCounter = 0
        this.progress.textContent = `Текущий прогресс ${this.progressCounter} / ${this.cards.length}`

        const array = this.shuffle()
        this.gameField.replaceChildren()

        array.forEach(item => {
            const card = document.createElement('div')
            card.className = 'card'
            card.dataset.name = item.name

            const img = document.createElement('img')
            img.src = item.path
            img.alt = item.name
            img.loading = 'lazy'

            card.append(img)
            card.addEventListener('click', () => this.flip(card))
            this.gameField.append(card)
        })
    }

    shuffle() {
        const arr = [...this.cards, ...this.cards]
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]]
        }
        return arr
    }

    flip(card) {
        if (this.timeout || card === this.firstCard) return
        if (card.classList.contains('completed')) return

        if (this.firstCard === null) {
            this.firstCard = card
            card.classList.add('visible')
        } else {
            card.classList.add('visible')
            this.checkCards(card)
        }
    }

    checkCards(secondCard) {
        this.moveCounter += 1
        this.moves.textContent = `Количество ходов: ${this.moveCounter}`

        const result = this.firstCard.dataset.name === secondCard.dataset.name

        if (!result) {
            this.timeout = true
            this.timer = setTimeout(() => {
                this.firstCard.classList.remove('visible')
                secondCard.classList.remove('visible')
                this.firstCard = null
                this.timeout = false
                this.timer = null
            }, 1500)
            return
        }

        this.progressCounter += 1
        this.progress.textContent = `Текущий прогресс ${this.progressCounter} / ${this.cards.length}`

        this.firstCard.classList.add('completed')
        secondCard.classList.add('completed')
        this.firstCard = null

        if (this.progressCounter === this.cards.length) {
            this.showWinModal()
        }
    }
}

const game = new Game()
game.initGame()