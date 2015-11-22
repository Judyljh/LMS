package au.gov.nla.domain;

import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotEmpty; 

public class BookType {
    
    private Integer bookTypeId;
    public Integer getBookTypeId() {
        return bookTypeId;
    }
    public void setBookTypeId(Integer bookTypeId) {
        this.bookTypeId = bookTypeId;
    }

    
    @NotEmpty(message="Please enter book type.")  
    private String bookTypeName;
    public String getBookTypeName() {
        return bookTypeName;
    }
    public void setBookTypeName(String bookTypeName) {
        this.bookTypeName = bookTypeName;
    }

    
    @NotNull(message="Please enter days.")  
    private Integer days;
    public Integer getDays() {
        return days;
    }
    public void setDays(Integer days) {
        this.days = days;
    }

}