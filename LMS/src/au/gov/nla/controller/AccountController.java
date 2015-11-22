package au.gov.nla.controller;

import java.beans.PropertyEditorSupport;
import java.io.UnsupportedEncodingException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Set;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.propertyeditors.CustomDateEditor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import au.gov.nla.dao.AccountDAO;
import au.gov.nla.domain.Account;
import au.gov.nla.domain.Book;
import au.gov.nla.utils.UserException;

@Controller
@RequestMapping("/Account")
public class AccountController {

	@Resource
	AccountDAO accountDAO;
	
	@InitBinder("account")
	public void initBinderAccount(WebDataBinder binder) {
		binder.setFieldDefaultPrefix("account.");
	}

	
	@InitBinder
	public void initBinder(WebDataBinder binder) {
		binder.registerCustomEditor(Date.class, new CustomDateEditor(
				new SimpleDateFormat("yyyy-MM-dd"), false));
	 
		binder.registerCustomEditor(Integer.class, new PropertyEditorSupport() {
			@Override
			public String getAsText() { 
				return (getValue() == null) ? "" : getValue().toString();
			} 
			@Override
			public void setAsText(String text) {
				Integer value = null;
				if (null != text && !text.equals("")) {  
						try {
							value = Integer.valueOf(text);
						} catch(Exception ex)  { 
							throw new UserException("Wrong Data Format."); 
						}  
				}
				setValue(value);
			} 
		});
	 
		binder.registerCustomEditor(Float.class, new PropertyEditorSupport() {
			@Override
			public String getAsText() { 
				return (getValue() == null)? "" : getValue().toString();
			} 
			@Override
			public void setAsText(String text)  {
				Float value = null;
				if (null != text && !text.equals("")) {
					try {
						value = Float.valueOf(text);
					} catch (Exception e) { 
						throw new UserException("Wrong Data Format."); 
					}
				}
				setValue(value);
			}
		});
	 
	}
	

	@RequestMapping(value = "/add", method = RequestMethod.GET)
	public String add(Model model) {
		model.addAttribute(new Account());
		return "Account_add";
	}

	@RequestMapping(value = "/add", method = RequestMethod.POST)
	public String add(@Validated Account account, BindingResult br,
			Model model, HttpServletRequest request) {
		if (br.hasErrors()) {
			model.addAttribute(account);
			return "Account_add";
		}
		try {
			accountDAO.AddAccount(account);
			request.setAttribute("message", "Successfully");
			return "message";
		} catch (Exception e) {
			e.printStackTrace();
			request.setAttribute("error", "Failed when add a new account, please try again.");
			return "error";
		}

	}
	
	@RequestMapping(value = { "/list" }, method = {RequestMethod.GET,RequestMethod.POST})
	public String list(String loginId,@ModelAttribute String firstName,String lastName, String email, String phone, Integer currentPage, Model model, HttpServletRequest request) {
		if (currentPage==null || currentPage == 0) currentPage = 1;
		if (loginId == null) loginId = "";
		if (firstName == null) firstName = "";
		if (lastName == null) lastName = "";
		if (email == null) email = "";
		if (phone == null) phone = "";
		
		List<Account> accountList = accountDAO.QueryAccountInfo(loginId, firstName, lastName,email, phone, currentPage);
		
	    request.setAttribute("loginId",  loginId);
	    request.setAttribute("firstName", firstName);
	    request.setAttribute("lastName", lastName);
	    request.setAttribute("email", email);
	    request.setAttribute("phone", phone);
		String jsonObject = getMapList(accountList);
		request.setAttribute("jsonAccounts", jsonObject);

		return "Account_query_result"; 
	}
	private String getMapList(List<Account> accountList){
		
		StringBuilder accounts = new StringBuilder(); 
		accounts.append("[");
		for (Account acc: accountList) {
			accounts.append(acc);
			accounts.append(",");
		}
		accounts.deleteCharAt(accounts.lastIndexOf(","));
		accounts.append("]");
		return accounts.toString();
	}

	
	@RequestMapping(value="/{accountId}/booklist",method=RequestMethod.POST)
	public @ResponseBody String getBookList(@PathVariable int accountId,
			Model model) {
		String result;
        Set<Book> books = accountDAO.GetBooksByAccountId(accountId);
        if(books != null)
        {
	        StringBuilder bs = new StringBuilder(); 
	
			for (Book book: books) {
				bs.append(book);
				bs.append(",");
			}
			bs.deleteCharAt(bs.lastIndexOf(","));
	
			System.out.println("Book: " + bs); 
			result =  "{\"Rows\": [" +  bs.toString() +"], \"Total\":" + books.size() +"}";
        }
        else
        	result =  "{\"Rows\": [" + new Book().toString() +"], \"Total\":1}";
     
		return result; 
	}
	@RequestMapping(value="/{accountId}/update",method=RequestMethod.GET)
	public String update(@PathVariable int accountId,Model model) {
		
        Account account = accountDAO.GetAccountByAccountId(accountId);
        model.addAttribute(account); 
        return "Account_modify"; 
	}
	
	

	@RequestMapping(value = "/{accountId}/update", method = RequestMethod.POST)
	public String update(@Validated Account account, BindingResult br,
			Model model, HttpServletRequest request) throws UnsupportedEncodingException {
		if (br.hasErrors()) {
			model.addAttribute(account);
			return "Account_modify";
		}
		try {
			accountDAO.UpdateAccount(account);
			request.setAttribute("message", "Successfully");
			return "message";
		} catch (Exception e) {
			e.printStackTrace();
			request.setAttribute("error", "Error when updating book type, please try again.");
			return "error";
		} 
	}
	
	
	@RequestMapping(value="/{accountId}/delete",method=RequestMethod.GET)
	public String delete(@PathVariable int accountId,HttpServletRequest request) throws UnsupportedEncodingException {
		  try { 
	            accountDAO.DeleteAccount(accountId);
	            request.setAttribute("message", "Successfully");
	          return  list(null, null, null, null, null, 1, null, request);
	        } catch (Exception e) { 
	            e.printStackTrace();
	            request.setAttribute("error", "Failed when deleting book type, please try again.");
				return "error";
	        }
	}
	
	
	

}
