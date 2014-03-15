from flask import *
from pgdb import *
from json import dumps

app = Flask(__name__)

@app.route('/',methods=['GET','POST'])
def home(seriesAll=[],seriesBelowProf=[]):
	seriesAll = assessments_by_grade('') # method from pgdb module
	seriesBelowProf = assessments_by_grade('Below Proficient') # method from pgdb module
	return render_template('index.html',seriesAll=seriesAll,grades=[g[4:] for g in grades],seriesBelowProf=seriesBelowProf,bpGrades=[g[4:] for g in bpGrades])

@app.route('/teacher', methods=['GET','POST'])
def teacher(grade='1 - First Grade',assessment='PLC - Addition'):
	f_grade = grade
	f_assessment = assessment
	if request.method == 'POST':
		f_grade = request.form.getlist("grade")[0]
		f_assessment = request.form.getlist("asmt")[0]
	assessments = relevant_quiz(f_grade) # this is to populate assessments in the filters based on grade
	if f_assessment not in assessments:
		f_assessment = assessments[0]
	chart_title = '\''+f_grade[4:]+': '+f_assessment+'\''
	return_data = single_assessment(f_grade,f_assessment) # returns data needed for the chart [teachers list,chart series] 
	teachers = return_data[0] # this is to get the relevant teachers (for the x axis)
	series=return_data[1] # this is to get the chart data
	table_vals = single_assessment_table(f_grade,f_assessment) # this is the table raw data
	growth = single_assessment_growth(f_grade,f_assessment) # this for the growth chart
	return render_template('teacher.html',teachers=teachers,series=series,table_vals=table_vals,assessments=assessments,grades=grades,f_grade=f_grade
		,f_assessment=f_assessment,chart_title=chart_title, growth=growth)
	#return render_template('teacher.html',f_grade=f_grade,f_assessment=f_assessment)

# @app.route('/teacher/<grade>/<assessment>', methods=['GET','POST'])
# def teacher2(grade,assessment):
# 	f_grade = grade
# 	f_assessment = assessment
# 	print grade, assessment
# 	assessments = relevant_quiz(f_grade) # this is to populate assessments in the filters based on grade
# 	if f_assessment not in assessments:
# 		f_assessment = assessments[0]
# 	chart_title = '\''+f_grade[4:]+': '+f_assessment+'\''
# 	return_data = single_assessment(f_grade,f_assessment) # returns data needed for the chart [teachers list,chart series] 
# 	teachers = return_data[0] # this is to get the relevant teachers (for the x axis)
# 	series=return_data[1] # this is to get the chart data
# 	table_vals = single_assessment_table(f_grade,f_assessment) # this is the table raw data
# 	growth = single_assessment_growth(f_grade,f_assessment) # this for the growth chart
# 	return render_template('teacher.html',teachers=teachers,series=series,table_vals=table_vals,assessments=assessments,grades=grades,f_grade=f_grade
# 		,f_assessment=f_assessment,chart_title=chart_title, growth=growth)

@app.route('/grid', methods=['GET','POST'])
def grid(grade='1 - First Grade'):
	f_grade = grade
	if request.method == 'POST':
		f_grade = request.form.getlist("grade")[0]
	return_data = student_grid(f_grade)
	table_vals = return_data[0] # this is the table raw data
	relevant_assessments = return_data[1]
	qcnt = len(relevant_assessments)
	return render_template('grid.html',table_vals=table_vals,quizzes=relevant_assessments,qcnt=qcnt,grades=grades,f_grade=f_grade)

# testing out lighter weight nav system to see if helps with the page load
# @app.route('/teacher2',methods=['GET','POST'])
# def t2():
# 	return render_template('teacher2.html')

# testing out common core view
@app.route('/domain',methods=['GET','POST'])
def domain():
	return render_template('domain.html')

# testing out common core view
@app.route('/domain/cluster',methods=['GET','POST'])
def cluster():
	return render_template('cluster.html')

# testing out common core view
@app.route('/domain/cluster/standard',methods=['GET','POST'])
def standard():
	return render_template('standard.html')



##############################################
####### API ROUTES RETURN JSON STRINGS #######
##############################################

@app.route('/api/dash1/all/<grade>', methods = ['GET'])
def get_db2_data_all(grade):
	d = assessments_by_recent(grade,'')
	return make_response(dumps(d))

@app.route('/api/dash1/belowProf/<grade>', methods = ['GET'])
def get_db2_data_bp(grade):
	d = assessments_by_recent(grade,'Below Proficient')
	return make_response(dumps(d))

@app.route('/api/big5/<student>', methods = ['GET'])
def get_big5(student):
	d = special_conditions(student)
	return make_response(dumps(d))

@app.route('/api/scores/<student>', methods = ['GET'])
def get_scores(student):
	d = score_distribution(student)
	return make_response(dumps(d))

@app.route('/api/averages/<student>', methods = ['GET'])
def get_averages(student):
	d = averages(student)
	print d
	return make_response(dumps(d))

if __name__ == '__main__':
	app.run(debug=True)