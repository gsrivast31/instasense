var globalFanybox=null;
var uti = new Uti();
var event =null;
var cal=null;
var monthLabel= ['January', 'February', 'March', 'April',
                     'May', 'June', 'July', 'August', 'September',
                     'October', 'November', 'December'];
//class uti
function Uti() {
	this.setDate = function(date){
		$('.when').text(this.formatDate(date));
		$('#when').val(date);
	}
	this.setData = function(data){		
		$('.when').text(this.formatDate(data['when']));
		$('#id').val(data['id']);
		$('#when-edit').val(data['when']);
		$('#where-edit').val(data['where']);
		$('#what-edit').val(data['what']);
		$('#about-edit').val(data['about']);
	}
	this.clearForm = function(){
		$('.when').text('');
		$('#when').val('');
		$('#where').val('');
		$('#what').val('');
		$('#about').val('');
	}
	this.truncateTitle = function(title){
		if(title.length>20){
			title=title.substring(0,19);
		}
		return title;
	}	
	this.formatDate = function(date){
		 var dateArray = date.split('-');		 
		 return dateArray[2]+" "+monthLabel[dateArray[1]]+ " "+dateArray[0];
	}
}

//class Calendar
function Calendar(domElement,monthNumber,yearNumber){
	var thisObj = this;
	this.domElement=domElement;
	if(yearNumber==null){
		today= new Date();
		this.yearNumber=today.getFullYear();
	}else{
		this.yearNumber=yearNumber;
	}
	if(monthNumber==null){
		today= new Date();
		this.monthNumber=today.getMonth();
	}else{
		this.monthNumber=monthNumber;
	}
	$('#time-title').text(this.yearNumber +" "+ ( monthLabel[this.monthNumber]) );
	this.event = new Event(thisObj);	
	if(!this.event.dbOpen){		
		this.event.open();
		//this.event.dropTable(); 
		this.event.createDb();
	}
	this.year = new Year(thisObj);
	this.current = thisObj.year.currentMonth;
	$(this.domElement).append(this.current);
	this.reload = function(){
		$('.dates').remove();
		
		this.year = new Year(thisObj);
		this.current = thisObj.year.currentMonth;
		$(this.domElement).append(this.current);
	}
	this.addEvent = function(record){
		 this.event.saveEvent(record);
	}
	this.updateEvent = function(record){
		 this.event.updateEvent(record);
	}
	this.deleteEvent = function(id){
		 this.event.deleteEvent(id);
	}
	this.prev= function(){
		if(this.monthNumber==0){
			this.monthNumber=11;
			this.yearNumber--;
		}else{
			this.monthNumber--;
		}		
		this.reload();		
	}
	this.next=function(){
		if(this.monthNumber==11){
			this.monthNumber=0;
			this.yearNumber++;
		}else{
			this.monthNumber++;
		}
		this.reload();
	}
}

//class Year
function Year(calendar){
	var thisObj = this;
	this.calendar = calendar;
	this.yearNumber=this.calendar.yearNumber;
	this.month = new Month(thisObj,this.calendar.monthNumber);
	this.currentMonth = function(){	
		thisObj.month.showContent();
		return thisObj.month.dom;
	} 
}

//class Month
function Month(year,monthNumber){
	var thisObj = this;
	this.year=year;
	this.monthNumber= monthNumber;
	this.weeks =new Array();
	this.dom = document.createElement('div');
	$(this.dom).addClass('dates');
	// these are the days of the week for each month, in order
	this.daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	// get first day of month
	var firstDay = new Date(this.year.yearNumber,monthNumber,1);
	this.monthStartingDay = firstDay.getDay();
	// find number of days in month
	var monthLength = this.daysInMonth[this.monthNumber];
	// compensate for leap year
	if (this.monthNumber == 1) { // February only!
	    if((this.year.yearNumber % 4 == 0 && this.year.yearNumber % 100 != 0) || this.year.yearNumber % 400 == 0){
	      monthLength = 29;
	    }
	}	
	var lastDay = new Date(this.year.yearNumber,monthNumber,monthLength);
	this.monthEndingDay = lastDay.getDay();
	// find number of weeks in this month
	var numOfweeks = (monthLength%7==0?0:1)+parseInt(monthLength/7);
	if(this.monthEndingDay<this.monthStartingDay){
		numOfweeks++;
	}
	// first week	
		this.weeks[0]= new Week(thisObj,this.monthStartingDay,6);
	// middle weeks
	for(var i=1; i<(numOfweeks-1);i++){
		this.weeks.push(new Week(thisObj,0,6))
	}
	// last week
		this.weeks.push(new Week(thisObj,0,this.monthEndingDay));
	this.showContent = function(){
		//append Week dom
		for(var j=0;j<this.weeks.length;j++){
			thisObj.weeks[j].formDom();
			$(this.dom).append(thisObj.weeks[j].dom);
		}	
	}
}

//class Month
function Week(month,startingDay,endingDay){
	var thisObj = this;
	this.days =new Array();
	this.month=month;
	this.dom = document.createElement('div');
	$(this.dom).addClass('calendar-row');
	//create div table tr
	var table=  document.createElement('table');
	$(table).attr('cellpadding',0);
	var tr = document.createElement('tr');
	//get Day objecs
	for(var i=0;i<=6;i++){
		if(i<startingDay||i>endingDay){
			this.days.push(new Day(thisObj,null));
		}else{
			this.days.push(new Day(thisObj,i));
		}
	}
	this.formDom = function(){
		//append Day dom
		for(var j=0;j<this.days.length;j++){
			thisObj.days[j].formDom();
			$(tr).append(thisObj.days[j].dom);
		}	
		//append Tr
		$(table).append(tr);
		$(this.dom).append(table);
	}
}

//class Day
function Day(week,dayNumber){	
	var thisObj = this;
	this.week = week;
	this.day =null;
	this.eventData= new Array();
	this.formDom = function(){
		var inWeek = this.week.month.weeks.indexOf(this.week);
		if(inWeek>0){
			this.day =(inWeek-1)*7+ (dayNumber+1)+(6-this.week.month.monthStartingDay+1);
		}else{
			this.day = ((dayNumber-this.week.month.monthStartingDay)+1)>0?((dayNumber-this.week.month.monthStartingDay)+1):0;
		}		
		var aLink = document.createElement('a');
		$(aLink).attr('href','#add');	
		$(aLink).addClass('add');
		var spanAdd = document.createElement('span');
		$(spanAdd).addClass('action');
		//create add link
		if(dayNumber!=null){
			$(aLink).text('Add');
		}else{
			$(aLink).text('');
		}
		if(dayNumber==null){
			this.date = 0;
		}else{
			this.date = (thisObj.week.month.year.yearNumber) + "-" + (thisObj.week.month.monthNumber)+ "-" +thisObj.day;
		}
		$(aLink).fancybox({
			'onStart': function(){
				uti.setDate(thisObj.date);
			}
		});	
		//create day 
		var daySpan = document.createElement('span');
		$(daySpan).addClass('title');	
		if(dayNumber!=null){
			$(daySpan).text(this.day);
		}else{
			$(daySpan).text('');
		}
		//find event
		thisObj.week.month.year.calendar.event.findEvent(thisObj);
		//create td		
		this.dom = document.createElement('td');
		if(dayNumber==null){
			$(this.dom).addClass('empty-cell');
		}
		this.div = document.createElement('div');
		$(this.div).addClass('tdcell');
		$(spanAdd).append(aLink);
		$(this.div).append(spanAdd);	
		$(this.div).append(daySpan);
		$(this.dom).append(this.div);	
	}
	this.addEvent = function(event){
		this.eventData.push(event);
	}	
	this.formEvent = function(){
		if(this.eventData.length>0){			
			var ul =document.createElement('ul');			
			for(var i=0; i<this.eventData.length; i++){
				var li =document.createElement('li');
				var a = document.createElement('a');
				$(a).attr('href','#edit');
				(function(i){
					$(a).fancybox({
						'onStart': function(){
							uti.setData(thisObj.eventData[i]);
						}
					})
				 })(i);
				$(a).text(uti.truncateTitle(this.eventData[i]['what']));
				$(li).append(a);
				$(ul).append(li);
			}			
			$(this.div).append(ul);
		}
	}
}

//class Event
function Event(cal){
	var thisObj = this;
	this.dbOpen = false;
	this.db =null;
	this.cal=cal;
	this.open = function(){
		 try {
            if (!window.openDatabase) {
                alert("Couldn't open the database.  Please try with a WebKit nightly with the database feature enabled.");
                return;
            }
            this.db = openDatabase('calendar', '1.0', 'calendar database', 1000000);
            if (!this.db){
				 alert("Failed to open the database on disk.");
			} 
			else{
				this.dbOpen =true;
			}
        } catch(err) { }
	}		
	this.sqlErrorCall = function(tx, err){
		 alert("Error opening WebKitCalendarEvents: " + err.message); 
	}		
	this.sqlSuccessCall = function(result){
		uti.clearForm();
		thisObj.cal.reload();
		$.fancybox.close();
	}		
	//create db
	this.createDb = function(){
		var createDbStatement= "CREATE TABLE IF NOT EXISTS  events (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, time DATE NOT NULL, place TEXT NOT NULL, title TEXT NOT NULL, des TEXT)";
		this.db.transaction(function (tx) {
		  	tx.executeSql(createDbStatement,[],null,thisObj.sqlErrorCall);
		});
	}
	//remove db
	this.dropTable = function(){
		var dropTableStatement= "DROP TABLE events";
		this.db.transaction(function (tx) {
		  	tx.executeSql(dropTableStatement);
		});
	}
	//find  events for this date
	this.findEvent = function(day){
		var selectEventStatement = 'SELECT * FROM events WHERE time = ? ORDER BY id DESC';
		var sqlArguments =[day.date];
		this.db.transaction(function (tx) {
			  tx.executeSql(selectEventStatement,sqlArguments, function (tx, results) {
				  var len = results.rows.length, i;
				  for (i = 0; i < len; i++) {
				  	var record=new Array();
					record=    {'id':results.rows.item(i).id, 
							    'when':results.rows.item(i).time,
								'where':results.rows.item(i).place,
								'what':results.rows.item(i).title,
								'about':results.rows.item(i).des};
					day.addEvent(record);
				  }			  
					day.formEvent();
			},thisObj.sqlErrorCall);
		});
		
	}
	//insert event
	this.saveEvent = function(record){
		 // SQL statement to insert new event into the database table
        var insertEventStatement = "INSERT INTO events( time, place, title, des) VALUES ( ?, ?, ?, ?)";        
        // Arguments to the SQL statement above		
        var sqlArguments = [ record['when'], record['where'], record['what'], record['about']];        
		this.db.transaction(function (tx) {
			   tx.executeSql(insertEventStatement, sqlArguments,thisObj.sqlSuccessCall,thisObj.sqlErrorCall);
		});
	}	
	//update event	
	this.updateEvent = function(record){
		 // SQL statement to update new event into the database table
        var updateEventStatement = "UPDATE events SET time = ?, place = ?, title = ?, des = ? WHERE id = ?";        
        // Arguments to the SQL statement above
        var sqlArguments = [ record['when'], record['where'], record['what'], record['about'],record['id']];        
		this.db.transaction(function (tx) {
			   tx.executeSql(updateEventStatement, sqlArguments,thisObj.sqlSuccessCall,thisObj.sqlErrorCall);
		});
	}	
	this.deleteEvent = function(id){
		 // SQL statement to delete an event from the database table
        var deleteEventStatement = "DELETE FROM events WHERE id = ?";        
        // Arguments to the SQL statement above
        var sqlArguments = [id];		
		this.db.transaction(function (tx) {
			   tx.executeSql(deleteEventStatement, sqlArguments,thisObj.sqlSuccessCall,thisObj.sqlErrorCall);
		});
	}	
}