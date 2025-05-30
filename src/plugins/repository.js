import repository from '../api/api.repository.js'

export default {
  install: (app) => {
    app.config.globalProperties.$repository = repository
    app.provide('repository', repository)
  }
}
