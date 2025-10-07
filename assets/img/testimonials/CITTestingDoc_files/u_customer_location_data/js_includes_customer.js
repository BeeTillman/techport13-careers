/*! RESOURCE: /scripts/js_includes_customer.js */
/*! RESOURCE: ScrumReleaseImportGroupDialog */
var ScrumReleaseImportGroupDialog = Class.create();
ScrumReleaseImportGroupDialog.prototype = {
   initialize: function () {
      this.setUpFacade();
   },
   
   setUpFacade: function () {
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this._mstrDlg = new dialogClass("task_window");
      this._mstrDlg.setTitle(getMessage("Add Members From Group"));
      this._mstrDlg.setBody(this.getMarkUp(), false, false);
   },
   setUpEvents: function () {
      var self = this, dialog = this._mstrDlg;
      var okButton = $("ok");
      if (okButton) {
         okButton.on("click", function () {
         var mapData = {};
         if (self.fillDataMap (mapData)) {
            var processor = new GlideAjax("ScrumAjaxAddReleaseTeamMembersProcessor");
            for (var strKey in mapData) {
               processor.addParam(strKey, mapData[strKey]);
            }
            self.showStatus(getMessage("Adding group users..."));
            processor.getXML(function () {
               self.refresh();
               dialog.destroy();
            });
         } else {
            dialog.destroy();
         }
      });
      }
      var cancelButton = $("cancel");
      if (cancelButton) {
      cancelButton.on("click", function () {
         dialog.destroy();
      });
      }
      var okNGButton = $("okNG");
      if (okNGButton) {
      okNGButton.on("click", function () {
         dialog.destroy();
      });
      }
      var cancelNGButton = $("cancelNG");
      if (cancelNGButton) {
      cancelNGButton.on("click", function () {
         dialog.destroy();
      });
      }
   },
   refresh: function(){
      GlideList2.get("scrum_pp_team.scrum_pp_release_team_member.team").refresh();
   },
   getScrumReleaseTeamSysId: function () {
      return g_form.getUniqueValue() + "";
   },
   getUserChosenGroupSysIds: function () {
      return $F('groupId') + ""; 
   },
   showStatus: function (strMessage) {
      $("task_controls").update(strMessage);
   },
   
   display: function(bIsVisible) {
      $("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
   },
  getRoleIds: function () {
      var arrRoleNames = ["scrum_user", "scrum_admin", "scrum_release_planner", "scrum_sprint_planner", "scrum_story_creator"];
      var arrRoleIds = [];
      var record = new GlideRecord ("sys_user_role");
      record.addQuery ("name", "IN", arrRoleNames.join (","));
      record.query ();
      while (record.next ())
         arrRoleIds.push (record.sys_id + "");
      return arrRoleIds;
  },
  hasScrumRole: function (roleSysId, arrScrumRoleSysIds) {
     for (var index = 0; index < arrScrumRoleSysIds.length; ++index)
        if (arrScrumRoleSysIds[index] == "" + roleSysId)
           return true;
  
     var record = new GlideRecord ("sys_user_role_contains");
     record.addQuery("role", roleSysId);
     record.query ();
     while (record.next())
       if (this.hasScrumRole (record.contains, arrScrumRoleSysIds))
         return true;
     return false;
  },
  getGroupIds: function () {  
     var arrScrumRoleIds = this.getRoleIds ();
     var arrGroupIds = [];
     var record = new GlideRecord ("sys_group_has_role");
     record.query ();
     while (record.next ())
        if (this.hasScrumRole (record.role, arrScrumRoleIds))
           arrGroupIds.push (record.group + "");
     return arrGroupIds;
   },
   
   getGroupInfo: function () {
      var mapGroupInfo = {};
      var arrRoleIds = this.getRoleIds ();
      var arrGroupIds = this.getGroupIds (arrRoleIds);
      var record = new GlideRecord ("sys_user_group");
      record.addQuery("sys_id", "IN", arrGroupIds.join (","));
      record.query ();
      while (record.next ()) {
         var strName = record.name + "";
         var strSysId = record.sys_id + "";
         mapGroupInfo [strName] = {name: strName, sysid: strSysId};
      }
      return mapGroupInfo;
   },
   getMarkUp: function () {
      var groupAjax = new GlideAjax('ScrumUserGroupsAjax');
      groupAjax.addParam('sysparm_name', 'getGroupInfo');
      groupAjax.getXML(this.generateMarkUp.bind(this));
   },
   generateMarkUp: function(response) {
      var mapGroupInfo = {};
      var groupData = response.responseXML.getElementsByTagName("group");
	   var strName, strSysId;
      for (var i = 0; i < groupData.length; i++) {
        strName = groupData[i].getAttribute("name");
        strSysId = groupData[i].getAttribute("sysid");
        mapGroupInfo[strName] = {
          name: strName,
          sysid: strSysId
        };
      }
      var arrGroupNames = [];
      for (var strGroupName in mapGroupInfo) {
        arrGroupNames.push (strGroupName + "");
      }
      arrGroupNames.sort ();
      var strMarkUp = "";
      if (arrGroupNames.length > 0) {
         var strTable = "<div class='row'><div class='form-group'><span class='col-sm-12'><select class='form-control' id='groupId'>";
         for (var nSlot = 0; nSlot < arrGroupNames.length; ++nSlot) {
            strName = arrGroupNames[nSlot];
            strSysId = mapGroupInfo [strName].sysid;
strTable += "<option value='" + strSysId + "'>" + strName + "</option>";
         }
strTable += "</select></span></div></div>";
      
      strMarkUp = "<div id='task_controls'>" + strTable + 
                    "<div style='text-align:right;padding-top:20px;'>" +
"<button id='cancel' class='btn btn-default' type='button'>" + getMessage("Cancel") + "</button>"+
"&nbsp;&nbsp;<button id='ok' class='btn btn-primary' type='button'>" + getMessage("OK") + "</button>" +
"</div></div>";
      } else {
strMarkUp = "<div id='task_controls'><p>No groups with scrum_user role found</p>" +
                        "<div style='text-align: right;padding-top:20px;'>" +
"<button id='cancelNG' class='btn btn-default' type='button'>" + getMessage("Cancel") + "</button>"+
"&nbsp;&nbsp;<button id='okNG' class='btn btn-primary' type='button'>" + getMessage("OK") + "</button>" +
"</div></div>";
      }
      this._mstrDlg.setBody(strMarkUp, false, false);
      this.setUpEvents();
      this.display(true);
   },
   fillDataMap: function (mapData) {
      var strChosenGroupSysId = this.getUserChosenGroupSysIds ();
      if (strChosenGroupSysId) {
         mapData.sysparm_name = "createReleaseTeamMembers";
         mapData.sysparm_sys_id = this.getScrumReleaseTeamSysId ();
         mapData.sysparm_groups = strChosenGroupSysId;
         return true;
      } else {
         return false;
      }
   }
};
/*! RESOURCE: ConnectionUtils */
var ConnectionUtils = {
	getSysConnection: function() {
		var connGR = new GlideRecord("sys_connection");
		connGR.addQuery('active', true);
		connGR.addQuery("connection_alias", g_form.getValue("connection_alias"));
		connGR.addQuery("sys_domain", g_form.getValue("sys_domain"));
		connGR.addQuery("sys_id", "!=", g_form.getUniqueValue());
		connGR.query();
	
		return connGR;
	},
	doConnection: function(verb) {
		if (g_form.getValue("active") == "false") {
			gsftSubmit(null, g_form.getFormElement(), verb);
		}
		var connGR;
		var performOverride = function() {
			connGR.active = false;
			connGR.update();
			gsftSubmit(null, g_form.getFormElement(), verb);
		};
		
		var grConnAlias = new GlideRecord("sys_alias");
		if (grConnAlias.get(g_form.getValue("connection_alias"))) {
			if (grConnAlias.multiple_connections == 'true') {
				gsftSubmit(null, g_form.getFormElement(), verb);
			} else {
				connGR = this.getSysConnection();
				if (connGR.next()) {
					var currName = g_form.getValue("name");
					if (connGR.name.toUpperCase() == currName.toUpperCase()) {
						var uniqueErrMsg = new GwtMessage().getMessage("A connection with {0} name already exists, duplicate connection names are not allowed", currName);
						g_form.addErrorMessage(uniqueErrMsg);
						return false;
					}
					var title = new GwtMessage().getMessage("Confirm inactivation");
var question = new GwtMessage().getMessage("You already have a {0} connection active, {1}.<br/>By making this one active, {2} will become inactive. <br/>Are you sure you want to make {3} the active connection?", connGR.protocol, connGR.name, connGR.name, currName);
					this.confirmOverride(title, question, performOverride);
				} else {
					gsftSubmit(null, g_form.getFormElement(), verb);
				}
			}
		}
	},
	confirmOverride: function(title, question, onPromptComplete) {
		var dialogClass = (window.GlideModal) ? GlideModal : GlideDialogWindow;
		var dialog = new GlideDialogWindow('glide_confirm_basic');
		dialog.setTitle(title);
		dialog.setSize(400, 325);
		dialog.setPreference('title', question);
		dialog.setPreference('onPromptComplete', onPromptComplete);
		dialog.render();
	},
	
};
/*! RESOURCE: RiskRankCalculatorUtil */
var RiskRankCalculatorUtil = Class.create();
RiskRankCalculatorUtil.prototype = {
    initialize: function(g_form) {
        this.g_form = g_form;
    },
    setRiskRank: function() {
        var ajax = new GlideAjax('AjaxRiskUtil');
        ajax.addParam("sysparm_impact", g_form.getValue('impact'));
        ajax.addParam("sysparm_probability", g_form.getValue('probability'));
        ajax.addParam("sysparm_name", 'getRiskRankDetails');
		ajax.addParam("sysparm_risk_id", g_form.getUniqueValue());
        ajax.getXML(function(response) {
            var result = response.responseXML.getElementsByTagName("result");
            result = result[0];
            g_form.setValue('risk_rank', result.getAttribute('rank'));
			g_form.setValue('risk_value', result.getAttribute('value'));
			g_form.getControl('risk_rank').setStyle('background-color:'+ result.getAttribute('color')) ;
        });
    },
    type: 'RiskRankCalculatorUtil'
};
/*! RESOURCE: GlobalCatalogItemAttachmentFunction */
function getSCAttachmentCount() {
	var length;
	try {
		length = angular.element("#sc_cat_item").scope().attachments.length;
	} catch(e) {
		length = -1;
	}
	return length;
}
/*! RESOURCE: PpmIntGroupSprintCreationHandler */
var PpmIntGroupSprintCreationHandler = Class.create({
    initialize: function (gr) {
        this._gr = gr;
		this._isList = (gr.type+""=="GlideList2")||(gr.type+""=="GlideList3");
        this._sysId = this._isList ? this._gr.getChecked() : this._gr.getUniqueValue();
        this._tableName = this._gr.getTableName();
        this._prmErr = [];
    },
	
    showLoadingDialog: function() {
        this.loadingDialog = new GlideDialogWindow("dialog_loading", true, 300);
        this.loadingDialog.setPreference('table', 'loading');
        this.loadingDialog.render();
    },
    hideLoadingDialog: function() {
        this.loadingDialog && this.loadingDialog.destroy();
    },
    showDialog: function () {
		if(this._tableName=='m2m_release_group')
			this.getGroupFromReleaseGroup(this._sysId);
		else
			this.getDefaultDataAndShowDialog();
    },
	
	getDefaultDataAndShowDialog: function(){
		if(!(this._sysId == '')){
(new GlideUI()).clearOutputMessages();
            this.showLoadingDialog();
            this._getDefaultData();
		}else{
            var span = document.createElement('span');
            span.setAttribute('data-type', 'system');
            span.setAttribute('data-text', getMessage('Please select a Group'));
            span.setAttribute('data-duration', '4000');
            span.setAttribute('data-attr-type', 'error');
            var notification  = {xml: span};
            GlideUI.get().fire(new GlideUINotification(notification));
		}
	},
	getGroupFromReleaseGroup: function(releaseGroupIds){
		var ga = new GlideAjax("agile2_AjaxProcessor");
		ga.addParam('sysparm_name', 'getGroupsFromReleaseGroups');
		ga.addParam('sysparm_releasegroups', releaseGroupIds);
        ga.getXML(this._groupCallback.bind(this));
	},
	
	_groupCallback: function (response) {
        var groups = response.responseXML.getElementsByTagName("group");
		var groupIds = '';
		var id;
		for(var i = 0; i < groups.length; i++) {
			id = groups[i].getAttribute("id");
			if(groupIds=='')
				groupIds = id;
			else
				groupIds = groupIds + ',' + id;
		}
		this._sysId = groupIds;
		this.getDefaultDataAndShowDialog();
    },
    showMainDialog: function() {
        this.hideLoadingDialog();
        var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
        this._mstrDlg = new dialogClass("ppm_int_TeamSprintCreationPage");
        var titleMsg = getMessage("Create Sprints");
        this._mstrDlg.setTitle(titleMsg);
        this._mstrDlg.setPreference('sprintCreationHandler', this);
        this._mstrDlg.setPreference('sysparm_nostack', true);
        this._mstrDlg.setPreference('sysparm_start_date', this._defaultStartDate);
        this._mstrDlg.setPreference('sysparm_count', this._defaultCount);
        this._mstrDlg.setPreference('sysparm_duration', this._defultDuration);
        this._mstrDlg.setPreference('sysparm_name', this.defaultName);
		this._mstrDlg.setPreference('focusTrap', true);
        this._mstrDlg.render();
    },
    onSubmit: function () {
        try {
            this.sprintCount = this._getValue('sprint_count');
            this.startDate = this._getValue('start_date');
            this.name = this._getValue('sprint_name');
            this.startAt = this._getValue('sprint_start_count');
            this.duration = this._getValue('sprint_duration');
            if (!this._validate()) {
                return false;
            }
            var ga = new GlideAjax("ppm_int_TeamProcessor");
            ga.addParam('sysparm_name', 'createSprints');
            ga.addParam('sysparm_start_date', this.startDate);
            ga.addParam('sysparm_sysid', this._sysId);
            ga.addParam('sysparm_count', this.sprintCount);
            ga.addParam('sysparm_start_count', this.startAt);
            ga.addParam('sysparm_sprint_name', this.name);
            ga.addParam('sysparm_duration', this.duration);
            this.showLoadingDialog();
            ga.getXML(this.callback.bind(this));
        } catch(err) {
            this._displayErrorDialog();
            console.log(err);
        }
        return false;
    },
    callback: function (response) {
        this.hideLoadingDialog();
        this._mstrDlg.destroy();
        var resp = response.responseXML.getElementsByTagName("result");
        if (resp[0] && resp[0].getAttribute("status") == "success") {
            window.location.reload();
        } else if (resp[0] && resp[0].getAttribute("status") == "hasOverlappingSprints") {
this._hasOverlappingSprints = true;
            if(this._isList)
                this._gr._refreshAjax();
        }else {
            this._displayErrorDialog();
        }
    },
    _displayErrorDialog: function() {
        var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
        this._createError = new dialogClass("ppm_int_error_dialog");
        this._createError.setTitle(getMessage("Error while creating Sprints for Team."));
        this._createError.render();
    },
    _validate: function () {
        this._prmErr = [];
		this.sprintCountLimit = 25;
        var field = '';
        this._removeAllError('ppm_int_TeamSprintCreationPage');
        if (this.name == 'undefined' || this.name.trim() == "") {
            this._prmErr.push(getMessage("Provide name"));
            field = 'sprint_name';
        }
        else if (!this.startAt || isNaN(this.startAt)) {
            this._prmErr.push(getMessage("Provide integer value"));
            field = 'sprint_start_count';
        }
        else if (this.startDate == 'undefined'
                 || this.startDate.trim() == ""
                 || getDateFromFormat(this.startDate, g_user_date_format) == 0) {
            this._prmErr.push(getMessage("Provide valid start date"));
            field = 'start_date';
        }
        else if (!this.duration || isNaN(this.duration)) {
            this._prmErr.push(getMessage("Provide integer value"));
            field = 'sprint_duration';
        }
        else if (!this.sprintCount || isNaN(this.sprintCount)) {
            this._prmErr.push(getMessage("Provide integer value"));
            field = 'sprint_count';
        }
		else if (this.sprintCount > this.sprintCountLimit) {
            this._prmErr.push(formatMessage(getMessage('The total number of sprints should not be more than {0}'), this.sprintCountLimit));
            field = 'sprint_count';
        }
        if (this._prmErr.length > 0) {
            setTimeout("var refocus = document.getElementById('" + field + "');refocus.focus();", 0);
            this._showFieldError(field, this._prmErr[0]);
            return false;
        }
        return true;
    },
    _getValue: function (inptNm) {
        return gel(inptNm).value;
    },
    _getDefaultData: function () {
        var ga = new GlideAjax("ppm_int_TeamProcessor");
        ga.addParam('sysparm_name', 'calculateSprintDefaults');
        ga.addParam('sysparm_sysid', this._sysId);
        ga.getXML(this._defaultDataCallback.bind(this));
    },
    _defaultDataCallback: function (response) {
        var resp = response.responseXML.getElementsByTagName("result");
        if (resp[0]) {
            this._defaultStartDate = resp[0].getAttribute("next_start_date");
            this._defaultCount = resp[0].getAttribute("count");
            this._defultDuration = resp[0].getAttribute("duration");
            this.defaultName = resp[0].getAttribute('name');
        }
        this.showMainDialog();
    },
    _showFieldError: function(groupId,message){
        var $group = $j('#'+groupId+'_group');
        var $helpBlock = $group.find('.help-block');
        if(!$group.hasClass('has-error'))
            $group.addClass('has-error');
        if($helpBlock.css('display')!="inline"){
            $helpBlock.text(message);
            $helpBlock.css('display','inline');
        }
    },
    _removeAllError: function(dialogName){
        $j('#'+dialogName+' .form-group.has-error').each(function(){
            $j(this).removeClass('has-error');
            $j(this).find('.help-block').css('display','none');
        });
    },
    
    type: "PpmIntGroupSprintCreationHandler"
});
/*! RESOURCE: PlannedTaskDateUtil */
var PlannedTaskDateUtil = Class.create();
PlannedTaskDateUtil.prototype = {
    initialize: function(g_form, g_scratchpad) {
        this.g_form = g_form;
        this.g_scratchpad = g_scratchpad;
        var tableName = g_form.getTableName();
        this.dayField = "ni." + tableName + ".durationdur_day";
        this.hourField = "ni." + tableName + ".durationdur_hour";
        this.minuteField = "ni." + tableName + ".durationdur_min";
        this.secondField = "ni." + tableName + ".durationdur_sec";
        this.tableName = tableName;
    },
	
    _showErrorMessage: function(column, message) {
		if (!message && !column) {
			try {
				this._gForm.showFieldMsg(column, message, 'error');
			} catch(e) {}
		}
    },
    setEndDate: function(answer) {
        this.g_scratchpad.flag = true;
        this.g_form.setValue('end_date', answer);
    },
    setDuration: function(answer) {
        this.g_scratchpad.flag = true;
        this.g_form.setValue('duration', answer);
    },
    getStartDate: function() {
        return this.g_form.getValue('start_date');
    },
    getDays: function() {
		var days = this.g_form.getValue(this.dayField);
        return this._getIntValue(days);
    },
    getHours: function() {
		var hours = this.g_form.getValue(this.hourField);
        return this._getIntValue(hours);
    },
    getMinutes: function() {
        var minutes = this.g_form.getValue(this.minuteField);
		return this._getIntValue(minutes);
    },
    getSeconds: function() {
        var seconds = this.g_form.getValue(this.secondField);
		return this._getIntValue(seconds);
    },
	_getIntValue: function(value) {
		var intValue = 0;
		if (value && !isNaN(value))
			intValue = parseInt(value);
		return intValue;
	},
    setDurationHoursAndDays: function() {
        var g_form = this.g_form;
        var days = this.getDays();
        var hours = this.getHours();
        var minutes = this.getMinutes();
        var seconds = this.getSeconds();
        this.g_scratchpad.flag = false;
        if (seconds >= 60) {
minutes += Math.floor(seconds / 60);
			seconds = seconds % 60;
        }
        if (minutes >= 60) {
hours += Math.floor(minutes / 60);
            minutes = minutes % 60;
        }
		if (hours >= 24) {
days += Math.floor(hours / 24);
			hours = hours % 24;
		}
        if (hours < 9)
            hours = "0" + hours;
        if (minutes < 9)
			minutes = "0" + minutes;
        if (seconds < 9)
			seconds = "0" + seconds;
        g_form.setValue(this.dayField, days);
        g_form.setValue(this.hourField, hours);
        g_form.setValue(this.minuteField, minutes);
        g_form.setValue(this.secondField, seconds);
    },
    validateDurationFields: function() {
        var g_form = this.g_form;
        var day = g_form.getValue(this.dayField);
        var hour = g_form.getValue(this.hourField);
        var minute = g_form.getValue(this.minuteField);
        var second = g_form.getValue(this.secondField);
        if (!day || day.trim() == '')
            g_form.setValue(this.dayField, "00");
        if (!hour || hour.trim() == '')
            g_form.setValue(this.hourField, "00");
        if (!minute || minute.trim() == '')
            g_form.setValue(this.minuteField, "00");
        if (!second || second.trim() == '')
            g_form.setValue(this.secondField, "00");
        var startDate = g_form.getValue("start_date");
        if (g_form.getValue("duration") == '')
            g_form.setValue("end_date", g_form.getValue("start_date"));
    },
    handleResponse: function(response, column) {
        if (response && response.responseXML) {
            var result = response.responseXML.getElementsByTagName("result");
            if (result) {
                result = result[0];
                var status = result.getAttribute("status");
                var answer = result.getAttribute("answer");
                if (status == 'error') {
                    var message = result.getAttribute('message');
                    this._showErrorMessage(result.getAttribute("column"), message);
                } else {
                    if (column == 'duration' || column == 'start_date')
                        this.setEndDate(answer);
                    else if (column == 'end_date')
                        this.setDuration(answer);
                }
            }
        }
    },
    calculateDateTime: function(column) {
        var self = this;
        var ga = new GlideAjax('AjaxPlannedTaskDateUtil');
        ga.addParam('sysparm_start_date', this.g_form.getValue('start_date'));
        if (column == 'duration' || column == 'start_date') {
            ga.addParam('sysparm_duration', this.g_form.getValue('duration'));
            ga.addParam('sysparm_name', 'getEndDate');
        } else if (column == 'end_date') {
            ga.addParam('sysparm_end_date', this.g_form.getValue('end_date'));
            ga.addParam('sysparm_name', 'getDuration');
        }
        ga.getXML(function(response) {
            self.handleResponse(response, column);
        });
    },
    calculateEndDateFromDuration: function(control, oldValue, newValue, isLoading, isTemplate) {
        var g_form = this.g_form;
        var g_scratchpad = this.g_scratchpad;
        this.validateDurationFields();
        if (isLoading || g_scratchpad.flag) {
            g_scratchpad.flag = false;
            return;
        }
        var startDate = this.getStartDate();
        var startDateEmpty = !startDate || startDate.trim() === '';
        if (newValue.indexOf("-") > -1 || startDateEmpty)
            return;
        
		this.setDurationHoursAndDays();
        this.calculateDateTime('duration');
    },
    calculateEndDateFromStartDate: function(control, oldValue, newValue, isLoading, isTemplate) {
        var g_form = this.g_form;
        var g_scratchpad = this.g_scratchpad;
        try {
            g_form.hideFieldMsg('start_date');
        } catch (e) {
        }
        if (isLoading || g_scratchpad.flag) {
            g_scratchpad.flag = false;
            return;
        }
        if (newValue == '')
            return;
        this.calculateDateTime('start_date');
    },
    calculateDurationFromEndDate: function(control, oldValue, newValue, isLoading, isTemplate) {
        var g_form = this.g_form;
        var g_scratchpad = this.g_scratchpad;
        var startDateColumn = 'start_date';
        var startDate;
        if (isLoading || g_scratchpad.flag) {
            g_scratchpad.flag = false;
            return;
        }
        startDate = g_form.getValue(startDateColumn);
        this.calculateDateTime('end_date');
    },
    type: "PlannedTaskDateUtil"
};
/*! RESOURCE: Validate Client Script Functions */
function validateFunctionDeclaration(fieldName, functionName) {
    var code = g_form.getValue(fieldName);
    if (code == "")
       return true;
    code = removeCommentsFromClientScript(code);
    var patternString = "function(\\s+)" + functionName + "((\\s+)|\\(|\\[\r\n])";
    var validatePattern = new RegExp(patternString);
    
    if (!validatePattern.test(code)) {
       var msg = new GwtMessage().getMessage('Missing function declaration for') + ' ' + functionName;
       g_form.showErrorBox(fieldName, msg);
       return false;
    }
    return true;
}
function validateNoServerObjectsInClientScript(fieldName) {
    var code = g_form.getValue(fieldName);
    if (code == "")
       return true;
    code = removeCommentsFromClientScript(code);
    
var doubleQuotePattern = /"[^"\r\n]*"/g;
    code = code.replace(doubleQuotePattern,""); 
var singleQuotePattern = /'[^'\r\n]*'/g;
    code = code.replace(singleQuotePattern,"");
    var rc = true;
var gsPattern = /(\s|\W)gs\./;
    if (gsPattern.test(code)) {
       var msg = new GwtMessage().getMessage('The object "gs" should not be used in client scripts.');
       g_form.showErrorBox(fieldName, msg);
       rc = false;
    }
var currentPattern = /(\s|\W)current\./;
    if (currentPattern.test(code)) {
       var msg = new GwtMessage().getMessage('The object "current" should not be used in client scripts.');
       g_form.showErrorBox(fieldName, msg);
       rc = false;
    }
    return rc;    
}
function validateUIScriptIIFEPattern(fieldName, scopeName, scriptName) {
	var code = g_form.getValue(fieldName);
	var rc = true;
	if("global" == scopeName)
		return rc;
	
	code = removeCommentsFromClientScript(code);
	code = removeSpacesFromClientScript(code);
	code = removeNewlinesFromClientScript(code);
	
	var requiredStart =  "var"+scopeName+"="+scopeName+"||{};"+scopeName+"."+scriptName+"=(function(){\"usestrict\";";
	var requiredEnd = "})();";
	
	if(!code.startsWith(requiredStart)) {
		var msg = new GwtMessage().getMessage("Missing closure assignment.");
		g_form.showErrorBox(fieldName,msg);
		rc = false;
	}
	
	if(!code.endsWith(requiredEnd)) {
		var msg = new GwtMessage().getMessage("Missing immediately-invoked function declaration end.");
		g_form.showErrorBox(fieldName,msg);
		rc = false;
	}
	return rc;
}
function validateNotCallingFunction (fieldName, functionName) {
	var code = g_form.getValue(fieldName);
	var rc = true;
	var reg = new RegExp(functionName, "g");
	var matches;
	
	code = removeCommentsFromClientScript(code);
	
	if (code == '')
		return rc;
	
	matches = code.match(reg);
	rc = (matches && (matches.length == 1));
	
	if(!rc) {
		var msg = "Do not explicitly call the " + functionName + " function in your business rule. It will be called automatically at execution time.";
		msg = new GwtMessage().getMessage(msg);
		g_form.showErrorBox(fieldName,msg);
	}
	
	return rc;
}
function removeCommentsFromClientScript(code) {
var pattern1 = /\/\*(.|[\r\n])*?\*\//g;
    code = code.replace(pattern1,""); 
var pattern2 = /\/\/.*/g;
    code = code.replace(pattern2,"");
    return code;
}
function removeSpacesFromClientScript(code) {
var pattern = /\s*/g;
	return code.replace(pattern,"");
}
function removeNewlinesFromClientScript(code) {
var pattern = /[\r\n]*/g;
	return code.replace(pattern,"");
}
/*! RESOURCE: ProjectTaskUtil */
var ProjectTaskUtil = Class.create();
ProjectTaskUtil.prototype = {
	initialize: function() {		
	},
	type: 'ProjectTaskUtil'
};
ProjectTaskUtil.decodeOnLoadActualDatesState = function(response) {
	var result = (response.responseXML.getElementsByTagName('result'))[0];
	var status = result.getAttribute('status');
	var workStartReadOnly = true;
	var workEndReadOnly = true;
	if(status == 'success') {
		var state = result.getAttribute('state');
		if(state == 'closed') {
			workStartReadOnly = false;
			workEndReadOnly = false;
		} else if(state == 'started')
			workStartReadOnly = false;
	}
	
	return {
		workStartReadOnly: workStartReadOnly,
		workEndReadOnly: workEndReadOnly
	};
};
ProjectTaskUtil.decodeOnChangeActualDatesState = function(response) {
	var result = (response.responseXML.getElementsByTagName('result'))[0];
	var state = JSON.parse(result.getAttribute('state'));
	return {
		workStartState: ProjectTaskUtil._decodeActualStartDateState(state.work_start_state),
		workEndState: ProjectTaskUtil._decodeActualEndDateState(state.work_end_state)
	};
};
ProjectTaskUtil._decodeActualStartDateState = function(result) {
	var workStartState = {
		date: '',
		readOnly: true
	};
	var status = result.work_start_status;
	if(status == 'success') {
		var state = result.work_start_state;
		if(state == 'already_started' || state == 'about_to_start') {
			workStartState.readOnly = false;
			workStartState.date = result.work_start;
		}
	}
	
	return workStartState;
};
ProjectTaskUtil._decodeActualEndDateState = function(result) {
	var workEndState = {
		date: '',
		readOnly: true
	};
	var status = result.work_end_status;
	if(status == 'success') {
		var state = result.work_end_state;
		if(state == 'already_closed' || state == 'about_to_close') {
			workEndState.readOnly = false;
			workEndState.date = result.work_end;
		}
	}
	
	return workEndState;
};
/*! RESOURCE: ScrumTaskDialog */
var ScrumTaskDialog = Class.create(GlideDialogWindow, {
    initialize: function () {
		if (typeof g_list != "undefined")
            this.list = g_list;
        else
            this.list = null;
        this.storyID = typeof rowSysId == 'undefined' ? (gel('sys_uniqueValue') ? gel('sys_uniqueValue').value : "") : rowSysId;
        this.setUpFacade();
        this.setUpEvents();
        this.display(true);
        this.checkOKButton();
        this.setWidth(155);
		this.focusFirstSelectElement();
    },
    toggleOKButton: function(visible){
        $("ok").style.display = (visible?"inline":"none");
    },
    setUpFacade: function () {
        GlideDialogWindow.prototype.initialize.call(this, "task_window", false);
        this.setTitle(getMessage("Add Scrum Tasks"));
        var mapCount = this.getTypeCounts();
        this.setBody(this.getMarkUp(mapCount), false, false);
    },
    checkOKButton: function(){
        var visible = false;
        var thisDialog = this;
        this.container.select("select").each(function(elem){
            if (elem.value + "" != "0")
                visible = true;
            if (!elem.onChangeAdded){
                elem.onChangeAdded = true;
                elem.on("change", function(){
                    thisDialog.checkOKButton();
                });
            }
        });
        this.toggleOKButton(visible);
    },
	
	focusFirstSelectElement: function() {
		this.container.select("select")[0].focus();
	},
    getTypeCounts: function() {
        var mapLabel = this.getLabels("rm_scrum_task", "type");
        var mapCount = {};
        for (var strKey in mapLabel) {
            mapCount[strKey] = getPreference("com.snc.sdlc.scrum.pp.tasks." + strKey, 0);
        }
        return mapCount;
    },
    setUpEvents: function () {
        var dialog = this;
        $("ok").on("click", function () {
            var mapTaskData = {};
            if (dialog.fillDataMap(mapTaskData)) {
                var taskProducer = new GlideAjax("ScrumAjaxTaskProducer");
                for (var strKey in mapTaskData) {
                    taskProducer.addParam("sysparm_" + strKey, mapTaskData[strKey]);
                }
                dialog.showStatus("Adding tasks...");
                taskProducer.getXML(function () {
                    dialog.refresh();
                    dialog._onCloseClicked();
                });
            } else {
                dialog._onCloseClicked();
            }
        });
        $("cancel").on("click", function () {
            dialog._onCloseClicked();
        });
    },
    refresh: function(){
        if (this.list)
            this.list.refresh();
        else
            this.reloadList("rm_story.rm_scrum_task.story");
    },
    getSysID: function(){
        return this.storyID;
    },
    fillDataMap: function (mapTaskData) {
        var bTasksRequired = false;
        mapTaskData.name = "createTasks";
        mapTaskData.sys_id = this.getSysID();
        var mapDetails = this.getLabels("rm_scrum_task", "type");
        var arrTaskTypes = [];
        for (var key in mapDetails) {
            arrTaskTypes.push(key);
        }
        for (var nSlot = 0; nSlot < arrTaskTypes.length; ++nSlot) {
            var strTaskType = arrTaskTypes[nSlot];
            var strTaskData = $(strTaskType).getValue();
            mapTaskData[strTaskType] = strTaskData;
            setPreference("com.snc.sdlc.scrum.pp.tasks." + strTaskType, strTaskData);
            if (strTaskData != "0") {
                bTasksRequired = true;
            }
        }
        return bTasksRequired;
    },
    getMarkUp: function (mapCounts) {
        function getSelectMarkUp(strFieldId, nValue) {
            var strMarkUp = "<select id='" + strFieldId + "'>";
            for (var nSlot = 0; nSlot <= 10; nSlot++) {
                if (nValue != 0 && nValue == nSlot) {
strMarkUp += "<option value='" + nSlot + "' + " + "selected='selected'" + ">" + nSlot + "</choice>";
                } else {
strMarkUp += "<option value='" + nSlot + "'>" + nSlot + "</choice>";
                }
            }
strMarkUp += "</select>";
            return strMarkUp;
        } 
        function buildRow(strMessage, strLabel, nValue) {
return "<tr><td><label for='" + strLabel + "'>" + strMessage + "</label></td><td>" + getSelectMarkUp(strLabel, nValue) +"</td></tr>";
        }
        function buildTable(mapDetails, mapCounts) {
            var arrDetails = [];
            for (var strKey in mapDetails) {
                arrDetails.push(strKey + "");
            }
            arrDetails.sort();
            var strBuf = "<table>";
            for (var index = 0; index < arrDetails.length; ++index) {
                var strTitleCase = arrDetails[index].charAt(0).toString().toUpperCase() + arrDetails[index].substring(1);
                var nCount = mapCounts[arrDetails[index]];
                strBuf += buildRow(strTitleCase, arrDetails[index], nCount);
            }
strBuf += "</table>";
            return strBuf;
        }
        var mapLabels = this.getLabels("rm_scrum_task", "type");
        return "<div id='task_controls'>" + buildTable(mapLabels, mapCounts) +
"<button id='ok' type='button'>" + getMessage('OK') + "</button>" +
"<button id='cancel' type='button'>" + getMessage('Cancel') + "</button></div>";
    },
    reloadForm: function () {
        document.location.href = document.location.href;
    },
    reloadList: function (strListName) {
        GlideList2.get(strListName).refresh();
    },
    showStatus: function (strMessage) {
        $("task_controls").update("Loading...");
    },
    display: function(bIsVisible) {
        $("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
    },
    getLabels: function(strTable, strAttribute) {
        var taskProducer = new GlideAjax("ScrumAjaxTaskProducer");
        taskProducer.addParam("sysparm_name" ,"getLabels");
        taskProducer.addParam("sysparm_table", strTable);
        taskProducer.addParam("sysparm_attribute", strAttribute);
        var result = taskProducer.getXMLWait();
        return this._parseResponse(result);
    },
    _parseResponse: function(resultXML) {
        var jsonStr = resultXML.documentElement.getAttribute("answer");
        var map = (isMSIE7 || isMSIE8) ? eval("(" + jsonStr + ")") : JSON.parse(jsonStr);
        return map;
    }
});
/*! RESOURCE: AssetSetDomainParameters */
function assetSetDomainParameters(gDialog) {
	var ga = new GlideAjax('global.AssetUtilsAJAX');
	ga.addParam('sysparm_name', 'isDomainDataSeparationEnabled');
	ga.getXMLWait();
	if (ga.getAnswer() === 'true') {
		gDialog.setPreference('sysparm_domain', g_form.getValue('sysparm_domain'));
		gDialog.setPreference('sysparm_domain_scope', g_form.getValue('sysparm_domain_scope'));
	}
}
/*! RESOURCE: tm_AssignDefect */
var tm_AssignDefect = Class.create({
	initialize: function (gr) {
		this._gr = gr;
		this._isList = (gr.type + "" == "GlideList2");
		this._sysId = this._gr.getUniqueValue();
		this._tableName = this._gr.getTableName();
		this._redirect = false;
		this._testCaseInstance = 'tm_test_case_instance';
		
		this._prmErr = [];
		if (this._tableName == 'tm_test_instance') {
			this._sysId = this._gr.getValue('tm_test_case_instance');
		}
		
		var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
		this._mstrDlg = new dialogClass("tm_ref_choose_dialog");
		var titleMsg = getMessage("Assign Defect to Test Case");
		this._mstrDlg.setTitle(titleMsg);
		this._mstrDlg.setPreference("sysparam_reference_table", "rm_defect");
		this._mstrDlg.setPreference("sysparam_query", "");
		
		this._mstrDlg.setPreference("sysparam_field_label", getMessage("Defect"));
		
		this._mstrDlg.setPreference("handler", this);
	},
	
	showLoadingDialog: function() {
		this.loadingDialog = new GlideDialogWindow("dialog_loading", true, 300);
		this.loadingDialog.setPreference('table', 'loading');
		this.loadingDialog.render();
	},
	
	hideLoadingDialog: function() {
		this.loadingDialog && this.loadingDialog.destroy();
	},
	
	showDialog: function () {
		this._mstrDlg.render();
	},
	
	onSubmit: function () {
		this.defectId = this._getValue('rm_defect_ref');
		this.defectLabel = this._getDisplayValue('rm_defect_ref');
		
		if (!this._validate()) {
			var e = gel("sys_display.rm_defect_ref");
			if (e)
				e.focus();	
			return false;
		}
		
		this._mstrDlg.destroy();
		
		if (this.defectId) {
			var ga = new GlideAjax("tm_AjaxProcessor");
			ga.addParam('sysparm_name', 'mapDefectToTestCase');
			ga.addParam('sysparm_sysId', this._sysId);
			ga.addParam('sysparm_defect', this.defectId);
			ga.addParam('sysparm_tn', this._testCaseInstance);
			
			this.showLoadingDialog();
			ga.getXML(this.callback.bind(this));
		}
		return false;
	},
	
	callback: function (response) {
		this.hideLoadingDialog();
		var resp = response.responseXML.getElementsByTagName("result");
		if (resp[0] && resp[0].getAttribute("status") == "success") {
			if (this._tableName == this._testCaseInstance) {
				var list = GlideList2.get(g_form.getTableName() + '.REL:5da20971872121003706db5eb2e3ec0b');
				if(list)
					list.setFilterAndRefresh('');
} else {
			this._displayInfoMessage(resp[0]);
		}
	} else {
		var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
		this._createError = new dialogClass("tm_error_dialog");
		this._createError.setTitle(getMessage("Error while assigning defect."));
		this._createError.render();
	}
},
_validate: function () {
	this._prmErr = [];
	this._removeAllError('tm_ref_choose_dialog');
	if (this._getValue('rm_defect_ref') == 'undefined' || this._getValue('rm_defect_ref').trim() == "") {
		this._prmErr.push(getMessage("Select the defect."));
		this._showFieldError('ref_test_suite_field', getMessage(this._prmErr[0]));
		return false;
	}
	return this._checkForDuplicateEntry();
},
_getValue: function (inptNm) {
	return gel(inptNm).value;
},
_getDisplayValue: function (inputNm) {
	return gel('display_hidden.' + inputNm).value;
},
_displayInfoMessage: function (result) {
	var infoMessage = result.textContent;
	this._gr.addInfoMessage(infoMessage);
},
_checkForDuplicateEntry: function () {
	this.defectId = this._getValue('rm_defect_ref');
	this._testCaseInstance;
	
	var ga = new GlideAjax("tm_AjaxProcessor");
	ga.addParam('sysparm_name', 'hasAssociation');
	ga.addParam('sysparm_testcaseinstance', this._sysId);
	ga.addParam('sysparm_defect', this._getValue('rm_defect_ref'));
	
	this.showLoadingDialog();
	var responseXML = ga.getXMLWait();
	return this._parseResponse(responseXML);
},
_parseResponse: function (responseXML) {
	this.hideLoadingDialog();
	
	var resp = responseXML.getElementsByTagName("result");
	if (resp[0] && resp[0].getAttribute("status") == "success") {
		var isDuplicate = responseXML.documentElement.getAttribute("answer");
		this._removeAllError('tm_ref_choose_dialog');
		
		if (isDuplicate == 'true') {
			this._showFieldError('ref_test_suite_field', getMessage('Already assigned'));
			return false;
		}
	}
	return true;
},
_removeAllError: function (dialogName) {
	$$('#'+dialogName+' .form-group.has-error').each(function(item){
		$(item).removeClassName('has-error');
		$(item).down('.help-block').setStyle({'display':'none'});
	});
},
_showFieldError: function (groupId, message) {
	var $group = $(groupId);
	var $helpBlock = $group.down('.help-block');
	if(!$group.hasClassName('has-error'))
		$group.addClassName('has-error');
	if($helpBlock.getStyle('display')!='inline-block'){
		$helpBlock.update(message);
		$helpBlock.setStyle({'display':'inline-block'});
	}
	
},
type: "tm_AssignDefect"
});
/*! RESOURCE: ProjectDeleteValidator */
var ProjectDeleteValidator = Class.create();
ProjectDeleteValidator.prototype = {
    initialize: function(projectIds) {
        this._projectIds = projectIds;
        this._hasValidationErrors = false;
        this._validationMessages = [];
    },
    validate: function(callback) {
        var ajaxHelper = new GlideAjax('AjaxProjectUtil');
        ajaxHelper.addParam('sysparm_name', 'canDeleteProjects');
        ajaxHelper.addParam('sysparm_sys_ids', this._projectIds);
        ajaxHelper.setWantSessionMessages(false);
        var that = this;
        ajaxHelper.getXMLAnswer(function(answer) {
            var results = JSON.parse(answer);
            var hasErrors = false;
            if (results && results.length > 0) {
                for (var i = 0; i < results.length; i++) {
                    if (results[i].status === "false") {
                        that._hasValidationErrors = true;
                        that._validationMessages.push(results[i].statusMessage);
                    }
                }
            }
			callback.call(that, that);
        });
    },
    hasValidationErrors: function() {
        return this._hasValidationErrors === true;
    },
	getValidationMessages: function(){
		return this._validationMessages;
	},
    type: "ProjectDeleteValidator"
};
/*! RESOURCE: ScrumMoveToProjectHandler */
var ScrumMoveToProjectHandler = Class.create({
    initialize: function(g_list) {
        this.g_list = g_list;
    },
    
    showDialog: function() {
		if(this.g_list.getChecked() == ''){
			var span = document.createElement('span');
            span.setAttribute('data-type', 'system');
            span.setAttribute('data-text', getMessage('Please select a Story'));
            span.setAttribute('data-duration', '4000');
            span.setAttribute('data-attr-type', 'error');
            var notification  = {xml: span};
            GlideUI.get().fire(new GlideUINotification(notification));
		}else{
			var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
			this.dlg = new dialogClass("scrum_move_to_project_dialog");
			var titleMsg = getMessage("Assign to project");
			this.dlg.setTitle(titleMsg);
			this.dlg.setPreference('handler', this);
			this.dlg.setPreference('sysparam_reference_table','pm_project');
			this.dlg.setPreference('sysparam_query','active=true');
			this.dlg.setPreference('sysparam_field_label', getMessage('Project'));
			this.dlg.setPreference('focusTrap', true);
			var url = window.parent.location.href;
            this.projectId = this.getSysParamFromUrl(url, 'sysparm_project_id');
            if (this.projectId) {
                var projectName = decodeURIComponent(this.getSysParamFromUrl(url, 'sysparm_project_name'));
                this.dlg.setPreference('sysparam_field_value', this.projectId);
                this.dlg.setPreference('sysparam_field_display_value', projectName);
            }
			this.dlg.render();
		}
    },
    
    onSubmit: function() {
        if ( ! this.valid() ) {
            return false;
        }
		var projectType = this.getValue('project_type_radiobutton');
		var ga;
		var dialogClass;
		if(projectType != 'new'){
			var projectId = this.getValue('pm_project_ref');
			var phaseId = this.getValue('pm_project_phase');
			this.dlg.destroy();
			dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
			this.wtDlg = new dialogClass('scrum_please_wait');
			this.wtDlg.render();
			ga = new GlideAjax("agile2_AjaxProcessor");
			ga.addParam('sysparm_name','addStoriesToProject');
			ga.addParam('sysparm_project', projectId);
			ga.addParam('sysparm_phase', phaseId);
			ga.addParam('sysparm_stories', this.g_list.getChecked());
			ga.getXML(this.callback.bind(this));        
			return false;
		}else{
			var projectName = this.getValue('new_project_field');
			var projectStartDate = this.getValue('new_project_start_date');
			this.dlg.destroy();
			dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
			this.wtDlg = new dialogClass('scrum_please_wait');
			this.wtDlg.render();
			ga = new GlideAjax("agile2_AjaxProcessor");
			ga.addParam('sysparm_name','createProjectForStories');
			ga.addParam('sysparm_project', projectName);
			ga.addParam('sysparm_startDate', projectStartDate);
			ga.addParam('sysparm_stories', this.g_list.getChecked());
			ga.getXML(this.callback.bind(this));        
			return false;
		}
    },
    
    onCancel: function() {
        this.dlg.destroy();
        return false;
    },
    
    getValue: function(fieldId) {
		if (fieldId == 'project_type_radiobutton')
			return $j("input[name='project_type_radiobutton']:checked").val();
        return gel(fieldId).value;
    },
    
    callback:function(response) {
		if(!this.projectId)
			this.wtDlg.destroy();
        var resp = response.responseXML.getElementsByTagName("result");
        if (resp[0] && resp[0].getAttribute("status") == "success") {
			var projectId = resp[0].getAttribute("projectId");
			if(projectId){
				var url = "pm_project.do?sys_id="+projectId;
				window.location  = url;
			}else
				window.location.reload();
        }
    },
    
    valid: function() {
		var projectType = this.getValue('project_type_radiobutton');
		var errMsg;
		this._hideAllFieldErrors();
		if(projectType != 'new'){
			if ( typeof this.getValue('pm_project_ref') == 'undefined' || this.getValue('pm_project_ref').trim() == '') {
				errMsg = getMessage("Select a project");
				this._showFieldError('ref_project_field',errMsg,'sys_display.pm_project_ref');
				return false;
			}else if ( this._isVisible('ref_project_phase') && (typeof this.getValue('pm_project_phase') == 'undefined' || this.getValue('pm_project_phase').trim() == '')) {
				errMsg = getMessage("Select a phase");
				this._showFieldError('ref_project_phase',errMsg,'ref_project_phase');
				return false;
			}else
				return true;
		}else{
			if ( typeof this.getValue('new_project_field') == 'undefined' || this.getValue('new_project_field').trim() == '') {
				errMsg = getMessage("Enter the project name");
				this._showFieldError('ref_new_project_field',errMsg,'new_project_field');
				return false;
			}
			else if ( typeof this.getValue('new_project_start_date') == 'undefined' || this.getValue('new_project_start_date').trim() == '') {
				errMsg = getMessage("Enter the project start date");
				this._showFieldError('ref_new_project_start_date',errMsg,'new_project_start_date');
				return false;
			}
			else
				return true;
		}
    },
    _showFieldError: function(groupId,message,focusField) {
        var $group = $j('#'+groupId);
        var $helpBlock = $group.find('.help-block');
        if(!$group.hasClass('has-error'))
            $group.addClass('has-error');
        if($helpBlock.css('display')!="inline"){
            $helpBlock.text(message);
            $helpBlock.css('display','inline');
        }
		else
			$helpBlock.css('display','none');
		if(focusField){
			var elem = gel(focusField);
			elem.focus();
		}
    },
	_hideAllFieldErrors: function() {
		var fields = ['ref_project_field','ref_new_project_field','ref_new_project_start_date'];
		var $group;
		var $helpBlock;
        fields.forEach(function(field){
			$group = $j('#'+field);
			$helpBlock = $group.find('.help-block');
			$helpBlock.css('display','none');
		});
    },
	_isVisible: function(field){
		return $j('#'+field).is(":visible");
	},
	getSysParamFromUrl: function(url, param) {
        var gURL = new GlideURL(url);
        var sysParam = gURL.getParam(param);
        return sysParam;
    },
    showDialogForRemovingStoriesFormProject: function() {
        var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
        this.dlg = new dialogClass("story_remove_from_project_dialog", false, 'modal-sm');
        var titleMsg = getMessage("Confirmation");
        this.dlg.setTitle(titleMsg);
        this.dlg.setPreference('handler', this);
        this.dlg.setPreference('sysparam_field_message', getMessage('Remove the selected record(s)?'));
		this.dlg.setPreference('focusTrap', true);
        this.dlg.render();
    },
    removeStoriesFromProject: function() {
        this.dlg.destroy();
        var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
        this.wtDlg = new dialogClass('scrum_please_wait');
        this.wtDlg.render();
        var ga = new GlideAjax("agile2_AjaxProcessor");
        ga.addParam('sysparm_name', 'removeStoriesFromProject');
        ga.addParam('sysparm_stories', this.g_list.getChecked());
        ga.getXML(this.callback.bind(this));
        return false;
    },
	
    type: "ScrumMoveToProjectHandler"
});
/*! RESOURCE: HandlePurchasedRights */
var HandlePurchasedRights = {
	setPurchasedRightsDefault: function(metric) {
		var MS_PER_CORE = 'ef64c370534323005d74ddeeff7b1238';
		var MS_PER_CORE_CAL = '22796ca493322200f2ef14f1b47ffb28';
		var SAP_ENGINE_MEASUREMENT = '7743a812b7a300101b8b8238ee11a9f9';
		var isRightsMandatory;
		var isRightsReadOnly;
		if (metric === MS_PER_CORE || metric === MS_PER_CORE_CAL || metric === SAP_ENGINE_MEASUREMENT) {
			isRightsMandatory = false;
			isRightsReadOnly = true;
		} else {
			isRightsMandatory = !g_form.getBooleanValue('unlimited_license');
			if (metric === '') {
				isRightsReadOnly = true;
			} else {
				isRightsReadOnly = ((g_form.getValue('source_entitlement') !== '') || g_scratchpad.has_child_entitlements
					|| g_scratchpad.has_related_entitments || g_scratchpad.has_upgradedToOrFrom
					|| g_scratchpad.has_upgrade_history);
			}
		}
		if (g_form.getViewName() !== 'playbook_entitlement_details') {
			g_form.setMandatory('purchased_rights', isRightsMandatory);
		}
		g_form.setReadOnly('purchased_rights', isRightsReadOnly);
	},
};
/*! RESOURCE: DemandTaskUtil */
var DemandTaskUtil = Class.create();
DemandTaskUtil.prototype = {
    initialize: function() {
    },
	onCompletionCallback : function() {
		var category = g_form.getValue('category');
		var categoryMsg = 'NA';
		if(category == 'resource_estimate')
			categoryMsg = getMessage('Resource Plan created for demand successfully');
		else if(category == 'cost_estimate')
			categoryMsg = getMessage('Cost Plan created for demand successfully');
		else if(category == 'benefit_estimate')
			categoryMsg = getMessage('Benefit Plan created for demand successfully');
		else if(category == 'risk_assessment')
			categoryMsg = getMessage('Risk created for demand successfully');
		if(categoryMsg != 'NA')
			g_form.addInfoMessage(categoryMsg);
	},
    openDemandTaskCategoryModal: function(title, tableName) {
        try {
            var demand = g_form.getValue('parent');
            if (!demand || demand == null) {
                var gr = new GlideRecord("dmn_demand_task");
                if (gr.get(g_form.getUniqueValue())) {
                    demand = gr.getValue('parent');
                }
            }
            if (demand != '') {
                var ctm = new GlideModalForm(title, tableName, this.onCompletionCallback);
                ctm.setPreference('sysparm_view', 'new');
                ctm.setPreference('sysparm_query', 'task=' + demand);
                ctm.setSysID(-1);
                ctm.setPreference('sysparm_form_only', 'true');
                ctm.setPreference('focusTrap', true);
                ctm.render();
            } 
        } catch (error) {
            jslog('Error while creating record for ' + tableName + '. Error occured : ' + error);
        }
    },
    type: 'DemandTaskUtil',
};
/*! RESOURCE: tm_AddToTestPlanHandler */
var tm_AddToTestPlanHandler = Class.create({
	initialize: function(gr) {
		this._gr=gr;
		this._isList = (gr.type+""=="GlideList2");
		this._tableName         = this._gr.getTableName();
		this._prmErr = [];
		
		var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
		this._mstrDlg = new dialogClass("tm_ref_choose_dialog");
		var titleMsg = '';
		if(this._gr.getTableName() == 'tm_test_case') {
			titleMsg = getMessage("Add Case(s) to Test Plan");
		} else if (this._gr.getTableName() == 'tm_test_suite') {
			titleMsg = getMessage("Add Suite(s) to Test Plan");
		}
		this._mstrDlg.setTitle(titleMsg);
		
		this._mstrDlg.setPreference("sysparam_field_label", getMessage("Test Plan"));
		this._mstrDlg.setPreference("sysparam_reference_table","tm_test_plan");
		this._mstrDlg.setPreference("sysparam_query","active=true");
		
		this._mstrDlg.setPreference("handler",this);
	},
	
	showDialog: function() {
		this._mstrDlg.render();
	},
	
	onSubmit: function() {
		var testPlanId = this._getValue('tm_test_plan_ref');
		if (!this._validate()) {
			return false;
		}
		this._mstrDlg.destroy();
		if(testPlanId) {
			var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
			this._plsWtDlg = new dialogClass("tm_wait_dialog");
			this._plsWtDlg.setTitle(getMessage("Working.  Please wait."));
			this._plsWtDlg.render();
			var ga = new GlideAjax("tm_AjaxProcessor");
			ga.addParam('sysparm_name','addToTestPlan');
			ga.addParam('sysparm_sys_id', this._isList ? this._gr.getChecked() : this._gr.getUniqueValue());
			ga.addParam('sysparm_tm_test_plan', testPlanId);
			ga.addParam('sysparm_tn', this._tableName);
			ga.getXML(this.callback.bind(this));
		}
		return false;
	},
	
	callback: function(response) {
		this._plsWtDlg.destroy();
		
		var resp = response.responseXML.getElementsByTagName("result");
		if (resp[0] && resp[0].getAttribute("status") == "success") {
			return false;
		} else {
			var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
			this._createError = new dialogClass("tm_error_dialog");
			this._createError.setTitle(getMessage("Error while adding Test Cases from selected Test Suite."));
			this._createError.render();
		}
		
	},
	
	_refreshRelatedList: function() {
		this._gForm.setFilterAndRefresh('');
	},
	
	_validate: function() {
		var valid = true;
		this._prmErr = [];
		if(!this._isList)
		this._removeAllError('tm_ref_choose_dialog');
		if (this._getValue('tm_test_plan_ref') == 'undefined' || this._getValue('tm_test_plan_ref').trim() == "") {
			this._prmErr.push(getMessage("Select Test Plan"));
			if(!this._isList)
			this._showFieldError('ref_test_suite_field',this._prmErr[0]);
			valid = false;
		}
		return valid;
	},
	
	_removeAllError: function(dialogName) {
		$$('#'+dialogName+' .form-group.has-error').each(function(item){
			$(item).removeClassName('has-error');
			$(item).down('.help-block').setStyle({'display':'none'});
		});
	},
	_showFieldError: function(groupId,message) {
		var $group = $(groupId);
		var $helpBlock = $group.down('.help-block');
		if(!$group.hasClassName('has-error'))
			$group.addClassName('has-error');
		if($helpBlock.getStyle('display')!='inline-block'){
			$helpBlock.update(message);
			$helpBlock.setStyle({'display':'inline-block'});
		}
	},
	
	
	_getValue: function(inptNm) {
		return gel(inptNm).value;
	},
	
	type: "tm_AddToTestPlanHandler"
});
/*! RESOURCE: AddScrumTask */
var AddScrumTask = Class.create();
AddScrumTask.prototype = {
	initialize: function () {
		this.list = (typeof g_list != "undefined") ? g_list : null;
		this.storyID = (typeof rowSysId == 'undefined' || rowSysId == null) ? (gel('sys_uniqueValue') ? gel('sys_uniqueValue').value : "") : rowSysId;
		this.setUpFacade();
		this.setUpEvents();
		this.display(true);
		this.checkOKButton();
		this.focusFirstSelectElement();
	},
	
	toggleOKButton: function(visible) {
		$("ok").style.display = (visible?"inline":"none");
	},
	
	setUpFacade: function () {
		var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
		this.dialog = new dialogClass("task_window");
		this.dialog.setTitle(getMessage("Add Scrum Tasks"));
		this.dialog.setPreference('focusTrap', true);
		var mapCount = this.getTypeCounts();
		this.dialog.setBody(this.getMarkUp(mapCount), false, false);
	},
	
	checkOKButton: function() {
		var visible = false;
		var self = this;
		
		$('task_window').select("select").each(function(elem) {
			if (elem.value + "" != "0") visible = true;
				
			if (!elem.onChangeAdded) {
				elem.onChangeAdded = true;
				
				elem.on("change", function() {
					self.checkOKButton();
				});
			}
		});
		
		this.toggleOKButton(visible);
	},
	
	focusFirstSelectElement: function() {
		$('task_window').select("select")[0].focus();
	},
	
	getTypeCounts: function() {
		var mapLabel = this.getLabels("rm_scrum_task", "type");
		var mapCount = {};
		for (var strKey in mapLabel) {
			mapCount[strKey] = getPreference("com.snc.sdlc.scrum.pp.tasks." + strKey, 0);
		}
		return mapCount;
	},
	
	setUpEvents: function () {
		var self = this, dialog = this.dialog;
		
		$("ok").on("click", function () {
			var mapTaskData = {};
			if (self.fillDataMap(mapTaskData)) {
				var taskProducer = new GlideAjax("ScrumAjaxTaskProducer");
				for (var strKey in mapTaskData) {
					taskProducer.addParam("sysparm_" + encodeURIComponent(strKey), mapTaskData[strKey]);
				}
				
				self.showStatus("Adding tasks...");
				
				taskProducer.getXML(function () {
					self.refresh();
					dialog.destroy();
				});
			} else {
				dialog.destroy();
			}
		});
		$("cancel").on("click", function () {
			dialog.destroy();
		});
	},
	
	refresh: function() {
		if (this.list) this.list.refresh();
			else {
				var tableName = 'rm_story';
				if(g_form)
					tableName = g_form.tableName;
				this.reloadList(tableName + ".rm_scrum_task.story");
			}
		},
	
	getSysID: function() {
		return this.storyID;
	},
	
	fillDataMap: function (mapTaskData) {
		var bTasksRequired = false;
		mapTaskData.name = "createTasks";
		mapTaskData.sys_id = this.getSysID();
		var mapDetails = this.getLabels("rm_scrum_task", "type");
		var arrTaskTypes = [];
		
		for (var key in mapDetails) {
			arrTaskTypes.push(key);
		}
		
		for (var nSlot = 0; nSlot < arrTaskTypes.length; ++nSlot) {
			var strTaskType = arrTaskTypes[nSlot];
			var strTaskData = $(strTaskType).getValue();
			mapTaskData[strTaskType] = strTaskData;
			setPreference("com.snc.sdlc.scrum.pp.tasks." + strTaskType, strTaskData);
			if (strTaskData != "0") {
				bTasksRequired = true;
			}
		}
		
		return bTasksRequired;
	},
	
	getMarkUp: function (mapCounts) {
		function getSelectMarkUp(strFieldId, nValue) {
			var strMarkUp = '<select class="form-control select2" id="' + strFieldId + '" name="' + strFieldId + '">';
			
			for (var nSlot = 0; nSlot <= 10; nSlot++) {
				if (nValue != 0 && nValue == nSlot) {
strMarkUp += '<option value="'+nSlot+'" selected="selected">'+nSlot+'</option>';
				} else {
strMarkUp += '<option value="'+nSlot+'">'+nSlot+'</option>';
				}
			}
			
strMarkUp += "</select>";
			return strMarkUp;
		}
		
		function buildRow(strMessage, nValue) {
			var row = '';
			row += '<div class="row" style="padding-top:10px;">';
			row +=     '<div class="form-group">';
			row +=         '<label class="control-label col-sm-3" for="'+strMessage+'" style="white-space:nowrap;">';
			row +=             strMessage;
row +=         '</label>';
			row +=         '<span class="col-sm-9">';
			row +=             getSelectMarkUp(strMessage, nValue);
row +=         '</span>';
row +=     '</div>';
row += '</div>';
			
			return row;
		}
		
		function buildTable(mapDetails, mapCounts) {
			var arrDetails = [];
			
			for (var strKey in mapDetails) {
				arrDetails.push(strKey + "");
			}
			
			arrDetails.sort();
			var strBuf = '';
			
			for (var index = 0; index < arrDetails.length; ++index) {
				var nCount = mapCounts[arrDetails[index]];
				strBuf += buildRow(arrDetails[index], nCount);
			}
			
			strBuf += '';
			return strBuf;
		}
		
		var mapLabels = this.getLabels("rm_scrum_task", "type");
		return buildTable(mapLabels, mapCounts) + "<div id='task_controls' style='text-align:right;padding-top:20px;'>" +
"<button id='cancel' type='button' class='btn btn-default'>" + getMessage('Cancel') + "</button>" +
"&nbsp;&nbsp;<button id='ok' type='button' class='btn btn-primary'>" + getMessage('OK') + "</button></div>";
	},
	
	reloadForm: function () {
		document.location.href = document.location.href;
	},
	
	reloadList: function (strListName) {
		if(typeof GlideList2 === 'undefined')
			return;
		var list = GlideList2.get(strListName);
		if(list)
			list.refresh();
	},
	
	showStatus: function (strMessage) {
		$("task_controls").update(getMessage('Loading...'));
	},
	
	display: function(bIsVisible) {
		$("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
	},
	
	getLabels: function(strTable, strAttribute) {
		var taskProducer = new GlideAjax("ScrumAjaxTaskProducer");
		taskProducer.addParam("sysparm_name" ,"getLabels");
		taskProducer.addParam("sysparm_table", strTable);
		taskProducer.addParam("sysparm_attribute", strAttribute);
		var result = taskProducer.getXMLWait();
		return this._parseResponse(result);
	},
	
	_parseResponse: function(resultXML) {
		var jsonStr = resultXML.documentElement.getAttribute("answer");
		var map = JSON.parse(jsonStr);
		return map;
	}
};
/*! RESOURCE: populate_scope_editor_slushbucket */
function populateLeftAndRightScopeEditor(dataLeft, dataRight) {
	slushbucketPopulateHelper(gel('scope_slush_left'), dataLeft);
	slushbucketPopulateHelper(gel('scope_slush_right'), dataRight);
}
function slushbucketPopulateHelper(select, data) {
	select.options.length = 0;
	if(data) {
		var list = data.split('^');
		for (var i = 0; i != list.length; i++) {
			var t = list[i].split(':');
			var label = atob(t[0]);
			var value = atob(t[1]);
			var o = new Option(label, value);
			select.options[select.options.length] = o;
		}
	}
}
function cancel() {
	g_form.fieldChanged('scope_slush', false);
	setTimeout(function() {reloadWindow(self);}, 1);
}
function editScopes() {
	g_form.fieldChanged('scope_slush', false);
	var jsonScopes = {
		"additionalScopes": scope_slush.getValues(scope_slush.getRightSelect()) || [],
		"removedScopes": scope_slush.getValues(scope_slush.getLeftSelect()) || []
	};
	var stringScopes = JSON.stringify(jsonScopes);
	
	var ga = new GlideAjax('AJAXAddScopes');
	ga.addParam('sysparm_name', 'updateScopes');
	ga.addParam('sysparm_scopes', stringScopes);
	ga.addParam('sysparm_oauthEntityId', g_form.getUniqueValue());
	ga.getXML(function(result) {
		g_navigation.reloadWindow();
	});
}
/*! RESOURCE: UpgradePlanProgressViewerUtil */
var UpgradePlanProgressViewerUtil = Class.create();
UpgradePlanProgressViewerUtil.prototype = {
	initialize: function() {
	},
	renderProgressViewer: function(title, progressId) {
		var self = this;
		var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
		var modal = new dialogClass('hierarchical_progress_viewer', false, '40em', '10.5em');
	
		modal.setTitle(title);
		modal.setPreference('sysparm_renderer_execution_id', progressId);
		modal.setPreference('sysparm_button_close', new GwtMessage().getMessage('Close'));
		modal.setPreference('sysparm_renderer_hide_drill_down', true);
	
		modal.on('bodyrendered', function() {
			self.disableModalCloseButton();
		});
	
		modal.on('renderStatus', function(statusObject) {
			self.addResultButtonIfApplicable(statusObject);
			self.addViewDetailsButtonIfApplicable(statusObject, progressId, modal);
		});
	
		modal.on('executionComplete', function() {
			self.updateModalButtons(modal);
		});
	
		modal.render();
	},
	addResultButtonIfApplicable: function(statusObject) {
		if (!this.isUpgradePlanComplete(statusObject))
			return;
		addButtonToProgressFooter(this.createResultButton(statusObject.result.upgradePlanSysId));
	},
	addViewDetailsButtonIfApplicable: function(statusObject, progressId, modal) {
		if (statusObject && statusObject.result && statusObject.result.succeedWithWarning && !$('sysparm_button_view_details') && !modal.title.includes(' - Execution Details'))
			addButtonToProgressFooter(this.createViewDetailsButton(progressId, modal));
	},
	disableModalCloseButton: function() {
		var closeBtn = $('sysparm_button_close');
		if (closeBtn)
			closeBtn.disable();
	},
	isUpgradePlanComplete: function(statusObject) {
		return statusObject && statusObject.result && statusObject.result.upgradePlanSysId && !$('sysparm_button_result_page');
	},
	createResultButton: function(upgradePlanSysId) {
		var resultButton = new Element('button', {
			'id': 'sysparm_button_result_page',
			'type': 'button',
			'class': 'btn btn-default',
			'style': 'margin-left: 5px;'
		}).update(new GwtMessage().getMessage('Go to Upgrade Plan'));
		resultButton.onclick = function() {
			window.location = 'sys_upgrade_plan.do?sys_id=' + upgradePlanSysId;
		};
		return resultButton;
	},
	createViewDetailsButton: function(progressId, modal) {
		var viewDetailsButton = new Element('button', {
			'id': 'sysparm_button_view_details',
			'type': 'button',
			'class': 'btn btn-default',
			'style': 'margin-left: 5px;'
		}).update(new GwtMessage().getMessage('View Details'));
		viewDetailsButton.onclick = function() {
			modal.setPreference('sysparm_renderer_hide_drill_down', false);
			modal.setTitle(modal.title + ' - Execution Details');
			modal.render();
		};
		return viewDetailsButton;
	},
	updateModalButtons: function(modal) {
		var closeBtn = $('sysparm_button_close');
		if (closeBtn) {
			closeBtn.onclick = function() {
				modal.destroy();
				reloadWindow(window);
			};
		}
		var resultBtn = $('sysparm_button_result_page');
		if (resultBtn)
			resultBtn.className += ' btn-primary';
		var viewDetailsBtn = $('sysparm_button_view_details');
		if (viewDetailsBtn)
			viewDetailsBtn.className += ' btn-secondary';
	},
	type: 'UpgradePlanProgressViewerUtil'
};
/*! RESOURCE: UI Action Context Menu */
function showUIActionContext(event) {
   if (!g_user.hasRole("ui_action_admin"))
      return;
   var element = Event.element(event);
   if (element.tagName.toLowerCase() == "span")
      element = element.parentNode;
   var id = element.getAttribute("gsft_id");
   var mcm = new GwtContextMenu('context_menu_action_' + id);
   mcm.clear();
   mcm.addURL(getMessage('Edit UI Action'), "sys_ui_action.do?sys_id=" + id, "gsft_main");
   contextShow(event, mcm.getID(), 500, 0, 0);
   Event.stop(event);
}
addLoadEvent(function() {
   document.on('contextmenu', '.action_context', function (evt, element) {
      showUIActionContext(evt);
   });
});
/*! RESOURCE: AddMembersFromGroup */
var AddMembersFromGroup = Class.create(GlideDialogWindow, {
   initialize: function () {
      this.setUpFacade();
   },
   
   setUpFacade: function () {
      GlideDialogWindow.prototype.initialize.call(this, "task_window", false);
      this.setTitle(getMessage("Add Members From Group"));
      this.setBody(this.getMarkUp(), false, false); 
   },
   setUpEvents: function () {
      var dialog = this;
      var okButton = $("ok");
      if (okButton) {
         okButton.on("click", function () {
         var mapData = {};
         if (dialog.fillDataMap (mapData)) {
            var processor = new GlideAjax("ScrumAjaxAddReleaseTeamMembersProcessor");
            for (var strKey in mapData) {
               processor.addParam(strKey, mapData[strKey]);
            }
            dialog.showStatus(getMessage("Adding group users..."));
            processor.getXML(function () {
               dialog.refresh();
               dialog._onCloseClicked();
            });            
         } else {
            dialog._onCloseClicked();  
         }
      });
      }
      var cancelButton = $("cancel");
      if (cancelButton) {
      cancelButton.on("click", function () {
         dialog._onCloseClicked(); 
      });
      }
      var okNGButton = $("okNG");
      if (okNGButton) {
      okNGButton.on("click", function () {
         dialog._onCloseClicked(); 
      });
      }
      var cancelNGButton = $("cancelNG");
      if (cancelNGButton) {
      cancelNGButton.on("click", function () {
         dialog._onCloseClicked(); 
      });
      }
   },
   refresh: function(){
      GlideList2.get("scrum_pp_team.scrum_pp_release_team_member.team").refresh();
   },
   getScrumReleaseTeamSysId: function () {
      return g_form.getUniqueValue() + "";
   },
   getUserChosenGroupSysIds: function () {
      return $F('groupId') + ""; 
   },
   showStatus: function (strMessage) {
      $("task_controls").update(strMessage);
   },
   
   display: function(bIsVisible) {
      $("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");   
   },
  getRoleIds: function () {
      var arrRoleNames = ["scrum_user", "scrum_admin", "scrum_release_planner", "scrum_sprint_planner", "scrum_story_creator"];
      var arrRoleIds = [];
      var record = new GlideRecord ("sys_user_role");
      record.addQuery ("name", "IN", arrRoleNames.join (","));
      record.query ();
      while (record.next ())
         arrRoleIds.push (record.sys_id + "");
      return arrRoleIds;
  },
  hasScrumRole: function (roleSysId, arrScrumRoleSysIds) {
     for (var index = 0; index < arrScrumRoleSysIds.length; ++index)
        if (arrScrumRoleSysIds[index] == "" + roleSysId)
           return true;
  
     var record = new GlideRecord ("sys_user_role_contains");
     record.addQuery("role", roleSysId);
     record.query ();
     while (record.next())
       if (this.hasScrumRole (record.contains, arrScrumRoleSysIds))
         return true;
     return false;
  },
  getGroupIds: function () {  
     var arrScrumRoleIds = this.getRoleIds ();
     var arrGroupIds = [];
     var record = new GlideRecord ("sys_group_has_role");
     record.query ();
     while (record.next ())
        if (this.hasScrumRole (record.role, arrScrumRoleIds))
           arrGroupIds.push (record.group + "");
     return arrGroupIds;
   },
   
   getGroupInfo: function () {
      var mapGroupInfo = {};
      var arrRoleIds = this.getRoleIds ();
      var arrGroupIds = this.getGroupIds (arrRoleIds);
      var record = new GlideRecord ("sys_user_group");
      record.addQuery("sys_id", "IN", arrGroupIds.join (","));
      record.query ();
      while (record.next ()) {
         var strName = record.name + "";
         var strSysId = record.sys_id + "";
         mapGroupInfo [strName] = {name: strName, sysid: strSysId};
      }
      return mapGroupInfo;
   },
   getMarkUp: function () {
      var groupAjax = new GlideAjax('ScrumUserGroupsAjax');
      groupAjax.addParam('sysparm_name', 'getGroupInfo');
      groupAjax.getXML(this.generateMarkUp.bind(this));
   },
   generateMarkUp: function(response) {
      var mapGroupInfo = {};
      var groupData = response.responseXML.getElementsByTagName("group");
	  var strName, strSysId;
      for (var i = 0; i < groupData.length; i++) {
        strName = groupData[i].getAttribute("name");
        strSysId = groupData[i].getAttribute("sysid");
        mapGroupInfo[strName] = {
          name: strName,
          sysid: strSysId
        };
      }
      var arrGroupNames = [];
      for (var strGroupName in mapGroupInfo) {
        arrGroupNames.push (strGroupName + "");
      }
      arrGroupNames.sort ();
      var strMarkUp = "";
      if (arrGroupNames.length > 0) {
         var strTable = "<table><tr><td><label for='groupId'><select id='groupId'>";
         for (var nSlot = 0; nSlot < arrGroupNames.length; ++nSlot) {
            strName = arrGroupNames[nSlot];
            strSysId = mapGroupInfo [strName].sysid;
strTable += "<option value='" + strSysId + "'>" + strName + "</option>";
         }
strTable += "</select></label></td></tr></table>";
      
      strMarkUp = "<div id='task_controls'>" + strTable + 
                    "<div style='text-align: right;'>" +
"<button id='ok' type='button'>" + getMessage("OK") + "</button>" +
"<button id='cancel' type='button'>" + getMessage("Cancel") + "</button></div></div>";
      } else {
strMarkUp = "<div id='task_controls'><p>No groups with scrum_user role found</p>" +
                        "<div style='text-align: right;'>" +
"<button id='okNG' type='button'>" + getMessage("OK") + "</button>" +
                         "<button id='cancelNG' type='button'>" + getMessage("Cancel") + 
"</button></div></div>";
      }
      this.setBody(strMarkUp, false, false);
      this.setUpEvents();
      this.display(true);
      this.setWidth(180);
   },
   fillDataMap: function (mapData) {
      var strChosenGroupSysId = this.getUserChosenGroupSysIds ();
      if (strChosenGroupSysId) {
         mapData.sysparm_name = "createReleaseTeamMembers";
         mapData.sysparm_sys_id = this.getScrumReleaseTeamSysId ();
         mapData.sysparm_groups = strChosenGroupSysId;
         return true;
      } else {
         return false;
      }
   }
});
/*! RESOURCE: ValidateStartEndDates */
function validateStartEndDate(startDateField, endDateField, processErrorMsg){
	var startDate = g_form.getValue(startDateField);
	var endDate = g_form.getValue(endDateField);
	var format = g_user_date_format;
	if (startDate === "" || endDate === "")
		return true;
	var startDateFormat = getDateFromFormat(startDate, format);
	var endDateFormat = getDateFromFormat(endDate, format);
	
	if (startDateFormat < endDateFormat)
		return true;
	
	if (startDateFormat === 0 || endDateFormat === 0){
		processErrorMsg(new GwtMessage().getMessage("{0} is invalid", g_form.getLabelOf(startDate === 0? startDateField : endDateField)));
		return false;
	}
	if (startDateFormat > endDateFormat){
		processErrorMsg(new GwtMessage().getMessage("{0} must be after {1}", g_form.getLabelOf(endDateField), g_form.getLabelOf(startDateField)));
		return false;
	}
	
	return true;
}
/*! RESOURCE: AddTeamMembers */
var AddTeamMembers = Class.create(GlideDialogWindow, {
   initialize: function () {
      this.setUpFacade();
   },
   
   setUpFacade: function () {
      GlideDialogWindow.prototype.initialize.call(this, "task_window", false);
      this.setTitle(getMessage("Add Team Members"));
      this.setBody(this.getMarkUp(), false, false); 
   },
   setUpEvents: function () {
      var dialog = this;
      var okButton = $("ok");
      if (okButton) {
         okButton.on("click", function () {
         var mapData = {};
         if (dialog.fillDataMap (mapData)) {
            var processor = new GlideAjax("ScrumAjaxAddReleaseTeamMembers2Processor");
            for (var strKey in mapData) {
               processor.addParam(strKey, mapData[strKey]);
            }
            dialog.showStatus(getMessage("Adding team members..."));
            processor.getXML(function () {
               dialog.refresh();
               dialog._onCloseClicked();
            });            
         } else {
            dialog._onCloseClicked();  
         }
      });
      }
      var cancelButton = $("cancel");
      if (cancelButton) {
         cancelButton.on("click", function () {
            dialog._onCloseClicked(); 
      });
      }
      var okNGButton = $("okNG");
      if (okNGButton) {
         okNGButton.on("click", function () {
            dialog._onCloseClicked(); 
      });
      }
      var cancelNGButton = $("cancelNG");
      if (cancelNGButton) {
         cancelNGButton.on("click", function () {
            dialog._onCloseClicked(); 
      });
      }
      
      var teamCombo = $("teamId");
      if (teamCombo) {
         teamCombo.on("change", function (){
            dialog.updateMembers ();
         });
      }
   },
   
   updateMembers: function () {
      var arrMemberInfo = [];
      var teamCombo = $("teamId");
      if (teamCombo) {      
         var strTeamSysId = teamCombo.value;
         var recTeamMember = new GlideRecord ("scrum_pp_release_team_member");
         recTeamMember.addQuery ("team", strTeamSysId);
         recTeamMember.query ();
         while (recTeamMember.next ()) {
            var recSysUser = new GlideRecord ("sys_user");
            recSysUser.addQuery ("sys_id", recTeamMember.name);
            recSysUser.query ();
            var strName = recSysUser.next () ? recSysUser.name : "";
            var strPoints = recTeamMember.default_sprint_points + "";
            arrMemberInfo.push ({name: strName, points: strPoints});
         }
      }
      if (arrMemberInfo.length > 0) {
         var strHtml = "<tr><th style='text-align: left; white-space: nowrap'>" + 
"Member</th><th style='text-align: left; white-space: nowrap'>Sprint Points</th><tr>";
         for (var nSlot = 0; nSlot < arrMemberInfo.length; ++nSlot) {
            var strMemberName = arrMemberInfo[nSlot].name + "";
            var strMemberPoints = arrMemberInfo[nSlot].points + "";
            strHtml += "<tr><td  style='text-align: left; white-space: nowrap'>" + strMemberName + 
"</td><td style='text-align: left; white-space: nowrap'>" + strMemberPoints + "</td></tr>";
         }
         $("memberId").update (strHtml);
      } else {
$("memberId").update ("<tr><td style='font-weight: bold'>"+getMessage("No team members")+"</td></tr>");
      }
   },
   refresh: function(){
      GlideList2.get("scrum_pp_team.scrum_pp_release_team_member.team").refresh();
   },
   getScrumReleaseTeamSysId: function () {
      return g_form.getUniqueValue() + "";
   },
   getUserChosenTeamSysIds: function () {
      return $F('teamId') + ""; 
   },
   showStatus: function (strMessage) {
      $("task_controls").update(strMessage);
   },
   
   display: function(bIsVisible) {
      $("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");   
   },
   getMarkUp: function () {
      var groupAjax = new GlideAjax('ScrumUserGroupsAjax');
      groupAjax.addParam('sysparm_name', 'getTeamInfo');
      groupAjax.addParam('sysparm_scrum_team_sysid', this.getScrumReleaseTeamSysId());
      groupAjax.getXML(this.generateMarkUp.bind(this));
   },
   generateMarkUp: function(response) {
      var mapTeamInfo = {};
      var teamData = response.responseXML.getElementsByTagName("team");
	  var strName, strSysId;
      for (var i = 0; i < teamData.length; i++) {
         strName = teamData[i].getAttribute("name");
         strSysId = teamData[i].getAttribute("sysid");
         mapTeamInfo[strName] = {
            name: strName,
            sysid: strSysId
         };
      }
   
      var arrTeamNames = [];
      for (var strTeamName in mapTeamInfo) {
         arrTeamNames.push (strTeamName + "");
      }
      arrTeamNames.sort ();
      var strMarkUp = "";
      if (arrTeamNames.length > 0) {
var strTable = "<table><tr><td><label for='teamId'>"+getMessage("Team")+"</label>&nbsp;<select id='teamId'>";
         for (var nSlot = 0; nSlot < arrTeamNames.length; ++nSlot) {
            strName = arrTeamNames[nSlot];
            strSysId = mapTeamInfo [strName].sysid;
strTable += "<option value='" + strSysId + "'>" + strName + "</option>";
         }
strTable += "</select></label></td></tr></table>";
var strTable2 = "<table style='width: 100%;'><tr><td style='width: 50%;'></td><td><table id='memberId'></table></td><td style='width: 50%;'></td></tr></table>";
      
         strMarkUp = "<div id='task_controls' style='overflow: auto;>" + strTable + strTable2 + 
"</div><table style='width: 100%'><tr><td style='white-space: nowrap; text-align: right;'><button id='ok' type='button'>" + getMessage("OK") + "</button>" +
"<button id='cancel' type='button'>" + getMessage("Cancel") + "</button></td></tr></table>";
      } else {
strMarkUp = "<div id='task_controls'><p>No release teams found</p>" +
"<table style='width: 100%'><tr><td style='white-space: nowrap; text-align: right;'><button id='okNG' type='button'>" + getMessage("OK") + "</button>" +
"<button id='cancelNG' type='button'>" + getMessage("Cancel") + "</button></td></tr></table></div>";
      }
      this.setBody(strMarkUp, false, false); 
      this.setUpEvents();
      this.display(true);
      this.setWidth(280);
   },
   fillDataMap: function (mapData) {
      var strChosenTeamSysId = this.getUserChosenTeamSysIds ();
      if (strChosenTeamSysId) {
         mapData.sysparm_name = "createReleaseTeamMembers";
         mapData.sysparm_sys_id = this.getScrumReleaseTeamSysId ();
         mapData.sysparm_teams = strChosenTeamSysId;
         return true;
      } else {
         return false;
      }
   }
});
/*! RESOURCE: ScrumAddSprints */
var ScrumAddSprints = Class.create({
    initialize: function(gr) {
        this._gr=gr;
        this._prmNms  = ["spName","spDuration","spStartDate","spStartNum","spNum","_tn","_sys_id"];
        this._dateFN = ["spStartDate"];
        this._refObs = [];
        this._prmVls = [];
        for (var i=0;i<this._prmNms.length;i++) {
            this._prmVls[this._prmNms[i]]="";
        }
        this._prmErr = [];
        var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
        this._crtDlg = new dialogClass("scrum_add_sprints_dialog");
        this._crtDlg.setTitle("Add Sprints");
        this._crtDlg.setPreference("_tn",this._gr.getTableName());
        this._crtDlg.setPreference("_sys_id", (this._gr.getUniqueValue()));
        this._crtDlg.setPreference("handler",this);
    },
    showDialog: function() {
        this._crtDlg.render();
    },
    onSubmit: function() {
        this._readFormValues();
        if (!this._validate()) {
            var errMsg = "Before you submit:";
            for (var i = 0; i < this._prmErr.length; i++) {
                errMsg += "\n * "+this._prmErr[i];
            }
            alert(errMsg);
			$j('#spName').focus();
            return false;
        }
        this._crtDlg.destroy();
        var ga = new GlideAjax("ScrumAddSprintsAjaxProcessor");
        ga.addParam("sysparm_name","checkDuration");
        for (var i = 0; i < this._prmNms.length; i++ ) {
            ga.addParam(this._prmNms[i],this._prmVls[this._prmNms[i]]);
        }
        ga.getXML(this.checkComplete.bind(this));
        return false;
    },
    checkComplete: function(response) {
        var resp = response.responseXML.getElementsByTagName("item");
        if (resp[0].getAttribute("result") == "success") {
            var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
            this._plsWtDlg = new dialogClass("scrum_please_wait");
            this._plsWtDlg.setTitle("Working.  Please wait.");
            this._plsWtDlg.render();
            var ga = new GlideAjax("ScrumAddSprintsAjaxProcessor");
            ga.addParam("sysparm_name","addSprints");
            for (var i = 0; i < this._prmNms.length; i++ ) {
                ga.addParam(this._prmNms[i],this._prmVls[this._prmNms[i]]);
            }
            ga.getXML(this.createComplete.bind(this));
            return false;
        }
        var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
        this._rlsPshDlg = new dialogClass("scrum_release_push_confirm_dialog");
        this._rlsPshDlg.setTitle("Modify Release Dates");
        this._rlsPshDlg.setPreference("handler",this);
        this._rlsPshDlg.render();
    },
    confirmReleasePush: function() {
        this._rlsPshDlg.destroy();
        var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
        this._plsWtDlg = new dialogClass("scrum_please_wait");
        this._plsWtDlg.setTitle("Working.  Please wait.");
        this._plsWtDlg.render();
        var ga = new GlideAjax("ScrumAddSprintsAjaxProcessor");
        ga.addParam("sysparm_name","addSprints");
        for (var i = 0; i < this._prmNms.length; i++ ) {
            ga.addParam(this._prmNms[i],this._prmVls[this._prmNms[i]]);
        }
        ga.getXML(this.createComplete.bind(this));
        return false;
    },
    cancelReleasePush: function(response) {
        this._rlsPshDlg.destroy();
        window.location.reload();
        return false;
    },
    createComplete: function(response) {
        this._plsWtDlg.destroy();
        var resp = response.responseXML.getElementsByTagName("item");
        if (resp[0].getAttribute("result") == "success") {
            this._sprints = response.responseXML.documentElement.getAttribute("answer");
            var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
            this._viewConfirm = new dialogClass("scrum_sprints_view_confirm_dialog");
            this._viewConfirm.setTitle("Sprints Created");
            this._viewConfirm.setPreference("handler",this);
            this._viewConfirm.render();
        }
        else {
            var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
            this._createError = new dialogClass("scrum_error");
            this._createError.setTitle("Error Creating Sprints");
            this._createError.setPreference("handler",this);
            this._createError.render();
        }
    },
    viewConfirmed: function() {
        this._viewConfirm.destroy();
        window.location="rm_sprint_list.do?sysparm_query=numberIN"+this._sprints+"&sysparm_view=scrum";
        return false;
    },
    viewCancelled: function() {
        this._viewConfirm.destroy();
        window.location.reload();
        return false;
    },
    popCal: function(dateFieldId) {
        return new GwtDateTimePicker(dateFieldId,g_user_date_time_format, true);
    },
    _validate: function() {
        var valid = true;
        this._prmErr = [];
        if (this._prmVls["spName"] == "") {
            this._prmErr.push("You must supply a Name");
            valid = false;
        }
        if (this._prmVls["spDuration"] == "" || isNaN(this._prmVls['spDuration'])) {
            this._prmErr.push("You must supply a valid numeric duration");
            valid = false;
        }
        if (this._prmVls["spStartDate"] == "") {
            this._prmErr.push("You must supply a Start Date");
            valid = false;
        }
        if (this._prmVls["spNum"] == "" || isNaN(this._prmVls['spNum'])) {
            this._prmErr.push("You must supply a valid Number of Sprints to create");
            valid = false;
        }
        if (this._prmVls["spStartNum"] == "" || isNaN(this._prmVls['spStartNum'])) {
            this._prmErr.push("You must supply a valid starting number");
            valid = false;
        }
        return valid;
    },
    _readFormValues: function() {
        for (var i=0;i<this._prmNms.length;i++) {
            var frmVl = this._getValue(this._prmNms[i]);
            if ((typeof frmVl === "undefined") || frmVl == "undefined" || frmVl == null || frmVl == "null") {
                frmVl = "";
            }
            this._prmVls[this._prmNms[i]] = frmVl;
        }
    },
    _getValue: function(inptNm) {
        return gel(inptNm).value;
    },
    type: "ScrumAddSprints"
});
/*! RESOURCE: AppointmentBookingConfigHelper */
var APP_BOOKING_CONSTANTS = {};
APP_BOOKING_CONSTANTS.MESSAGES = {};
APP_BOOKING_CONSTANTS.MESSAGES.ERROR = {};
APP_BOOKING_CONSTANTS.MESSAGES.ERROR.ONSUBMIT = "";
APP_BOOKING_CONSTANTS.MESSAGES.ERROR.DAILYSCHEDULE = "";
APP_BOOKING_CONSTANTS.MESSAGES.ERROR.BREAKTIME = "";
APP_BOOKING_CONSTANTS.MESSAGES.ERROR.DURATION = "";
APP_BOOKING_CONSTANTS.MESSAGES.AVAILABLE = "";
APP_BOOKING_CONSTANTS.MESSAGES.BREAK = "";
APP_BOOKING_CONSTANTS.MESSAGES.INSUFFICIENT_TIME = "";
APP_BOOKING_CONSTANTS.MESSAGES.FETCHED = false;
			
var AppointmentBookingConfigHelper = Class.create();
AppointmentBookingConfigHelper.prototype = {
	initialize : function () {
		this.htmlTemplate = '';
	},
	clearTimespans : function () {
		var macroElem = $j("#appointmentBookingTimeSlotContainer")[0];
		if (macroElem) {
			macroElem.innerHTML = '';
		}
	},
	setBookableTime : function (bookableTime) {
		g_form.setValue("bookable_time", bookableTime);
	},
	initEventHandlers : function() {
		var breakStartElem = $j("#break-start");
		var breakEndElem = $j("#break-end");
		if (breakStartElem && breakEndElem) {
			breakStartElem.change(function() {
				var configHelper = new AppointmentBookingConfigHelper();
				if(configHelper.validateBreakTimes()){
					configHelper.refreshTimeSlots();
				}
			});
			breakEndElem.change(function() {
				var configHelper = new AppointmentBookingConfigHelper();
				if(configHelper.validateBreakTimes()){
					configHelper.refreshTimeSlots();
				}
			});
		}
	},
	validateDailySchedule : function () {
		var dailyStartTime = g_form.getValue("daily_start_time");
		var dailyEndTime = g_form.getValue("daily_end_time");
		g_form.hideFieldMsg('daily_start_time', true);
		g_form.hideFieldMsg('daily_end_time', true);
		if (!this.compareTime(dailyStartTime,dailyEndTime)) {
			g_form.showFieldMsg('daily_start_time',APP_BOOKING_CONSTANTS.MESSAGES.ERROR.DAILYSCHEDULE,'error');
			return false;
		}
		return true;
	},
	validateBreakTimes : function () {
		var considerBreak = g_form.getValue("include_daily_break");
		var breakStartElem = $j("#break-start");
		var breakEndElem = $j("#break-end");
		g_form.hideFieldMsg('include_daily_break', true);
		if (breakStartElem && breakEndElem) {
			if(breakStartElem[0].value == "" || breakEndElem[0].value == "")
				return true;
			if (!this.compareTime(breakStartElem[0].value, breakEndElem[0].value)) {
				g_form.showFieldMsg('include_daily_break',getMessage("Break start time cannot be after break end time"),'error');
				return false;
			}
		}
		return true;
	},
	validateDurations : function(){
		var appointmentDuration = g_form.getValue("appointment_duration");
		var workDuration = g_form.getValue("work_duration");
		var avgTravelDuration = g_form.getValue("average_travel_duration");
		if(appointmentDuration != "") {
			g_form.hideFieldMsg('appointment_duration', true);
			if((Number(workDuration) + Number(avgTravelDuration)) > Number(appointmentDuration)){
				g_form.showFieldMsg('appointment_duration',APP_BOOKING_CONSTANTS.MESSAGES.ERROR.DURATION,'error');
				return false;
			}
		} else 
			return false;
		return true;
	},
	validateOnSubmit : function() {
		var shouldSubmit = true;
		g_form.clearMessages();
		if (!this.validateDailySchedule()) {
			g_form.addErrorMessage(APP_BOOKING_CONSTANTS.MESSAGES.ERROR.ONSUBMIT);
			g_form.addErrorMessage(APP_BOOKING_CONSTANTS.MESSAGES.ERROR.DAILYSCHEDULE);
			shouldSubmit = false;
		}
		if (!this.validateBreakTimes()) {
			if (shouldSubmit)
				g_form.addErrorMessage(APP_BOOKING_CONSTANTS.MESSAGES.ERROR.ONSUBMIT);
			g_form.addErrorMessage(APP_BOOKING_CONSTANTS.MESSAGES.ERROR.BREAKTIME);
			shouldSubmit = false;
		}
		if (!this.validateDurations()) {
			if (shouldSubmit)
				g_form.addErrorMessage(APP_BOOKING_CONSTANTS.MESSAGES.ERROR.ONSUBMIT);
			g_form.addErrorMessage(APP_BOOKING_CONSTANTS.MESSAGES.ERROR.DURATION);
			shouldSubmit = false;
		}
		return shouldSubmit;
	},
	compareTime : function(start, end) {
		if (start && end) {
			var startComponentsArr = start.split(":");
			var endComponentsArr = end.split(":");
			var len = Math.min(startComponentsArr.length, endComponentsArr.length);
			var startNumeric = 0;
			var endNumeric = 0;
			try {
				for (var i = len-1;i>=0;i--){
startNumeric = startNumeric/60.0 + parseInt(startComponentsArr[i]);
endNumeric = endNumeric/60.0 + parseInt(endComponentsArr[i]);
				}
				return startNumeric <= endNumeric;
			} catch(err) {
				return false;
			}
		}
	},
	
	refreshTimeSlots : function() {
		if (!APP_BOOKING_CONSTANTS.MESSAGES.FETCHED) {
            var appointmentBookingAjax = new GlideAjax('sn_apptmnt_booking.AppointmentBookingAjaxUtil');
            appointmentBookingAjax.addParam('sysparm_name','getTranslatedMessagesForAppBookingConfig');
            appointmentBookingAjax.getXML(this.processAppBookingTranslationMessagesResponse.bind(this));
                    
		} else
			this._refreshTimeSlots();
	},
    
    processAppBookingTranslationMessagesResponse : function(response, args) {
        translatedMessages = response.responseXML.documentElement.getAttribute("answer");
        if (translatedMessages) {
            APP_BOOKING_CONSTANTS = JSON.parse(translatedMessages);
            APP_BOOKING_CONSTANTS.MESSAGES.FETCHED = true;
            this._refreshTimeSlots();
        }
    },
	
	_refreshTimeSlots : function() {
		var timeSlots = this.processTimeSpans();
		var bookableTime = [];
		for (var i = 0; i < timeSlots.length; i++) {
			var slot = timeSlots[i];
			if (slot) {
				var slotClassName = "time-slot";
				if (!slot.available)
					slotClassName += "-disable";
				this.htmlTemplate += '<div class="'+slotClassName+'">';
				if (slot.available)
this.htmlTemplate += '<div class="time-slot-label"><span data-index='+i+' action-value='+i+' class="icon-check"></span></div>';
				else
this.htmlTemplate += '<div class="time-slot-label"></div>';
this.htmlTemplate += '<div class="time-slot-value"> <span class="m-l-xs m-r-xs"> '+slot.start+' </span>';
this.htmlTemplate += '<span class="m-l-xs m-r-xs"> - </span>';
this.htmlTemplate += '<span class="m-l-xs m-r-xs"> '+slot.end+' </span> </div>';
				if (slot.available)
					bookableTime.push(slot.start + "-" + slot.end);
				if (!slot.available)
this.htmlTemplate += '<div class="time-slot-reason"> <span class="m-l-xs m-r-xs"> - '+slot.reason+' </span> </div>';
this.htmlTemplate += '</div>';
			}
		}
		this.setBookableTime(bookableTime.join()+"");
		this.updateTimeSlots();
	},
	processTimeSpans : function () {
		var windowDuration = g_form.getValue("appointment_duration");
		var dailyStartTime = g_form.getValue("daily_start_time");
		var dailyEndTime = g_form.getValue("daily_end_time");
		if (this.isNil(windowDuration) || this.isNil(dailyStartTime) || this.isNil(dailyEndTime))
			return [];
		var considerBreak = g_form.getValue("include_daily_break");
		var breakStartElem = $j("#break-start")[0];
		var breakEndElem = $j("#break-end")[0];
		var breakStartTime = "0:00", breakEndTime = "0:00";
		if ((considerBreak == true || considerBreak == "true") && breakStartElem && breakEndElem) {
			breakStartTime = breakStartElem.value+"";
			breakEndTime = breakEndElem.value+"";
			considerBreak = true;
			var breakString = breakStartTime + "-" + breakEndTime;
			g_form.setValue("break_time",breakString);
		}
		return this.buildTimeSpans(dailyStartTime, dailyEndTime, breakStartTime, breakEndTime, windowDuration, considerBreak);
	},
	isNil : function(value) {
		return (value == "" || value == null || value == undefined || value == "null" || value == "undefined");
	},
	updateTimeSlots : function() {
		var macroElem = $j("#appointmentBookingTimeSlotContainer")[0];
		if (macroElem) {
			macroElem.innerHTML = this.htmlTemplate;
		}
	},
	setHourMin: function(now, hourMin){
var arr = hourMin.split(/[-: ]/);
		var hour = Number(arr[0]);
		var min = Number(arr[1]);
		now.setHours(hour);
		now.setMinutes(min);
		now.setSeconds(0);
		return now;
	},
	buildTimeSpans : function (dailyStartTime, dailyEndTime, breakStartTime, breakEndTime, windowDuration, considerBreak) {
		var timeSpans = [], now = new Date();
		var CONSTANTS = {};
		CONSTANTS.AVAILABLE = APP_BOOKING_CONSTANTS.MESSAGES.AVAILABLE;
		CONSTANTS.BREAK = APP_BOOKING_CONSTANTS.MESSAGES.BREAK;
		CONSTANTS.INSUFFICIENT_TIME = APP_BOOKING_CONSTANTS.MESSAGES.INSUFFICIENT_TIME;
		CONSTANTS.MAX_MINUTES_IN_A_DAY = 1440;
		var start = this.setHourMin(new Date(), dailyStartTime);
		var end = this.setHourMin(new Date(), dailyEndTime);
		if (start.getTimezoneOffset() != end.getTimezoneOffset()) {
			start.setDate(start.getDate() + 1);
			end.setDate(end.getDate() + 1);
		}
		var currNumVal = start.getTime(), dailyEndNumVal = end.getTime();
		var endNumVal = dailyEndNumVal;
		var startTimeStamp = dailyStartTime;
		if (currNumVal >= dailyEndNumVal) {
			console.error("daily start time cannot be on or after daily end time");
			return timeSpans;
		}
		var breakStart = this.setHourMin(new Date(), breakStartTime);
		var breakEnd = this.setHourMin(new Date(), breakEndTime);
		var breakStartNumVal = breakStart.getTime(), breakEndNumVal = breakEnd.getTime();
		var breakStartTimeStamp = -1, breakEndTimeStamp = -1;
		if (considerBreak)
			considerBreak = this.shouldConsiderBreak(currNumVal, endNumVal, breakStartNumVal,breakEndNumVal);
		if (considerBreak) {
			breakStartTimeStamp = this.getTimestamp(breakStart);
			breakEndTimeStamp = this.getTimestamp(breakEnd);
		}
		if (considerBreak && breakStartNumVal < currNumVal) {
			currNumVal = breakStartNumVal;
			start = breakStart;
			startTimeStamp = this.getTimestamp(breakStart);
		}
		var maxCounter = 0;
		while (currNumVal < dailyEndNumVal || maxCounter > CONSTANTS.MAX_MINUTES_IN_A_DAY) {
			var nextWindow = this.addMinutes(start, parseInt(windowDuration));
			endNumVal = nextWindow.getTime();
if (endNumVal > dailyEndNumVal)
				break;
			var breakOverlapStartTime = this.doBreakOverlapStartTime(currNumVal, endNumVal, breakStartNumVal,breakEndNumVal);
			var breakOverlapEndTime = this.doBreakOverlapEndTime(currNumVal, endNumVal, breakStartNumVal,breakEndNumVal);
			if (considerBreak && (breakOverlapStartTime || breakOverlapEndTime)) {
				if (breakOverlapEndTime) {
					timeSpans.push(this.getWindowSpan(startTimeStamp, breakStartTimeStamp, false, CONSTANTS.INSUFFICIENT_TIME));
				}
				timeSpans.push(this.getWindowSpan(breakStartTimeStamp, breakEndTimeStamp, false, CONSTANTS.BREAK));
				currNumVal = breakEnd.getTime();
				start = breakEnd;
				startTimeStamp = breakEndTimeStamp;
			} else {
				var endTimeStamp = this.getTimestamp(nextWindow);
				timeSpans.push(this.getWindowSpan(startTimeStamp, endTimeStamp, true, CONSTANTS.AVAILABLE));
				startTimeStamp = endTimeStamp;
				start = nextWindow;
				currNumVal = start.getTime();
			}
			maxCounter++;
		}
		return timeSpans;
	},
	getWindowSpan : function (start, end, available, reason) {
		var windowSpan = {};
		windowSpan.start = start;
		windowSpan.end = end;
		windowSpan.window = start + "-" + end;
		windowSpan.available = available;
		windowSpan.reason = reason;
		return windowSpan;
	},
	shouldConsiderBreak : function (windowStart, windowEnd, breakStart, breakEnd) {
		var considerBreak = false;
		if (!breakStart || !breakEnd || breakStart == breakEnd)
			return false;
		if (breakStart > breakEnd) {
			return false;
		}
		if (breakStart < windowStart && breakEnd <= windowStart) {
			return false;
		}
		if (breakStart >= windowEnd && breakEnd > windowEnd) {
			return false;
		}
		return true;
	},
	doBreakOverlapStartTime : function (windowStart, windowEnd, breakStart, breakEnd) {
		return (breakStart <= windowStart && breakEnd > windowStart);
	},
	doBreakOverlapEndTime : function (windowStart, windowEnd, breakStart, breakEnd) {
		return (breakStart > windowStart && breakStart < windowEnd);
	},
	dateTimeInyyyymmdd : function (dt, time) {
		var dateVal = this._getDateInyyyymmdd(dt);
		var dateTimeVal = dateVal + " " + time;
		return dateTimeVal;
	},
	_getDateInyyyymmdd : function (dateVal) {
		if (dateVal) {
			var d = new Date(dateVal), month = '' + (d.getMonth() + 1), day = ''
			+ d.getDate(), year = d.getFullYear();
			if (month.length < 2)
				month = '0' + month;
			if (day.length < 2)
				day = '0' + day;
			return [ year, month, day ].join('-');
		}
		return null;
	},
	addMinutes : function (dt, minutes) {
		return new Date(dt.getTime() + minutes * 60000);
	},
	getTimestamp : function (dt) {
		if (dt && dt instanceof Date) {
			var hours = dt.getHours(), minutes = dt.getMinutes(), seconds = dt
			.getSeconds();
			if (hours < 10) {
				hours = "0" + hours;
			}
			if (minutes < 10) {
				minutes = "0" + minutes;
			}
			if (seconds < 10) {
				seconds = "0" + seconds;
			}
			return hours + ":" + minutes;
		}
		return null;
	},
	hideBreakTime : function(){
		document.getElementById("break-container").style.visibility="hidden";
	},
	showBreakTime : function(){
		document.getElementById("break-container").style.visibility="visible";
	},
	setBreakStart : function(startTime){
		document.getElementById("break-start").value = startTime;
	},
	setBreakEnd : function(endTime){
		document.getElementById("break-end").value = endTime;
	}
};
/*! RESOURCE: pdb_HighchartsConfigBuilder */
var HighchartsBuilder = {
	getChartConfig: function(chartOptions, tzOffset) {
		var chartTitle = chartOptions.title.text,
			xAxisTitle = chartOptions.xAxis.title.text,
			xAxisCategories = chartOptions.xAxis.categories,
			yAxisTitle = chartOptions.yAxis.title.text,
			series = chartOptions.series;
		this.convertEpochtoMs(xAxisCategories);
		this.formatDataSeries(xAxisCategories, series);
		var config = {
			chart: {
				type: 'area',
				zoomType: 'x'
			},
			credits: {
				enabled: false
			},
			title: {
				text: chartTitle
			},
			xAxis: {
				type: 'datetime',
				title: {
					text: xAxisTitle,
					style: {textTransform: 'capitalize'}
				}
			},
			yAxis: {
				reversedStacks: false,
				title: {
					text: yAxisTitle,
					style: {textTransform: 'capitalize'}
				}
			},
			plotOptions: {
				area: {
					stacking: 'normal'
				},
				series: {
					marker: {
						enabled: true,
						symbol: 'circle',
						radius: 2
					},
					step: 'center'
				}
			},
			tooltip: {
				valueDecimals: 2,
				style: {
					whiteSpace: "wrap",
					width: "200px"
				}
			},
			series: series
		};
var convertedOffset = -1 * (tzOffset/60);
		Highcharts.setOptions({
			lang: {
				thousandsSep: ','
			},
			global: {
				timezoneOffset: convertedOffset
			}
		});
		return config;
	},
    convertEpochtoMs: function(categories) {
		categories.forEach(function(point, index, arr) {
			arr[index] *= 1000;
		});
	},
	formatDataSeries: function(categories, series) {
		series.forEach(function(row, index, arr) {
			arr[index].data.forEach(function(innerRow, innerIndex, innerArr) {
				var value = innerRow;
				if (value == "NaN") {
					value = 0;
				}
			    var xValue = categories[innerIndex];
				innerArr[innerIndex] = [xValue, value];
			});
		});
	}
};
/*! RESOURCE: CalculateTotalCost */
var CalculateTotalCost = {
	getTotalcost: function(unitCost, purchasedRights, doNotSetField, singleCurrencyEnabled, singleCurrencyCode) {
		var value = unitCost * purchasedRights;
		var inputStartDate = getDateFromFormat(g_form.getValue('start_date'), g_user_date_format);
		var inputEndDate = getDateFromFormat(g_form.getValue('end_date'), g_user_date_format);
		var timeSpan = this.getTimeSpan(inputStartDate, inputEndDate, g_form.getValue('subscription_period'));
		value *= timeSpan;
		value = value.toString();
		if (!doNotSetField) {
			var currencyCode = '';
			if (singleCurrencyEnabled === 'true') {
				currencyCode = singleCurrencyCode;
			} else {
				currencyCode = g_form.getValue('unit_cost.currency_type') || NOW.currency.code;
			}
			var costDisplayValue = currencyCode + ';' + value;
			var currency = g_form.getValue('unit_cost.currency');
			g_form.setValue('cost', currency + ';' + value, costDisplayValue);
			g_form.setValue('cost.currency', currency);
		}
		return value;
	},
	getTimeSpan: function(inputStartDate, inputEndDate, subscriptioPeriod) {
		if (!inputStartDate || !inputEndDate || !subscriptioPeriod) {
			return 1;
		}
		var startDate = new Date(inputStartDate);
		var endDate = new Date(inputEndDate);
		endDate.setDate(endDate.getDate() + 1);
		var timeSpan;
		var leftDays;
		var yearDiff = endDate.getUTCFullYear() - startDate.getUTCFullYear();
		var monthDiff = endDate.getUTCMonth() - startDate.getUTCMonth();
		var dayDiff = endDate.getUTCDate() - startDate.getUTCDate();
		if (dayDiff < 0) {
			monthDiff -= 1;
		}
		if (monthDiff < 0) {
			yearDiff -= 1;
			monthDiff += 12;
		}
		if (yearDiff < 0) {
			return 0;
		}
var leftQuarter = Math.floor(monthDiff / 3);
		var totalQuarter = yearDiff * 4 + leftQuarter;
		if (subscriptioPeriod === 'annually') {
			startDate = this._addTimeSpan(startDate, yearDiff, 0);
			leftDays = this._subtractDays(startDate, endDate);
timeSpan = yearDiff + leftDays / 365;
		} else if (subscriptioPeriod === 'quarterly') {
			startDate = this._addTimeSpan(startDate, yearDiff, leftQuarter * 3);
			leftDays = this._subtractDays(startDate, endDate);
timeSpan = totalQuarter + leftDays / 91;
		} else if (subscriptioPeriod === 'monthly') {
			var daysInStartMonth = this._getDaysInMonth(startDate);
			startDate = this._addTimeSpan(startDate, yearDiff, monthDiff);
			leftDays = this._subtractDays(startDate, endDate);
timeSpan = yearDiff * 12 + monthDiff + leftDays / daysInStartMonth;
} else {
			timeSpan = 1;
		}
		return timeSpan;
	},
	_addTimeSpan: function(date, year, month) {
		return new Date(date.setUTCFullYear(date.getUTCFullYear() + year, date.getUTCMonth() + month));
	},
	_subtractDays: function(startDate, endDate) {
var dayDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
		return Math.round(dayDiff);
	},
	_getDaysInMonth: function(date) {
		var month = date.getUTCMonth();
		var year = date.getUTCFullYear();
		return new Date(year, month + 1, 0).getDate();
	},
};
/*! RESOURCE: ScrumCloneReleaseTeamDialog */
var ScrumCloneReleaseTeamDialog = Class.create();
ScrumCloneReleaseTeamDialog.prototype = {
   initialize: function () {
      this.setUpFacade();
   },
   
   setUpFacade: function () {
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this._mstrDlg = new dialogClass("task_window");
      this._mstrDlg.setTitle(getMessage("Add Team Members"));
      this._mstrDlg.setBody(this.getMarkUp(), false, false);
   },
   setUpEvents: function () {
      var dialog = this._mstrDlg;
	  var _this = this;
      var okButton = $("ok");
      if (okButton) {
         okButton.on("click", function () {
         var mapData = {};
         if (_this.fillDataMap (mapData)) {
            var processor = new GlideAjax("ScrumAjaxAddReleaseTeamMembers2Processor");
            for (var strKey in mapData) {
               processor.addParam(strKey, mapData[strKey]);
            }
            _this.showStatus(getMessage("Adding team members..."));
            processor.getXML(function () {
               _this.refresh();
               dialog.destroy();
            });            
         } else {
            dialog.destroy();
         }
      });
      }
      var cancelButton = $("cancel");
      if (cancelButton) {
         cancelButton.on("click", function () {
            dialog.destroy();
      });
      }
      var okNGButton = $("okNG");
      if (okNGButton) {
         okNGButton.on("click", function () {
            dialog.destroy();
      });
      }
      var cancelNGButton = $("cancelNG");
      if (cancelNGButton) {
         cancelNGButton.on("click", function () {
            dialog.destroy();
      });
      }
      
      var teamCombo = $("teamId");
      if (teamCombo) {
         teamCombo.on("change", function (){
            _this.updateMembers ();
         });
      }
   },
   
   updateMembers: function () {
      var arrMemberInfo = [];
      var teamCombo = $("teamId");
      if (teamCombo) {      
         var strTeamSysId = teamCombo.value;
         var recTeamMember = new GlideRecord ("scrum_pp_release_team_member");
         recTeamMember.addQuery ("team", strTeamSysId);
         recTeamMember.query ();
         while (recTeamMember.next ()) {
            var recSysUser = new GlideRecord ("sys_user");
            recSysUser.addQuery ("sys_id", recTeamMember.name);
            recSysUser.query ();
            var strName = recSysUser.next () ? recSysUser.name : "";
            var strPoints = recTeamMember.default_sprint_points + "";
            arrMemberInfo.push ({name: strName, points: strPoints});
         }
      }
      if (arrMemberInfo.length > 0) {
         var strHtml = "<tr><th style='text-align: left; white-space: nowrap'>" + 
"Member</th><th style='text-align: left; white-space: nowrap'>Sprint Points</th><tr>";
         for (var nSlot = 0; nSlot < arrMemberInfo.length; ++nSlot) {
            var strMemberName = arrMemberInfo[nSlot].name + "";
            var strMemberPoints = arrMemberInfo[nSlot].points + "";
            strHtml += "<tr><td  style='text-align: left; white-space: nowrap'>" + strMemberName + 
"</td><td style='text-align: left; white-space: nowrap'>" + strMemberPoints + "</td></tr>";
         }
         $("memberId").update (strHtml);
      } else {
$("memberId").update ("<tr><td style='font-weight: bold'>"+getMessage("No team members")+"</td></tr>");
      }
   },
   refresh: function(){
      GlideList2.get("scrum_pp_team.scrum_pp_release_team_member.team").refresh();
   },
   getScrumReleaseTeamSysId: function () {
      return g_form.getUniqueValue() + "";
   },
   getUserChosenTeamSysIds: function () {
      return $F('teamId') + ""; 
   },
   showStatus: function (strMessage) {
      $("task_controls").update(strMessage);
   },
   
   display: function(bIsVisible) {
      $("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");   
   },
   getMarkUp: function () {
      var groupAjax = new GlideAjax('ScrumUserGroupsAjax');
      groupAjax.addParam('sysparm_name', 'getTeamInfo');
      groupAjax.addParam('sysparm_scrum_team_sysid', this.getScrumReleaseTeamSysId());
      groupAjax.getXML(this.generateMarkUp.bind(this));
   },
   generateMarkUp: function(response) {
      var mapTeamInfo = {};
      var teamData = response.responseXML.getElementsByTagName("team");
	  var strName, strSysId;
      for (var i = 0; i < teamData.length; i++) {
         strName = teamData[i].getAttribute("name");
         strSysId = teamData[i].getAttribute("sysid");
         mapTeamInfo[strName] = {
            name: strName,
            sysid: strSysId
         };
      }
   
      var arrTeamNames = [];
      for (var strTeamName in mapTeamInfo) {
         arrTeamNames.push (strTeamName + "");
      }
      arrTeamNames.sort ();
      var strMarkUp = "";
      if (arrTeamNames.length > 0) {
var strTable = "<div class='row'><div class='form-group'><label class='col-sm-3 control-label' for='teamId'>"+getMessage("Team")+"</label><span class='col-sm-9'><select class='form-control' id='teamId'>";
         for (var nSlot = 0; nSlot < arrTeamNames.length; ++nSlot) {
            strName = arrTeamNames[nSlot];
            strSysId = mapTeamInfo [strName].sysid;
strTable += "<option value='" + strSysId + "'>" + strName + "</option>";
         }
strTable += "</select></span></div></div>";
var strTable2 = "<div class='row' style='padding-top:10px;'><div id='memberId' class='col-sm-12'></div></div>";
      
         strMarkUp = "<div id='task_controls'>" + strTable + strTable2 +
                     "<div style='text-align:right;padding-top:20px;'>"+
"<button id='cancel' class='btn btn-default' type='button'>" + getMessage("Cancel") + "</button>"+
"&nbsp;&nbsp;<button id='ok' class='btn btn-primary' type='button'>" + getMessage("OK") + "</button>" +
"</div></div>";
      } else {
strMarkUp = "<div id='task_controls'><p>No release teams found</p>" +
                     "<div style='padding-top:20px;text-align:right;'>"+
"<button id='cancelNG' class='btn btn-default' type='button'>" + getMessage("Cancel") + "</button>"+
"&nbsp;&nbsp;<button id='okNG' class='btn btn-primary' type='button'>" + getMessage("OK") + "</button>" +
"</div></div>";
      }
      this._mstrDlg.setBody(strMarkUp, false, false);
      this.setUpEvents();
      this.display(true);
   },
   fillDataMap: function (mapData) {
      var strChosenTeamSysId = this.getUserChosenTeamSysIds ();
      if (strChosenTeamSysId) {
         mapData.sysparm_name = "createReleaseTeamMembers";
         mapData.sysparm_sys_id = this.getScrumReleaseTeamSysId ();
         mapData.sysparm_teams = strChosenTeamSysId;
         return true;
      } else {
         return false;
      }
   }
};
/*! RESOURCE: ScrumAdjustRankHandler */
var ScrumAdjustRankHandler = Class.create({
    initialize: function (gr) {
        this._gr = gr;
    },
	
    showLoadingDialog: function() {
        this.loadingDialog = new GlideDialogWindow("dialog_loading", true, 300);
        this.loadingDialog.setPreference('table', 'loading');
        this.loadingDialog.render();
    },
    hideLoadingDialog: function() {
        this.loadingDialog && this.loadingDialog.destroy();
    },
    showProductDialog: function () {
		this._context = 'product';
        var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
        this._mstrDlg = new dialogClass("scrum_adjust_rank_dialog");
        var titleMsg = getMessage("Select Product");
        this._mstrDlg.setTitle(titleMsg);
        this._mstrDlg.setPreference('handler', this);
        this._mstrDlg.setPreference('sysparam_reference_table','cmdb_application_product_model');
        this._mstrDlg.setPreference('sysparam_query','active=true');
        this._mstrDlg.setPreference('sysparam_field_label', getMessage('Product'));
        this._mstrDlg.render();
    },
	
    showGroupDialog: function () {
		this._context = 'group';
        var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
        this._mstrDlg = new dialogClass("scrum_adjust_rank_dialog");
        var titleMsg = getMessage("Select Group");
        this._mstrDlg.setTitle(titleMsg);
        this._mstrDlg.setPreference('handler', this);
        this._mstrDlg.setPreference('sysparam_reference_table','sys_user_group');
        this._mstrDlg.setPreference('sysparam_query','active=true^typeLIKE1bff3b1493030200ea933007f67ffb6d^EQ');
        this._mstrDlg.setPreference('sysparam_field_label', getMessage('Group'));
        this._mstrDlg.render();
    },
	
    adjustOverallRank: function () {
		this._context = 'overall';
		this._contextId = -1;
        try {
            var ga = new GlideAjax("agile2_AjaxProcessor");
            ga.addParam('sysparm_name', 'compactStoryRanks');
            ga.addParam('sysparm_context', this._context);
            ga.addParam('sysparm_context_id', this._contextId);
            this.showLoadingDialog();
            ga.getXML(this.callback.bind(this));
        } catch(err) {
            this._displayErrorDialog();
            console.log(err);
        }
    },
	
    onSubmit: function () {
        try {
            if (!this._validate()) {
                return false;
            }
            var ga = new GlideAjax("agile2_AjaxProcessor");
            ga.addParam('sysparm_name', 'compactStoryRanks');
            ga.addParam('sysparm_context', this._context);
            ga.addParam('sysparm_context_id', this._contextId);
            this.showLoadingDialog();
            ga.getXML(this.callback.bind(this));
        } catch(err) {
            this._displayErrorDialog();
            console.log(err);
        }
        return false;
    },
    callback: function (response) {
        this.hideLoadingDialog();
		if(this._mstrDlg)
			this._mstrDlg.destroy();
        var resp = response.responseXML.getElementsByTagName("result");
        if (resp[0] && resp[0].getAttribute("status") == "success") {
            window.location.reload();
        } else if (resp[0] && resp[0].getAttribute("status") == "no_data"){
            this._displayNotification(getMessage("Didn't find any story with rank. Please rank the stories first and perform this action"));
        } else {
            this._displayErrorDialog();
        }
    },
    _displayErrorDialog: function() {
        var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
        this._createError = new dialogClass("ppm_int_error_dialog");
        this._createError.setTitle(getMessage("Error while adjusting ranks for Stories."));
        this._createError.render();
    },
    _displayNotification: function(msg) {
		var span = document.createElement('span');
		span.setAttribute('data-type', 'info');
		span.setAttribute('data-text', msg);
		span.setAttribute('data-duration', '4000');
		var notification  = {xml: span};
		GlideUI.get().fire(new GlideUINotification(notification));
    },
    _validate: function () {
		if (this._context == 'product')
			this._contextId = this._getValue('cmdb_application_product_model_ref');
		if (this._context == 'group')
			this._contextId = this._getValue('sys_user_group_ref');
		
        if ( typeof this._contextId == 'undefined' || this._contextId.trim() == '') {
            var errMsg;
			if (this._context == 'product')
				errMsg = getMessage('Product field cannot be empty');
			if (this._context == 'group')
				errMsg = getMessage('Group field cannot be empty');
            this._showFieldError('ref_rank_field',errMsg);
            return false;
        }
        else
            return true;
    },
    _getValue: function (inptNm) {
        return gel(inptNm).value;
    },
    _showFieldError: function(groupId,message){
        var $group = $j('#'+groupId);
        var $helpBlock = $group.find('.help-block');
        if(!$group.hasClass('has-error'))
            $group.addClass('has-error');
        if($helpBlock.css('display')!="inline"){
            $helpBlock.text(message);
            $helpBlock.css('display','inline');
        }
		var elem;
		if (this._context == 'product')
			elem = gel("sys_display.cmdb_application_product_model_ref");
		else if (this._context == 'group')
			elem = gel("sys_display.sys_user_group_ref");
		if(elem)
			elem.focus();
    },
    
    type: "ScrumAdjustRankHandler"
});
/*! RESOURCE: EvtMgmtPriorityOverride */
function normalizePriority(columnName) {
var regexComma = /,/g;
    var index = getIndexByColumn(columnName);
    if (jQuery("div#em_alert_list").length) {
        jQuery("tbody.list2_body tr.list_row:not([smart-priority-override])").each(function() {
            var row = jQuery(this);
            var cell = jQuery(row.find("td:not(.list_decoration_cell)")[index]);
            var value = cell.text();
            if (!value)
                return;
            value = value.replace(regexComma, "");
            if (isNaN(value))
                return;
var priority = parseInt(parseInt(value) / 1000);
            cell.text(priority);
            row.attr("smart-priority-override", "true");
        });
    }
}
function getIndexByColumn(name) {
    var index = -1;
    jQuery("thead th.list_header_cell").each(function(idx) {
        var curr = jQuery(this);
        if (curr.attr('name') === name) {
            if (index == -1) {
                index = idx;
            }
        }
    });
    return index;
}
/*! RESOURCE: redirectUsers */
function checkRedirect() {
var skip_paths = ['/auth_redirect.do', '/login_locate_sso.do', '/onestop', '/safe', '/login_cpw.do', '/login.do', '/$pwd_reset.do', '/$pwd_verify.do', '/$pwd_new.do', '/$pwd_error.do', '/tnt', '/$nextem_confirmation.do', 'safe_redirect'];
	for (var i = 0; i < skip_paths.length; i++) {
		if (top.window.location.pathname.indexOf(skip_paths[i]) != -1) {
			return;
		}
	}
	setTimeout(redirectUsers, 250);
}
function redirectUsers() {
	if (!window.g_user) {
		setTimeout(redirectUsers, 100);
		return;
	}
	var role_list = window.g_user.roles + '';
	var url = top.window.location.toString();
	if (g_user.userID == 'guest') {
top.window.location = '../login_locate_sso.do';
	} else if (role_list.indexOf('snc_external') != -1 && role_list.indexOf('itil') == -1) {
top.window.location = '../safe';
	} 
	else if (role_list.indexOf('x_brin2_docm.user.supplier') != -1) {
		if (url.indexOf('home_splash.do') != -1) {
top.window.location = '../nav_to.do?uri=%2F$pa_dashboard.do?sysparm_dashboard=2c17609e1b54d0d0a9c885507e4bcb9b';
		}
	}	else if (role_list.indexOf('x_brin2_docm.user.installer') != -1) {
		if (url.indexOf('home_splash.do') != -1) {
top.window.location = '../nav_to.do?uri=%2F$pa_dashboard.do?sysparm_dashboard=02b270921bd4d0d0a9c885507e4bcb11';
		}
	}else if (role_list == '') {
top.window.location = '../onestop';
	} else {
	}
}
checkRedirect();
/*! RESOURCE: /scripts/lib/jquery/jquery_clean.js */
(function() {
	if (!window.jQuery)
		return;
	if (!window.$j_glide)
		window.$j = jQuery.noConflict();
	if (window.$j_glide && jQuery != window.$j_glide) {
		if (window.$j_glide)
		jQuery.noConflict(true);
		window.$j = window.$j_glide;
	}
})();
;
;
