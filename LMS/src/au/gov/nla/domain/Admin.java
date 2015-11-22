package au.gov.nla.domain;

import org.hibernate.validator.constraints.NotEmpty;

 
public class Admin {
	@NotEmpty(message="Please enter user.")  
	private String username;

	@NotEmpty(message="Please enter password.") 
	private String password;
	
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	
}
