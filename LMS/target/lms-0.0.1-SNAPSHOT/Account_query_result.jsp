<%@ page language="java" import="java.util.*"  contentType="text/html;charset=utf-8"%> 
<%@ page import="au.gov.nla.domain.Account" %>
<%@include file="head.jsp"%>
<%
    String loginId = (String)request.getAttribute("loginId"); 
    String firstName = (String)request.getAttribute("firstName");
    String lastName = (String)request.getAttribute("lastName"); 
    String email = (String)request.getAttribute("email"); 
    String phone = (String)request.getAttribute("phone"); 
    String username=(String)session.getAttribute("username");
    if(username==null){
        response.getWriter().println("<script>top.location.href='" + basePath + "login';</script>");
    }
%>
 <script type="text/javascript">
 $.jqueryDefaults.Filter.operators['string'] =
	    $.jqueryDefaults.Filter.operators['text'] =
	    ["like" , "equal", "notequal", "startwith", "endwith" ];
     var manager;

     
     var customersData={Rows:<%=(String)request.getAttribute("jsonAccounts")%>};

       $(function ()
        {
            manager = window['g'] = 
            $("#maingrid4").jqueryGrid({
            columns: [
            { display: 'No', name: 'accountId',width: '5%', align: 'left',   editor: { type: 'text'}},
            { display: 'Login', name: 'loginId',width: '10%', align: 'left',   editor: { type: 'text'}},
            { display: 'FirstName', name: 'firstName',width: '10%', align: 'left',  editor: { type: 'text'}},
            { display: 'LastName', name: 'lastName', width: '10%', align: 'left', editor: { type: 'text'}},
            { display: 'Email', name: 'email', width: '30%', align: 'left', editor: { type: 'text'}},
            { display: 'Phone', name: 'phone', width: '10%', align: 'left', editor: { type: 'text'}},
            {  display: '',name: 'accountId', width: '20%', 
            	render: function (record, rowindex, value, column) { 
            	return '<span style="cursor:hand;" onclick="location.href=\'<%=basePath %>Account/'+value+'/update\'"><a href="#"><img src="<%=basePath %>images/edt.gif" width="16" height="16"/>Edit&nbsp; &nbsp;</a></span>'+
                '<img src="<%=basePath %>images/del.gif" width="16" height="16"/><a href="<%=basePath  %>Account/'+value+'/delete" onclick="return confirm(\'Are you sure to delete this account?\');">Delete</a></span>';

            	} 
            }
                ], data: $.extend({},customersData), detail: { onShowDetail:GetDetail, height: 'auto' }, 
                 enabledEdit: true, clickToEdit: false, 
                width: '99.5%', height: '99.5%',
                onAfterShowData: function()
                {
                	$(".l-grid-row-cell-inner").css("height","auto");
                }
            });

            $("#pageloading").hide();
        });
		function GetDetail(row, detailPanel, callback) { 
			var booksData;
			var call = '<%=basePath  %>Account/'+row.accountId+'/booklist';
			jQuery.ajax(

			{
					url : call,
					type: 'POST',
					dataType: 'json',
					success:function(data) { 
						var booksData= data;
						var formdisplay = document.createElement('div');  
					    $(detailPanel).append(formdisplay); 
					    formdisplay.innerHTML = '<br><form style="color:blue"> '
			                  +'<div class="l-text-label" style="float: left;"><p style="text-indent: 2em; font-size:12px">The borrowed books list of ' + row.firstName + ': </p><hr><br></div>';
						var grid = document.createElement('div'); 
			            $(detailPanel).append(grid);
			            $(grid).css('margin',30).jqueryGrid({
			                columns:
			                            [
			                            { display: 'IBSN', name: 'barcode', width: '15%',editor: { type: 'text'}},
			                            { display: 'Author', name: 'author', width: '15%', editor: { type: 'text'}},
			                            { display: 'Title', name: 'bookName',width: '15%',  editor: { type: 'text'}},
			                            { display: 'Category', name: 'bookType', width: '15%',  editor: { type: 'text'}},
			                            { display: 'Price', name: 'price',width: '15%',  editor: { type: 'currency'}}
			                            ],  data: booksData, width: '80%', 
			                            onAfterShowData: callback
			            }); 
		            },
					error: function() {alert(data); }

			});

			
			 
		}


        function itemclick()
        {
            g.options.data = $.extend({}, customersData);
            g.showFilter();
        }
        function f_tip(value) {
            $.jqueryDialog.tip({  title: 'Info',content:value});
        }
       </script>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Account Management</title>
<style type="text/css">

body {
    margin-left: 0px;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
}
.STYLE1 {font-size: 12px}
.STYLE3 {font-size: 12px; font-weight: bold; }
.STYLE4 {
    color: #03515d;
    font-size: 12px;
}

</style>

 <script src="<%=basePath %>calendar.js"></script>
</head>

<body>
<form action="<%=basePath %>/Account/list" name="accountQueryForm" method="post">
<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td height="30" background="<%=basePath %>images/tab_05.gif"><table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td width="12" height="30"><img src="<%=basePath %>images/tab_03.gif" width="12" height="30" /></td>
        <td><table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td width="46%" valign="middle"><table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td width="5%"><div align="center"><img src="<%=basePath %>images/tb.gif" width="16" height="16" /></div></td>
                <td width="95%" class="STYLE1"><span class="STYLE3">Current</span>:[Clients]-[Manage Account]</td>
              </tr>
            </table></td>
            <td width="54%"><table border="0" align="right" cellpadding="0" cellspacing="0">

            </table></td>
          </tr>
        </table></td>
        <td width="16"><img src="<%=basePath %>images/tab_07.gif" width="16" height="30" /></td>
      </tr>
    </table></td>
  </tr>


  <tr>
  <td  class="STYLE1">
Login<input type=text name="loginId" value="<%=loginId%>" />&nbsp;
First Name<input type=text name="firstName" value="<%=firstName %>" />&nbsp; 
Last Name<input type=text name="lastName" value="<%=lastName %>" />&nbsp;
Email<input type=text name="email" value="<%=email %>" />&nbsp; 
Phone<input type=text name="phone" value="<%=phone %>" />&nbsp;

    <input type=hidden name=currentPage value="1" />
    <input type=submit value="Search" onclick="QueryAccount();"  />
  </td>
</tr>
</table>
  </form>

<div>
	<div class="l-loading" style="display: block" id="pageloading"></div> 
	<div id="maingrid4" style="margin: 0; padding: 0"></div>
	<div style="display: none;"></div>
	
</div>


</body>
</html>
