package au.gov.nla.dao;

import javax.annotation.Resource;


import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import au.gov.nla.domain.Admin;

@Service @Transactional
public class AdminDAO {
	@Resource  SessionFactory factory;

	
	private String errMessage;
	public String getErrMessage() { return this.errMessage; }
	
	
	@Transactional(propagation=Propagation.NOT_SUPPORTED)
	public boolean CheckLogin(Admin admin) { 
		Session s = factory.getCurrentSession(); 

		Admin db_admin = (Admin)s.get(Admin.class, admin.getUsername());
		if(db_admin == null) { 
			this.errMessage = "Account Not Exist ";
			System.out.print(this.errMessage);
			return false;
		} else if( !db_admin.getPassword().equals(admin.getPassword())) {
			this.errMessage = "Invalid Login Details ";
			System.out.print(this.errMessage);
			return false;
		}
		
		return true;
	}
	

	
	public void ChangePassword(String username, String newPassword) {
		Session s = factory.getCurrentSession();
		
		Admin db_admin = (Admin)s.get(Admin.class, username);
		db_admin.setPassword(newPassword);
		s.save(db_admin);
		
	}
	
	
	public Admin GetAdmin(String username) {
		Session s = factory.getCurrentSession();
		Admin db_admin = null;
		db_admin = (Admin)s.get(Admin.class, username); 
		return db_admin;
	}
}
