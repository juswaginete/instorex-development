const mix = require('laravel-mix')

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

// const pages = [
//   'contents/index.js',
//   'dynamic_playlists/edit.js',
//   'dynamic_playlists/create.js',
//   'dynamic_playlists/index.js',
//   'dynamic_playlists/show.js'
// ]
mix
  .autoload({
    jquery: ['$', 'jQuery', 'window.jQuery'],
    'popper.js/dist/umd/popper': ['Popper'],
    moment: ['moment', 'window.moment']
  })
  .js('resources/assets/js/app.js', 'public/js')
  .extract([
    'lodash',
    'bootstrap',
    'prettysize',
    'jquery',
    'jquery-ui/ui/widgets/draggable',
    'jquery-ui/ui/widgets/selectable',
    'jquery-ui/ui/widgets/sortable',
    'jquery-ui-touch-punch',
    'popper.js/dist/esm/popper',
    'jstree',
    'bootbox',
    'pnotify',
    'urijs',
    'axios',
    'moment',
    'tempusdominus-bootstrap-4'
  ])
  .sass('resources/assets/sass/app.scss', 'public/css')
  .copy('resources/assets/pixie/config.json', 'public/pixie')
  .copy('resources/assets/pixie/assets/css/*', 'public/pixie/css')
  .copy('resources/assets/pixie/assets/fonts/*', 'public/pixie/fonts')
  .copyDirectory('resources/assets/pixie/assets/images', 'public/pixie/images')
  // .less('resources/assets/pixie/assets/less/main.less', 'public/css/pixie.css', {path: 'resources/assets/pixie/less'})
  // .styles('resources/assets/pixie/assets/css/main.css', 'public/css/pixie.css')
  // .scripts('resources/assets/pixie/assets/js/scripts.min.js', 'public/js/pixie.js')

// pages.forEach((file) => {
//   mix.js('resources/assets/js/pages/' + file, 'public/js/pages/' + file)
// })

if (mix.config.inProduction) {
  mix.version()
  mix.webpackConfig({
    module: {
      rules: [{
        test: /index\.js$/,
        use: [{
          loader: 'babel-loader',
          options: mix.config.babel()
        }]
      }]
    }
  })
}
