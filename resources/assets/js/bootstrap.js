try {
  window._ = require('lodash')
  window.moment = require('moment')
  window.URI = require('urijs')
  require('urijs/src/URI.fragmentQuery')
  window.pretty = require('prettysize')
  window.$ = window.jQuery = require('jquery')
  require('jquery-ui/ui/widgets/draggable')
  require('jquery-ui/ui/widgets/selectable')
  require('jquery-ui/ui/widgets/sortable')
  window.Popper = require('popper.js/dist/umd/popper')
  require('bootstrap')
  require('jquery-ui-touch-punch')
  require('tempusdominus-bootstrap-4')
  require('jstree')
  window.bootbox = require('bootbox')
  window.PNotify = require('pnotify')
  window.axios = require('axios')

  window.moment.locale('da')
  window.PNotify.prototype.options.styling = 'fontawesome'
  window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

  let token = document.head.querySelector('meta[name="csrf-token"]')

  if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content
  } else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token')
  }
} catch (e) {
  console.error('Error loading all javascript modules')
  console.error(e)
}
