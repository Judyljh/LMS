<%@ page language="java" import="java.util.*" pageEncoding="utf-8" %> 
<%@ taglib prefix="sf" uri="http://www.springframework.org/tags/form" %>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Library Management System</title>
<style type="text/css">

body {
	margin-left: 0px;
	margin-top: 0px;
	margin-right: 0px;
	margin-bottom: 0px;
	background-color: #016aa9;
	overflow:hidden;
}
.STYLE1 {
	color: #000000;
	font-size: 12px;
}

</style></head>

<body>

<sf:form method="post" modelAttribute="admin" action="login">  
<table width="100%" height="100%" border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td><table width="962" border="0" align="center" cellpadding="0" cellspacing="0">
      <tr>
        <td height="235" background="<%=basePath %>images/login_03.gif">&nbsp;</td>
      </tr>
      <tr>
        <td height="53"><table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td width="394" height="53" background="<%=basePath %>images/login_05.gif">&nbsp;</td>
            <td width="206" background="<%=basePath %>images/login_06.gif"><table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td width="16%" height="25"><div align="right"><span class="STYLE1">User</span></div></td>
                <td width="57%" height="25"><div align="center">
                 <input type="text" name="username" style="width:105px; height:17px; background-color:#292929; border:solid 1px #7dbad7; font-size:12px; color:#6cd0ff"/>
                  <sf:errors path="username" cssStyle="color:red" />
                </div></td>
                <td width="27%" height="25">&nbsp;</td>
              </tr>
              <tr>
                <td height="25"><div align="right"><span class="STYLE1">Password</span></div></td>
                <td height="25"><div align="center">
                  <input type="password" name="password" style="width:105px; height:17px; background-color:#292929; border:solid 1px #7dbad7; font-size:12px; color:#6cd0ff"/>
                   <sf:errors path="password" cssStyle="color:red; font-size:9px;" />
                </div></td>
                <td height="25"><div align="left"><img style="cursor:hand;" onclick="document.forms[0].submit();" src="<%=basePath %>images/dl.gif" width="49" height="18" border="0"/></div></td>
              </tr>
            </table>
            </td>
            <td width="362" background="<%=basePath %>images/login_07.gif">&nbsp;</td>
          </tr>
        </table>
        </td>
      </tr>
      <tr>
        <td height="213" background="<%=basePath %>images/login_08.gif">&nbsp;</td>
      </tr>
    </table>
    </td>
  </tr>
</table>
</sf:form>
 
 

</body>
</html>
