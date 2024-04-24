angular.module('image.text')

  .controller('TextController', ['$scope', '$rootScope', '$timeout', 'canvas', 'text', 'fonts', 'history', function ($scope, $rootScope, $timeout, canvas, text, fonts, history) {
    $scope.text = text
    $scope.fonts = fonts

    $scope.opacity = 1
    $scope.fontSize = 25
    $scope.enableOutline = true
    $scope.filters = {
      category: 'custom',
      family: ''
    }

    $scope.isPanelEnabled = function () {
      const obj = canvas.fabric.getActiveObject()
      return obj && obj.name === 'text' && $rootScope.activeTab === 'text'
    }

    $scope.changeFont = function (font, e) {
      const active = canvas.fabric.getActiveObject()
      $rootScope.openPanel('text', e)

      if (!active || active.name !== 'text') {
        const newText = new fabric.IText('Double click me to edit my contents.', {
          fontWeight: 400,
          fontSize: 28 / canvas.currentZoom,
          fill: '#fff',
          removeOnCancel: true,
          name: 'text'
        })

        canvas.fabric.add(newText)
        newText.setTop(25)
        newText.setLeft(25)
        canvas.fabric.setActiveObject(newText)
        canvas.fabric.renderAll()
      }

      text.setProperty('fontFamily', font)
    }

    $scope.cancelAddingTextToCanvas = function () {
      const textObject = text.getTextObject()

      if (textObject.removeOnCancel) {
        text.removeTextFromCanvas(textObject)
      }

      $rootScope.activePanel = false
    }

    $scope.finishAddingTextToCanvas = function () {
      const textObject = text.getTextObject()
      const fontObject = fonts.getByFontFamily(textObject.fontFamily)

      $rootScope.activePanel = false
      $rootScope.$emit('text.added', textObject)
      // canvas.fabric.setActiveObject(canvas.mainImage);
      canvas.fabric.discardActiveObject(textObject)
      fonts.createLinkToFont(fontObject)
    }

    $rootScope.$on('tab.changed', function (e, name) {
      if (name === 'text') {
        const textObject = $scope.text.getTextObject()

        // if we can find an existing text object set it as active
        if (textObject) {
          textObject.removeOnCancel = false
          canvas.fabric.setActiveObject(textObject)
        }
      }
    })

    fonts.getAll($scope.filters)
  }])