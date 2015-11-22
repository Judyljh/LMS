<%@ page language="java" import="java.util.*"  contentType="text/html;charset=utf-8"%> 
<%@ page import="au.gov.nla.domain.BookType" %>
 
<%
    String path = request.getContextPath();
    String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
    List<BookType> bookTypeList = (List<BookType>)request.getAttribute("bookTypeList");
    int currentPage =  (Integer)request.getAttribute("currentPage");
    int totalPage =   (Integer)request.getAttribute("totalPage");
    int  recordNumber =   (Integer)request.getAttribute("recordNumber");
    String username=(String)session.getAttribute("username");
    if(username==null){
        response.getWriter().println("<script>top.location.href='" + basePath + "login';</script>");
    }
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Book Category Management</title>
<style type="text/css">
<!--
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
-->
</style>

 <script src="<%=basePath %>calendar.js"></script>
<script>
var  highlightcolor='#c1ebff';
var  clickcolor='#51b2f6';
function  changeto(){
source=event.srcElement;
if  (source.tagName=="TR"||source.tagName=="TABLE")
return;
while(source.tagName!="TD")
source=source.parentElement;
source=source.parentElement;
cs  =  source.children;
//alert(cs.length);
if  (cs[1].style.backgroundColor!=clickcolor&&source.id!="nc")
for(i=0;i<cs.length;i++){
    cs[i].style.backgroundColor=clickcolor;
}
else
for(i=0;i<cs.length;i++){
    cs[i].style.backgroundColor="";
}
}

function  changeback(){
if  (event.fromElement.contains(event.toElement)||source.contains(event.toElement)||source.id=="nc")
return
if  (event.toElement!=source&&cs[1].style.backgroundColor!=clickcolor)
//source.style.backgroundColor=originalcolor
for(i=0;i<cs.length;i++){
	cs[i].style.backgroundColor="";
}
}

function GoToPage(currentPage,totalPage) {
    if(currentPage==0) return;
    if(currentPage>totalPage) return;
    document.forms[0].currentPage.value = currentPage;
    document.forms[0].action = "<%=basePath %>/BookType/list";
    document.forms[0].submit();

}

function changepage(totalPage)
{
    var pageValue=document.bookQueryForm.pageValue.value;
    if(pageValue>totalPage) {
        alert('Please enter a valid page number.');
        return ;
    }
    document.bookTypeQueryForm.currentPage.value = pageValue;
    document.forms["bookTypeQueryForm"].action = "<%=basePath %>/BookType/list";
    document.bookTypeQueryForm.submit();
}

function QueryBookType() {
	document.forms["bookTypeQueryForm"].action = "<%=basePath %>/BookType/list";
	document.forms["bookTypeQueryForm"].submit();
}
 

</script>
</head>

<body>
<form action="<%=basePath %>/BookType/list" name="bookTypeQueryForm" method="post">
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
                <td width="95%" class="STYLE1"><span class="STYLE3">Current</span>:[Book Category Management]-[Category Search]</td>
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
  <td>
    <input type=hidden name=currentPage value="1" />
  </td>
</tr>
  <tr>
    <td><table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td width="8" background="<%=basePath %>images/tab_12.gif">&nbsp;</td>
        <td><table width="100%" border="0" cellpadding="0" cellspacing="1" bgcolor="b5d6e6" onmouseover="changeto()"  onmouseout="changeback()">
          <tr>
          <!-- 
            <td width="3%" height="22" background="<%=basePath %>images/bg.gif" bgcolor="#FFFFFF"><div align="center">
              <input type="checkbox" name="checkall" onclick="checkAll();" />
            </div></td> -->
            <td width="3%" height="22" background="<%=basePath %>images/bg.gif" bgcolor="#FFFFFF"><div align="center"><span class="STYLE1">No</span></div></td>
            <td  height="22" background="<%=basePath %>images/bg.gif" bgcolor="#FFFFFF"><div align="center"><span class="STYLE1">Category ID</span></div></td>
            <td  height="22" background="<%=basePath %>images/bg.gif" bgcolor="#FFFFFF"><div align="center"><span class="STYLE1">Category Name</span></div></td>
            <td  height="22" background="<%=basePath %>images/bg.gif" bgcolor="#FFFFFF"><div align="center"><span class="STYLE1">Days for Borrow</span></div></td>
            <td width="10%" height="22" background="<%=basePath %>images/bg.gif" bgcolor="#FFFFFF" class="STYLE1"><div align="center">Operation</div></td>
          </tr>
           <%
            	int startIndex = (currentPage -1) * 3;
            	for(int i=0;i<bookTypeList.size();i++) {
            		int currentIndex = startIndex + i + 1; 
            		BookType bookType = bookTypeList.get(i);
             %>
          <tr>
            <td height="20" bgcolor="#FFFFFF"><div align="center" class="STYLE1">
              <div align="center"><%=currentIndex %></div>
            </div></td>
            <td height="20" bgcolor="#FFFFFF"><div align="center"><span class="STYLE1"><%=bookType.getBookTypeId() %></span></div></td>
            <td height="20" bgcolor="#FFFFFF"><div align="center"><span class="STYLE1"><%=bookType.getBookTypeName() %></span></div></td>
            <td height="20" bgcolor="#FFFFFF"><div align="center"><span class="STYLE1"><%=bookType.getDays() %></span></div></td>
            <td height="20" bgcolor="#FFFFFF"><div align="center">
            <span class="STYLE4">
            <span style="cursor:hand;" onclick="location.href='<%=basePath %>BookType/<%=bookType.getBookTypeId() %>/update'"><a href='#'><img src="<%=basePath %>images/edt.gif" width="16" height="16"/>Edit&nbsp; &nbsp;</a></span>
            <img src="<%=basePath %>images/del.gif" width="16" height="16"/><a href="<%=basePath  %>BookType/<%=bookType.getBookTypeId() %>/delete" onclick="return confirm('Are you sure to delete the category?');">Delete</a></span>
            </div></td>
          </tr>
          <%	} %>
        </table></td>
        <td width="8" background="images/tab_15.gif">&nbsp;</td>
      </tr>
    </table></td>
  </tr>

  <tr>
    <td height="35" background="<%=basePath %>images/tab_19.gif">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td width="12" height="35"><img src="<%=basePath %>images/tab_18.gif" width="12" height="35" /></td>
        <td><table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td width="15" align="center"><img src="<%=basePath %>images/icon-first.gif"  style="cursor:hand;" onclick="GoToPage(1,<%=totalPage %>);" /></td>
            <td width="15" align="center"><img src="<%=basePath %>images/icon-prev.gif"  style="cursor:hand;" onclick="GoToPage(<%=currentPage-1 %>,<%=totalPage %>);"/></td>
          
            <td width="50" align="center"><input name="pageValue" type="text" size="4" style="height:12px; width:20px; border:1px solid #999999;" value="<%=currentPage %>" />/<%=totalPage %></td>
            <td width="15" align="center"><img src="<%=basePath %>images/icon-next.gif"  style="cursor:hand;" onclick="GoToPage(<%=currentPage+1 %>,<%=totalPage %>);" /></td>
            <td width="10" align="center"><img src="<%=basePath %>images/icon-last.gif"  style="cursor:hand;" onclick="GoToPage(<%=totalPage %>,<%=totalPage %>);"/></td>
 
            <td><table border="0" align="right" cellpadding="0" cellspacing="0">
                <tr>
                  <td><div align="center"><span class="STYLE1">Start from 1 to  <%=recordNumber %></span></div></td>
                </tr>
            </table></td>
          </tr>
        </table></td>
        <td width="16"><img src="<%=basePath %>images/tab_20.gif" width="16" height="35" /></td>
      </tr>
    </table></td>
  </tr>
</table>
  </form>
</body>
</html>
