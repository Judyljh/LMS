<%@ page contentType="text/html; charset=utf-8" language="java" import="java.sql.*" errorPage="" %>
<% 
	String path = request.getContextPath();
	String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
 
	session.removeAttribute("username");
	session.invalidate();
	out.println("<script>top.location='" + basePath +"login/login_view.action';</script>");
%>