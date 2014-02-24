from flask import *
#from pgdb import *

app = Flask(__name__)


@app.route('/')
def home():
	return render_template('indexHC.html')

@app.route('/teacher')
def teacher():
	return render_template('teacher.html')

if __name__ == '__main__':
	app.run(debug=True)