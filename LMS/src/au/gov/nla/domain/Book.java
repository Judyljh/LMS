package au.gov.nla.domain;

import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotEmpty;

public class Book {
    
	public Book(){
		bookName = "";
		bookType = null;
		price = 0.0f;
		author = "";
		barcode = "";
	}
	@NotEmpty(message="Please enter a book name.")  
    private String bookName;
    public String getBookName() {
        return bookName;
    }
    public void setBookName(String bookName) {
        this.bookName = bookName;
    }

    
    private BookType bookType;
    public BookType getBookType() {
        return bookType;
    }
    public void setBookType(BookType bookType) {
        this.bookType = bookType;
    }

	@NotNull(message="Please enter book price.") 
    private Float price;
    public Float getPrice() {
        return price;
    }
    public void setPrice(Float price) {
        this.price = price;
    }

    
    @NotNull(message="Please enter the count of the book.")  
    private Integer count;
    public Integer getCount() {
        return count;
    }
    public void setCount(Integer count) {
        this.count = count;
    }

    
    private String author;
    public String getAuthor() {
        return author;
    }
    public void setAuthor(String author) {
        this.author = author;
    }
    
 
    @NotEmpty(message="Please enter IBSN") 
    private String barcode;
    public String getBarcode() {
        return barcode;
    }
    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public boolean equals(Object obj) {
        if (obj == null) return false;
        if (!this.getClass().equals(obj.getClass())) return false;

        Book obj2 = (Book)obj;
        if((this.barcode == obj2.getBarcode()))
        {
           return true;
        }
        return false;
     }
     public int hashCode() {
        int tmp = 0;
        tmp = ( barcode ).hashCode();
        return tmp; 
     }
     
	@Override
	public String toString() {
		String str = "{\"bookName\":\"" + bookName + "\", \"bookType\":\"";
		if(bookType==null)
			str += "";
		else
			str += bookType.getBookTypeName();
		str += "\", \"price\":\"" + price + "\", \"count\":\"" + count + "\", \"author\":\""
				+ author + "\", \"barcode\":\"" + barcode + "\"}";
		
		return str;
	}
     
     
}