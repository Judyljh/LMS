
var s_tiannet_turn_base = "height:16px;font-size:9pt;color:white;border:0 solid #CCCCCC;cursor:hand;background-color:#2650A6;";
var s_tiannet_turn = "width:28px;" + s_tiannet_turn_base;

var s_tiannet_turn2 = "width:22px;" + s_tiannet_turn_base;

var s_tiannet_select = "width:64px;display:none;";

var s_tiannet_select2 = "width:46px;display:none;";

var s_tiannet_body = "width:150;background-color:#2650A6;display:none;z-index:9998;position:absolute;" +
  "border-left:1 solid #CCCCCC;border-top:1 solid #CCCCCC;border-right:1 solid #999999;border-bottom:1 solid #999999;";

var s_tiannet_day = "width:21px;height:20px;background-color:#D8F0FC;font-size:10pt;";

var s_tiannet_font = "color:#FFCC00;font-size:9pt;cursor:hand;";

var s_tiannet_link = "text-decoration:none;font-size:9pt;color:#2650A6;";

var s_tiannet_line = "border-bottom:1 solid #6699CC";

var tiannetYearSt = 1950;
var tiannetYearEnd = 2010;
var tiannetDateNow = new Date();
var tiannetYear = tiannetDateNow.getFullYear(); 
var tiannetMonth = tiannetDateNow.getMonth()+1; 
var tiannetDay = tiannetDateNow.getDate();
var tiannetHour = 8;
var tiannetMinute = 0;
var tiannetArrDay=new Array(42);          
var tiannetDateSplit = "-";     
var tiannetDateTimeSplit = " ";    
var tiannetTimeSplit = ":";     
var tiannetOutObject;      
var arrTiannetHide = new Array();
var m_bolShowHour = false;
var m_bolShowMinute = false;

var m_aMonHead = new Array(12);         
    m_aMonHead[0] = 31; m_aMonHead[1] = 28; m_aMonHead[2] = 31; m_aMonHead[3] = 30; m_aMonHead[4]  = 31; m_aMonHead[5]  = 30;
    m_aMonHead[6] = 31; m_aMonHead[7] = 31; m_aMonHead[8] = 30; m_aMonHead[9] = 31; m_aMonHead[10] = 30; m_aMonHead[11] = 31;


function setDay(obj){
 tiannetOutObject = obj;
 
 var strValue = tiannetTrim(tiannetOutObject.value);
 if( strValue != "" ){
  tiannetInitDate(strValue);
 }
 tiannetPopCalendar();
}

function setDayH(obj){
 tiannetOutObject = obj;
 m_bolShowHour = true;
 
 var strValue = tiannetTrim(tiannetOutObject.value);
 if( strValue != "" ){
  tiannetInitDate(strValue.substring(0,10));
  var hour = strValue.substring(11,13);
  if( hour < 10 ) tiannetHour = hour.substring(1,2);
 }
 tiannetPopCalendar();
}

function setDayHM(obj){
 tiannetOutObject = obj;
 m_bolShowHour = true;
 m_bolShowMinute = true;
 
 var strValue = tiannetTrim(tiannetOutObject.value);
 if( strValue != "" ){
  tiannetInitDate(strValue.substring(0,10));
  var time = strValue.substring(11,16);
  var arr = time.split(tiannetTimeSplit);
  tiannetHour = arr[0];
  tiannetMinute = arr[1];
  if( tiannetHour < 10 ) tiannetHour = tiannetHour.substring(1,2);
  if( tiannetMinute < 10 ) tiannetMinute = tiannetMinute.substring(1,2);
 }
 tiannetPopCalendar();
}

function  setYearPeriod(intDateBeg,intDateEnd){
 tiannetYearSt = intDateBeg;
 tiannetYearEnd = intDateEnd;
}

function setDateSplit(strDateSplit){
 tiannetDateSplit = strDateSplit;
}

function setDateTimeSplit(strDateTimeSplit){
 tiannetDateTimeSplit = strDateTimeSplit;
}

function setTimeSplit(strTimeSplit){
 tiannetTimeSplit = strTimeSplit;
}

function setSplit(strDateSplit,strDateTimeSplit,strTimeSplit){
 tiannetDateSplit(strDateSplit);
 tiannetDateTimeSplit(strDateTimeSplit);
 tiannetTimeSplit(strTimeSplit);
}

function setDefaultDate(strDate){
 tiannetYear = strDate.substring(0,4);
 tiannetMonth = strDate.substring(5,7);
 tiannetDay = strDate.substring(8,10);
}

function setDefaultTime(strTime){
 tiannetHour = strTime.substring(0,2);
 tiannetMinute = strTime.substring(3,5);
}


var weekName = new Array("Mon","Tue","Wed","Thu","Fri","Sat","Sun");
document.write('<div id="divTiannetDate" style="'+s_tiannet_body+'" >');
document.write('<div align="center" id="divTiannetDateText" Author="tiannet" style="padding-top:2px;">');
document.write('<span id="tiannetYearHead" Author="tiannet" style="'+s_tiannet_font+'" '+
    'onclick="spanYearCEvent();">&nbsp;</span>');
document.write('<select id="selTianYear" style="'+s_tiannet_select+'" Author="tiannet"  '+
    ' onChange="tiannetYear=this.value;tiannetSetDay(tiannetYear,tiannetMonth);document.all.tiannetYearHead.style.display=\'\';'+
    'this.style.display=\'none\';">');
for(var i=tiannetYearSt;i <= tiannetYearEnd;i ++){
 document.writeln('<option value="' + i + '">' + i + '</option>');
}
document.write('</select>');
document.write('<span id="tiannetMonthHead" Author="tiannet" style="'+s_tiannet_font+'" '+
    'onclick="spanMonthCEvent();">&nbsp;&nbsp;��</span>');
document.write('<select id="selTianMonth" style="'+s_tiannet_select2+'" Author="tiannet" '+
    'onChange="tiannetMonth=this.value;tiannetSetDay(tiannetYear,tiannetMonth);document.all.tiannetMonthHead.style.display=\'\';'+
    'this.style.display=\'none\';">');
for(var i=1;i <= 12;i ++){
 document.writeln('<option value="' + i + '">' + i + '��</option>');
}
document.write('</select>');
//document.write('</div>');
//document.write('<div align="center" id="divTiannetTimeText" Author="tiannet">');
document.write('<span id="tiannetHourHead" Author="tiannet" style="'+s_tiannet_font+'display:none;" '+
    'onclick="spanHourCEvent();">&nbsp;ʱ</span>');
document.write('<select id="selTianHour" style="'+s_tiannet_select2+'display:none;" Author="tiannet" '+
    ' onChange="tiannetHour=this.value;tiannetWriteHead();document.all.tiannetHourHead.style.display=\'\';' +
    'this.style.display=\'none\';">');
for(var i=0;i <= 23;i ++){
 document.writeln('<option value="' + i + '">' + i + 'ʱ</option>');
}
document.write('</select>');
document.write('<span id="tiannetMinuteHead" Author="tiannet" style="'+s_tiannet_font+'display:none;" '+
    'onclick="spanMinuteCEvent();">&nbsp;&nbsp;��</span>');
document.write('<select id="selTianMinute" style="'+s_tiannet_select2+'display:none;" Author="tiannet" '+
    '  onChange="tiannetMinute=this.value;tiannetWriteHead();document.all.tiannetMinuteHead.style.display=\'\';'+
    'this.style.display=\'none\';">');
for(var i=0;i <= 59;i ++){
 document.writeln('<option value="' + i + '">' + i + '</option>');
}
document.write('</select>');
document.write('</div>');

document.write('<div style="'+s_tiannet_line+'"></div>');
document.write('<div align="center" id="divTiannetTurn" style="border:0;" Author="tiannet">');
document.write('<input type="button" style="'+s_tiannet_turn+'" value="Last Year" title="Last Year" onClick="tiannetPrevYear();">');
document.write('<input type="button" style="'+s_tiannet_turn+'" value="Next Year" title="Next Year" onClick="tiannetNextYear();">&nbsp;');
document.write('<input type="button" style="'+s_tiannet_turn+'" value="Last Mon" title="Last Month" onClick="tiannetPrevMonth();">');
document.write('<input type="button" style="'+s_tiannet_turn+'" value="Next Mon" title="Next Month" onClick="tiannetNextMonth();">');
document.write('</div>');

document.write('<div style="'+s_tiannet_line+'"></div>');
document.write('<table border=0 cellspacing=0 cellpadding=0  bgcolor=white onselectstart="return false">');
document.write(' <tr style="background-color:#2650A6;font-size:10pt;color:white;height:22px;" Author="tiannet">');
for(var i =0;i < weekName.length;i ++){
 
 document.write('<td width="21" align="center" Author="tiannet">' + weekName[i] + '</td>');
}
document.write(' </tr>');
document.write('</table>');

document.write('<table border=0 cellspacing=1 cellpadding=0  bgcolor=white onselectstart="return false">');
var n = 0;
for (var i=0;i<5;i++) { 
 document.write (' <tr align=center id="trTiannetDay' + i + '" >');
 for (var j=0;j<7;j++){
  document.write('<td align="center" id="tdTiannetDay' + n + '" '+
    'onClick="tiannetDay=this.innerText;tiannetSetValue(true);" ' 
   +' style="' + s_tiannet_day + '">&nbsp;</td>');
  n ++;
 }
 document.write (' </tr>');
}
document.write (' <tr align=center id="trTiannetDay5" >');
document.write('<td align="center" id="tdTiannetDay35" onClick="tiannetDay=this.innerText;tiannetSetValue(true);" ' 
    +' style="' + s_tiannet_day + '">&nbsp;</td>');
document.write('<td align="center" id="tdTiannetDay36" onClick="tiannetDay=this.innerText;tiannetSetValue(true);" ' 
    +' style="' + s_tiannet_day + '">&nbsp;</td>');
document.write('<td align="right" colspan="5"><a href="javascript:tiannetClear();" style="' + s_tiannet_link + '">/</a>'+
    '&nbsp;<a href="javascript:tiannetHideControl();" style="' + s_tiannet_link + '">/</a>' +
    '&nbsp;<a href="javascript:tiannetSetValue(true);" style="' + s_tiannet_link + '">/</a>&nbsp;' +
    '</td>');
document.write (' </tr>');
document.write('</table>');
document.write('</div>');



function spanYearCEvent(){
 hideElementsById(new Array("selTianYear","tiannetMonthHead"),false);
 if(m_bolShowHour) hideElementsById(new Array("tiannetHourHead"),false);
 if(m_bolShowMinute) hideElementsById(new Array("tiannetMinuteHead"),false);
 hideElementsById(new Array("tiannetYearHead","selTianMonth","selTianHour","selTianMinute"),true);
}

function spanMonthCEvent(){
 hideElementsById(new Array("selTianMonth","tiannetYearHead"),false);
 if(m_bolShowHour) hideElementsById(new Array("tiannetHourHead"),false);
 if(m_bolShowMinute) hideElementsById(new Array("tiannetMinuteHead"),false);
 hideElementsById(new Array("tiannetMonthHead","selTianYear","selTianHour","selTianMinute"),true);
}

function spanHourCEvent(){
 hideElementsById(new Array("tiannetYearHead","tiannetMonthHead"),false);
 if(m_bolShowHour) hideElementsById(new Array("selTianHour"),false);
 if(m_bolShowMinute) hideElementsById(new Array("tiannetMinuteHead"),false);
 hideElementsById(new Array("tiannetHourHead","selTianYear","selTianMonth","selTianMinute"),true);
}

function spanMinuteCEvent(){
 hideElementsById(new Array("tiannetYearHead","tiannetMonthHead"),false);
 if(m_bolShowHour) hideElementsById(new Array("tiannetHourHead"),false);
 if(m_bolShowMinute) hideElementsById(new Array("selTianMinute"),false);
 hideElementsById(new Array("tiannetMinuteHead","selTianYear","selTianMonth","selTianHour"),true);
}

function hideElementsById(arrId,bolHide){
 var strDisplay = "";
 if(bolHide) strDisplay = "none";
 for(var i = 0;i < arrId.length;i ++){
  var obj = document.getElementById(arrId[i]);
  obj.style.display = strDisplay;
 }
}


function isPinYear(year){
 var bolRet = false;
 if (0==year%4&&((year%100!=0)||(year%400==0))) {
  bolRet = true;
 }
 return bolRet;
}

function getMonthCount(year,month){
 var c=m_aMonHead[month-1];
 if((month==2)&&isPinYear(year)) c++;
 return c;
}

function setRealDayCount() {
 if( tiannetDay > getMonthCount(tiannetYear,tiannetMonth) ) {
  
  tiannetDay = getMonthCount(tiannetYear,tiannetMonth);
 }
}

function addZero(value){
 if(value < 10 ){
  value = "0" + value;
 }
 return value;
}

function tiannetTrim(str) {
 return str.replace(/(^\s*)|(\s*$)/g,"");
}

function createOption(objSelect,value,text){
 var option = document.createElement("OPTION");
 option.value = value;
 option.text = text;
 objSelect.options.add(option);
}

function tiannetPrevYear() {
 if(tiannetYear > 999 && tiannetYear <10000){tiannetYear--;}
 else{alert("Please enter a valid number (1000-9999)");}
 tiannetSetDay(tiannetYear,tiannetMonth);
 
 if( tiannetYear < tiannetYearSt ) {
  tiannetYearSt = tiannetYear;
  createOption(document.all.selTianYear,tiannetYear,tiannetYear + "Y");
 }
 checkSelect(document.all.selTianYear,tiannetYear);
 tiannetWriteHead();
}

function tiannetNextYear() {
 if(tiannetYear > 999 && tiannetYear <10000){tiannetYear++;}
 else{alert("Please enter a valid number (1000-9999)");return;}
 tiannetSetDay(tiannetYear,tiannetMonth);
 
 if( tiannetYear > tiannetYearEnd ) {
  tiannetYearEnd = tiannetYear;
  createOption(document.all.selTianYear,tiannetYear,tiannetYear + "Y");
 }
 checkSelect(document.all.selTianYear,tiannetYear);
 tiannetWriteHead();
}

function tiannetToday() {
 tiannetYear = tiannetDateNow.getFullYear();
 tiannetMonth = tiannetDateNow.getMonth()+1;
 tiannetDay = tiannetDateNow.getDate();
 tiannetSetValue(true);
 
 
}

function tiannetPrevMonth() {
 if(tiannetMonth>1){tiannetMonth--}else{tiannetYear--;tiannetMonth=12;}
 tiannetSetDay(tiannetYear,tiannetMonth);
 checkSelect(document.all.selTianMonth,tiannetMonth);
 tiannetWriteHead();
}

function tiannetNextMonth() {
 if(tiannetMonth==12){tiannetYear++;tiannetMonth=1}else{tiannetMonth++}
 tiannetSetDay(tiannetYear,tiannetMonth);
 checkSelect(document.all.selTianMonth,tiannetMonth);
 tiannetWriteHead();
}

function tiannetWriteHead(){
 document.all.tiannetYearHead.innerText = tiannetYear + "Y";
 document.all.tiannetMonthHead.innerText = tiannetMonth + "M";
 if( m_bolShowHour )  document.all.tiannetHourHead.innerText = " "+tiannetHour + "Hr";
 if( m_bolShowMinute ) document.all.tiannetMinuteHead.innerText = tiannetMinute + "Min";
 tiannetSetValue(false);
}

function tiannetSetDay(yy,mm) {
  
 setRealDayCount();
 tiannetWriteHead();
 var strDateFont1 = "", strDateFont2 = "" 
 for (var i = 0; i < 37; i++){tiannetArrDay[i]=""};  
 var day1 = 1;
 var firstday = new Date(yy,mm-1,1).getDay();  
 for (var i = firstday; day1 < getMonthCount(yy,mm)+1; i++){
  tiannetArrDay[i]=day1;day1++;
 }
 
 //if(tiannetArrDay[35] == ""){
 // document.all.trTiannetDay5.style.display = "none";
 //} else {
 // document.all.trTiannetDay5.style.display = "";
 //}
 for (var i = 0; i < 37; i++){ 
  var da = eval("document.all.tdTiannetDay"+i)     
  if (tiannetArrDay[i]!="") { 
   
   if(i % 7 == 0 || (i+1) % 7 == 0){
   strDateFont1 = "<font color=#f0000>"
   strDateFont2 = "</font>"
   } else {
    strDateFont1 = "";
    strDateFont2 = ""
   }
   da.innerHTML = strDateFont1 + tiannetArrDay[i] + strDateFont2;
   
   if(tiannetArrDay[i] == tiannetDay ) {
    da.style.backgroundColor = "#CCCCCC";
   } else {
    da.style.backgroundColor = "#EFEFEF";
   }
   da.style.cursor="hand"
  } else {
   da.innerHTML="";da.style.backgroundColor="";da.style.cursor="default"
  }
 }//end for
 tiannetSetValue(false);
}//end function tiannetSetDay

function checkSelect(objSelect,selectValue) {
 var count = parseInt(objSelect.length);
 if( selectValue < 10 && selectValue.toString().length == 2) {
  selectValue = selectValue.substring(1,2);
 }
 for(var i = 0;i < count;i ++){
  if(objSelect.options[i].value == selectValue){
   objSelect.selectedIndex = i;
   break;
  }
 }//for
}

function selectObject(){
 
 if( tiannetYear < tiannetYearSt ) {
  for( var i = tiannetYear;i < tiannetYearSt;i ++  ){
   createOption(document.all.selTianYear,i,i + "Y");
  }
  tiannetYearSt = tiannetYear;
 }
 
 if( tiannetYear > tiannetYearEnd ) {
  for( var i = tiannetYearEnd+1;i <= tiannetYear;i ++  ){
   createOption(document.all.selTianYear,i,i + "Y");
  }
  tiannetYearEnd = tiannetYear;
 }
 checkSelect(document.all.selTianYear,tiannetYear);
 checkSelect(document.all.selTianMonth,tiannetMonth);
 if( m_bolShowHour )  checkSelect(document.all.selTianHour,tiannetHour);
 if( m_bolShowMinute ) checkSelect(document.all.selTianMinute,tiannetMinute);
}


function tiannetSetValue(bolHideControl){
 var value = "";
 if( !tiannetDay || tiannetDay == "" ){
  tiannetOutObject.value = value;
  return;
 }
 var mm = tiannetMonth;
 var day = tiannetDay;
 if( mm < 10 && mm.toString().length == 1) mm = "0" + mm;
 if( day < 10 && day.toString().length == 1) day = "0" + day;
 value = tiannetYear + tiannetDateSplit + mm + tiannetDateSplit + day;
 if( m_bolShowHour ){
  var hour = tiannetHour;
  if( hour < 10 && hour.toString().length == 1 ) hour = "0" + hour;
  value += tiannetDateTimeSplit + hour;
 }
 if( m_bolShowMinute ){
  var minute = tiannetMinute;
  if( minute < 10 && minute.toString().length == 1 ) minute = "0" + minute;
  value += tiannetTimeSplit + minute;
 }
 tiannetOutObject.value = value;
 //document.all.divTiannetDate.style.display = "none";
 if( bolHideControl ) {
  tiannetHideControl();
 }
}

function showTime(){
 if( !m_bolShowHour && m_bolShowMinute){
  alert("Error.");
  return;
 }
 hideElementsById(new Array("tiannetHourHead","selTianHour","tiannetMinuteHead","selTianMinute"),true);
 if( m_bolShowHour ){
  
  hideElementsById(new Array("tiannetHourHead"),false);
 }
 if( m_bolShowMinute ){
  
  hideElementsById(new Array("tiannetMinuteHead"),false);
 }
}

function tiannetPopCalendar(){
 
 hideElementsById(new Array("selTianYear","selTianMonth","selTianHour","selTianMinute"),true);
 hideElementsById(new Array("tiannetYearHead","tiannetMonthHead","tiannetHourHead","tiannetMinuteHead"),false);
 tiannetSetDay(tiannetYear,tiannetMonth);
 tiannetWriteHead();
 showTime();
 var dads  = document.all.divTiannetDate.style;
 var iX, iY;
  
 var h = document.all.divTiannetDate.offsetHeight;
 var w = document.all.divTiannetDate.offsetWidth;
 
 if (window.event.x + h > document.body.offsetWidth - 10    )
  iX = window.event.x - h - 5 ;
 else
  iX = window.event.x + 5;  
 if (iX <0)  
  iX=0;
 
 iY = window.event.y;
 if (window.event.y + w > document.body.offsetHeight - 10   )
  iY = document.body.scrollTop + document.body.offsetHeight - w - 5 ;
 else
  iY = document.body.scrollTop +window.event.y + 5;  
 if (iY <0)  
  iY=0;
 dads.left = iX;
 dads.top = iY;
 tiannetShowControl();
 selectObject();
}

function tiannetHideControl(){
 document.all.divTiannetDate.style.display = "none";
 tiannetShowObject();
 arrTiannetHide = new Array();
}

function tiannetShowControl(){
 document.all.divTiannetDate.style.display = "";
 tiannetHideObject("SELECT");
 tiannetHideObject("OBJECT");
}

function tiannetHideObject(strTagName) {
 
 x = document.all.divTiannetDate.offsetLeft;
 y = document.all.divTiannetDate.offsetTop;
 h = document.all.divTiannetDate.offsetHeight;
 w = document.all.divTiannetDate.offsetWidth;
 
 for (var i = 0; i < document.all.tags(strTagName).length; i++)
 {
  
  var obj = document.all.tags(strTagName)[i];
  if (! obj || ! obj.offsetParent)
   continue;
  
  var objLeft   = obj.offsetLeft;
  var objTop    = obj.offsetTop;
  var objHeight = obj.offsetHeight;
  var objWidth = obj.offsetWidth;
  var objParent = obj.offsetParent;
  
  while (objParent.tagName.toUpperCase() != "BODY"){
   objLeft  += objParent.offsetLeft;
   objTop   += objParent.offsetTop;
   objParent = objParent.offsetParent;
  }
  
  
  var bolHide = true;
  if( obj.style.display == "none" || obj.style.visibility == "hidden" || obj.getAttribute("Author") == "tiannet" ){
   
   bolHide = false;
  }
  if(  ( (objLeft + objWidth) > x && (y + h + 20) > objTop && (objTop+objHeight) >  y && objLeft < (x+w) ) && bolHide ){
   
   arrTiannetHide[arrTiannetHide.length] = obj;
   obj.style.visibility = "hidden";
  }
  
  
 }
}

function tiannetShowObject(){
 for(var i = 0;i < arrTiannetHide.length;i ++){
  //alert(arrTiannetHide[i]);
  arrTiannetHide[i].style.visibility = "";
 }
}

function tiannetInitDate(strDate){
 var arr = strDate.split(tiannetDateSplit);
 tiannetYear = arr[0];
 tiannetMonth = arr[1];
 tiannetDay = arr[2];
}

function tiannetClear(){
 tiannetOutObject.value = "";
 tiannetHideControl();
}
 