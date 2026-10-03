async function prepareGame(){

    const cards = await loadCards()
    let fullSet = [...cards,...cards,...cards,...cards]
    pageRenderer()
    fillCards(fullSet)

}

function pageRenderer() {
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
}

async function loadCards(){
    const response = await fetch('./cards.json')
    const items = await response.json()
    return items
}

async function fillCards(cards) {

    const container = document.querySelector('.game-field')
    container.replaceChildren()

    cards.forEach(item => {
        const card = document.createElement('div')
        card.className = 'card'

        const img = document.createElement('img')
        img.src = item.path
        img.alt = item.name
        img.loading = 'lazy'

        const label = document.createElement('span')
        label.textContent = item.name

        card.append(img, label)
        container.append(card)
    })
}

prepareGame()