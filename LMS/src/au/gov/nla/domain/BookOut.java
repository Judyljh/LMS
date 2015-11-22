package au.gov.nla.domain;

public class BookOut {
	
	private Integer outId;
	private Integer userId;
    private Integer bookId;
    private String outTime;
    
    public Integer getBookId() {
        return bookId;
    }
    public void setBookId(Integer bookId) {
        this.bookId = bookId;
    }
	public Integer getOutId() {
		return outId;
	}
	public void setOutId(Integer outId) {
		this.outId = outId;
	}
	public Integer getUserId() {
		return userId;
	}
	public void setUserId(Integer userId) {
		this.userId = userId;
	}
	public String getOutTime() {
		return outTime;
	}
	public void setOutTime(String outTime) {
		this.outTime = outTime;
	}

    
}
