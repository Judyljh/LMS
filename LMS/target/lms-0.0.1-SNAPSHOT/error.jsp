<%@ page contentType="text/html; charset=utf-8" language="java" import="java.sql.*" errorPage="" %>
<% 
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
String error=(String)request.getAttribute("error"); 

%>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>ERROR</title>
<link href="css/style.css" rel="stylesheet">
</head>

<body>
<table width="100%" height="100%" border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center"><table width="419" height="226" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" background="<%=basePath %>images/error.jpg"><table width="388" height="194" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center"><img src="<%=basePath %>images/error_b.gif" width="31" height="31">&nbsp;&nbsp;Error: <%=error%> <br>
              <br>
              <input name="Submit" type="submit" class="btn_grey" value="Back" onClick="history.back(-1)"></td>
          </tr>
        </table></td>
      </tr>
    </table></td>
  </tr>
</table>
<center>
</center>
</body>
</html>
