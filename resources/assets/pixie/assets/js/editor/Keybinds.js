'use strict'

angular.module('ImageEditor')

  .factory('keybinds', ['$rootScope', function ($rootScope) {
    const keybinds = {

      fabric: false,

      history: false,

      init: function (fabric) {
        this.fabric = fabric
        this.history = angular.element($('#editor')).injector().get('history')
        init()
      },

      destroy: function () {
        $('.canvas-container').off('keydown', handleKeyDown, false)
      }
    }

    function init () {
      $(document).on('keydown', handleKeyDown)
    }

    function handleKeyDown (e) {
      e = e || window.event

      if ([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        moveObject(e)
      }
      if (e.keyCode === 46) {
        deleteObject()
      }
    }

    function deleteObject () {
      const activeObject = keybinds.fabric.getActiveObject()

      if (activeObject) {
        keybinds.fabric.remove(activeObject)
        keybinds.fabric.renderAll()
      }
      keybinds.history.add('Delete ' + activeObject.type, 'delete')
    }

    function moveObject (e) {
      const movementDelta = 2

      const activeObject = keybinds.fabric.getActiveObject()
      const activeGroup = keybinds.fabric.getActiveGroup()

      if (e.keyCode === 37) {
        e.preventDefault()
        if (activeObject) {
          const a = activeObject.get('left') - movementDelta
          activeObject.set('left', a)
        } else if (activeGroup) {
          const a = activeGroup.get('left') - movementDelta
          activeGroup.set('left', a)
        }
      } else if (e.keyCode === 39) {
        e.preventDefault()
        if (activeObject) {
          const a = activeObject.get('left') + movementDelta
          activeObject.set('left', a)
        } else if (activeGroup) {
          const a = activeGroup.get('left') + movementDelta
          activeGroup.set('left', a)
        }
      } else if (e.keyCode === 38) {
        e.preventDefault()
        if (activeObject) {
          const a = activeObject.get('top') - movementDelta
          activeObject.set('top', a)
        } else if (activeGroup) {
          const a = activeGroup.get('top') - movementDelta
          activeGroup.set('top', a)
        }
      } else if (e.keyCode === 40) {
        e.preventDefault()
        if (activeObject) {
          const a = activeObject.get('top') + movementDelta
          activeObject.set('top', a)
        } else if (activeGroup) {
          const a = activeGroup.get('top') + movementDelta
          activeGroup.set('top', a)
        }
      }

      if (activeObject) {
        activeObject.setCoords()
        keybinds.fabric.renderAll()
      } else if (activeGroup) {
        activeGroup.setCoords()
        keybinds.fabric.renderAll()
      }

      const last = keybinds.history.getLatest('all')
      if (last.elementId === activeObject.$$hashKey) {
        keybinds.history.change('Changed ' + activeObject.type, 'more', false, activeObject.$$hashKey)
      } else {
        keybinds.history.add('Changed ' + activeObject.type, 'more', false, activeObject.$$hashKey)
      }
    }

    return keybinds
  }])
