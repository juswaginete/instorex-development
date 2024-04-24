import * as _ from 'lodash'
import bootbox from 'bootbox'

const myDialog = (dialog, opts) => {
  opts = opts || {}
  dialog.init(() => {
    const $header = $(dialog).find('.modal-header');
    $header.find('h4').addClass('mx-auto').after($header.find('button'));
    if (opts.type) {
      switch (opts.type) {
        case 'danger':
        case 'error':
          $header.addClass('bg-danger text-white')
          break
        case 'primary':
          break
      }
    }
    if (_.isFunction(opts.init)) {
      opts.init(dialog)
    }
  })
  return dialog
}

const InstoreX = {
  // An XOR function
  XOR: (a, b) => {
    return (a && !b) || (!a && b)
  },
  dialogs: {
    error: opts => (
      myDialog(bootbox.alert(_.assign({}, {
        title: 'Error'
      }, opts)), {
        type: 'danger',
        init: (dialog) => {
          $(dialog)
            .find('.modal-footer [data-bb-handler="ok"]')
            .removeClass('btn-primary')
            .addClass('btn-danger')
        }
      })
    ),
    custom: myDialog
  },
  setLoading: ($container, load) => {
    if (load) {
      $container.append(
        $('<div class="overlay d-flex justify-content-center align-items-center"><i class="fa fa-spinner spinner font-huge"></i></div>')
      ).css('position', 'relative')
    } else {
      $container.find('.overlay').remove()
    }
  },
  notify: (options) => {
    const notice = new PNotify(options)
    notice.get().click(function () {
      notice.remove()
    })
  },

  /**
   *
   * @param {Array} list
   * @param {Function} comparisonFunction
   * @param {string} string
   * @param {boolean=} emptySearchMatchesAll
   */
  search: (list, comparisonFunction, string, emptySearchMatchesAll) => {
    const searches = string
      .toLowerCase()
      .split('+')
      .map((s) => {
        return s.trim()
      })
      .filter((s) => {
        return !!s
      })

    emptySearchMatchesAll = emptySearchMatchesAll || true

    return (searches.length === 0 && emptySearchMatchesAll) ? list : _.filter(list, (playlist) => {
      return _.some(searches, (search) => {
        return comparisonFunction(playlist, search)
      })
    })
  },

  /**
   *
   * @param {string=} part
   * @param {jQuery=} $modal
   * @returns {jQuery}
   */
  getCurrentModal: (part, $modal) => {
    $modal = $modal || $('.bootbox.modal').first()
    switch (part) {
      case 'header':
      case 'body':
      case 'footer':
        return $modal.find('.modal-' + part)
      case 'alert':
        return $modal.find('.modal-body .alert')
      case undefined:
      case null:
      case '':
        return $modal
      default:
        return $modal.find('.modal-footer').find('[data-bb-handler="' + part + '"]')
    }
  }
}

export default InstoreX
