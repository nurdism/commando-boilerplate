import { Client } from 'discord.js-commando'
import Database from './database'

export default class BotClient extends Client {
  constructor (options) {
    super(options)
    this.database = Database.db

    Database.start()
  }
}
