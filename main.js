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
        this.resultSaved = false
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
        leaderBtn.addEventListener('click', () => this.showLeaderboardModal())
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal()
        })

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal()
        })

        return { moves, progress, gameField, overlay, modalContainer }
    }

    openModal(content) {
        this.modalContainer.replaceChildren(content)
        this.overlay.classList.add('visible')
        document.body.classList.add('no-scroll')
    }

    closeModal() {
        this.overlay.classList.remove('visible')
        document.body.classList.remove('no-scroll')
    }

    showWinModal() {
        this.saveResult()

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

    showLeaderboardModal() {
        const modal = document.createElement('div')
        modal.className = 'modal-leaderboard'

        const title = document.createElement('h2')
        title.textContent = '🏆 Таблица лидеров'

        const content = document.createElement('div')
        content.className = 'content'

        const results = this.getResults()

        if (results.length === 0) {
            const empty = document.createElement('p')
            empty.className = 'empty'
            empty.textContent = 'Пока нет результатов'
            content.append(empty)
        } else {
            const table = document.createElement('table')
            table.className = 'table'

            const thead = document.createElement('thead')
            const headRow = document.createElement('tr')

            const thPlace = document.createElement('th')
            thPlace.textContent = 'Место'

            const thMoves = document.createElement('th')
            thMoves.textContent = 'Ходы'

            const thDate = document.createElement('th')
            thDate.textContent = 'Дата'

            headRow.append(thPlace, thMoves, thDate)
            thead.append(headRow)

            const tbody = document.createElement('tbody')
            results.forEach((result, i) => {
                const tr = document.createElement('tr')

                const place = document.createElement('td')
                place.textContent = String(i + 1)

                const moves = document.createElement('td')
                moves.textContent = String(result.moves)

                const date = document.createElement('td')
                date.textContent = result.date

                tr.append(place, moves, date)
                tbody.append(tr)
            })

            table.append(thead, tbody)
            content.append(table)
        }

        const closeBtn = document.createElement('button')
        closeBtn.className = 'modal-close'
        closeBtn.textContent = 'Закрыть'
        closeBtn.addEventListener('click', () => this.closeModal())

        modal.append(title, content, closeBtn)
        this.openModal(modal)
    }

    getResults() {
        try {
            const raw = localStorage.getItem('memory_game_results')
            if (!raw) return []
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    }

    saveResult() {
        if (this.resultSaved) return

        const date = new Date()
        const dd = String(date.getDate()).padStart(2, '0')
        const mm = String(date.getMonth() + 1).padStart(2, '0')
        const yyyy = date.getFullYear()
        const dateStr = `${dd}.${mm}.${yyyy}`

        const results = this.getResults()
        results.push({
            moves: this.moveCounter,
            date: dateStr,
            timestamp: Date.now(),
        })

        results.sort((a, b) => {
            if (a.moves !== b.moves) return a.moves - b.moves
            return a.timestamp - b.timestamp
        })

        const top10 = results.slice(0, 10)
        localStorage.setItem('memory_game_results', JSON.stringify(top10))

        this.resultSaved = true
    }

    newGame() {
        this.closeModal()
        if (this.timer !== null) {
            clearTimeout(this.timer)
            this.timer = null
        }
        this.timeout = false
        this.resultSaved = false
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
        if (card.classList.contains('visible')) return

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