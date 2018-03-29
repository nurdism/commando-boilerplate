import Sequelize from 'sequelize'
import logger from 'winston'

const { NODE_ENV, DATABASE } = process.env
const dev = NODE_ENV !== 'production'
const database = new Sequelize(dev ? 'sqlite://development.db' : DATABASE, { logging: false, operatorsAliases: false })

export default class Database {
  static get db () {
    return database
  }

  static start () {
    database.authenticate()
      .then(() => logger.info('[DATABASE]: Connection to database has been established successfully.'))
      .then(() => logger.info('[DATABASE]: Synchronizing database...'))
      .then(() => database.sync()
        .then(() => logger.info('[DATABASE]: Done Synchronizing database!'))
        .catch(error => logger.error(`[DATABASE]: Error synchronizing the database: \n${error}`))
      )
      .catch(error => {
        logger.error(`[DATABASE]: Unable to connect to the database: \n${error}`)
        logger.error(`[DATABASE]: Try reconnecting in 5 seconds...`)
        setTimeout(() => Database.start(), 5000)
      })
  }
}
