Ext.define('AM.controller.ReceiptVouchers', {
  extend: 'Ext.app.Controller',

  stores: ['ReceiptVouchers'],
  models: ['ReceiptVoucher'],

  views: [
    'operation.receiptvoucher.List',
    'operation.receiptvoucher.Form'
  ],

  	refs: [
		{
			ref: 'list',
			selector: 'receiptvoucherlist'
		} 
	],

  init: function() {
    this.control({
      'receiptvoucherlist': {
        itemdblclick: this.editObject,
        selectionchange: this.selectionChange,
				afterrender : this.loadObjectList,
      },
      'receiptvoucherform button[action=save]': {
        click: this.updateObject
      },
      'receiptvoucherlist button[action=addObject]': {
        click: this.addObject
      },
      'receiptvoucherlist button[action=editObject]': {
        click: this.editObject
      },
      'receiptvoucherlist button[action=deleteObject]': {
        click: this.deleteObject
			}	,
      'receiptvoucherlist button[action=confirmObject]': {
        click: this.confirmObject
			}	,
      'confirmreceiptvoucherform button[action=confirm]' : {
				click : this.executeConfirm
			},
      'receiptvoucherlist button[action=unconfirmObject]': {
        click: this.unconfirmObject
			}	,
      'unconfirmreceiptvoucherform button[action=unconfirm]' : {
				click : this.executeUnconfirm
			},
			'receiptvoucherlist textfield[name=searchField]': {
				change: this.liveSearch
			} ,
		 
      
    });
  },

	liveSearch : function(grid, newValue, oldValue, options){
		var me = this;

		me.getReceiptVouchersStore().getProxy().extraParams = {
		    livesearch: newValue
		};
	 
		me.getReceiptVouchersStore().load();
	},
 

	loadObjectList : function(me){
		// console.log("************* IN THE USERS CONTROLLER: afterRENDER");
		me.getStore().load();
	},

  addObject: function() {
    var view = Ext.widget('receiptvoucherform');
    view.show();
  },

  editObject: function() {
    var record = this.getList().getSelectedObject();
    var view = Ext.widget('receiptvoucherform');

    view.down('form').loadRecord(record);
		view.setComboBoxData(record); 
  },

  updateObject: function(button) {
    var win = button.up('window');
    var form = win.down('form');

    var store = this.getReceiptVouchersStore();
    var record = form.getRecord();
    var values = form.getValues();

		
		if( record ){
			record.set( values );
			 
			form.setLoading(true);
			record.save({
				success : function(record){
					form.setLoading(false);
					//  since the grid is backed by store, if store changes, it will be updated
					store.load();
					win.close();
				},
				failure : function(record,op ){
					form.setLoading(false);
					var message  = op.request.scope.reader.jsonData["message"];
					var errors = message['errors'];
					form.getForm().markInvalid(errors);
					this.reject();
				}
			});
				
			 
		}else{
			//  no record at all  => gonna create the new one 
			var me  = this; 
			var newObject = new AM.model.ReceiptVoucher( values ) ;
			
			// learnt from here
			// http://www.sencha.com/forum/showthread.php?137580-ExtJS-4-Sync-and-success-failure-processing
			// form.mask("Loading....."); 
			form.setLoading(true);
			newObject.save({
				success: function(record){
					//  since the grid is backed by store, if store changes, it will be updated
					store.load();
					form.setLoading(false);
					win.close();
					
				},
				failure: function( record, op){
					form.setLoading(false);
					var message  = op.request.scope.reader.jsonData["message"];
					var errors = message['errors'];
					form.getForm().markInvalid(errors);
					this.reject();
				}
			});
		} 
  },

  
  deleteObject: function() {
    var record = this.getList().getSelectedObject();

    if (record) {
      var store = this.getReceiptVouchersStore();
      store.remove(record);
      store.sync();
// to do refresh programmatically
		this.getList().query('pagingtoolbar')[0].doRefresh();
    }

  },

  confirmObject: function(){
		// console.log("mark as Deceased is clicked");
		var view = Ext.widget('confirmreceiptvoucherform');
		var record = this.getList().getSelectedObject();
		view.setParentData( record );
		// view.down('form').getForm().findField('c').setValue(record.get('deceased_at')); 
    view.show();
	},
  
  unconfirmObject: function(){
		// console.log("mark as Deceased is clicked");
		var view = Ext.widget('unconfirmreceiptvoucherform');
		var record = this.getList().getSelectedObject();
		view.setParentData( record );
		// view.down('form').getForm().findField('c').setValue(record.get('deceased_at')); 
    view.show();
	},
  
  executeConfirm : function(button){
		var me = this; 
		var win = button.up('window');
    var form = win.down('form');
		var list = this.getList();

    var store = this.getReceiptVouchersStore();
		var record = this.getList().getSelectedObject();
    var values = form.getValues();
 
		if(record){
			var rec_id = record.get("id");
			
			record.set( 'confirmed_at' , values['confirmed_at'] );			 
			
			form.setLoading(true);
			record.save({
				params : {
					confirm: true 
				},
				success : function(record){
					form.setLoading(false);
					
					// list.fireEvent('confirmed', record);
					
					
					store.load();
					win.close();
					
				},
				failure : function(record,op ){
					// console.log("Fail update");
					form.setLoading(false);
					var message  = op.request.scope.reader.jsonData["message"];
					var errors = message['errors'];
					form.getForm().markInvalid(errors);
					record.reject(); 
					// this.reject(); 
				}
			});
		}
	},
  
  executeUnconfirm : function(button){
		var me = this; 
		var win = button.up('window');
    var form = win.down('form');
		var list = this.getList();

    var store = this.getReceiptVouchersStore();
		var record = this.getList().getSelectedObject();
    var values = form.getValues();
 
		if(record){
			var rec_id = record.get("id");
			
				 
			
			form.setLoading(true);
			record.save({
				params : {
					unconfirm: true 
				},
				success : function(record){
					form.setLoading(false);
					
					// list.fireEvent('confirmed', record);
					
					
					store.load();
					win.close();
					
				},
				failure : function(record,op ){
					// console.log("Fail update");
					form.setLoading(false);
					var message  = op.request.scope.reader.jsonData["message"];
					var errors = message['errors'];
					form.getForm().markInvalid(errors);
					record.reject(); 
					// this.reject(); 
				}
			});
		}
	},
  
  selectionChange: function(selectionModel, selections) {
    var grid = this.getList();

    if (selections.length > 0) {
      grid.enableRecordButtons();
    } else {
      grid.disableRecordButtons();
    }
  }

});
