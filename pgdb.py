import psycopg2, os, urlparse
from math import trunc


############ DB CONNECTION ############ 

production = False # set this to true if pushing changes to production server (heroku) else keep false on development box

if production == False:

	# development server (local box)
	host = 'localhost'
	dbname = 'inquis'
	user = 'postgres'
	password = 'password'
	conn_string = 'host=%s dbname=%s user=%s password=%s' %(host,dbname,user,password)
	conn = psycopg2.connect(conn_string)

else:

	#production server (heroku)
	urlparse.uses_netloc.append("postgres")
	url = urlparse.urlparse(os.environ["DATABASE_URL"])

	conn = psycopg2.connect(
	    database=url.path[1:],
	    user=url.username,
	    password=url.password,
	    host=url.hostname,
	    port=url.port
	)

# cursor object
cursor = conn.cursor()

############ DEFAULT LISTS ############

# PROFICIENCY GROUPS
cursor.execute('select distinct PRIOR_YEAR_PROFICIENCY from data;')
proficiency_groups = [r[0] for r in cursor.fetchall()]
proficiency_groups.append('All')

# GRADE LEVELS
cursor.execute('select distinct GRADE from data order by 1;')
grades = [r[0] for r in cursor.fetchall()]
cursor.execute('select distinct GRADE from (select GRADE, PRIOR_YEAR_PROFICIENCY from data_new GROUP BY GRADE, PRIOR_YEAR_PROFICIENCY) s where PRIOR_YEAR_PROFICIENCY = \'Below Proficient\' order by 1;')
bpGrades = [r[0] for r in cursor.fetchall()]

# ATTEMPTS
cursor.execute('select distinct attempt from data order by 1;')
attempts = [r[0] for r in cursor.fetchall()]

############ HELPER METHODS ############

def round_me(number):
	 #return Decimal(number).quantize(Decimal('0.01'))
	 return (trunc(round(number,3)*1000)+.0)/10

def relevant_quiz(grade):
	sql = 'SELECT DISTINCT ASSESSMENT FROM DATA_NEW WHERE GRADE = \'%s\' ORDER BY 1;' % grade
	cursor.execute(sql)
	quizzes = [r[0] for r in cursor.fetchall()]
	return quizzes

def relevant_teachers(grade):
	sql = 'SELECT DISTINCT TEACHER FROM DATA WHERE GRADE = \'%s\' ORDER BY 1;' % grade
	cursor.execute(sql)
	rs = [r[0] for r in cursor.fetchall()]
	rs.append('All') # Allow for all teachers within the grade
	return rs	

############ MAIN METHODS ############

def quiz(grade,proficiency):
	if proficiency == 'All':
		sql = 'SELECT ASSESSMENT, AVG(SCORE) FROM DATA WHERE GRADE = \'%s\' AND ATTEMPT = 1 GROUP BY ASSESSMENT ORDER BY 1;' % grade
	else:
		sql = 'SELECT ASSESSMENT, AVG(SCORE) FROM DATA WHERE GRADE = \'%s\' AND ATTEMPT = 1 AND PRIOR_YEAR_PROFICIENCY = \'%s\' GROUP BY ASSESSMENT ORDER BY 1;' % (grade,proficiency)
	cursor.execute(sql)
	rs = cursor.fetchall()
	assessments = [r[0] for r in rs]
	#scores = [round_me(r[1]) for r in rs]
	scores = [float(r[1]) for r in rs]
	return assessments, scores


def teacher(grade,proficiency,quiz):
	if proficiency == 'All':
		sql = 'SELECT TEACHER, AVG(SCORE) FROM DATA WHERE GRADE = \'%s\' AND ASSESSMENT = \'%s\'  AND ATTEMPT = 1 GROUP BY TEACHER ORDER BY 1;' % (grade,quiz)
	else:
		sql = 'SELECT TEACHER, AVG(SCORE) FROM DATA WHERE GRADE = \'%s\' AND ASSESSMENT = \'%s\' AND ATTEMPT = 1 AND PRIOR_YEAR_PROFICIENCY = \'%s\' GROUP BY TEACHER ORDER BY 1;' % (grade,quiz,proficiency)
	cursor.execute(sql)
	rs = cursor.fetchall()
	teachers = [r[0] for r in rs]
	#scores = [round_me(r[1]) for r in rs]
	scores = [float(r[1]) for r in rs]
	return teachers, scores	






####################################################################
####################################################################
####################### NEW STUFF PONY V2 ##########################
####################################################################
####################################################################

######## DASHBOARD: ASSESSMENTS BY GRADE BY SCORE (LAST 3) #########
def assessments_by_grade(proficiency):
	mydata =  [{
        'name': '4',
        'color': "#698B22",
        'data': []
    }, {
        'name': '3',
        'color': "#9ACD32",
        'data': []
    }, {
        'name': '2',
        'color': "#4F94CD",
        'data': []
    }, {
        'name': '1',
        'color': "#36648B",
        'data': []
    }];
	if proficiency <> '':
		sql = 'select grade, score, count(*) students from (select grade,student,round(avg(score)) score from (select student, grade, assessment, max(round(score)) score from data_new where score <= 4 and assessment in (select assessment from (select s.*, row_number() over (partition by grade order by assessment) rowCnt from (select distinct grade, assessment from data_new) s) t where rowCnt <= 8) and PRIOR_YEAR_PROFICIENCY = \'%s\' group by student, grade, assessment) i group by grade,student) j where score > 0 group by grade, score order by 1,2;' % proficiency
	else:
		sql = 'select grade, score, count(*) students from (select grade,student,round(avg(score)) score from (select student, grade, assessment, max(round(score)) score from data_new where score <= 4 and assessment in (select assessment from (select s.*, row_number() over (partition by grade order by assessment) rowCnt from (select distinct grade, assessment from data_new) s) t where rowCnt <= 8) group by student, grade, assessment) i group by grade,student) j where score > 0 group by grade, score order by 1,2;'
	cursor.execute(sql)
	rs = cursor.fetchall()
	
	for i in range(1,5):
		rng = [float(r[2]) for r in rs if r[1]==i]
		#print(i,rng)
		for k in mydata:
			if k['name'] == str(i):
				k['data'] = rng
	return mydata

def assessments_by_recent(grade,proficiency):
	mydata =  [{
        'name': '4',
        'color': "#698B22",
        'data': []
    }, {
        'name': '3',
        'color': "#9ACD32",
        'data': []
    }, {
        'name': '2',
        'color': "#4F94CD",
        'data': []
    }, {
        'name': '1',
        'color': "#36648B",
        'data': []
    }];
	if proficiency <> '':
		sql = 'select assessment, score, count(*) students from (select student, grade, assessment, max(round(score)) score from data_new where score <= 4 and assessment in (select assessment from ( select s.*, row_number() over (partition by grade order by assessment) rowCnt from (select distinct grade, assessment from data_new ) s ) t where rowCnt <= 8) and PRIOR_YEAR_PROFICIENCY = \'%s\' group by student, grade, assessment) s where grade = \'%s\' group by assessment, score order by assessment, score' %(proficiency,grade)
	else:
		sql = 'select assessment, score, count(*) students from (select student, grade, assessment, max(round(score)) score from data_new where score <= 4 and assessment in (select assessment from ( select s.*, row_number() over (partition by grade order by assessment) rowCnt from (select distinct grade, assessment from data_new ) s ) t where rowCnt <= 8) group by student, grade, assessment) s where grade = \'%s\' group by assessment, score order by assessment, score' %(grade)
	#print sql
	cursor.execute(sql)
	rs = cursor.fetchall()
	print sql	
	for i in range(1,5):
		rng = [float(r[2]) for r in rs if r[1]==i]
		#print(i,rng)
		for k in mydata:
			if k['name'] == str(i):
				k['data'] = rng

	# keep tab of recents
	recents = list(set([r[0] for r in rs])) # distinct list of assessments
	#print [mydata,recents]
	return [mydata,recents]

################## TEACHER DRILL DOWN ##################
def single_assessment(grade,assessment):
	myseries =  [{
        'name': '4',
        'color': "#698B22",
        'data': []
    }, {
        'name': '3',
        'color': "#9ACD32",
        'data': []
    }, {
        'name': '2',
        'color': "#4F94CD",
        'data': []
    }, {
        'name': '1',
        'color': "#36648B",
        'data': []
    }];	
	sql = 'select s.teacher,s.score,case when t.students is null then 0 else t.students end students from (select r.teacher,s.score from (select distinct teacher teacher from data_new where grade = \'%s\') r cross join (select distinct round(score) score from data_new where round(score) between 1 and 4) s) s left join (select teacher, score, count(*) students from (select teacher, student, grade, assessment, max(round(score)) score from data_new where score <= 4 and assessment = \'%s\' group by teacher,student, grade, assessment) s where grade = \'%s\' group by teacher, score) t on s.teacher = t.teacher and s.score = t.score order by 1,2' %(grade,assessment,grade)
	cursor.execute(sql)
	rs = cursor.fetchall()
	teachers = sorted(list(set([r[0] for r in rs])))
	for i in range(1,5):
		rng = [float(r[2]) for r in rs if r[1]==i]
		print(i,rng)
		for k in myseries:
			if k['name'] == str(i):
				k['data'] = rng

	return [teachers,myseries]

def single_assessment_table(grade,assessment):
	#sql = 'select student, teacher,max(case when attempt = 1 then score end) A1,max(case when attempt = 2 then score end) A2,max(case when attempt = 3 then score end) A3,max(case when attempt in (1,2,3) then score end) HS from data_new where score <= 4 and grade = \'%s\' and assessment = \'%s\' group by teacher, student order by 1,2' %(grade,assessment)
	sql = 'select d.student,d.teacher, case when sped is not null or \"504\" is not null or ell is not null or incidents > 0 then \'Tier 3\' end \"Tier 3\" ,max(case when attempt = 1 then score end) A1,max(case when attempt = 2 then score end) A2,max(case when attempt = 3 then score end) A3,max(case when attempt in (1,2,3) then score end) HS from data_new d left join student_attributes a on a.student = d.student where score <= 4 and grade = \'%s\' and assessment = \'%s\' group by d.teacher, d.student ,case when sped is not null or \"504\" is not null or ell is not null or incidents > 0 then \'Tier 3\' end order by 1,2' %(grade,assessment)
	cursor.execute(sql)
	rs = cursor.fetchall()
	mydata = []	
	for r in rs:
		row = []
		for e in r:
			if type(e)<>str and e is not None:
				row.append(float(e))
			else:
				row.append(e)
		mydata.append(row)
	return mydata

def single_assessment_growth(grade,assessment):
	sql = 'select teacher, coalesce(round(avg(A1),2),0) A1,coalesce(round(avg(A2),2),0) A2, coalesce(round(avg(A3),2),0) A3 from (select teacher, student ,max(case when attempt in (1) then score end) A1,max(case when attempt in (1,2) then score end) A2,max(case when attempt in (1,2,3) then score end) A3 from data_new where score <= 4 and grade = \'%s\' and assessment = \'%s\' group by teacher, student ) s group by teacher order by 1' %(grade,assessment)
	cursor.execute(sql)
	rs = cursor.fetchall()
	mydata = [] # will be an array of dicts for the growth line chart
	for r in rs:
		row = {}
		row['name'] = r[0]
		row['data'] = [float(e) for e in r[1:]]
		mydata.append(row)
	return mydata


def special_conditions(student):
	sql = 'select case when sped is null then 0 else 1 end sped,case when \"504\" is null then 0 else 1 end \"504\",case when ell is null then 0 else 1 end ell,case when incidents = 0 then 0 else 1 end incidents,case when lunch = \'N\' then 0 else 1 end lunch from student_attributes where student=\'%s\'' %student	
	cursor.execute(sql)
	rs = cursor.fetchall()
	mydata = [float(r) for r in rs[0]]
	return mydata

def score_distribution(student):
	mydata = [
		{'name':'4.0','visible':'true','y':45,'color': "#698B22"},
		{'name':'3.0','visible':'true','y':45,'color': "#9ACD32"},
		{'name':'2.0','visible':'true','y':45,'color': "#4F94CD"},
		{'name':'1.0','visible':'true','y':45,'color': "#36648B"}
	]
	sql = 'select a.score, case when b.cnt is null then 0 else b.cnt end cnt from (select distinct round(score) score from data_new where round(score) between 1 and 4) a left join (select score, count(*) cnt from (select assessment, max(round(score)) score from data_new where student = \'%s\' group by assessment)y group by score) b on a.score = b.score order by 1' % student
	cursor.execute(sql)
	rs = cursor.fetchall()
	for d in mydata:
		for r in rs:
			print str(float(r[0]))
			if str(float(r[0])) == d['name']:
				d['y'] = float(r[1])		
	return mydata
	
def averages(student):
	sql = 'select round(avg(score),2) score from (select assessment, max(round(score)) score from data_new where student = \'%s\' group by assessment) s union all select round(avg(score),2) score from (select student, assessment, max(round(score)) score from data_new where teacher = (select distinct teacher from data_new where student = \'%s\') group by student, assessment) s union all select round(avg(score),2) score from (select student, assessment, max(round(score)) score from data_new where grade = (select distinct grade from data_new where student = \'%s\') group by student, assessment) s' %(student,student,student)
	cursor.execute(sql)
	rs = cursor.fetchall()
	print rs
	mydata = [float(r[0]) for r in rs]
	print mydata
	return mydata

def student_grid(grade):
	#sql = 'select student, teacher, assessment, max(score) from data_new where grade = \'%s\' group by student, teacher, assessment' % grade
	sql = 'select d.student, d.teacher, assessment,case when sped is not null or \"504\" is not null or ell is not null or incidents > 0 then \'Tier 3\' end \"Tier 3\",  max(score) hs from data_new d left join student_attributes a on d.student = a.student where grade = \'%s\' group by d.student, d.teacher, assessment ,case when sped is not null or \"504\" is not null or ell is not null or incidents > 0 then \'Tier 3\' end' % grade
	cursor.execute(sql)
	rs = cursor.fetchall()
	quizzes = sorted(list(set([r[2] for r in rs])))
	student_teachers = sorted(list(set([(r[0],r[1],r[3]) for r in rs])))
	mydata = []
	for s in student_teachers:
		row = []
		row.append(s[0]) # student
		row.append(s[1]) # teacher
		row.append(s[2]) # tier 3
		for q in quizzes:
			found = False
			for r in rs:
				if s[0] == r[0] and q == r[2]: # if  student and quiz
					if type(r[4])<>str and r[4] is not None:
						row.append(float(r[4]))
					else:
						row.append(r[4])
					found = True
			if found == False:
				row.append(None)
		mydata.append(row)
	
	return [mydata,quizzes]

