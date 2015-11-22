package au.gov.nla.domain;

import java.util.HashSet;
import java.util.Set;

import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotEmpty;

public class Account {
    private Integer accountId;
    public Integer getAccountId() {
        return accountId;
    }
    public void setAccountId(Integer accountId) {
        this.accountId = accountId;
    }

    private Set<Book> books = new HashSet<Book>();
	public Set<Book> getBooks() {
		return books;
	}
	public void setBooks(Set<Book> books) {
		this.books = books;
	}

	@NotEmpty(message="Please enter first name.")  
    private String firstName;
    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

	@NotEmpty(message="Please enter last name.")  
    private String lastName;
    public String getLastName() {
        return lastName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    
    @NotNull(message="Please enter email.") 
    private String email;
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    
    @NotNull(message="Please enter the phone number.")  
    private String phone;
    public String getPhone() {
        return phone;
    }
    public void setPhone(String phone) {
        this.phone = phone;
    }

    @NotEmpty(message="Please enter Login ID.")  
    private String loginId;
    public String getLoginId() {
        return loginId;
    }
    public void setLoginId(String loginId) {
        this.loginId = loginId;
    }
	@Override
	public String toString() {
		return "{accountId:'" + accountId + "', firstName:'" + firstName
				+ "', lastName:'" + lastName + "', email:'" + email + "', phone:'"
				+ phone + "', loginId:'" + loginId + "'}";
	}
    
    

}
