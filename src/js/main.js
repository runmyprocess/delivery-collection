(function (DELIVERY, undefined) {
  /*
       Requires the Lodash library (https://lodash.com/)
       Optionlly requires the CKEditor 4 library (https://ckeditor.com/ckeditor-4/)
   */

  /* eslint no-console: "off" */
  /* global window console $ _ RMPApplication alertify CKEDITOR */

  'use strict'

  // TODO : Shall be removed when this code will be integrated into the Delivery Library
  // DELIVERY.alert will be replaced by SweetAlert 2
  DELIVERY.alert = alertify
  DELIVERY.backoffice = {}

  DELIVERY.editor = ''

  var debug = true

  // Private variable
  // Backoffice configuration
  // Those default parameters may be modified through the setConfig function
  var defaultConfig = {
    key: null,
    lang: 'en',
    collection: 'col_item',
    widget_form: 'id_form',
    widget_action: 'id_action',
    widget_report: 'id_report',
    modal: {
      width: 200
    },
    editor: null,
    message: {
      en: {
        create: {
          title: 'Create a new item',
          button: 'Create',
          success: 'The item was successfully created.',
          failure: 'An error occurred while adding the item. Please contact your administrator.'
        },
        read: {
          failure: 'An error occurred while loading the item. Please contact your administrator.'
        },
        update: {
          title: 'Update an existing item',
          button: 'Update',
          success: 'The item was successfully updated.',
          failure: 'An error occurred while updating the item. Please contact your administrator.'
        },
        delete: {
          success: 'The item was successfully deleted.',
          failure: 'An error occurred while deleting the item. Please contact your administrator.'
        },
        check: {
          exist: 'This item already exists in the collection.',
          required: 'Please fill in all the required fields.',
          failure: 'An error occurred while checking if the item already exists. Please contact your administrator.'
        },
        open: {
          failure: 'An error occurred while opening the form. Please contact your administrator.'
        },
        setup: {
          failure: 'An error occurred while starting the back office. Please contact your administrator.'
        }
      },
      fr: {
        create: {
          title: 'Créer un nouvel élément',
          button: 'Créer',
          success: "L'élément a été créé avec succès.",
          failure: "Une erreur s'est produite lors de l'ajout de l'élément. Veuillez contacter votre administrateur."
        },
        read: {
          failure: "Une erreur s'est produite lors du chargement de l'élément. Veuillez contacter votre administrateur."
        },
        update: {
          title: 'Modifier un élément existant',
          button: 'Modifier',
          success: "L'élément a été modifié avec succès.",
          failure: "Une erreur s'est produite lors de la modification de l'élément. Veuillez contacter votre administrateur."
        },
        delete: {
          success: "L'élément a été supprimé avec succès.",
          failure: "Une erreur s'est produite lors de la suppression de l'élément. Veuillez contacter votre administrateur."
        },
        check: {
          exist: 'Cet élément existe déjà dans la collection.',
          required: 'Veuillez renseigner tous les champs obligatoires.',
          failure: "Une erreur s'est produite lors du contrôle d'unicité de l'élément. Veuillez contacter votre administrateur."
        },
        open: {
          failure: "Une erreur s'est produite lors de l'ouverture du formulaire. Veuillez contacter votre administrateur."
        },
        setup: {
          failure: "Une erreur s'est produite lors du démarrage du back office. Veuillez contacter votre administrateur."
        }
      }
    },
    ckeditor: {
      language: 'fr',
      toolbarGroups: [
        { name: 'clipboard', groups: ['clipboard', 'undo'] },
        // {"name": "insert"},
        { name: 'document', groups: ['mode'] },
        '/',
        { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
        { name: 'paragraph', groups: ['list', 'indent'] },
        { name: 'links' }
        // {"name": "styles"}
      ],
      width: 600,
      // "this.baseFloatZIndex": 102000,
      format_tags: 'p;h1;h2;h3'
    }
  }

  // Define the styles for the console messages
  var style = {
    error: [
      'font-weight: bold',
      'color: #F00'
    ].join(';'),
    standard: [
      'font-weight: normal',
      'color: #000'
    ].join(';')
  }

  /*
       CREATE
       Create a new backoffice
       @instanceName : Name of the backoffice
       @configuration (optional): Parameters of the backoffice
       Public method
   */
  DELIVERY.backoffice.create = function (instanceName, configuration) {
    // CHECK: If the Lodash library isn't available, , display an error message and abort
    if (typeof (_) === 'undefined' || typeof (_.VERSION) !== 'string') {
      DELIVERY.alert.error(defaultConfig.message[defaultConfig.lang].setup.failure)
      console.log("%cERROR: %cYou shall add the Lodash library (https://lodash.com/) to the web interface's JavaScript files.", style.error, style.standard)
      return false
    }

    // CHECK: If "instance name" isn't properly defined, display an error message and abort
    if (!instanceName || !_.isString(instanceName) || _.size(_.trim(instanceName)) === 0) {
      DELIVERY.alert.error(defaultConfig.message[defaultConfig.lang].setup.failure)
      console.log('%cERROR: %cYou shall define an instance name (string) as the first parameter of the DELIVERY.backoffice.create function.', style.error, style.standard)
      return false
    }

    if (configuration && !_.isPlainObject(configuration)) {
      DELIVERY.alert.error(defaultConfig.message[defaultConfig.lang].setup.failure)
      console.log('%cERROR: %cThe configuration passed as the second parameter of the DELIVERY.backoffice.create function shall be a plain object.', style.error, style.standard)
      return false
    }

    // Create a new instance of DELIVERY.Backoffice
    // Register this instance under the "DELIVERY.backoffice.instanceName" global variable
    instanceName = _.replace(_.trim(instanceName), ' ', '_')
    DELIVERY.backoffice[instanceName] = new Backoffice(instanceName, configuration)
  }

  /*
       BACKOFFICE
       Object constructor
   */
  /**
   *
   */
  function Backoffice (instanceName, configuration) {
    if (debug === true) {
      console.log('DEBUG: New Backoffice object instance created (Name: ' + instanceName + ')')
      console.log('DEBUG: (' + instanceName + ' back office) configuration:')
      console.log(configuration)
    }

    // CHECK: If the constructor was called without "new", run the constructor again with "new" keyword
    if (!(this instanceof Backoffice)) {
      console.log('You shall use the "new" keyword when calling the Backoffice constructor.')
      return new Backoffice(instanceName, configuration)
    }

    // Set the parameters
    this.name = 'DELIVERY.backoffice.' + instanceName

    // Merge user specified configuration with default configuration
    configuration = _.merge(defaultConfig, configuration)

    this.key = _.get(configuration, 'key')
    this.lang = _.get(configuration, 'lang')
    this.collection = _.get(configuration, 'collection')
    this.widget_form = _.get(configuration, 'widget_form')
    this.widget_action = _.get(configuration, 'widget_action')
    this.widget_report = _.get(configuration, 'widget_report')
    this.editor = _.get(configuration, 'editor')

    this.modal = _.get(configuration, 'modal')
    this.message = _.get(configuration, 'message')
    this.ckeditor = _.get(configuration, 'ckeditor')

    // CHECK: If the Web Interface isn't properly configured, display an error message and abort
    if (!checkInterface.call(this)) {
      DELIVERY.alert.error(this.message[this.lang].open.failure)
      return false
    }

    // Public method
    // Open the edition modal window
    // action : create or update
    // uid : Unique ID (uuid) of the item in the collection
    this.editItem = function (action, uid) {
      if (debug === true) { console.log('DEBUG: (' + this.name + ') Edit Item') }

      // CHECK: If the 'action' parameter isn't properly defined, display an error message and abort
      if (!action || !_.isString(action) || !_.includes(['create', 'update'], action)) {
        DELIVERY.alert.error(this.message[this.lang].setup.failure)
        console.log("%cERROR: %cUnrecognized 'action' parameter passed to the editItem function. Should be 'create' or 'update'.", style.error, style.standard)
        return false
      }

      // CHECK: If the 'uid' parameter isn't properly defined in conjunction with the 'update' action, display an error message and abort
      if (action === 'update' && (!uid || !_.isString(uid) || _.size(uid) === 0)) {
        DELIVERY.alert.error(this.message[this.lang].setup.failure)
        console.log("%cERROR: %cMissing 'uid' parameter for the editItem function used with the 'update' action.", style.error, style.standard)
        return false
      }

      var buttonTemplate = _.template('<hr><button class="gwt-Button" onclick="<%= button_action %>"><%= button_label %></button>')
      var buttonHtml = ''

      switch (action) {
        // Set the modal window to create a new item
        case 'create':

          if (debug === true) { console.log('DEBUG: (' + this.name + ') Edit Item --> Create') }

          // Reset form's data
          resetFormData.call(this)

          // Display the create button
          buttonHtml = buttonTemplate({
            button_action: this.name + '.createItem()',
            button_label: this.message[this.lang].create.button
          })

          window[this.widget_action].setHtml(buttonHtml)

          // Show the form and open the modal window
          window[this.widget_form].setVisible(true)
          this.openModal('create')
          break

          // Set the modal window to update an existing item
        case 'update':

          if (debug === true) { console.log('DEBUG: (' + this.name + ') Edit Item --> Update') }

          // Display the update button
          buttonHtml = buttonTemplate({
            button_action: this.name + ".updateItem('" + uid + "')",
            button_label: this.message[this.lang].update.button
          })

          window[this.widget_action].setHtml(buttonHtml)

          // Show the form
          window[this.widget_form].setVisible(true)

          // Retrieve the item from the collection
          this.readItem(uid)
          break

          // If action isn't recognized, display an error message and abort
        default:
          console.log("%cERROR: %cThe action parameter passed to the DELIVERY.collection.editItem function isn't recognized", style.error, style.standard)
          return false
      }
    }

    /*
           CREATE ITEM
           Create a new record in the collection
           Public method
       */
    this.createItem = function () {
      if (debug === true) { console.log('DEBUG: (' + this.name + ') Create Item') }

      // CHECK: If the Web Interface isn't properly configured, display an error message and abort
      if (!checkInterface.call(this)) {
        DELIVERY.alert.error(this.message[this.lang].create.failure)
        return false
      }

      // CHECK: If all the required fields aren't fulfilled, display an error message and abort
      if (!RMPApplication.validate()) {
        DELIVERY.alert.error(this.message[this.lang].check.required)
        return false
      }

      // CHECK: If the item already exists in the collection, display an error message and abort
      if (checkItem.call(this) === true) {
        DELIVERY.alert.error(this.message[this.lang].check.exist)
        return false
      }

      var that = this

      // Add the record in the collection
      window[this.collection].saveCallback(

        // Prepare the data to inject in the collection, including an unique identifier (UID) for the record
        _.merge(getFormData.call(this), { uid: RMPApplication.uuid() }),

        // Trigger create success callback
        function success () {
          DELIVERY.alert.success(that.message[that.lang].create.success)
          window[that.widget_report].refresh()
          closeModal.call(that)
        },

        // Trigger create failure callback
        function failure (error) {
          DELIVERY.alert.error(that.message[that.lang].create.failure)
          console.log(error)
        }
      )
    }

    /*
           READ ITEM
           Read an existing record from the collection
           Public method
       */
    this.readItem = function (uid) {
      if (debug === true) { console.log('DEBUG: (' + this.name + ') Read Item') }

      // CHECK: If the Web Interface isn't properly thisured, display an error message and abort
      if (!checkInterface.call(this)) {
        DELIVERY.alert.error(this.message[this.lang].read.failure)
        return false
      }

      // CHECK: If UID parameter isn't defined, display an error message and abort
      if (!uid || uid === 'undefined') {
        DELIVERY.alert.error(this.message[this.lang].read.failure)
        console.log('%cERROR: %cAn UID parameter shall be passed to the DELIVERY.collection.readItem function', style.error, style.standard)
        return false
      }

      var widgetForm = this.widget_form
      var that = this

      // Trigger read success callback
      /**
       *
       */
      function success (result) {
        // We consider only the first record in the collection
        var record = _.nth(result, 0)

        var variables = []
        var variable = ''
        var label = ''
        var objectName = ''

        // Inject data from the collection into the edition widget
        // Loop through all widgets of the web interface
        RMPApplication.forEachWidget(function (widget) {
          // Select only the widgets within the split widget
          var parent = widget.getParent()
          if (parent && _.has(parent, 'conf.id') && parent.conf.id === widgetForm) {
            // Set the variable, depending of the widget's type
            switch (widget.getType()) {
              // Radio button widget
              case 'RMP_RadioButton':

                // ListOfMyVariables returns an array, the first element is the label, the second the variable
                variables = JSON.parse(widget.getListOfMyVariables())
                variable = variables[1]

                // If this variable exists in the record, set the widget accordingly
                if (_.has(record, variable)) {
                  widget.setSelectedValue(_.get(record, variable))
                } else {
                  widget.reset()
                }
                break

                // Selection list widget
              case 'RMP_MultiSelectionListBox':
              case 'RMP_MultiSelectionCheckBox':
              case 'RMP_ListBox':

                objectName = JSON.parse(widget.getListOfMyVariables())[1].split('.')[0]
                label = JSON.parse(widget.getListOfMyVariables())[0].split('.')[1]
                variable = JSON.parse(widget.getListOfMyVariables())[1].split('.')[1]

                if (widget.getType() === 'RMP_MultiSelectionListBox' || widget.getType() === 'RMP_MultiSelectionCheckBox') {
                  // ListOfMyVariables returns an array, the first element is the label, the second the variable
                  // If this variable exists in the record, set the widget accordingly
                  if (record.hasOwnProperty(objectName)) {
                    widget.setPicked(JSON.stringify(record[objectName][label]), JSON.stringify(record[objectName][variable]))
                    // widget.setSelectedValue(record[variable])
                  } else {
                    widget.reset()
                  }
                } else {
                  // If this variable exists in the record, set the widget accordingly
                  if (record.hasOwnProperty(objectName)) {
                    widget.setSelectedValue(record[objectName][variable])
                  } else {
                    widget.reset()
                  }
                }
                break

                // Text widget
              case 'RMP_TextInput':

                // ListOfMyVariables returns an array, the first element is the variable
                variables = JSON.parse(widget.getListOfMyVariables())
                variable = variables[0]

                // If this variable exists in the record, set the widget accordingly otherwise set an empty string
                widget.setValue(_.get(record, variable, ''))
                break

                // HTML widget
              case 'RMP_Html':
                // Do nothing
                break

                // Other widgets
              default:
                console.log('Unmanaged widget type: ' + widget.getType())
            }
          }
        })

        that.openModal('update')
        return true
      }

      // Trigger read failure callback
      /**
       *
       */
      function failure (error) {
        DELIVERY.alert.error(this.message[this.lang].read.failure)
        window[this.widget_report].refresh()
        console.log(error)
        return false
      }

      // Get the record from the collection
      var pattern = { uid: uid }
      window[this.collection].listCallback(pattern, {}, success, failure)
    }

    /*
           UPDATE ITEM
           Update an existing record in the collection
           Public method
       */
    this.updateItem = function (uid) {
      if (debug === true) { console.log('DEBUG: (' + this.name + ') Update Item') }

      // CHECK: If the Web Interface isn't properly configured, display an error message and abort
      if (!checkInterface.call(this)) {
        DELIVERY.alert.error(this.message[this.lang].update.failure)
        return false
      }

      // CHECK: If the UID parameter isn't defined, display an error message and abort
      if (!uid || !_.isString(uid) || uid === 'undefined') {
        DELIVERY.alert.error(this.message[this.lang].update.failure)
        console.log('%cERROR: %cAn UID parameter shall be passed to the DELIVERY.collection.updateItem function', style.error, style.standard)
        return false
      }

      // CHECK: If all the required fields aren't fulfilled, display an error message and abort
      if (!RMPApplication.validate()) {
        DELIVERY.alert.error(this.message[this.lang].check.required)
        return false
      }

      /*
           TODO (referential integrity)
           When the key variables are modified:
           Check there isn't already another item with those new values in the collection
           */

      var that = this

      window[this.collection].updateCallback(

        // Pattern
        { uid: uid },

        // Prepare the data to inject in the collection
        _.merge(getFormData.call(this), { uid: uid }),

        // Trigger update success callback
        function success ()	{
          DELIVERY.alert.success(that.message[that.lang].update.success)
          window[that.widget_report].refresh()
          closeModal.call(that)
        },

        // Trigger update failure callback
        function failure (error) {
          DELIVERY.alert.error(that.message[that.lang].update.failure)
          console.log(error)
        }
      )
    }

    /*
           DELETE ITEM
           Delete an existing record in the collection
           Public method
       */
    this.deleteItem = function (uid) {
      if (debug === true) { console.log('DEBUG: (' + this.name + ') Delete Item') }

      // CHECK: If the Web Interface isn't properly configured, display an error message and abort
      if (!checkInterface.call(this)) {
        DELIVERY.alert.error(this.message[this.lang].delete.failure)
        return false
      }

      // CHECK: If the uid parameter isn't defined, display an error message and abort
      if (!uid || uid === 'undefined') {
        DELIVERY.alert.error(this.message[this.lang].delete.failure)
        console.log('%cERROR: %cAn UID parameter shall be passed to the DELIVERY.collection.deleteItem function', style.error, style.standard)
        return false
      }

      var that = this

      // Delete the item in the collection
      window[this.collection].removeCallback(

        // Define the pattern, the record is identified by its UID
        { uid: uid },

        // Trigger success callback
        function success ()	{
          DELIVERY.alert.success(that.message[that.lang].delete.success)
          window[that.widget_report].refresh()
        },

        // Trigger failure callback
        function failure (error) {
          DELIVERY.alert.error(that.message[that.lang].delete.failure)
          console.log(error)
          return false
        }
      )

      /*
         TODO (apparently there's a bug in Alertify alert.confirm. Better do it with SweetAlert2)
         DELIVERY.alert.confirm(
             "Are you sure you want to delete this line ?",
             function () { window[this.collection].removeCallback(pattern, success, failure) },
             function () {}
           )
         */
    }

    /*
           SET REPORT ACTIONS
           Add action buttons to the report rows
           @uid : Unique ID (uuid) of the item in the collection
           @actions (optional): "update", "delete", both if empty
           Syntax: DELIVERY.backoffice.my_instanceName.setReportActions("[[uid]]")
           Public method
       */
    this.setReportActions = function (uid, action) {
      // CHECK: If the Lodash library isn't available, abort
      if (!_ || typeof (_.VERSION) !== 'string') {
        return false
      }

      var linkTemplate = _.template('<a href="#" class="<%= link_class %>" onClick="<%= link_action %>"></a>')

      // Generate the "Update" link from the template
      var linkUpdate = linkTemplate({
        link_class: 'update',
        link_action: this.name + ".editItem('update', '" + uid + "')"
      })

      // Generate the "Delete" link from the template
      var linkDelete = linkTemplate({
        link_class: 'delete',
        link_action: this.name + ".deleteItem('" + uid + "')"
      })

      if (!action || !_.isString(action) || !_.includes(['update', 'delete'], action)) {
        return linkUpdate + linkDelete
      } else if (action === 'update') {
        return linkUpdate
      } else if (action === 'delete') {
        return linkDelete
      }
    }

    /*
           OPEN MODAL
           Open a modal window
           Private method
       */
    this.openModal = function (action) {
      if (debug === true) { console.log('DEBUG: (' + this.name + ') Open Modal') }

      // id_MyComponent is the ID of the element that we want to deploy in the window
      var windowComp = $('[id="' + this.widget_form + '"]').dialog({
        autoOpen: false,
        modal: true,
        stack: false,
        width: this.modal.width,
        title: this.message[this.lang][action].title,
        /* CKEDITOR HACK START : SHALL BE CORRECTED */
        open: function (event, ui) {
          if (this.editor) {
            DELIVERY.editor = CKEDITOR.replace(this.editor[0], this.ckeditor)
            var editorData = window[this.editor[0]].getValue() || ''
            DELIVERY.editor.setData(editorData)
          }
        },
        close: function (event, ui) {
          if (this.editor) {
            DELIVERY.editor.destroy()
          }
        }
        /* HACK END */
      })

      // window[this.widget_form].setVisible(true)
      $(windowComp).dialog('open')
    }

    /*
           CLOSE MODAL
           Close the modal window
           Private method
       */
    /**
     *
     */
    function closeModal () {
      $('[id="' + this.widget_form + '"]').dialog('close')
    }

    /*
           RESET FORM DATA
           Reset form's data
           Used by "collection.createItem" method
           Private method
       */
    /**
     *
     */
    function resetFormData () {
      if (debug === true) { console.log('DEBUG: Reset Form Data') }

      var widgetForm = this.widget_form

      // Reset the fields of the edition form
      // Loop through all widgets of the web interface
      RMPApplication.forEachWidget(function (widget) {
        // Select only the widgets inside the split widget
        var parent = widget.getParent()
        if (parent && parent.conf.hasOwnProperty('id') && parent.conf.id === widgetForm) {
          // Reset the variable, depending of the widget's type
          switch (widget.getType()) {
            case 'RMP_ListBox':
            case 'RMP_MultiSelectionListBox':
            case 'RMP_MultiSelectionCheckBox':
            case 'RMP_RadioButton':
              widget.reset()
              break
            case 'RMP_TextInput':
              widget.setValue(widget.getDefaultValue())
              break
            case 'RMP_Html':
              // Do nothing
              break
            default:
              console.log('Unmanaged widget type: ' + widget.getType())
          }
        }
      })
    }

    /*
           CHECK INTERFACE
           Check if the Web Interface is properly configured
           Private method
       */
    /**
     *
     */
    function checkInterface () {
      if (debug === true) { console.log('DEBUG: Check Interface') }

      var check = true

      // CHECK: If the defined Report Widget doesn't exist in the web interface, display an error message and abort
      if (!window[this.widget_report] || window[this.widget_report].getType() !== 'RMP_Report') {
        console.log('%cERROR: %cYou shall create a Report Widget with the ID ' + this.widget_report + ' in your web interface.', style.error, style.standard)
        check = false
      }

      // CHECK: If the Collection isn't included in the web interface, display an error message and abort
      if (!window[this.collection] || window[this.collection].getType() !== 'RMP_IncludedCollection') {
        console.log('%cERROR: %cYou shall include a Collection with the ID ' + this.collection + ' in your web interface.', style.error, style.standard)
        check = false
      }

      // CHECK: If the defined form widget doesn't exist in the web interface, display an error message and abort
      if (!window[this.widget_form] || window[this.widget_form].getType() !== 'RMP_Table') {
        console.log('%cERROR: %cYou shall create a Split Widget with the ID ' + this.widget_form + ' in your web interface.', style.error, style.standard)
        check = false
      }

      // CHECK: If the defined action widget doesn't exist in the web interface, display an error message and abort
      if (!window[this.widget_action]) {
        console.log('%cERROR: %cYou shall create an empty HTML Widget with the ID ' + this.widget_action + ' within the ' + this.widget_form + ' Split Widget.', style.error, style.standard)
        check = false
      }

      // CHECK: HTML wysiwyg editor related controls
      if (this.editor) {
        // CHECK: If the ckeditor.js file is missing, display an error message and abort
        if (!CKEDITOR) {
          console.log('%cERROR: %cYou shall integrate the ckeditor.js file in order to use the HTML wysiwyg editor.', style.error, style.standard)
          check = false
        }

        // CHECK: If editor isn't an array, display an error message and abort
        if (!Array.isArray(this.editor)) {
          console.log('%cERROR: %cThe editor parameter shall be an array of Widgets IDs.', style.error, style.standard)
          check = false
        }

        // CHECK: If any of the defined editor widgets doesn't exist in the web interface or isn't a Text Widget, display an error message and abort
        for (var i = 0; i < this.editor.length; i++) {
          if (!window[this.editor[i]] || window[this.editor[i]].getType() !== 'RMP_TextInput') {
            console.log('%cERROR: %cYou shall create a Text Widget with the ID ' + this.editor[i] + ' within the ' + this.widget_form + ' Split Widget in order to use the HTML wysiwyg editor.', style.error, style.standard)
            check = false
          }
        }
      }

      // If any of the checks failed, return 'false' otherwise return 'true'
      return check
    }

    /*
           CHECK ITEM
           Check if an item already exists in the collection
           Used by "collection.createItem" method
           Private method
       */
    /**
     *
     */
    function checkItem () {
      if (debug === true) { console.log('DEBUG: Check Item') }

      // Success callback
      /**
       *
       */
      function success (result) {
        // Returns true if the item already exists in the collection, false otherwise
        answer = !!(result[0])
      }

      // Failure callback
      /**
       *
       */
      function failure (error) {
        DELIVERY.alert.error(this.message[this.lang].check.failure)
        console.log(error)
      }

      // If no key is defined, there is nothing to check
      if (!this.key) {
        return false
      }

      // Define the value of the key to be checked in the collection
      var pattern = this.key.reduce(function (accumulator, currentValue) {
        accumulator[currentValue] = RMPApplication.getVariable(currentValue)
        return accumulator
      }, {})

      // Set query options
      var options = { asynchronous: false }

      // Query item in the collection
      var answer = false
      window[this.collection].listCallback(pattern, options, success, failure)
      return answer
    }

    /*
           GET FORM DATA
           Get form's data as an object ready to be injected in the collection
           Used by "collection.createItem" and "collection.updateItem" methods
           Private method
       */
    /**
     *
     */
    function getFormData () {
      if (debug === true) { console.log('DEBUG: Get Form Data') }

      var widgetForm = this.widget_form
      var editor = this.editor
      var input = {}

      var variables = []
      var variable = ''
      var label = ''
      var objectName = ''

      // Loop through all widgets of the web interface
      RMPApplication.forEachWidget(function (widget) {
        // Select only the widgets within the split widget
        var parent = widget.getParent()
        if (parent && _.has(parent, 'conf.id') && parent.conf.id === widgetForm) {
          // Set the variable, depending of the widget's type
          switch (widget.getType()) {
            // Select list widget
            case 'RMP_ListBox':

              // ListOfMyVariables returns an array, the first element is the label, the second the variable
              variables = JSON.parse(widget.getListOfMyVariables())
              label = variables[0].split('.')[1]
              variable = variables[1].split('.')[1]
              objectName = variables[1].split('.')[0]

              // Add the label and value to the input object
              _.set(input, objectName + '.' + label, widget.getSelectedLabel())
              _.set(input, objectName + '.' + variable, widget.getSelectedValue())
              break

              // Radio button widget
            case 'RMP_RadioButton':

              // ListOfMyVariables returns an array, the first element is the label, the second the variable
              variables = JSON.parse(widget.getListOfMyVariables())
              label = variables[0]
              variable = variables[1]

              // Add the label and value to the input object
              _.set(input, label, widget.getSelectedLabel())
              _.set(input, variable, widget.getSelectedValue())
              break

            case 'RMP_MultiSelectionListBox':
            case 'RMP_MultiSelectionCheckBox':

              // ListOfMyVariables returns an array, the first element is the label, the second the variable
              variables = JSON.parse(widget.getListOfMyVariables())
              label = variables[0].split('.')[1]
              variable = variables[1].split('.')[1]
              objectName = variables[1].split('.')[0]

              // Add the label and value to the input object
              _.set(input, objectName + '.' + label, JSON.parse(widget.getSelectedLabel()))
              _.set(input, objectName + '.' + variable, JSON.parse(widget.getSelectedValue()))
              break

              // Text widget
            case 'RMP_TextInput':

              // ListOfMyVariables returns an array, the first element is the variable
              variables = JSON.parse(widget.getListOfMyVariables())
              variable = variables[0]

              /* CKEDITOR HACK START : SHALL BE CORRECTED */
              if (editor && editor.indexOf(widget.getName()) !== -1) {
                input[variable] = DELIVERY.editor.getData() || ''
              } else {
                // Add the value to the input object
                _.set(input, variable, widget.getValue())
              }
              /* HACK END */
              break

              // HTML widget
            case 'RMP_Html':
              // Do nothing
              break

              // Other widgets
            default:
              console.log('Unmanaged widget type: ' + widget.getType())
          }
        }
      })

      return input
    }
  }
})(window.DELIVERY = window.DELIVERY || {})
