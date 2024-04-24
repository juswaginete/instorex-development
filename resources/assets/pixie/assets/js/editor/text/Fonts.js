'use strict'

angular.module('image.text')

  .directive('edFontsPagination', ['$rootScope', 'fonts', function ($rootScope, fonts) {
    return {
      restrict: 'A',
      link: function ($scope, el) {
        // initiate pagination plugin
        el.pagination({
          items: 0,
          itemsOnPage: fonts.paginator.perPage,
          onPageClick: function (num) {
            $scope.$apply(function () {
              fonts.paginator.selectPage(num)
            })
          }
        })

        // redraw pagination bar on total items change
        $scope.$watch('fonts.paginator.totalItems', function (value) {
          if (value) { el.pagination('updateItems', value) }
        })
      }
    }
  }])

  .factory('fonts', ['$rootScope', '$http', '$timeout', '$filter', 'localStorage', 'settings', function ($rootScope, $http, $timeout, $filter, localStorage, settings) {
    const fonts = {

      loadedLocal: false,
      loadedGoogle: false,

      paginator: {

        /**
         * All available fonts.
         *
         * @type {Array}
         */
        sourceItems: [],

        /**
         * All available fonts with filtrs applied.
         */
        filteredItems: [],

        /**
         * Fonts currently being shown.
         *
         * @type {Array}
         */
        currentItems: [],

        /**
         * Fonts to show per page.
         *
         * @type int
         */
        perPage: 17,

        /**
         * Total number of fonts.
         *
         * @type int
         */
        totalItems: 0,

        /**
         * Slice items for the given page.
         *
         * @param  {int} page
         * @return void
         */
        selectPage: function (page) {
          this.currentItems = this.filteredItems.slice(
            (page - 1) * this.perPage, (page - 1) * this.perPage + this.perPage
          )

          fonts.load()
        },

        filter: function (filters) {
          this.start($filter('filter')(fonts.paginator.sourceItems, filters))
        },

        /**
         * Start the paginator with given items.
         *
         * @param  {Array} items
         * @return void
         */
        start: function (items) {
          this.filteredItems = items
          this.totalItems = items.length
          this.currentItems = items.slice(0, this.perPage)

          fonts.load()
        }
      },

      runFilter: function (filters) {
        const self = this
        if (self.loadedGoogle && self.loadedLocal) {
          filters ? self.paginator.filter(filters) : self.paginator.start(self.paginator.sourceItems)
        }
      },

      /**
       * Fetch all available fonts from GoogleFonts API.
       *
       * @return void
       */
      getAll: function (filters) {
        const self = this
        const googleCached = localStorage.get('googleFonts')
        const localCached = localStorage.get('localFonts')
        const key = $rootScope.keys['google_fonts']

        if (googleCached) {
          $.merge(fonts.paginator.sourceItems, googleCached)
          self.loadedGoogle = true
          self.runFilter(filters)
        } else {
          $http.get('https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=' + key)
            .success(function (data) {
              const items = data.items.map(function (item) {
                item.instorexType = 'google'
                return item
              })
              localStorage.set('googleFonts', items)
              $.merge(fonts.paginator.sourceItems, items)
              self.loadedGoogle = true
              self.runFilter(filters)
            })
        }

        if (localCached) {
          $.merge(fonts.paginator.sourceItems, localCached)
          self.loadedLocal = true
          self.runFilter(filters)
        } else {
          $rootScope.$on('settings.ready', function () {
            const items = settings.get('fonts') || []
            $.merge(fonts.paginator.sourceItems, items)
            self.loadedLocal = true
            self.runFilter(filters)
          })
        }
      },

      getByFontFamily: function (name) {
        return fonts.paginator.sourceItems.find(function (font) {
          return font.family === name
        })
      },

      /**
       * Load given google fonts into the DOM.
       *
       * @return void
       */
      load: function () {
        const self = this
        const head = $('head')

        // Group fonts
        const grouped = {google: [], local: []}
        fonts.paginator.currentItems
          .forEach(function (item) {
            grouped[item.instorexType].push(item.family)
          })

        // Parse google fonts
        if (grouped.google.length) {
          // remove previous page fonts
          $(head).find('#dynamic-fonts').remove()

          // load the given fonts
          head.append(
            '<link rel="stylesheet" id="dynamic-fonts" href="https://fonts.googleapis.com/css?family=' +
            grouped.google.join('|').replace(/ /g, '+') + '">'
          )
        }

        // Parse local fonts
        grouped.local.forEach(function(font) {
          self.createLinkToLocalFont(font, 'font-' + font, $('#font-' + font))
        })
      },

      createLinkToLocalFont: function (name, id, $link) {
        if (!$link[0]) {
          $link = $(['<style type="text/css" id="' + id + '">',
            '@font-face {',
            '    font-family: ' + name + ';',
            '    src: url("/pixie/fonts/' + name + '.eot"); /* IE9 Compat Modes */',
            '    src: url("/pixie/fonts/' + name + '.eot?#iefix") format("embedded-opentype"), /* IE6-IE8 */',
            '         url("/pixie/fonts/' + name + '.woff") format("woff"), /* Modern Browsers */',
            '         url("/pixie/fonts/' + name + '.ttf")  format("truetype"), /* Safari, Android, iOS */',
            '         url("/pixie/fonts/' + name + '.svg#svgFontName") format("svg"); /* Legacy iOS */',
            '}',
            '</style>'].join('\n'))
          $('head').append($link)
        }
        return $link
      },

      createLinkToGoogleFont: function (name, id, $link) {
        if ($link[0]) {
          $link.attr('href', 'https://fonts.googleapis.com/css?family=' + name)
        } else {
          $link = $('<link rel="stylesheet" id="' + id + '" href="https://fonts.googleapis.com/css?family=' + name + '">')
          $('head').append($link)
        }
        return $link
      },

      createLinkToFont: function (font, onLoadedCallback) {
        const name = font.family.replace(/ /g, '+')
        const id = 'font-' + name
        const $link = $('#' + id)
        switch (font.instorexType) {
          case 'google':
            return fonts.createLinkToGoogleFont(name, id, $link)
          case 'local':
            return fonts.createLinkToLocalFont(name, id, $link)
        }
      }
    }

    return fonts
  }])
