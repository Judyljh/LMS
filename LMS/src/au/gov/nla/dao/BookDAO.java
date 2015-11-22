package au.gov.nla.dao;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.Resource;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import au.gov.nla.domain.BookType;
import au.gov.nla.domain.Book;

@Service @Transactional
public class BookDAO {

	@Resource SessionFactory factory;
    
    private final int PAGE_SIZE = 5;

    
    private int totalPage;
    public void setTotalPage(int totalPage) {
        this.totalPage = totalPage;
    }
    public int getTotalPage() {
        return totalPage;
    }

    
    private int recordNumber;
    public void setRecordNumber(int recordNumber) {
        this.recordNumber = recordNumber;
    }
    public int getRecordNumber() {
        return recordNumber;
    }

    
    public void AddBook(Book book) throws Exception {
    	Session s = factory.getCurrentSession();
    	s.merge(book);
    }

    
    @Transactional(propagation=Propagation.NOT_SUPPORTED)
    public ArrayList<Book> QueryBookInfo(String bookName,BookType bookType,String barcode,String author,int currentPage) { 
    	Session s = factory.getCurrentSession();
    	String hql = "From Book book where 1=1";
    	if(!bookName.equals("")) hql = hql + " and book.bookName like '%" + bookName + "%'";
    	if(null != bookType && bookType.getBookTypeId() != null && bookType.getBookTypeId()!=0) hql += " and book.bookType.bookTypeId=" + bookType.getBookTypeId();
    	if(!barcode.equals("")) hql = hql + " and book.barcode like '%" + barcode + "%'";
    	if(!author.equals("")) hql = hql + " and book.author like '%" + author + "%'";
    	 Query q = s.createQuery(hql);
    	
    	int startIndex = (currentPage-1) * this.PAGE_SIZE;
    	q.setFirstResult(startIndex);
    	q.setMaxResults(this.PAGE_SIZE);
    	List bookList = q.list();
    	return (ArrayList<Book>) bookList;
    }

    
    @Transactional(propagation=Propagation.NOT_SUPPORTED)
    public void CalculateTotalPageAndRecordNumber(String bookName,BookType bookType,String barcode,String author) {
        Session s = factory.getCurrentSession();
        String hql = "From Book book where 1=1";
        if(!bookName.equals("")) hql = hql + " and book.bookName like '%" + bookName + "%'";
        if(null != bookType && bookType.getBookTypeId()!=null && bookType.getBookTypeId()!=0 ) hql += " and book.bookType.bookTypeId=" + bookType.getBookTypeId();
        if(!barcode.equals("")) hql = hql + " and book.barcode like '%" + barcode + "%'";
        if(!author.equals("")) hql = hql + " and book.author like '%" + author + "%'";
        Query q = s.createQuery(hql);
        List bookList = q.list();
        recordNumber = bookList.size();
        int mod = recordNumber % this.PAGE_SIZE;
        totalPage = recordNumber / this.PAGE_SIZE;
        if(mod != 0) totalPage++;
    }

    
    @Transactional(propagation=Propagation.NOT_SUPPORTED)
    public Book GetBookByBarcode(String barcode) {
        Session s = factory.getCurrentSession();
        Book book = (Book)s.get(Book.class, barcode);
        return book;
    }

    
    public void UpdateBook(Book book) throws Exception {
        Session s = factory.getCurrentSession();
        s.merge(book); 
    }

    
    public void DeleteBook (String barcode) throws Exception {
        Session s = factory.getCurrentSession(); 
        Object book = s.load(Book.class, barcode);
        s.delete(book);
    }
	public ArrayList<Book> GetBookByAccount(int accountId) {
	      Session s = factory.getCurrentSession();
	        String hql = "From Book book join book.bookOut out where out.userId=" + accountId;
	        Query q = s.createQuery(hql);
	    	List bookList = q.list();
	    	return (ArrayList<Book>) bookList;
	}

}
