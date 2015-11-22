<%@ page language="java" import="java.util.*"  contentType="text/html;charset=utf-8"%>
<%@ taglib prefix="sf" uri="http://www.springframework.org/tags/form" %>
<%@ page import="au.gov.nla.domain.BookType" %> 
<%
    String path = request.getContextPath();
    String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
    List<BookType> bookTypeList = (List<BookType>)request.getAttribute("bookTypeList");
    String username=(String)session.getAttribute("username");
    if(username==null){
        response.getWriter().println("<script>top.location.href='" + basePath + "login';</script>");
    }
%>
<HTML><HEAD><TITLE>Book Management</TITLE> 
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

</HEAD>

<BODY background="<%=basePath %>">
<s:fielderror cssStyle="color:red" />
<TABLE align="center" height="100%" cellSpacing=0 cellPadding=0 width="80%" border=0>
  <TBODY>
  <TR>
    <TD align="left" vAlign=top >
     <sf:form method="post" modelAttribute="book" onsubmit="return checkForm();" enctype="multipart/form-data">    
<table width='100%' cellspacing='1' cellpadding='3' bgcolor='#a6d8f0' class="tablewidth">

  <tr>
    <td width=30%>ISBN</td>
    <td width=70%> <sf:input path="barcode" size="20"/> 
     <sf:errors path="barcode" cssStyle="color:red" />
    </td>
  </tr>

  <tr>
    <td width=30%>Title</td>
    <td width=70%><sf:input path="bookName" size="20"/> 
     <sf:errors path="bookName" cssStyle="color:red" /></td>
  </tr>

  <tr>
    <td width=30%>Type</td>
    <td width=70%>
      <sf:select path="bookType.bookTypeId" items="${bookTypeList}" itemLabel="bookTypeName"  
        itemValue="bookTypeId"></sf:select>    
    </td>
  </tr>

  <tr>
    <td width=30%>Price($)</td>
    <td width=70%><sf:input path="price" size="8"/>
     <sf:errors path="price" cssStyle="color:red" /></td>
  </tr>

  <tr>
    <td width=30%>Stock</td>
    <td width=70%><sf:input path="count" size="8"/> 
     <sf:errors path="count" cssStyle="color:red" /></td>
  </tr>

  <tr>
    <td width=30%>Author</td>
    <td width=70%><sf:input path="author" size="20"/> 
     <sf:errors path="author" cssStyle="color:red" /></td>
  </tr>

  <tr bgcolor='#FFFFFF'>
      <td colspan="4" align="center">
        <input type='submit' name='button' value='Submit' >
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
