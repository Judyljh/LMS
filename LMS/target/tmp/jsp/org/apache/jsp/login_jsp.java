/*
 * Generated by the Jasper component of Apache Tomcat
 * Version: jetty/9.2.2.v20140723
 * Generated at: 2015-11-22 06:04:45 UTC
 * Note: The last modified time of this file was set to
 *       the last modified time of the source file after
 *       generation to assist with modification tracking.
 */
package org.apache.jsp;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.jsp.*;
import java.util.*;

public final class login_jsp extends org.apache.jasper.runtime.HttpJspBase
    implements org.apache.jasper.runtime.JspSourceDependent {

  private static final javax.servlet.jsp.JspFactory _jspxFactory =
          javax.servlet.jsp.JspFactory.getDefaultFactory();

  private static java.util.Map<java.lang.String,java.lang.Long> _jspx_dependants;

  static {
    _jspx_dependants = new java.util.HashMap<java.lang.String,java.lang.Long>(2);
    _jspx_dependants.put("jar:file:/D:/JAVA/judy/V3/LMS/WebRoot/WEB-INF/lib/org.springframework.web.servlet-3.1.3.RELEASE.jar!/META-INF/spring-form.tld", Long.valueOf(1351655300000L));
    _jspx_dependants.put("file:/D:/JAVA/judy/V3/LMS/WebRoot/WEB-INF/lib/org.springframework.web.servlet-3.1.3.RELEASE.jar", Long.valueOf(1362369092593L));
  }

  private org.apache.jasper.runtime.TagHandlerPool _005fjspx_005ftagPool_005fsf_005fform_0026_005fmodelAttribute_005fmethod_005faction;
  private org.apache.jasper.runtime.TagHandlerPool _005fjspx_005ftagPool_005fsf_005ferrors_0026_005fpath_005fcssStyle_005fnobody;

  private javax.el.ExpressionFactory _el_expressionfactory;
  private org.apache.tomcat.InstanceManager _jsp_instancemanager;

  public java.util.Map<java.lang.String,java.lang.Long> getDependants() {
    return _jspx_dependants;
  }

  public void _jspInit() {
    _005fjspx_005ftagPool_005fsf_005fform_0026_005fmodelAttribute_005fmethod_005faction = org.apache.jasper.runtime.TagHandlerPool.getTagHandlerPool(getServletConfig());
    _005fjspx_005ftagPool_005fsf_005ferrors_0026_005fpath_005fcssStyle_005fnobody = org.apache.jasper.runtime.TagHandlerPool.getTagHandlerPool(getServletConfig());
    _el_expressionfactory = _jspxFactory.getJspApplicationContext(getServletConfig().getServletContext()).getExpressionFactory();
    _jsp_instancemanager = org.apache.jasper.runtime.InstanceManagerFactory.getInstanceManager(getServletConfig());
  }

  public void _jspDestroy() {
    _005fjspx_005ftagPool_005fsf_005fform_0026_005fmodelAttribute_005fmethod_005faction.release();
    _005fjspx_005ftagPool_005fsf_005ferrors_0026_005fpath_005fcssStyle_005fnobody.release();
  }

  public void _jspService(final javax.servlet.http.HttpServletRequest request, final javax.servlet.http.HttpServletResponse response)
        throws java.io.IOException, javax.servlet.ServletException {

    final javax.servlet.jsp.PageContext pageContext;
    javax.servlet.http.HttpSession session = null;
    final javax.servlet.ServletContext application;
    final javax.servlet.ServletConfig config;
    javax.servlet.jsp.JspWriter out = null;
    final java.lang.Object page = this;
    javax.servlet.jsp.JspWriter _jspx_out = null;
    javax.servlet.jsp.PageContext _jspx_page_context = null;


    try {
      response.setContentType("text/html;charset=utf-8");
      pageContext = _jspxFactory.getPageContext(this, request, response,
      			null, true, 8192, true);
      _jspx_page_context = pageContext;
      application = pageContext.getServletContext();
      config = pageContext.getServletConfig();
      session = pageContext.getSession();
      out = pageContext.getOut();
      _jspx_out = out;

      out.write(" \r\n");
      out.write("\r\n");

String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";

      out.write("\r\n");
      out.write("<html xmlns=\"http://www.w3.org/1999/xhtml\">\r\n");
      out.write("<head>\r\n");
      out.write("<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\r\n");
      out.write("<title>Library Management System</title>\r\n");
      out.write("<style type=\"text/css\">\r\n");
      out.write("\r\n");
      out.write("body {\r\n");
      out.write("\tmargin-left: 0px;\r\n");
      out.write("\tmargin-top: 0px;\r\n");
      out.write("\tmargin-right: 0px;\r\n");
      out.write("\tmargin-bottom: 0px;\r\n");
      out.write("\tbackground-color: #016aa9;\r\n");
      out.write("\toverflow:hidden;\r\n");
      out.write("}\r\n");
      out.write(".STYLE1 {\r\n");
      out.write("\tcolor: #000000;\r\n");
      out.write("\tfont-size: 12px;\r\n");
      out.write("}\r\n");
      out.write("\r\n");
      out.write("</style></head>\r\n");
      out.write("\r\n");
      out.write("<body>\r\n");
      out.write("\r\n");
      //  sf:form
      org.springframework.web.servlet.tags.form.FormTag _jspx_th_sf_005fform_005f0 = (org.springframework.web.servlet.tags.form.FormTag) _005fjspx_005ftagPool_005fsf_005fform_0026_005fmodelAttribute_005fmethod_005faction.get(org.springframework.web.servlet.tags.form.FormTag.class);
      _jspx_th_sf_005fform_005f0.setPageContext(_jspx_page_context);
      _jspx_th_sf_005fform_005f0.setParent(null);
      // /login.jsp(30,0) name = method type = null reqTime = true required = false fragment = false deferredValue = false deferredMethod = false expectedTypeName = null methodSignature = null 
      _jspx_th_sf_005fform_005f0.setMethod("post");
      // /login.jsp(30,0) name = modelAttribute type = null reqTime = true required = false fragment = false deferredValue = false deferredMethod = false expectedTypeName = null methodSignature = null 
      _jspx_th_sf_005fform_005f0.setModelAttribute("admin");
      // /login.jsp(30,0) name = action type = null reqTime = true required = false fragment = false deferredValue = false deferredMethod = false expectedTypeName = null methodSignature = null 
      _jspx_th_sf_005fform_005f0.setAction("login");
      int[] _jspx_push_body_count_sf_005fform_005f0 = new int[] { 0 };
      try {
        int _jspx_eval_sf_005fform_005f0 = _jspx_th_sf_005fform_005f0.doStartTag();
        if (_jspx_eval_sf_005fform_005f0 != javax.servlet.jsp.tagext.Tag.SKIP_BODY) {
          do {
            out.write("  \r\n");
            out.write("<table width=\"100%\" height=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\r\n");
            out.write("  <tr>\r\n");
            out.write("    <td><table width=\"962\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\">\r\n");
            out.write("      <tr>\r\n");
            out.write("        <td height=\"235\" background=\"");
            out.print(basePath );
            out.write("images/login_03.gif\">&nbsp;</td>\r\n");
            out.write("      </tr>\r\n");
            out.write("      <tr>\r\n");
            out.write("        <td height=\"53\"><table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\r\n");
            out.write("          <tr>\r\n");
            out.write("            <td width=\"394\" height=\"53\" background=\"");
            out.print(basePath );
            out.write("images/login_05.gif\">&nbsp;</td>\r\n");
            out.write("            <td width=\"206\" background=\"");
            out.print(basePath );
            out.write("images/login_06.gif\"><table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\r\n");
            out.write("              <tr>\r\n");
            out.write("                <td width=\"16%\" height=\"25\"><div align=\"right\"><span class=\"STYLE1\">User</span></div></td>\r\n");
            out.write("                <td width=\"57%\" height=\"25\"><div align=\"center\">\r\n");
            out.write("                 <input type=\"text\" name=\"username\" style=\"width:105px; height:17px; background-color:#292929; border:solid 1px #7dbad7; font-size:12px; color:#6cd0ff\"/>\r\n");
            out.write("                  ");
            //  sf:errors
            org.springframework.web.servlet.tags.form.ErrorsTag _jspx_th_sf_005ferrors_005f0 = (org.springframework.web.servlet.tags.form.ErrorsTag) _005fjspx_005ftagPool_005fsf_005ferrors_0026_005fpath_005fcssStyle_005fnobody.get(org.springframework.web.servlet.tags.form.ErrorsTag.class);
            _jspx_th_sf_005ferrors_005f0.setPageContext(_jspx_page_context);
            _jspx_th_sf_005ferrors_005f0.setParent((javax.servlet.jsp.tagext.Tag) _jspx_th_sf_005fform_005f0);
            // /login.jsp(46,18) name = path type = null reqTime = true required = false fragment = false deferredValue = false deferredMethod = false expectedTypeName = null methodSignature = null 
            _jspx_th_sf_005ferrors_005f0.setPath("username");
            // /login.jsp(46,18) name = cssStyle type = null reqTime = true required = false fragment = false deferredValue = false deferredMethod = false expectedTypeName = null methodSignature = null 
            _jspx_th_sf_005ferrors_005f0.setCssStyle("color:red");
            int[] _jspx_push_body_count_sf_005ferrors_005f0 = new int[] { 0 };
            try {
              int _jspx_eval_sf_005ferrors_005f0 = _jspx_th_sf_005ferrors_005f0.doStartTag();
              if (_jspx_th_sf_005ferrors_005f0.doEndTag() == javax.servlet.jsp.tagext.Tag.SKIP_PAGE) {
                return;
              }
            } catch (java.lang.Throwable _jspx_exception) {
              while (_jspx_push_body_count_sf_005ferrors_005f0[0]-- > 0)
                out = _jspx_page_context.popBody();
              _jspx_th_sf_005ferrors_005f0.doCatch(_jspx_exception);
            } finally {
              _jspx_th_sf_005ferrors_005f0.doFinally();
              _005fjspx_005ftagPool_005fsf_005ferrors_0026_005fpath_005fcssStyle_005fnobody.reuse(_jspx_th_sf_005ferrors_005f0);
            }
            out.write("\r\n");
            out.write("                </div></td>\r\n");
            out.write("                <td width=\"27%\" height=\"25\">&nbsp;</td>\r\n");
            out.write("              </tr>\r\n");
            out.write("              <tr>\r\n");
            out.write("                <td height=\"25\"><div align=\"right\"><span class=\"STYLE1\">Password</span></div></td>\r\n");
            out.write("                <td height=\"25\"><div align=\"center\">\r\n");
            out.write("                  <input type=\"password\" name=\"password\" style=\"width:105px; height:17px; background-color:#292929; border:solid 1px #7dbad7; font-size:12px; color:#6cd0ff\"/>\r\n");
            out.write("                   ");
            //  sf:errors
            org.springframework.web.servlet.tags.form.ErrorsTag _jspx_th_sf_005ferrors_005f1 = (org.springframework.web.servlet.tags.form.ErrorsTag) _005fjspx_005ftagPool_005fsf_005ferrors_0026_005fpath_005fcssStyle_005fnobody.get(org.springframework.web.servlet.tags.form.ErrorsTag.class);
            _jspx_th_sf_005ferrors_005f1.setPageContext(_jspx_page_context);
            _jspx_th_sf_005ferrors_005f1.setParent((javax.servlet.jsp.tagext.Tag) _jspx_th_sf_005fform_005f0);
            // /login.jsp(54,19) name = path type = null reqTime = true required = false fragment = false deferredValue = false deferredMethod = false expectedTypeName = null methodSignature = null 
            _jspx_th_sf_005ferrors_005f1.setPath("password");
            // /login.jsp(54,19) name = cssStyle type = null reqTime = true required = false fragment = false deferredValue = false deferredMethod = false expectedTypeName = null methodSignature = null 
            _jspx_th_sf_005ferrors_005f1.setCssStyle("color:red; font-size:9px;");
            int[] _jspx_push_body_count_sf_005ferrors_005f1 = new int[] { 0 };
            try {
              int _jspx_eval_sf_005ferrors_005f1 = _jspx_th_sf_005ferrors_005f1.doStartTag();
              if (_jspx_th_sf_005ferrors_005f1.doEndTag() == javax.servlet.jsp.tagext.Tag.SKIP_PAGE) {
                return;
              }
            } catch (java.lang.Throwable _jspx_exception) {
              while (_jspx_push_body_count_sf_005ferrors_005f1[0]-- > 0)
                out = _jspx_page_context.popBody();
              _jspx_th_sf_005ferrors_005f1.doCatch(_jspx_exception);
            } finally {
              _jspx_th_sf_005ferrors_005f1.doFinally();
              _005fjspx_005ftagPool_005fsf_005ferrors_0026_005fpath_005fcssStyle_005fnobody.reuse(_jspx_th_sf_005ferrors_005f1);
            }
            out.write("\r\n");
            out.write("                </div></td>\r\n");
            out.write("                <td height=\"25\"><div align=\"left\"><img style=\"cursor:hand;\" onclick=\"document.forms[0].submit();\" src=\"");
            out.print(basePath );
            out.write("images/dl.gif\" width=\"49\" height=\"18\" border=\"0\"/></div></td>\r\n");
            out.write("              </tr>\r\n");
            out.write("            </table>\r\n");
            out.write("            </td>\r\n");
            out.write("            <td width=\"362\" background=\"");
            out.print(basePath );
            out.write("images/login_07.gif\">&nbsp;</td>\r\n");
            out.write("          </tr>\r\n");
            out.write("        </table>\r\n");
            out.write("        </td>\r\n");
            out.write("      </tr>\r\n");
            out.write("      <tr>\r\n");
            out.write("        <td height=\"213\" background=\"");
            out.print(basePath );
            out.write("images/login_08.gif\">&nbsp;</td>\r\n");
            out.write("      </tr>\r\n");
            out.write("    </table>\r\n");
            out.write("    </td>\r\n");
            out.write("  </tr>\r\n");
            out.write("</table>\r\n");
            int evalDoAfterBody = _jspx_th_sf_005fform_005f0.doAfterBody();
            if (evalDoAfterBody != javax.servlet.jsp.tagext.BodyTag.EVAL_BODY_AGAIN)
              break;
          } while (true);
        }
        if (_jspx_th_sf_005fform_005f0.doEndTag() == javax.servlet.jsp.tagext.Tag.SKIP_PAGE) {
          return;
        }
      } catch (java.lang.Throwable _jspx_exception) {
        while (_jspx_push_body_count_sf_005fform_005f0[0]-- > 0)
          out = _jspx_page_context.popBody();
        _jspx_th_sf_005fform_005f0.doCatch(_jspx_exception);
      } finally {
        _jspx_th_sf_005fform_005f0.doFinally();
        _005fjspx_005ftagPool_005fsf_005fform_0026_005fmodelAttribute_005fmethod_005faction.reuse(_jspx_th_sf_005fform_005f0);
      }
      out.write("\r\n");
      out.write(" \r\n");
      out.write(" \r\n");
      out.write("\r\n");
      out.write("</body>\r\n");
      out.write("</html>\r\n");
    } catch (java.lang.Throwable t) {
      if (!(t instanceof javax.servlet.jsp.SkipPageException)){
        out = _jspx_out;
        if (out != null && out.getBufferSize() != 0)
          try { out.clearBuffer(); } catch (java.io.IOException e) {}
        if (_jspx_page_context != null) _jspx_page_context.handlePageException(t);
        else throw new ServletException(t);
      }
    } finally {
      _jspxFactory.releasePageContext(_jspx_page_context);
    }
  }
}
