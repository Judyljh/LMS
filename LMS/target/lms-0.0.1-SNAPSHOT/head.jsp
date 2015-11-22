<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>
   <link href="<%=path + "/lib/jqueryUI/css/jqueryui-all.css"%>" rel="stylesheet" type="text/css" />
   <script src="<%=path +"/lib/jqueryUI/js/jquery-1.5.2.min.js"  %>" type="text/javascript"></script>
   <script src="<%=path +"/lib/jqueryUI/js/jqueryui.all.js" %>" type="text/javascript"></script>
     
    