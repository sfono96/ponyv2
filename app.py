from flask import *
from pgdb import *

app = Flask(__name__)


@app.route('/',methods=['GET','POST'])
def home(seriesAll=[],seriesBelowProf=[]):
	seriesAll = assessments_by_grade('') # method from pgdb module
	seriesBelowProf = assessments_by_grade('Below Proficient') # method from pgdb module
	print seriesAll
	print seriesBelowProf
	return render_template('indexHC.html',seriesAll=seriesAll,grades=grades,seriesBelowProf=seriesBelowProf,bpGrades=bpGrades)

@app.route('/teacher')
def teacher():
	return render_template('teacher.html')

if __name__ == '__main__':
	app.run(debug=True)