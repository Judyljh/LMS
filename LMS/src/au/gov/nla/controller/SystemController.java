package au.gov.nla.controller;

import java.io.UnsupportedEncodingException;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Controller; 
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated; 
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttributes;

 

import au.gov.nla.dao.AdminDAO;
import au.gov.nla.domain.Admin;
import au.gov.nla.utils.UserException;

 
@Controller
@SessionAttributes("username")
public class SystemController { 
	
	@Resource AdminDAO adminDAO;  
	
	@RequestMapping(value="/login",method=RequestMethod.GET)
	public String login(Model model) {
		model.addAttribute(new Admin());
		return "login";
	}

	@RequestMapping(value="/login",method=RequestMethod.POST)
	public String login(@Validated Admin admin,BindingResult br,Model model,HttpServletRequest request,HttpSession session) { 
		if(br.hasErrors()) {
			return "login";
		} 
		if (!adminDAO.CheckLogin(admin)) {
			request.setAttribute("error", adminDAO.getErrMessage()); 
			return "error";
		}
		model.addAttribute("username", admin.getUsername());
		return "main";  
	}
	
	
	
	@RequestMapping("/logout")
	public String logout(Model model,HttpSession session) {
		model.asMap().remove("username");
		session.invalidate();
		return "redirect:/login";
	}
	
	
	@RequestMapping(value="/changePassword",method=RequestMethod.POST)
	public String ChangePassword(String oldPassword,String newPassword,String newPassword2,HttpServletRequest request,HttpSession session) throws UnsupportedEncodingException { 
		if(oldPassword.equals("")) throw new UserException("Please enter your password");
		if(newPassword.equals("")) throw new UserException("Please enter your new password");
		if(!newPassword.equals(newPassword2)) throw new UserException("Please confirm your new password is the same."); 
		
		String username = (String)session.getAttribute("username");
		if(username == null) throw new UserException("session time out. Please re-login.");
		 
		
		Admin admin = adminDAO.GetAdmin(username); 
		if(!admin.getPassword().equals(oldPassword)) throw new UserException("Your password is not right.");
		
		try { 
			adminDAO.ChangePassword(username,newPassword);
			request.setAttribute("message", "Successfully");
			return "message";
		} catch (Exception e) {
			e.printStackTrace();
			request.setAttribute("error","Error. Please try again.");
			return "error";
		}   
	}
	
	
	
	
}
