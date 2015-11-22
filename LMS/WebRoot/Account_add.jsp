<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%> 
<%@ taglib prefix="sf" uri="http://www.springframework.org/tags/form" %>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
String username=(String)session.getAttribute("username");
if(username==null){
    response.getWriter().println("<script>top.location.href='" + basePath + "login';</script>");
}
%>
 
<HTML><HEAD><TITLE>Add Account</TITLE> 

<STYLE type=text/css>
BODY {
    	MARGIN-LEFT: 0px; BACKGROUND-COLOR: #ffffff
}
.STYLE1 {color: #ECE9D8}
.label {font-style.:italic; }
.errorLabel {font-style.:italic;  color:red; }
.errorMessage {font-weight:bold; color:red; }
</STYLE>
 <script src="<%=basePath %>calendar.js"></script>
<script language="javascript">

function checkForm() { 
 
    var loginId = document.getElementById("LoginId").value;
    if(loginId=="") {
        alert('Please enter a name for login.');
        return false;
    }

    var firstName = document.getElementById("firstName");
    if(firstName=="") {
        alert('Please enter first name.');
        return false;
    }
    
    var lastName = document.getElementById("lastName");
    if(lastName=="") {
        alert('Please enter last name.');
        return false;
    }
    
    var email = document.getElementById("email");
    if(email=="") {
        alert('Please enter email.');
        return false;
    }
    
    
    var phone = document.getElementById("phone");
	if (phone =="")
    {
       alert("Please enter a correct phone number (e.g. 0400123456)."); 
       phone.focus();
       return false;
    }
    return true; 
}
 </script>
</HEAD>

<BODY>

<TABLE align="center" height="100%" cellSpacing=0 cellPadding=0 width="80%" border=0>
  <TBODY>
  <TR>
    <TD align="left" vAlign=top >
    <sf:form method="post" modelAttribute="account" onsubmit="return checkForm();">   
<table width='100%' cellspacing='1' cellpadding='3'  bgcolor='#a6d8f0' class="tablewidth">

  <tr>
    <td width=30%>Login</td>
    <td width=70%>
      <sf:input path="LoginId" size="18"/> 
     <sf:errors path="LoginId" cssStyle="color:red" />
    </td>
  </tr>

  <tr>
    <td width=30%>First Name</td>
    <td width=70%> 
      <sf:input path="firstName" size="18"/> 
     <sf:errors path="firstName" cssStyle="color:red" />
    </td>
  </tr>

  <tr>
    <td width=30%>Last Name</td>
    <td width=70%> 
      <sf:input path="lastName" size="18"/> 
     <sf:errors path="lastName" cssStyle="color:red" />
    </td>
  </tr>
  
    <tr>
    <td width=30%>Email</td>
    <td width=70%> 
      <sf:input path="email" size="18"/> 
     <sf:errors path="email" cssStyle="color:red" />
    </td>
  </tr>
  <tr>
    <td width=30%>Phone</td>
    <td width=70%> 
      <sf:input path="phone" size="18"/> 
     <sf:errors path="phone" cssStyle="color:red" />
    </td>
  </tr>
  <tr bgcolor='#FFFFFF'>
      <td colspan="4" align="center">
        <input type='submit' name='button' value='Save' >
        &nbsp;&nbsp;
        <input type="reset" value='Reset' />
      </td>
    </tr>

</table>
</sf:form>
   </TD></TR>
  </TBODY>
</TABLE>
</BODY>
</HTML>
