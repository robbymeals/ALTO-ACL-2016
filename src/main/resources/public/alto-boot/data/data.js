var button = "";

function afterLoad(numDocsPerPage, labelName, labelSetStr) {
	setTimeout(() => {
		addDocLabel(numDocsPerPage, true, labelName, labelSetStr);
		disableLabelMenue();
	}, 100);
}

function disableLabelMenue(){
	var nodes = document.getElementById("main").children;
	for(var i=0; i < nodes.length; i++) {
		var docId = nodes[i].id;
		if(docId != ''){
			document.getElementById("label_"+nodes[i].id).disabled = "true";
			if ((docId in mainWindow.docLabelMap == false) && (docId in mainWindow.classificationDocLabelMap == false))
				document.getElementById("delete_"+docId).disabled = "true";
		}
	}
}
function disableSelectLabel(docId){
	document.getElementById('apply_label_'+docId).disabled = false;
	document.getElementsByName('label_'+docId)[0].disabled = true;
	if(docId in mainWindow.classificationDocLabelMap)
		document.getElementById("approve_"+docId).disabled = true;
}
function enableSelectLabel(docId){
	$('#label-form-'+docId).keyup(function(e){
		if((e.keyCode == 8 || e.keyCode == 46) && this.value.length == 0){
			document.getElementById('apply_label_'+docId).disabled = true;
			document.getElementsByName('label_'+docId)[0].disabled = false;
			if(docId in mainWindow.classificationDocLabelMap)
				document.getElementById("approve_"+docId).disabled = false;
		}
	});
}

function addLabel(docId){//add a new label in data
	var labelName = document.getElementById("label-form-"+docId).value;
	labelName = labelName.toLowerCase().trim();
	var addTime = new Date().getTime() / 1000;
	if (labelName.replace(/[\.,?!-\/#!$%\^&\*;:\'{}=\-_`~()]/g, "") != labelName) {
		var currMin = mainWindow.minute;
		var currSec = mainWindow.second;
		mainWindow.invalidAddLabelLogs(labelName, addTime, currMin, currSec);
		return "hasPunctuatation";
	}
	mainWindow.newLabel = true;
	var currMin = mainWindow.minute;
	var currSec = mainWindow.second;
	mainWindow.addLabelLogs(addTime, true, docId, labelName, currMin, currSec);
	mainWindow.takeLogsInServer();
	sortLabels(docId, labelName);
}
function sortLabels(docId, labelName){
	//update the select menue
	var nodes = document.getElementById("main").children;
	sortedLabelSet = Object.keys(mainWindow.labelSet).sort();
	for(var i=0; i < nodes.length; i++) {
		$("#label_"+nodes[i].id).empty();
		$("#label_"+nodes[i].id).append($("<option></option>").attr("value","").text("no label"));
		for(var j in sortedLabelSet){
			$("#label_"+nodes[i].id).append($("<option></option>").attr("value",sortedLabelSet[j]).text(sortedLabelSet[j]));
		}
		if(nodes[i].id in mainWindow.docLabelMap)
			document.getElementsByName("label_"+nodes[i].id)[0].value = mainWindow.docLabelMap[nodes[i].id];
		else if(nodes[i].id in mainWindow.classificationDocLabelMap)
			document.getElementsByName("label_"+nodes[i].id)[0].value = mainWindow.classificationDocLabelMap[nodes[i].id];

	}

	mainWindow.addLabelName(labelName);
	mainWindow.enableEditDel();
	mainWindow.takeLogsInServer();
}
function updateLabelDisplay(docId, currentLabel){
	if(currentLabel ==''){
		document.getElementById('top-part-'+docId).innerHTML = "<table width=\"100%\"><tr bgcolor=\""+"white"+"\" style=\"height:10px\"><td width=\"100%\"></td></tr>"+
		"<tr style=\"height:10px\"><td style=\"font-size:10px;\" align=\"center\">&nbsp;&nbsp;</td></tr>"+
		"<tr width=\"100%\"><td align=\"center\">"+"&nbsp;&nbsp"+"</td></tr></table>";
	}
	else{
		document.getElementById('top-part-'+docId).innerHTML = "<table width=\"100%\"><tr bgcolor=\""+mainWindow.labelToColor[currentLabel]+"\" style=\"height:10px\"><td width=\"100%\"></td></tr>"+
		"<tr style=\"height:10px\"><td style=\"font-size:10px;\" align=\"center\">&nbsp;&nbsp;</td></tr>"+
		"<tr width=\"100%\"><td align=\"center\">"+currentLabel+"</td></tr></table>	";
	}
}
function getLabelVal(docId){
	var nameStr = "label_"+docId;
	var form_val = document.getElementById('label-form-'+docId).value;
	var label_val = form_val.toLowerCase().trim();
	var tmp_final = "";
	if(label_val != '' && (label_val in mainWindow.labelSet == false)){
		val = addLabel(docId);
		if(val == "hasPunctuatation")
			return "hasPunctuatation";
		tmp_final = label_val;
	}
	else if(label_val.trim() in mainWindow.labelSet){
		tmp_final = label_val;
	}
	else{
		tmp_final = document.getElementsByName(nameStr)[0].value;
		// no label assigned before and no label assigned now
		if(tmp_final == '' && docId in mainWindow.docLabelMap == false && docId in mainWindow.classificationDocLabelMap == false){
			return null;
		}
	}
	return tmp_final;
}

function updateDocColors(docId , label_val){
	//update the doc colors in main view when labeling
	var label_val = mainWindow.docLabelMap[docId];
	//update the normal doc box
	var docIdWTopic = mainWindow.getDocIdWithTopic(docId);
	if(mainWindow.checkExists(docId) && label_val != ''){//if the doc exists in the normal list
		mainWindow.document.getElementById(docIdWTopic).style.color = mainWindow.labelToColor[label_val];
		mainWindow.document.getElementById(docIdWTopic).style.backgroundColor = '';
	}
	if(mainWindow.checkExists(docId) && label_val != '' && docId in mainWindow.docLabelMap)
		mainWindow.document.getElementById(docIdWTopic).style.backgroundColor = 'yellow';
}
function saveDocLabelMap(numDisplayDocs, isLabelDocs, docId){
	var label_val ='';
	if(isLabelDocs){
		label_val = '';
	}
	else{
		label_val = getLabelVal(docId);
	}
	if(label_val == null) {
		var appearTime = new Date().getTime() / 1000;
		window.alert("Please select a label or create a new label to assign to the document.");
		var okTime = new Date().getTime() / 1000;
		var currMin = mainWindow.minute;
		var currSec = mainWindow.second;
		var str = "Please select a label or create a new label to assign to the document.";
		mainWindow.addAlertLogs(str, appearTime, okTime, currMin, currSec);
		return;

	}
	if(label_val == "hasPunctuatation"){
		var appearTime = new Date().getTime() / 1000;
		window.alert("Labels can only contain letters and digits.");
		var okTime = new Date().getTime() / 1000;
		var currMin = mainWindow.minute;
		var currSec = mainWindow.second;
		var str = "Labels can only contain letters and digits.";
		mainWindow.addAlertLogs(str, appearTime, okTime, currMin, currSec);
		return;
	}
	mainWindow.numLabeled += 1;

	if(label_val == ''){
		mainWindow.deleteDocLabel = true;
		mainWindow.deletedDocLabelId = docId;
	}

	var currLabel = mainWindow.getCurrLabel(docId, mainWindow.docLabelMap, mainWindow.classificationDocLabelMap);
	var labelDefiner = mainWindow.getLabelDefiner(docId, mainWindow.docLabelMap, mainWindow.classificationDocLabelMap);
	var labelConfidence = mainWindow.getLabelConfidence(docId, mainWindow.docLabelMap, mainWindow.classificationDocLabelMap, mainWindow.maxPosteriorLabelProbMap);

	if(docId in mainWindow.classificationDocLabelMap && !isLabelDocs){
		document.getElementById('approve_'+docId).disabled = true;
		document.getElementById('approve_'+docId).value = 'saved';
	}
	if(label_val == '' && isLabelDocs){
		document.getElementById('delete_'+docId).disabled = true;
	}

	docIdWTopic = mainWindow.getDocIdWithTopic(docId);

	result = "";
	if(mainWindow.isFirstLabel == false){
		var lastLabeledDocId = "";
		var tmp = mainWindow.lastLabeledDocDiv.split("-");
		tmp.splice(0,1);
		for(var i in tmp){
			lastLabeledDocId += tmp[i]+"-";
		}
		lastLabeledDocId = lastLabeledDocId.substring(0 , lastLabeledDocId.length-1);
		if(mainWindow.checkExists(lastLabeledDocId)){
			mainWindow.document.getElementById(mainWindow.lastLabeledDocDiv).style.backgroundColor = '';
		}
		mainWindow.lastLabeledDocDiv = docIdWTopic;
	}

	if(mainWindow.checkExists(docId) && mainWindow.isFirstLabel == false){//set the background color of the previous labeled doc to white
		if(mainWindow.document.getElementById(mainWindow.lastLabeledDocDiv) != null)
			mainWindow.document.getElementById(mainWindow.lastLabeledDocDiv).style.backgroundColor = '';
	}
	currentTime = Number(new Date().getTime() / 1000)
	if (mainWindow.isFirstLabel == true){
		mainWindow.lastLabeledDocDiv = docIdWTopic;
		mainWindow.explorationTime = currentTime- mainWindow.startSeconds;
		mainWindow.isFirstLabel = false;
	}

	//adds the docid -> labels to a map
	if (Object.keys(mainWindow.docIdToIndexMap).length == 0){
		mainWindow.fillDocToIndexMap();
	}
	var nodes = document.getElementById("main").children;

	//Changing the color of doc name in main interface, if the label was not deleted
	if (document.getElementsByName("definer_"+docId)[0].value == 'user'){ //if user defined
		//update allLabelDocMap
		if(label_val == ''){//deleting a user label
			document.getElementsByName("definer_"+docId)[0].value = 'undefined';
			mainWindow.deleteUserDocLabel(docId, mainWindow, isLabelDocs);
		}

		else if(label_val != docLabelMap[docId]){//updating a user label
			prev_label = mainWindow.docLabelMap[docId];
			index = mainWindow.allLabelDocMap[prev_label].indexOf(String(docId));//find index of doc in prev label array
			mainWindow.allLabelDocMap[prev_label].splice(index,1);//remove from prev label array
			mainWindow.allLabelDocMap[label_val].unshift(docId);//add the doc to the new label
			if(!isLabelDocs){
				index = mainWindow.localAllLabelDocMap[prev_label].indexOf(String(docId));//find index of doc in prev label array
				mainWindow.localAllLabelDocMap[prev_label].splice(index,1);//remove from prev label array
				mainWindow.localAllLabelDocMap[label_val].unshift(docId);//add the doc to the new label
			}
			mainWindow.docLabelMap[docId] = label_val;
		}
	}
	else if(document.getElementsByName("definer_"+docId)[0].value == 'classifier'){
		if(label_val == ''){//deleting an automatic label
			document.getElementsByName("definer_"+docId)[0].value = 'undefined';
			mainWindow.deleteAutoDocLabel(docId, mainWindow, isLabelDocs);
		}
		else if(label_val != classificationDocLabelMap[docId]){//updating an automatic label
			document.getElementsByName("definer_"+docId)[0].value = 'user';
			prev_label = mainWindow.classificationDocLabelMap[docId];
			index = mainWindow.allLabelDocMap[prev_label].indexOf(String(docId));//find index of doc in prev label array
			mainWindow.allLabelDocMap[prev_label].splice(index,1);//remove from prev label array
			mainWindow.allLabelDocMap[label_val].unshift(docId);//add the doc to the new label
			if(!isLabelDocs){
				index = mainWindow.localAllLabelDocMap[prev_label].indexOf(String(docId));//find index of doc in prev label array
				mainWindow.localAllLabelDocMap[prev_label].splice(index,1);//remove from prev label array
				mainWindow.localAllLabelDocMap[label_val].unshift(docId);//add the doc to the new label
			}
			mainWindow.docLabelMap[docId] = label_val;
			delete mainWindow.classificationDocLabelMap[docId];
		}
		else{//approving an automatic label
			document.getElementsByName("definer_"+docId)[0].value = 'user';
			mainWindow.docLabelMap[docId] = label_val;
			delete mainWindow.classificationDocLabelMap[docId];
			delete mainWindow.maxPosteriorLabelProbMap[docId];
		}
	}
	else{//no label assigned before
		mainWindow.allLabelDocMap[label_val].push(docId);
		if(!isLabelDocs){
			mainWindow.localAllLabelDocMap[label_val].push(docId);
		}
		if(label_val != ''){
			document.getElementsByName("definer_"+docId)[0].value = 'user';
			mainWindow.docLabelMap[docId] = label_val;
		}
	}
	updateLabelDisplay(docId, label_val);
	//update select menue
	document.getElementsByName('label_'+docId)[0].value = label_val;
	updateDocColors(docId, label_val);
	if(label_val == ''){
		mainWindow.deletedADocLabel = true;
	}
	//take logs
	var endSaveSeconds = new Date().getTime() / 1000;
	//topicIndex=1,pos=6,positionUnlabeled=2,currlabel=NONE,def=NONE,confidence=NONE
	var currMin = mainWindow.minute;
	var currSec = mainWindow.second;
	mainWindow.addSaveDocLogs(docId, endSaveSeconds, currLabel, labelDefiner, labelConfidence, label_val, isLabelDocs, button, currMin, currSec);
	mainWindow.takeLogsInServer();
	if(mainWindow.usedLabels.indexOf(label_val) == -1){// if the label was not used before and now it is being used, traing from scratch
		mainWindow.newlyAddedLabel = true;
	}
	//add to labeled topic docs
	if(mainWindow.global_study_condition === mainWindow.LA_CONDITION || mainWindow.global_study_condition === mainWindow.LR_CONDITION){
		if(label_val != '' && mainWindow.baselineLabeledDocs.indexOf(docId) == -1)
			mainWindow.baselineLabeledDocs.push(docId);
		if(label_val == ''){//remove from labeled list
			var index = mainWindow.baselineLabeledDocs.indexOf(docId);
			if(index > -1)
				mainWindow.baselineLabeledDocs.splice(index, 1);
		}
	}
	else{//TA and TR
		var highestTopic = mainWindow.docToTopicMap[docId];
		if(label_val != '' && mainWindow.labeledTopicsDocs[highestTopic].indexOf(docId) == -1)
			mainWindow.labeledTopicsDocs[highestTopic].push(docId);
		if(label_val == ''){
			var index = mainWindow.labeledTopicsDocs[highestTopic].indexOf(docId);
			if(index > -1)
				mainWindow.labeledTopicsDocs[highestTopic].splice(index, 1);
		}
		mainWindow.setProgressBar();
	}
	if(mainWindow.numLabeled >= mainWindow.numDocsToRunClassifier){
		if(mainWindow.canRunClassifier(mainWindow.docLabelMap)){
			mainWindow.classify();
		}
	}
	else if(mainWindow.canRunClassifier(mainWindow.docLabelMap)){
		mainWindow.suggestDocsFirst(true);
	}

	if(!isLabelDocs){
		if(button == "applyClose" || button == "approveClose" || button == "enter")
			window.close();
	}
}

function resetLastLabelTime(){
	if(mainWindow.isLabelView){
		//update the lastLabelEvent to current time
		mainWindow.lastLabelTime = Date.now() / 1000;
	}
}
function setButton(buttonName){
	button = buttonName;
}

function addDocLabel(numDisplayDocs, isLabelDocs, labelName, labelSetStr){
	if (window.location.href.indexOf("?") == -1){
		document.getElementById("main").style.display = "block";
		return;
	}

	let nodes = $('#main').children();
	let endNode = nodes.length;
	const currLabelSet = {};
	let optionStr = `<option value=''>No Label</option>`;

	if (labelSetStr.length > 0){
		const labels = labelSetStr.split(',');

		labels.forEach((label) => {
			if (label != '') currLabelSet[label] = true;
		});

		const sortedLabelSet = Object.keys(currLabelSet).sort();
		sortedLabelSet.forEach((label) => {
			optionStr += `<option value='${label}'>${label}</option>`;
		});
	}

	if (isLabelDocs) endNode--;

	for (let i = 0; i < endNode; i++) {
		let node = nodes[i];
		let currentLabel;

		if (node.id in mainWindow.docLabelMap) {
			currentLabel = mainWindow.docLabelMap[node.id];

			$(`#top-part-${node.id}`).html(`
				<table width="100%">
					<tr bgcolor="${mainWindow.labelToColor[currentLabel]}" style="height:10px">
						<td width="100%"></td>
					</tr>
					<tr style="height:10px">
						<td style="font-size:10px;" align="center">&nbsp;&nbsp;</td>
					</tr>
					<tr width="100%">
						<td align="center">${currentLabel}</td>
					</tr>
				</table>`);
		} else if (node.id in mainWindow.classificationDocLabelMap) {
			currentLabel = mainWindow.classificationDocLabelMap[node.id];
			const confidence = Math.round(mainWindow.maxPosteriorLabelProbMap[node.id] * 100);

			$(`#top-part-${node.id}`).html(`
				<table width="100%">
					<tr bgcolor="${mainWindow.labelToColor[currentLabel]}" style="height:10px">
						<td width="100%"></td>
					</tr>
					<tr style="height:10px">
						<td style="font-size:10px;" align="center">This document has been auto labeled (confidence level = ${confidence}%).</td>
					</tr>
					<tr width="100%">
						<td align="center">${currentLabel}</td>
					</tr>
				</table>`);
		} else { //white bar
			$(`#top-part-${node.id}`).html(`
				<table width="100%"><tr bgcolor="white" style="height:10px">
					<td width="100%"></td>
				</tr>
				<tr style="height:10px">
					<td style="font-size:10px;" align="center">&nbsp;&nbsp;</td>
				</tr>
				<tr width="100%">
					<td align="center">&nbsp;&nbsp</td>
				</tr>
			</table>`);
		}

		const approveAndCloseButton = `
			<input id='approve_${node.id}'
				type='button'
				onclick="setButton('approveClose');
								 addApproveCloseLogs('${node.id}');
								 resetLastLabelTime();
								 saveDocLabelMap(${numDisplayDocs}, ${isLabelDocs},'${node.id}');"
				style='font-size:100%'
				value='Approve and Close'>`;
		const newLabelTextBox = `
			<input id='label-form-${node.id}'
				placeholder='Create new label'
				name='label-form-${node.id}'
				oninput="disableSelectLabel('${node.id}')"
				onkeypress="enableSelectLabel('${node.id}')"
				size='20'
				type='text'
				style='font-size:100%'>`;
		const closeButton=`
			<input id='close_${node.id}'
				type='button'
				onclick='addCloseNormalDocLogs();'
				style='font-size:100%'
				value='Close'>`;
		const applycloseLabelButton = `
			<input id='apply_label_${node.id}'
				type='button'
				onclick="setButton('applyClose');
								 addApplyCloseLogs('${node.id}');
								 resetLastLabelTime();
								 saveDocLabelMap(${numDisplayDocs}, ${isLabelDocs}, '${node.id}');"
				style='font-size:100%'
				disabled
				value='Apply and Close'>`;
		const applyLabelButton = `
			<input id='apply_label_${node.id}'
				type='button'
				onclick="setButton('apply');
								 addApplyLogs('${node.id}');
								 resetLastLabelTime();
								 saveDocLabelMap(${numDisplayDocs}, ${isLabelDocs},'${node.id}')"
				style='font-size:100%'
				disabled
				value='Apply'>`;
		const deleteLabelButton = `
			<input id='delete_${node.id}'
				type='button'
				onclick="setButton('deleteLabel');
								 addDeleteLabelViewLogs('${node.id}');
								 saveDocLabelMap(${numDisplayDocs}, ${isLabelDocs}, '${node.id}');
								 resetLastLabelTime();"
				style='font-size:100%'
				value='Delete'>`;
		let innerHTMLStr = '';

		if (!isLabelDocs) {//one doc per page
			innerHTMLStr = `
				<form onsubmit="setButton('enter');
												addApplyCloseLogs('${node.id}');
												saveDocLabelMap(${numDisplayDocs}, ${isLabelDocs}, '${node.id}');
												return false;">
					<table border="0" style="background-color:white; top:370px; position:fixed;" id='text_${node.id}' width='100%'>`;
		} else {
			//bug here. one doc in label. enter gives error
			innerHTMLStr = `
				<form onsubmit="saveDocLabelMap(${numDisplayDocs}, ${isLabelDocs}, '${node.id}'); return false;">
					<table border="0" style="background-color:white;" id='text_${node.id}' width='100%'>`;
		}
		innerHTMLStr += `<tr>
			<td colspan="2"><hr /></td>
		</tr>`;

		innerHTMLStr += `<tr>
			<td width="20%">
				<select id='label_${node.id}'
								name='label_${node.id}'
								onchange='addChangeLabelLogs("${node.id}");
													resetLastLabelTime();
													saveDocLabelMap(${numDisplayDocs}, ${isLabelDocs}, "${node.id}")'>
					${optionStr}
				</select>
				<hidden name='definer_${node.id}' value='undefined'/>
			</td>`;

		if (!isLabelDocs) {//normal view
			if (node.id in mainWindow.classificationDocLabelMap) {
				innerHTMLStr += `<td>${approveAndCloseButton}&nbsp; &nbsp;</td>`;
			}

			innerHTMLStr += `
				</tr>
				<tr>
					<td width="20%" align='left'>${newLabelTextBox}</td>
					<td>${applycloseLabelButton}&nbsp; &nbsp;</td>
				</tr>
				<tr>
					<td></td>
					<td align='right'>${closeButton}&nbsp; &nbsp;</td>
				</tr>`;
		} else { //label view
			if (i == endNode-1) {
				let labelDocNum = mainWindow.allLabelDocMap[labelName].length;

				if (node.id === mainWindow.allLabelDocMap[labelName][labelDocNum - 1])
					document.getElementById('nextButton').disabled = true;
			}
			if (i == 0) {
				if(node.id === mainWindow.allLabelDocMap[labelName][0]) {
					document.getElementById('prevButton').disabled = true;
				}
			}
			innerHTMLStr += `
					<td>${deleteLabelButton}</td>
				</tr>`;
		}
		innerHTMLStr += '</table></form>';
		$(`#low-part-${node.id}`).html(innerHTMLStr);
		$(`#label-form-${node.id}`).focus();
	}

	let docToLabelString = getParameterByName('classificationDocLabelMap');
	let docsToLabels = docToLabelString.split(',');

	if (docToLabelString.length > 0) {
		for (let i = 0; i < docsToLabels.length; i++){
			let temp = docsToLabels[i].split(':');
			let docId = temp[0];
			let label = temp[1];
			classificationDocLabelMap[docId] = label;
			document.getElementsByName(`label_${docId}`)[0].value = label;
			document.getElementsByName(`definer_${docId}`)[0].value = 'classifier';

		}
	}
	docToLabelString = getParameterByName('docLabelMap');
	docsToLabels = docToLabelString.split(',');

	//setting different labels color
	if (docToLabelString.length > 0){
		for (i = 0; i < docsToLabels.length; i++){
			let temp = docsToLabels[i].split(':');
			let docId = temp[0];
			let label = temp[1];
			docLabelMap[docId] = label;
			document.getElementsByName(`label_${docId}`)[0].value = label;
			$(`#text_${docId}`).css({
				color: mainWindow.labelToColor[label],
				'font-weight': 'bold'});
			document.getElementsByName(`definer_${docId}`)[0].value = 'user';
		}
	}

	const docid = getParameterByName('docid');
	let e = document.getElementById(docid);
	document.getElementById('main').style.display = 'block';
	e.scrollIntoView();
}
function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
	results = regex.exec(window.location);
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
//----------------------------------------------------------------------------------------
//logging functions
function getLoadTime(){
	mainWindow.docOpenTime = new Date().getTime() / 1000;
	var currMin = mainWindow.minute;
	var currSec = mainWindow.second;
	mainWindow.addLoadDocLogs(mainWindow.docid_wo_topicid, mainWindow.topicIndex, mainWindow.globalPosition,
			mainWindow.positionUnlabeled, mainWindow.requestTime, mainWindow.docOpenTime, mainWindow.currLabel,
			mainWindow.labelDefiner, mainWindow.labelConfidence, currMin, currSec);
}
function getLabelViewLoadTime(isRefreshed){

	mainWindow.lastLabelTime = new Date().getTime() / 1000;
	var currMin = mainWindow.minute;
	var currSec = mainWindow.second;
	mainWindow.addLoadLabelDocsLog(true, mainWindow.clickLabelTime, mainWindow.lastLabelTime, mainWindow.loadedLabelName, mainWindow.displayedLabelIds, isRefreshed, currMin, currSec);
}

function addApproveCloseLogs(docId){
	var currMin = mainWindow.minute;
	var currSec = mainWindow.second;
	var nameStr = "label_"+docId;
	var labelName = document.getElementsByName(nameStr)[0].value;
	mainWindow.applyTime = new Date().getTime()/1000;
	mainWindow.addApproveCloseLogs(mainWindow.applyTime, docId, labelName, currMin, currSec);
}
function addDeleteLabelViewLogs(docId){
	mainWindow.applyTime = new Date().getTime()/1000;
	var waitTime = Number(mainWindow.applyTime) - Number(mainWindow.lastLabelTime);
	var currMin = mainWindow.minute;
	var currSec = mainWindow.second;
	mainWindow.addDeleteLabelViewLogs(mainWindow.applyTime, docId, waitTime,currMin, currSec);
}

function addApplyCloseLogs(docId){
	var currMin = mainWindow.minute;
	var currSec = mainWindow.second;
	mainWindow.applyTime = new Date().getTime()/1000;
	var nameStr = "label_"+docId;
	var form_val = document.getElementById('label-form-'+docId).value;
	var labelName = form_val.toLowerCase().trim();

	mainWindow.addApplyCloseLogs(mainWindow.applyTime,docId, labelName, currMin, currSec);
}
function addApplyLogs(docId){
	var currMin = mainWindow.minute;
	var currSec = mainWindow.second;
	mainWindow.applyTime = new Date().getTime()/1000;
	var nameStr = "label_"+docId;
	var form_val = document.getElementById('label-form-'+docId).value;
	var labelName = form_val.toLowerCase().trim();
	var waitTime = -1;
	if (mainWindow.isLabelView)
		waitTime = Number(mainWindow.applyTime) - Number(mainWindow.lastLabelTime);

	mainWindow.addApplyLogs(mainWindow.applyTime,docId, waitTime, labelName, currMin, currSec);
	//mainWindow.takeLogsInServer();
}
function addChangeLabelLogs(docId){
	var currMin = mainWindow.minute;
	var currSec = mainWindow.second;
	mainWindow.applyTime = new Date().getTime()/1000;
	var nameStr = "label_"+docId;
	var labelName = document.getElementsByName(nameStr)[0].value;
	if (mainWindow.isLabelView)
		waitTime = Number(mainWindow.applyTime) - Number(mainWindow.lastLabelTime);
	else
		waitTime = mainWindow.applyTime - mainWindow.docOpenTime;

	mainWindow.addChangeLabelLogs(mainWindow.applyTime,docId, waitTime, labelName, currMin, currSec);
}
