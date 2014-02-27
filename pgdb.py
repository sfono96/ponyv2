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
grades = [r[0][4:] for r in cursor.fetchall()]
cursor.execute('select distinct GRADE from (select GRADE, PRIOR_YEAR_PROFICIENCY from data_new GROUP BY GRADE, PRIOR_YEAR_PROFICIENCY) s where PRIOR_YEAR_PROFICIENCY = \'Below Proficient\' order by 1;')
bpGrades = [r[0][4:] for r in cursor.fetchall()]

# ATTEMPTS
cursor.execute('select distinct attempt from data order by 1;')
attempts = [r[0] for r in cursor.fetchall()]

############ HELPER METHODS ############

def round_me(number):
	 #return Decimal(number).quantize(Decimal('0.01'))
	 return (trunc(round(number,3)*1000)+.0)/10

def relevant_quiz(grade):
	sql = 'SELECT DISTINCT ASSESSMENT FROM DATA WHERE GRADE = \'%s\' ORDER BY 1;' % grade
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


def students_list(grade,teacher,proficiency):
	if proficiency == 'All':
		if teacher == 'All':
			sql = 'SELECT STUDENT, ASSESSMENT, SCORE, TEACHER FROM DATA WHERE GRADE = \'%s\' AND ATTEMPT = 1 ORDER BY 1,2;' % grade
		else:
			sql = 'SELECT STUDENT, ASSESSMENT, SCORE, TEACHER FROM DATA WHERE TEACHER = \'%s\' AND ATTEMPT = 1 ORDER BY 1,2;' % teacher
	else:
		if teacher == 'All':
			sql = 'SELECT STUDENT, ASSESSMENT, SCORE, TEACHER FROM DATA WHERE GRADE = \'%s\' AND ATTEMPT = 1 AND PRIOR_YEAR_PROFICIENCY = \'%s\' ORDER BY 1,2;' % (grade,proficiency)
		else:
			sql = 'SELECT STUDENT, ASSESSMENT, SCORE, TEACHER FROM DATA WHERE TEACHER = \'%s\' AND ATTEMPT = 1 AND PRIOR_YEAR_PROFICIENCY = \'%s\' ORDER BY 1,2;' % (teacher,proficiency)
	
	quizzes = relevant_quiz(grade)

	cursor.execute(sql)
	rs = cursor.fetchall()
	data_series = []
	sdict = {}

	for r in rs:
		if r[0] not in sdict: # if student not in the dictionary
			sdict[r[0]] = [] # will be a list where first value is teacher name and second value is dictionary of quiz scores
			sdict[r[0]].append(r[3]) # teacher
			sdict[r[0]].append({}) # dictionary of quiz scores
			for quiz in quizzes:
				if quiz not in sdict[r[0]][1]: # if quiz score in the dictionary for student 
					sdict[r[0]][1][quiz] = '' # blank place holder quiz score

		if r[1] in sdict[r[0]][1]:
			sdict[r[0]][1][r[1]] = float(r[2]) # add real quiz score

	for k in sdict:
		list = []
		list.append(sdict[k][0]) # teacher
		list.append(k) # student
		for q in quizzes:
			if sdict[k][1][q] <> '':
				list.append(float(sdict[k][1][q]))
			else:
				list.append('')
		data_series.append(list)

	data_series = sorted(data_series)
	return data_series

def student_attempts(grade,teacher,proficiency,quiz):
	# SQL depending on selections
	if proficiency == 'All':
		if teacher == 'All':
			sql = 'SELECT STUDENT, ATTEMPT, SCORE FROM DATA WHERE GRADE = \'%s\' AND ASSESSMENT = \'%s\' ORDER BY 1,2;' %(grade, quiz)
		else:
			sql = 'SELECT STUDENT, ATTEMPT, SCORE FROM DATA WHERE TEACHER = \'%s\' AND ASSESSMENT = \'%s\' ORDER BY 1,2;' %(teacher, quiz)
	else:
		if teacher == 'All':
			sql = 'SELECT STUDENT, ATTEMPT, SCORE FROM DATA WHERE GRADE = \'%s\' AND ASSESSMENT = \'%s\' AND PRIOR_YEAR_PROFICIENCY = \'%s\' ORDER BY 1,2;' % (grade,quiz,proficiency)
		else:
			sql = 'SELECT STUDENT, ATTEMPT, SCORE FROM DATA WHERE TEACHER = \'%s\' AND ASSESSMENT = \'%s\' AND PRIOR_YEAR_PROFICIENCY = \'%s\' ORDER BY 1,2;' % (teacher,quiz,proficiency)
	cursor.execute(sql)
	rs = cursor.fetchall()
	
	# get list of scores (val) for each student (key)
	sdict = {}
	for r in rs:
		if r[0] not in sdict:
			sdict[r[0]] = []
		sdict[r[0]].append(r[2])
	
	# now combine in key, val into 1 row and toss into data series list for returning
	data_series = []
	for k in sdict:
		list = []
		list.append(k)
		for v in sdict[k]:
			if v is not None:
				list.append(round_me(v))
			else:
				list.append(None)
		data_series.append(list)

	data_series = sorted(data_series)
	return data_series

# st = student_attempts('0 - Kindergarten','Mr. Boler','All','K.CC.A.1')
# for s in st:
# 	print s

####################################################################
####################################################################
####################### NEW STUFF PONY V2 ##########################
####################################################################
####################################################################

# ASSESSMENTS BY GRADE By SCORE (LAST 3)
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
		sql = 'select grade, score, count(*) students from (select grade,student,round(avg(score)) score from (select student, grade, assessment, max(round(score)) score from data_new where score <= 4 and assessment in (select assessment from (select s.*, row_number() over (partition by grade order by assessment) rowCnt from (select distinct grade, assessment from data_new) s) t where rowCnt <= 3) and PRIOR_YEAR_PROFICIENCY = \'%s\' group by student, grade, assessment) i group by grade,student) j where score > 0 group by grade, score order by 1,2;' % proficiency
	else:
		sql = 'select grade, score, count(*) students from (select grade,student,round(avg(score)) score from (select student, grade, assessment, max(round(score)) score from data_new where score <= 4 and assessment in (select assessment from (select s.*, row_number() over (partition by grade order by assessment) rowCnt from (select distinct grade, assessment from data_new) s) t where rowCnt <= 3) group by student, grade, assessment) i group by grade,student) j where score > 0 group by grade, score order by 1,2;'
	cursor.execute(sql)
	rs = cursor.fetchall()
	
	for i in range(1,5):
		rng = [float(r[2]) for r in rs if r[1]==i]
		#print(i,rng)
		for k in mydata:
			if k['name'] == str(i):
				k['data'] = rng
	return mydata

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
		sql = 'select grade, score, count(*) students from (select grade,student,round(avg(score)) score from (select student, grade, assessment, max(round(score)) score from data_new where score <= 4 and assessment in (select assessment from (select s.*, row_number() over (partition by grade order by assessment) rowCnt from (select distinct grade, assessment from data_new) s) t where rowCnt <= 3) and PRIOR_YEAR_PROFICIENCY = \'%s\' group by student, grade, assessment) i group by grade,student) j where score > 0 group by grade, score order by 1,2;' % proficiency
	else:
		sql = 'select grade, score, count(*) students from (select grade,student,round(avg(score)) score from (select student, grade, assessment, max(round(score)) score from data_new where score <= 4 and assessment in (select assessment from (select s.*, row_number() over (partition by grade order by assessment) rowCnt from (select distinct grade, assessment from data_new) s) t where rowCnt <= 3) group by student, grade, assessment) i group by grade,student) j where score > 0 group by grade, score order by 1,2;'
	cursor.execute(sql)
	rs = cursor.fetchall()
	
	for i in range(1,5):
		rng = [float(r[2]) for r in rs if r[1]==i]
		#print(i,rng)
		for k in mydata:
			if k['name'] == str(i):
				k['data'] = rng
	return mydata

#assessments_by_grade('')