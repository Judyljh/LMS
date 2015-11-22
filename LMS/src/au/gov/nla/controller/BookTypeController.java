package au.gov.nla.controller;

import java.beans.PropertyEditorSupport;
import java.io.UnsupportedEncodingException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.propertyeditors.CustomDateEditor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import au.gov.nla.dao.BookTypeDAO;
import au.gov.nla.domain.BookType;

@Controller
@RequestMapping("/BookType")
public class BookTypeController {

	@Resource
	BookTypeDAO bookTypeDAO;

	@InitBinder
	public void initBinder(WebDataBinder binder) {
		binder.registerCustomEditor(Date.class, new CustomDateEditor(
				new SimpleDateFormat("yyyy-MM-dd"), false));
		binder.registerCustomEditor(Integer.class, new PropertyEditorSupport() {
			@Override
			public String getAsText() {
				return getValue() == null ? "" : getValue().toString();
			}

			@Override
			public void setAsText(String text) throws IllegalArgumentException {
				Integer value = 0;
				if (null != text && !text.equals("")) {
					value = Integer.valueOf(text);
				}
				setValue(value);
			}
		});
	 
	}

	@RequestMapping(value = "/add", method = RequestMethod.GET)
	public String add(Model model) {
		model.addAttribute(new BookType());
		return "BookType_add";
	}

	@RequestMapping(value = "/add", method = RequestMethod.POST)
	public String add(@Validated BookType bookType, BindingResult br,
			Model model, HttpServletRequest request) {
		if (br.hasErrors()) {
			model.addAttribute(bookType);
			return "BookType_add";
		}
		try {
			bookTypeDAO.AddBookType(bookType);
			request.setAttribute("message", "Successfully");
			return "message";
		} catch (Exception e) {
			e.printStackTrace();
			request.setAttribute("error", "Error when add book type, please try again.");
			return "error";
		}

	}

	@RequestMapping(value = { "/list" }, method = {RequestMethod.GET,RequestMethod.POST})
	public String list(Integer currentPage, Model model, HttpServletRequest request) {
		if (currentPage==null || currentPage == 0) currentPage = 1;
		List<BookType> bookTypeList = bookTypeDAO.QueryBookTypeInfo(currentPage);
		
		bookTypeDAO.CalculateTotalPageAndRecordNumber();
		
		int totalPage = bookTypeDAO.getTotalPage();
		
		int recordNumber = bookTypeDAO.getRecordNumber();
		request.setAttribute("bookTypeList", bookTypeList);
		request.setAttribute("totalPage", totalPage);
		request.setAttribute("totalPage", totalPage);
		request.setAttribute("recordNumber", recordNumber);
		request.setAttribute("currentPage", currentPage);
		return "BookType_query_result"; 
	}
	
	@RequestMapping(value="/{bookTypeId}/update",method=RequestMethod.GET)
	public String update(@PathVariable int bookTypeId,Model model) {
		
        BookType bookType = bookTypeDAO.GetBookTypeByBookTypeId(bookTypeId);
        model.addAttribute(bookType); 
        return "BookType_modify"; 
	}
	

	@RequestMapping(value = "/{bookTypeId}/update", method = RequestMethod.POST)
	public String update(@Validated BookType bookType, BindingResult br,
			Model model, HttpServletRequest request) throws UnsupportedEncodingException {
		if (br.hasErrors()) {
			model.addAttribute(bookType);
			return "BookType_modify";
		}
		try {
			bookTypeDAO.UpdateBookType(bookType);
			request.setAttribute("message", "Successfully");
			return "message";
		} catch (Exception e) {
			e.printStackTrace();
			request.setAttribute("error", "Error when updating book type, please try again.");
			return "error";
		} 
	}
	
	
	@RequestMapping(value="/{bookTypeId}/delete",method=RequestMethod.GET)
	public String delete(@PathVariable int bookTypeId,HttpServletRequest request) throws UnsupportedEncodingException {
		  try { 
	            bookTypeDAO.DeleteBookType(bookTypeId);
	            request.setAttribute("message", "Successfully");
	            return list(1, null, request);
	        } catch (Exception e) { 
	            e.printStackTrace();
	            request.setAttribute("error", "Error when deleting book type, please try again.");
				return "error";
	        }
	}
	
}
