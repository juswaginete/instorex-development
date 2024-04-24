'use strict'

angular
  .module('ImageEditor')
  .controller('TopPanelController', ['$rootScope', '$scope', '$mdDialog', '$mdToast', '$$rAF', 'canvas', 'history', 'saver', function ($rootScope, $scope, $mdDialog, $mdToast, $$rAF, canvas, history, saver) {
    $scope.history = history

    $scope.isDemo = $rootScope.isDemo
    $scope.canOpenImage = false
    $scope.canvas = canvas
    $scope.openImageMode = 'open'

    $scope.canvasWidth = 800
    $scope.canvasHeight = 600

    $scope.imageName = null
    $scope.imageType = 'json'
    $scope.imageQuality = 8

    $scope.objectsPanelOpen = false
    $scope.historyPanelOpen = false

    $scope.enableSaveButton = function () {
      if ($scope.imageName) {
        return ($scope.imageName.length >= 1 && window.localStorage.getItem('jstree') === null)
      }
      return true
    }

    $scope.openNewCanvasDialog = function ($event) {
      document.location.search = ''
      //$mdDialog.show({
      //  template: $('#main-start-create-image').html(),
      //  targetEvent: $event,
      //  controller: 'TopPanelController',
      //  clickOutsideToClose: true
      //})
    }

    $scope.openUploadDialog = function ($event) {
      $mdDialog.show({
        template: $('#main-image-upload-dialog-template').html(),
        targetEvent: $event,
        controller: 'TopPanelController',
        clickOutsideToClose: true
      })
    }

    $scope.toggleRightPanel = function (name, e) {
      const panelIsOpen = $scope[name + 'PanelOpen']

      if (panelIsOpen) {
        $scope[name + 'PanelOpen'] = false
        $('#' + name).hide()
      } else {
        $scope[name + 'PanelOpen'] = true
        $('#' + name).show()
      }
    }

    $scope.transformOpen = function (name, e) {
      const panel = $('#' + name)

      panel.removeClass('transition-out transition-in').show()
      $scope.transformToClickElement(panel, e)

      $$rAF(function () {
        panel.addClass('transition-in').css('transform', '')
        e.currentTarget.blur()
      })
    }

    $scope.transformClose = function (name, e) {
      const panel = $('#' + name)

      panel.addClass('transition-out').removeClass('transition-in')
      $scope.transformToClickElement(panel, e)

      panel.one($rootScope.transitionEndEvent, function () {
        panel.hide().css('transform', '').removeClass('transition-out')
        e.currentTarget.blur()
      })
    }

    $scope.transformToClickElement = function (panel, e) {
      const clickRect = e.target.getBoundingClientRect()
      const panelRect = panel[0].getBoundingClientRect()

      const scaleX = Math.min(0.5, clickRect.width / panelRect.width)
      const scaleY = Math.min(0.5, clickRect.height / panelRect.height)

      panel.css('transform', 'translate3d(' +
        (-panelRect.left + clickRect.left + clickRect.width / 2 - panelRect.width / 2) + 'px,' +
        (-panelRect.top + clickRect.top + clickRect.height / 2 - panelRect.height / 2) + 'px,' +
        '0) scale(' + scaleX + ',' + scaleY + ')'
      )
    }

    $scope.openSaveDialog = function ($event) {
      if ($rootScope.getParam('onSaveButtonClick')) {
        $rootScope.getParam('onSaveButtonClick')()
      }

      if ($rootScope.delayEditorStart) {
        return saver.saveImage()
      }

      $mdDialog.show({
        template: $('#save-image-dialog').html(),
        targetEvent: $event,
        controller: 'TopPanelController',
        clickOutsideToClose: true,
      })
    }

    $scope.createNewCanvas = function (width, height) {
      canvas.openNew(width, height)
      $scope.closeUploadDialog()
      $rootScope.started = true
      $rootScope.resetUI()
    }

    $scope.openSampleImage = function () {
      canvas.loadMainImage('pixie/images/lotus.jpg')
      $scope.closeUploadDialog()
      $rootScope.started = true
    }

    $scope.saveImage = function ($event) {
      saver.saveImage($scope.imageType, $scope.imageQuality, $scope.imageName, $event)
    }

    $scope.showImagePreview = function (url) {
      let historyObject = url

      try {
        historyObject = JSON.parse(url)
      } catch (e) {
        //
      }

      if (historyObject && historyObject.state) {
        setTimeout(function () {
          $scope.$apply(function () {
            $scope.canOpenImage = false
          })
        }, 10)

        canvas.fabric.clear()
        history.load(historyObject)
        $scope.closeUploadDialog()
        $rootScope.started = true
        return historyObject
      }

      fabric.util.loadImage(url, function (image) {
        if (image) {
          $scope.$apply(function () {
            $('.img-preview').html('').append(image)
            $scope.canOpenImage = true
          })
        } else {
          $scope.$apply(function () {
            $scope.canOpenImage = false
          })
        }
      })
    }

    $scope.openImage = function () {
      const url = $('.img-preview img').attr('src')

      if (!url || !$scope.canOpenImage) return

      if ((!canvas.fabric._objects.length || !canvas.mainImage) && !$rootScope.userPreset) {
        canvas.fabric.clear()
        canvas.loadMainImage(url)
      } else {
        canvas.openImage(url, function () {
          history.add('Add image', 'panorama-wide-angle')
        })
      }

      $scope.closeUploadDialog()
      $rootScope.started = true
    }

    $scope.closeUploadDialog = function () {
      $scope.canUploadImage = false
      $scope.openImageMode = 'open'
      $('.img-preview').html()
      $mdDialog.hide()
    }
  }])



