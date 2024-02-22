enum CardAttributes {
    Rank,
    Suit,
    SuitColor
}
enum CardContainerKinds {
    Draw,
    Discard,
    Player,
    Puzzle,
    Score,
    Tableau
}
cardKit.createSelectEvent(CardContainerKinds.Discard, SelectionButtons.A, function (container, card) {
    if (cardKit.containerHasCards(pickUpStack)) {
        returnPickedUpCards()
    } else {
        pickUpSourceContainer = container
        cardKit.moveCardBetween(container, CardContainerPositions.First, pickUpStack, CardContainerPositions.Last, CardFaces.Unchanged)
    }
})
function checkWinCondition () {
    scoredCardCount = 0
    for (let scoringPile of cardKit.getContainerKindList(CardContainerKinds.Score)) {
        scoredCardCount += cardKit.getContainerCardCount(scoringPile)
    }
    if (scoredCardCount == 52) {
        cardKit.disableLayoutButtonControl()
        cardKit.removeCursor()
        pause(1000)
        isWinning = true
    }
}
function returnPickedUpCards () {
    while (cardKit.containerHasCards(pickUpStack)) {
        // There is a difference between the ordering of card stacks and card spreads. The first card of a card stack is the top card of the stack. For the tableau card spreads, since the cards are lined from top to bottom, the cards need to be returned to the last position for them to stack properly.
        if (cardKit.isContainerOfKind(pickUpSourceContainer, CardContainerKinds.Tableau)) {
            cardKit.moveCardBetween(pickUpStack, CardContainerPositions.First, pickUpSourceContainer, CardContainerPositions.Last, CardFaces.Unchanged)
        } else {
            cardKit.moveCardBetween(pickUpStack, CardContainerPositions.First, pickUpSourceContainer, CardContainerPositions.First, CardFaces.Unchanged)
        }
    }
    pickUpSourceContainer = pickUpStack
}
function addCardToTableauPoints () {
    if (cardKit.isContainerOfKind(pickUpSourceContainer, CardContainerKinds.Discard)) {
        info.changeScoreBy(5)
    } else if (cardKit.isContainerOfKind(pickUpSourceContainer, CardContainerKinds.Score)) {
        info.changeScoreBy(-15)
    }
}
cardKit.createSelectEmptySlotEvent(CardContainerKinds.Discard, SelectionButtons.A, function (container) {
    returnPickedUpCards()
})
cardKit.createSelectEvent(CardContainerKinds.Draw, SelectionButtons.A, function (container, card) {
    if (cardKit.containerHasCards(pickUpStack)) {
        returnPickedUpCards()
    } else {
        cardKit.moveCardBetween(container, CardContainerPositions.First, discardPile, CardContainerPositions.First, CardFaces.Up)
    }
})
cardKit.createSelectEmptySlotEvent(CardContainerKinds.Draw, SelectionButtons.A, function (container) {
    if (cardKit.containerHasCards(pickUpStack)) {
        returnPickedUpCards()
    } else {
        while (cardKit.getContainerCardCount(discardPile) > 0) {
            cardKit.moveCardBetween(discardPile, CardContainerPositions.First, container, CardContainerPositions.First, CardFaces.Down)
        }
        info.changeScoreBy(-100)
    }
})
cardKit.createSelectEvent(CardContainerKinds.Discard, SelectionButtons.B, function (container, card) {
    if (cardKit.containerHasCards(pickUpStack)) {
        returnPickedUpCards()
    } else {
        cardAlreadyScored = false
        selectedCard = card
        for (let scoringPile of cardKit.getContainerKindList(CardContainerKinds.Score)) {
            selectedScoringPile = scoringPile
            scoreSingleCard()
        }
    }
})
cardKit.createSelectEvent(CardContainerKinds.Tableau, SelectionButtons.B, function (container, card) {
    if (cardKit.containerHasCards(pickUpStack)) {
        returnPickedUpCards()
    } else if (cardKit.getCardFaceUp(card) && card == cardKit.getCard(container, CardContainerPositions.Last)) {
        cardAlreadyScored = false
        selectedCard = card
        for (let scoringPile of cardKit.getContainerKindList(CardContainerKinds.Score)) {
            selectedScoringPile = scoringPile
            scoreSingleCard()
        }
    }
})
// The setup game function creates the play area and sets up how the cursor travels between the different play areas.
function setupGame () {
    pickUpStack = cardKit.createEmptyHand(CardContainerKinds.Player, CardLayoutDirections.TopToBottom)
    cardKit.setCardLayoutSpacing(pickUpStack, -14)
    cardKit.setContainerLayer(pickUpStack, 500)
    cardKit.hideEmptySlots(pickUpStack)
    drawDeck = cardKit.createPlayingCards()
    cardKit.setContainerPosition(drawDeck, 20, 36)
    discardPile = cardKit.createEmptyPile(CardContainerKinds.Discard)
    cardKit.setContainerPosition(discardPile, 34, 36)
    cardKit.linkContainers(discardPile, RelativeDirections.RightOf, drawDeck)
    previousContainer = discardPile
    for (let index = 0; index <= 6; index++) {
        tableauStack = cardKit.createEmptyHand(CardContainerKinds.Tableau, CardLayoutDirections.TopToBottom)
        // The pick up stack and tableau stacks have negative spacing in order to stack the cards. Stacking can only be done using spread card containers.
        cardKit.setCardLayoutSpacing(tableauStack, -14)
        cardKit.setContainerPosition(tableauStack, 55 + 14 * index, 36)
        cardKit.linkContainers(tableauStack, RelativeDirections.RightOf, previousContainer)
        // This block changes the card the cursor points to when the player moves from card stack to card stack. The last card sits at the bottom of the stack.
        cardKit.setContainerEntryPoint(tableauStack, CardContainerPositions.Last)
        previousContainer = tableauStack
    }
    cardKit.linkContainers(previousContainer, RelativeDirections.LeftOf, drawDeck)
    for (let index = 0; index <= 3; index++) {
        scoringPile = cardKit.createEmptyPile(CardContainerKinds.Score)
        cardKit.setContainerPosition(scoringPile, 55 + 14 * index, 14)
        if (index > 0) {
            cardKit.linkContainers(scoringPile, RelativeDirections.RightOf, previousContainer)
        }
        previousContainer = scoringPile
        cardKit.linkContainers(cardKit.getContainerKindList(CardContainerKinds.Tableau)[index], RelativeDirections.Below, scoringPile)
    }
}
cardKit.createSelectEmptySlotEvent(CardContainerKinds.Tableau, SelectionButtons.A, function (container) {
    if (cardKit.containerHasCards(pickUpStack) && cardKit.getCardNumberAttribute(cardKit.getCard(pickUpStack, CardContainerPositions.First), CardAttributes.Rank) == 13) {
        while (cardKit.containerHasCards(pickUpStack)) {
            cardKit.moveCardBetween(pickUpStack, CardContainerPositions.First, container, CardContainerPositions.Last, CardFaces.Unchanged)
        }
        addCardToTableauPoints()
    }
    returnPickedUpCards()
})
cardKit.createSelectEmptySlotEvent(CardContainerKinds.Score, SelectionButtons.A, function (container) {
    if (cardKit.getContainerCardCount(pickUpStack) == 1) {
        cardAlreadyScored = false
        selectedCard = cardKit.getCard(pickUpStack, CardContainerPositions.First)
        selectedScoringPile = container
        scoreSingleCard()
    }
    returnPickedUpCards()
})
cardKit.createSelectEvent(CardContainerKinds.Tableau, SelectionButtons.A, function (container, card) {
    if (cardKit.containerHasCards(pickUpStack)) {
        if (cardKit.getCardNumberAttribute(cardKit.getCard(container, CardContainerPositions.Last), CardAttributes.Rank) == cardKit.getCardNumberAttribute(cardKit.getCard(pickUpStack, CardContainerPositions.First), CardAttributes.Rank) + 1) {
            if (cardKit.getCardNumberAttribute(cardKit.getCard(container, CardContainerPositions.Last), CardAttributes.SuitColor) != cardKit.getCardNumberAttribute(cardKit.getCard(pickUpStack, CardContainerPositions.First), CardAttributes.SuitColor)) {
                while (cardKit.containerHasCards(pickUpStack)) {
                    cardKit.moveCardBetween(pickUpStack, CardContainerPositions.First, container, CardContainerPositions.Last, CardFaces.Unchanged)
                }
                addCardToTableauPoints()
            }
        }
        returnPickedUpCards()
    } else {
        if (cardKit.getCardFaceUp(card)) {
            pickUpSourceContainer = container
            while (card != cardKit.getCard(container, CardContainerPositions.Last)) {
                cardKit.moveCardBetween(container, CardContainerPositions.Last, pickUpStack, CardContainerPositions.First, CardFaces.Unchanged)
            }
            cardKit.addCardTo(pickUpStack, card, CardContainerPositions.First, CardFaces.Unchanged)
        } else if (card == cardKit.getCard(container, CardContainerPositions.Last)) {
            // Since this is in-game, we can safely use the flip block to show the flipping animation here.
            cardKit.flipCard(cardKit.getCard(container, CardContainerPositions.Last))
            info.changeScoreBy(5)
        }
    }
})
// Since cards and card containers cannot be function parameters, variables like selectedScoringPile and selectedCard are being used in place of function parameters, and must be set before the function is called
function scoreSingleCard () {
    if (!(cardAlreadyScored)) {
        // Note that card ranks are numbers and card suits are strings, and must be retrieved using the correct blocks - if card suits are being retrieved as numbers, all of them would become NaN (not a number) which would incorrectly make all card suits the same as each other.
        if (cardKit.getContainerCardCount(selectedScoringPile) == 0) {
            if (cardKit.getCardNumberAttribute(selectedCard, CardAttributes.Rank) == 1) {
                cardKit.addCardTo(selectedScoringPile, selectedCard, CardContainerPositions.First, CardFaces.Unchanged)
                info.changeScoreBy(10)
                cardAlreadyScored = true
                checkWinCondition()
            }
        } else if (cardKit.getCardNumberAttribute(cardKit.getCard(selectedScoringPile, CardContainerPositions.First), CardAttributes.Rank) + 1 == cardKit.getCardNumberAttribute(selectedCard, CardAttributes.Rank)) {
            if (cardKit.getCardTextAttribute(cardKit.getCard(selectedScoringPile, CardContainerPositions.First), CardAttributes.Suit) == cardKit.getCardTextAttribute(selectedCard, CardAttributes.Suit)) {
                cardKit.addCardTo(selectedScoringPile, selectedCard, CardContainerPositions.First, CardFaces.Unchanged)
                info.changeScoreBy(10)
                cardAlreadyScored = true
                checkWinCondition()
            }
        }
    }
}
cardKit.createSelectEvent(CardContainerKinds.Score, SelectionButtons.A, function (container, card) {
    if (cardKit.containerHasCards(pickUpStack)) {
        if (cardKit.getContainerCardCount(pickUpStack) == 1) {
            cardAlreadyScored = false
            selectedCard = cardKit.getCard(pickUpStack, CardContainerPositions.First)
            selectedScoringPile = container
            scoreSingleCard()
        }
        returnPickedUpCards()
    } else {
        pickUpSourceContainer = container
        cardKit.moveCardBetween(container, CardContainerPositions.First, pickUpStack, CardContainerPositions.Last, CardFaces.Unchanged)
    }
})
// The setup tableau function deals out the initial spread for the game.
function setupTableau () {
    cardKit.shuffleCards(drawDeck)
    for (let index = 0; index <= 5; index++) {
        tableauStack = cardKit.getContainerKindList(CardContainerKinds.Tableau)[6 - index]
        for (let index2 = 0; index2 < 6 - index; index2++) {
            cardKit.moveCardBetween(drawDeck, CardContainerPositions.First, tableauStack, CardContainerPositions.Last, CardFaces.Down)
            pause(100)
        }
        // To flip the top card of the stack face up during setup, the set face up block is used to avoid showing the flip animation.
        cardKit.setCardFaceUp(cardKit.getCard(tableauStack, CardContainerPositions.Last), true)
    }
    cardKit.moveCursorInsideLayoutWithButtons(drawDeck)
}
let thrownCard: cardCore.Card = null
let scoringPile: cardCore.CardContainer = null
let tableauStack: cardCore.CardContainer = null
let previousContainer: cardCore.CardContainer = null
let drawDeck: cardCore.CardContainer = null
let selectedScoringPile: cardCore.CardContainer = null
let selectedCard: cardCore.Card = null
let cardAlreadyScored = false
let discardPile: cardCore.CardContainer = null
let scoredCardCount = 0
let pickUpSourceContainer: cardCore.CardContainer = null
let pickUpStack: cardCore.CardContainer = null
let isWinning = false
isWinning = false
scene.setBackgroundImage(assets.image`background`)
let titleCard = sprites.create(assets.image`title`, SpriteKind.Player)
titleCard.z = 300
pause(500)
sprites.destroy(titleCard, effects.bubbles, 1000)
pause(500)
setupGame()
setupTableau()
// Since card containers are not sprites, this game update action allows the picked up cards to follow the cursor. The cursor also bumps down (out) when cards are picked up.
game.onUpdate(function () {
    cardKit.setContainerPosition(pickUpStack, cardKit.getCursorSprite().x - 4, cardKit.getCursorSprite().y + 2)
    if (cardKit.containerHasCards(pickUpStack)) {
        cardKit.setCursorAnchor(CardCursorAnchors.TopRight, -2, 18)
    } else {
        cardKit.setCursorAnchor(CardCursorAnchors.TopRight, -2, 8)
    }
})
game.onUpdateInterval(500, function () {
    if (isWinning) {
        scoredCardCount = 0
        // This section of blocks shows how cards can be controlled like regular sprites. This should only be done only after a card is taken out of a container, or else the container would try to control the card as well, causing unexpected behaviors.
        for (let scoringPile of cardKit.getContainerKindList(CardContainerKinds.Score)) {
            scoredCardCount += cardKit.getContainerCardCount(scoringPile)
            if (cardKit.containerHasCards(scoringPile)) {
                thrownCard = cardKit.removeCardFrom(scoringPile, CardContainerPositions.First)
                thrownCard.setVelocity(randint(-80, 80), randint(-10, -20))
                thrownCard.ay = 300
                thrownCard.z = 200
                sprites.destroy(thrownCard, effects.disintegrate, 1000)
            }
        }
        if (scoredCardCount == 0) {
            game.setGameOverEffect(true, effects.bubbles)
            game.gameOver(true)
        }
    }
})
