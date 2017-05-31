'use strict'

const exec = require('child_process').exec
const fs = require('fs-extra')
const path = require('path')
const Generator = require('./generator')
const glob = require('glob-promise')

/**
 * App Generator
 */
class AppGenerator extends Generator {
  async run () {
    console.log(`  Generating app ${this.rawName()} ...`)

    await this.copyAppTemplate()
    await this.replacePlaceholders()
    await this.renameMigration()
    await this.initializeGit()

    console.log(`  App located at ./${this.appPath}`)
  }

  get templatePath () {
    return path.join(__dirname, '.', 'templates', 'app')
  }

  get appPath () {
    return path.join('.', this.rawName())
  }

  copyAppTemplate () {
    return fs.copy(this.templatePath, this.appPath)
  }

  initializeGit () {
    return new Promise((resolve, reject) => {
      exec(`git init ${this.appPath}`, function (err) {
        if (err) {
          return reject(err)
        }

        return resolve()
      })
    })
  }

  async replacePlaceholders () {
    let files = await glob(path.join(this.appPath, '**', '*'))

    await Promise.all(files.map(async (file) => {
      await this.replacePlaceholderInFile(file)
    }))
  }

  renameMigration () {
    let migration = path.join(this.appPath, 'db', 'migrations', '0_setup_database.js')
    let newName = path.join(this.appPath, 'db', 'migrations', `${this.yyyymmddhhmmss()}_setup_database.js`)

    return fs.rename(migration, newName)
  }
}

module.exports = AppGenerator
