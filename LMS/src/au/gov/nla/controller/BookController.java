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
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import au.gov.nla.dao.BookDAO;
import au.gov.nla.dao.BookTypeDAO;
import au.gov.nla.domain.Book;
import au.gov.nla.domain.BookType;
import au.gov.nla.utils.UserException;


@Controller
@RequestMapping("/Book")
public class BookController {

	@Resource BookDAO bookDAO;
	@Resource BookTypeDAO bookTypeDAO;
	
	
	@InitBinder("bookType")
	public void initBinderBookType(WebDataBinder binder) {
		binder.setFieldDefaultPrefix("bookType.");
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
	public String add(Model model,HttpServletRequest request) {
		model.addAttribute(new Book());
		
        List<BookType> bookTypeList = bookTypeDAO.QueryAllBookTypeInfo();
        request.setAttribute("bookTypeList", bookTypeList);
		return "Book_add";
	}
	
	

	@RequestMapping(value = "/add", method = RequestMethod.POST)
	public String add(@Validated Book book, BindingResult br,
			Model model, HttpServletRequest request) throws UnsupportedEncodingException {
		 
		if (br.hasErrors()) {
			model.addAttribute(book);
			
	        List<BookType> bookTypeList = bookTypeDAO.QueryAllBookTypeInfo();
	        request.setAttribute("bookTypeList", bookTypeList);
			return "Book_add";
		}
		
		if(bookDAO.GetBookByBarcode(book.getBarcode()) != null) {
			throw new UserException("The code is duplicated."); 
		}
		
	
		try {
			bookDAO.AddBook(book);
			request.setAttribute("message", "Successfully.");
			return "message";
		} catch (Exception e) {
			e.printStackTrace();
			request.setAttribute("error", "Error when adding book. Please try again.");
			return "error";
		}

	}
	
	
	
	
	@RequestMapping(value = { "/list" }, method = {RequestMethod.GET,RequestMethod.POST})
	public String list(String barcode,@ModelAttribute BookType bookType,String bookName,String author,Integer currentPage, Model model, HttpServletRequest request) {
		if (currentPage==null || currentPage == 0) currentPage = 1;
		if (bookName == null) bookName = "";
		if (barcode == null) barcode = "";
		if (author == null) author = "";
		List<Book> bookList = bookDAO.QueryBookInfo(bookName, bookType, barcode,author, currentPage);
	    
	    bookDAO.CalculateTotalPageAndRecordNumber(bookName, bookType, barcode,author);
	    
	    int totalPage = bookDAO.getTotalPage();
	    
	    int recordNumber = bookDAO.getRecordNumber();
	    request.setAttribute("bookList",  bookList);
	    request.setAttribute("totalPage", totalPage);
	    request.setAttribute("recordNumber", recordNumber);
	    request.setAttribute("currentPage", currentPage);
	    request.setAttribute("bookName", bookName);
	    request.setAttribute("bookType", bookType);
	    List<BookType> bookTypeList = bookTypeDAO.QueryAllBookTypeInfo();
	    request.setAttribute("bookTypeList", bookTypeList);
	    request.setAttribute("barcode", barcode);
	    request.setAttribute("author", author);
	     
		return "Book_query_result"; 
	}
	

	@RequestMapping(value="/{barcode}/update",method=RequestMethod.GET)
	public String update(@PathVariable String barcode,Model model,HttpServletRequest request) {
		
        Book book = bookDAO.GetBookByBarcode(barcode);

        List<BookType> bookTypeList = bookTypeDAO.QueryAllBookTypeInfo();
        request.setAttribute("bookTypeList", bookTypeList);
        request.setAttribute("book",  book);
        return "Book_modify";
		 
	}
	

	@RequestMapping(value = "/{barcode}/update", method = RequestMethod.POST)
	public String update(@Validated Book book, BindingResult br,
			Model model, HttpServletRequest request) throws UnsupportedEncodingException {
		if (br.hasErrors()) { 
			model.addAttribute(book);
			
	        List<BookType> bookTypeList = bookTypeDAO.QueryAllBookTypeInfo();
	        request.setAttribute("bookTypeList", bookTypeList);
			return "Book_modify";
		}
		
        
        
		try {
			BookType bookType = bookTypeDAO.GetBookTypeByBookTypeId(book.getBookType().getBookTypeId());
			book.setBookType(bookType);
			bookDAO.UpdateBook(book);
			request.setAttribute("message", "Successfully");
			return "message";
		} catch (Exception e) {
			e.printStackTrace();
			request.setAttribute("error", "Error when udpating book, please try again.");
			return "error";
		} 
	}
	
	
	@RequestMapping(value="/{barcode}/delete",method=RequestMethod.GET)
	public String delete(@PathVariable String barcode,HttpServletRequest request) throws UnsupportedEncodingException {
		  try { 
			  bookDAO.DeleteBook(barcode);
	           
	            request.setAttribute("message", "Successfully");
	            return list(null, null,null,null,1, null, request);
	        } catch (Exception e) { 
	            e.printStackTrace();
	            request.setAttribute("error","Error when deleting book, please try again.");
				return "error";
	        }
	}
	
	
	


	
}
