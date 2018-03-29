import logger from 'winston'
import { resolve } from 'path'
import { FriendlyError } from 'discord.js-commando'

import Client from './structures/client'
import SequelizeProvider from './providers/Sequelize'

const { OWNERS, COMMAND_PREFIX, TOKEN, NODE_ENV } = process.env

// logger
logger.remove(logger.transports.Console)
logger.add(logger.transports.Console, {
  level: NODE_ENV !== 'production' ? 'debug' : 'warn',
  colorize: true,
  json: false
})

// client
const client = new Client({
  owner: OWNERS.split(','),
  commandPrefix: COMMAND_PREFIX,
  unknownCommandResponse: false,
  disableEveryone: true
})

client.setProvider(new SequelizeProvider(client.database))

client
  .on('error', logger.error)
  .on('warn', logger.warn)
  .on('debug', logger.debug)
  .on('ready', () => {
    logger.info(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`)
  })
  .on('disconnect', () => { console.warn('Disconnected!') })
  .on('reconnecting', () => { console.warn('Reconnecting...') })
  .on('commandError', (cmd, err) => {
    if (err instanceof FriendlyError) return
    logger.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err)
  })
  .on('commandBlocked', (msg, reason) => {
    logger.info(`Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''} blocked; ${reason}`)
  })
  .on('commandPrefixChange', (guild, prefix) => {
    logger.info(`Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.`)
  })
  .on('commandStatusChange', (guild, command, enabled) => {
    logger.info(`Command ${command.groupID}:${command.memberName} ${enabled ? 'enabled' : 'disabled'} ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.`)
  })
  .on('groupStatusChange', (guild, group, enabled) => {
    logger.info(`Group ${group.id} ${enabled ? 'enabled' : 'disabled'} ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.`)
  })

client.registry
  .registerGroup('fun', 'Fun')
  .registerDefaults()
  .registerCommandsIn(resolve(__dirname, 'commands'))

client.login(TOKEN)
