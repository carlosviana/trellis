import { createStore } from 'redux'
import PouchDB from 'pouchdb'

export default class Store {
  constructor() {
    const db            = PouchDB('trellis')
    const remoteCouch   = false


    // Load initial state from local storage or json file
    db.get("1").then((doc) => {
      this.reduxStore.dispatch({
        type: 'SET_STATE',
        state: doc
      })
    })

    this.reduxStore = createStore((state = {}, action) => {
      switch(action.type) {
        case 'UPDATE_CARD':
          return this.updateCardTransform(state, action)
        case 'CREATE_CARD':
          return this.createCardTransform(state, action)
        case 'DELETE_CARD':
          return this.deleteCardTransform(state, action)
        case 'SET_STATE':
          return action.state
        default:
          return state
      }
    })

    this.subscribe = this.reduxStore.subscribe
    this.getState  = this.reduxStore.getState

    this.subscribe(() => {
      console.log("new state", this.getState())
      let state = this.getState()
      state._id = "1"

      db.put(state, (err, result) => {
        if(err) console.log(err)
      })
    })
  }

  createCard(attributes) {
    this.reduxStore.dispatch({
      type: 'CREATE_CARD',
      attributes: attributes
    })
  }

  createCardTransform(state, action) {
    let nextId = Math.max.apply(null, state.cards.map((c) => c.id)) + 1
    let card   = Object.assign({}, action.attributes, { id: nextId })
    let cards  = [...state.cards, card]

    return Object.assign({}, state, { cards: cards })
  }

  updateCard(card) {
    this.reduxStore.dispatch({
      type: 'UPDATE_CARD',
      card: card
    })
  }

  updateCardTransform(state, action) {
    let newCard = action.card
    let cards   = state.cards

    let cardIndex = cards.findIndex((card) => {
      return card.id === newCard.id
    })

    cards[cardIndex] = newCard

    return Object.assign({}, state, { cards: cards })
  }

  deleteCard(card) {
    this.reduxStore.dispatch({
      type: 'DELETE_CARD',
      card: card
    })
  }

  deleteCardTransform(state, action) {
    let deleteCard = action.card
    let cards = state.cards

    let cardIndex = cards.findIndex((card) => {
      return card.id === deleteCard.id
    })

    cards = cards.slice(0, cardIndex).concat(cards.slice(cardIndex+1, cards.length))

    return Object.assign({}, state, { cards: cards })
  }

  findCard(cardId) {
    let state = this.getState()

    return state.cards.find((card) => {
      return cardId === card.id
    })
  }

  findCardsByList(listId) {
    return this.getState().cards.filter((card) => {
      return card.listId === listId
    })
  }

  findList(listId) {
    let state = this.getState()

    return state.lists.find((list) => {
      return listId === list.id
    })
  }

}
