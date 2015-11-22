package au.gov.nla.dao;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import javax.annotation.Resource;

import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import au.gov.nla.domain.Account;

@Service @Transactional
public class AccountDAO {
	@Resource SessionFactory factory;
    
    private final int PAGE_SIZE = 10;

    
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

    
    public void AddAccount(Account account) throws Exception {
    	Session s = factory.getCurrentSession();
    	s.save(account);
    }

    
    @Transactional(propagation=Propagation.NOT_SUPPORTED)
    public ArrayList<Account> QueryAccountInfo(String loginId, String firstName, String lastName, String email, String phone, int currentPage) { 
    	Session s = factory.getCurrentSession();
    	String hql = "From Account account where 1=1";
    	if(!loginId.equals("")) hql = hql + " and account.loginId like '%" + loginId + "%'";
    	if(!firstName.equals("")) hql = hql + " and account.firstName like '%" + firstName + "%'";
    	if(!lastName.equals("")) hql = hql + " and account.lastName like '%" + lastName + "%'";
    	if(!email.equals("")) hql = hql + " and account.email like '%" + email + "%'";
    	if(!phone.equals("")) hql = hql + " and account.phone like '%" + phone + "%'";
 
    	 Query q = s.createQuery(hql);
    	
    	int startIndex = (currentPage-1) * this.PAGE_SIZE;
    	q.setFirstResult(startIndex);
    	q.setMaxResults(this.PAGE_SIZE);
    	List accountList = q.list();
    	return (ArrayList<Account>) accountList;

    }



    @Transactional(propagation=Propagation.NOT_SUPPORTED)
    public Account GetAccountByAccountId(int accountId) {
        Session s = factory.getCurrentSession();
        Account account = (Account)s.get(Account.class, accountId);
        return account;
    }

    
    public void UpdateAccount(Account account) throws Exception {
        Session s = factory.getCurrentSession();
        s.update(account);
    }

    
    public void DeleteAccount (int accountId) throws Exception {
        Session s = factory.getCurrentSession(); 
        Object account = s.load(Account.class, accountId);
        s.delete(account);
    }
	public Set GetBooksByAccountId(int accountId) {
		
        Session s = factory.getCurrentSession();
        Account account = (Account)s.get(Account.class, accountId);
        Set books = account.getBooks();
        if(books != null && books.size() > 0){
        	return books;
        }
        return null;

	}
}
