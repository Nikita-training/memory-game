class Game {

    constructor() {
        this.firstCard = null
        this.moves = null
        this.progress = null
        this.gameField = null
        this.timeout = false
        this.cards = null

    }

    async initGame() {
        this.cards = await loadCards()
        Object.assign(this, this.pageRenderer());
        this.fillCards(this.cards)
    }

    pageRenderer() {
        const container = document.createElement('div')
        container.className = 'main-container'

        // header
        const header = document.createElement('header')

        const startBtn = document.createElement('button')
        startBtn.textContent = "Start game"
        startBtn.className = 'start-btn'

        const leaderBtn = document.createElement('button')
        leaderBtn.textContent = 'Leaderboard'
        leaderBtn.className = 'leader-btn'

        header.append(startBtn, leaderBtn)

        // Game caption
        const h1 = document.createElement('h1')
        h1.textContent = "Memory Game"

        // game
        const gameContainer = document.createElement('div')
        gameContainer.className = "game-container"

        const statsContainer = document.createElement('div')
        statsContainer.className = 'stats-container'

        const moves = document.createElement('span')
        moves.className = 'moves'
        moves.textContent = '0'

        const progress = document.createElement('span')
        progress.className = 'progress'
        progress.textContent = '0 / 8'

        statsContainer.append(moves, progress)

        const gameField = document.createElement('div')
        gameField.className = 'game-field'

        gameContainer.append(statsContainer, gameField)


        container.append(header, h1, gameContainer)
        document.body.append(container)

        return { moves, progress, gameField }
    }

    fillCards() {
        const array = shuffle(this.cards)

        const container = document.querySelector('.game-field')
        container.replaceChildren()

        array.forEach(item => {
            const card = document.createElement('div')
            card.className = 'card'
            card.dataset.name = item.name

            const img = document.createElement('img')
            img.src = item.path
            img.alt = item.name
            img.loading = 'lazy'

            card.append(img)
            container.append(card)
            card.addEventListener('click', () => {
                this.flip(card)
            })
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
        if (this.firstCard === null) {
            this.firstCard = card
            card.classList.add('visible')
        }
        else {
            card.classList.add('visible')
            this.checkCards(card)
        }
    }

    checkCards(secondCard) {
        const result = this.firstCard.dataset.name === secondCard.dataset.name
        if (!result) {
            this.timeout = true
            setTimeout(() => {
                this.firstCard.classList.remove('visible')
                secondCard.classList.remove('visible')
                this.firstCard = null
                this.timeout = false
            }, 1500);
        }
        else {
            this.firstCard.classList.add('completed')
            secondCard.classList.add('completed')
            this.firstCard = null
        }
    }
}

game = new Game()
game.initGame()

